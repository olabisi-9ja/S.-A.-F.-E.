import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';
import CryptoJS from 'crypto-js';
import { meshAPI, alertsAPI } from './api';

// Must match the backend's MESH_ENCRYPTION_KEY default (Back End/backend/controllers/meshController.js).
// If the backend operator sets a custom MESH_ENCRYPTION_KEY env var, update this to match.
const MESH_ENCRYPTION_KEY = 'SAFE_MESH_KEY_32_CHARACTERS_LONG';
const QUEUE_KEY = 'safe_mesh_queue';
const DEVICE_ID_KEY = 'safe_device_id';
const DEFAULT_TTL = 5; // max relay hops before a packet is dropped

export interface MeshAlertPayload {
  user_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface QueuedPacket {
  id: string;
  encrypted_payload: string;
  ttl: number;
  origin_device_id: string;
  hop_count: number;
  queued_at: string;
}

// ─── Device identity ─────────────────────────────────────────
export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = Crypto.randomUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ─── AES-256-CBC encryption (matches backend zero-IV scheme) ──
function getKeyWordArray() {
  const padded = MESH_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32);
  return CryptoJS.enc.Utf8.parse(padded);
}

const ZERO_IV = CryptoJS.lib.WordArray.create([0, 0, 0, 0]); // 16 zero bytes

function encryptPayload(payload: MeshAlertPayload): string {
  const json = JSON.stringify(payload);
  const encrypted = CryptoJS.AES.encrypt(json, getKeyWordArray(), {
    iv: ZERO_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

// ─── Local queue (AsyncStorage) ────────────────────────────────
async function readQueue(): Promise<QueuedPacket[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedPacket[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueuedPacketCount(): Promise<number> {
  return (await readQueue()).length;
}

/**
 * Called when HTTPS delivery of an SOS alert fails or times out.
 * Encrypts the alert, queues it locally, tries a best-effort BLE relay
 * to nearby devices, and leaves it queued for automatic sync the moment
 * connectivity returns (see startMeshAutoSync).
 */
export async function queueAlertForMesh(
  userId: number,
  latitude: number,
  longitude: number
): Promise<QueuedPacket> {
  const deviceId = await getDeviceId();
  const payload: MeshAlertPayload = {
    user_id: userId,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  };

  const packet: QueuedPacket = {
    id: Crypto.randomUUID(),
    encrypted_payload: encryptPayload(payload),
    ttl: DEFAULT_TTL,
    origin_device_id: deviceId,
    hop_count: 0,
    queued_at: new Date().toISOString(),
  };

  const queue = await readQueue();
  queue.push(packet);
  await writeQueue(queue);

  // Best-effort: try to hand this packet to any nearby S.A.F.E. device over
  // BLE so it can relay it if it has connectivity before we do.
  relayViaBLE(packet).catch(() => {});

  return packet;
}

/**
 * Attempt to push every queued packet to the server. Called automatically
 * when the network comes back, and can also be called manually (e.g. a
 * "Sync now" button, or after receiving a relayed packet from a peer).
 */
export async function syncQueuedPackets(): Promise<{ synced: number; remaining: number }> {
  const queue = await readQueue();
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  const deviceId = await getDeviceId();
  const stillQueued: QueuedPacket[] = [];
  let synced = 0;

  for (const packet of queue) {
    const result = await meshAPI.sync({
      encrypted_payload: packet.encrypted_payload,
      ttl: packet.ttl,
      origin_device_id: packet.origin_device_id,
      relay_device_id: packet.origin_device_id === deviceId ? undefined : deviceId,
      hop_count: packet.hop_count,
    });

    if (result.success) {
      synced += 1;
    } else {
      stillQueued.push(packet);
    }
  }

  await writeQueue(stillQueued);
  return { synced, remaining: stillQueued.length };
}

export type AlertDeliveryMode = 'https' | 'mesh';

/**
 * The core FR4 flow: try to deliver an SOS alert over HTTPS first; if that
 * fails or takes too long (no signal / server unreachable), fall back to
 * the encrypted mesh queue so the alert is never silently lost. Returns
 * which path actually delivered it.
 */
export async function sendAlertWithFallback(
  userId: number,
  latitude: number,
  longitude: number,
  timeoutMs = 7000
): Promise<{ mode: AlertDeliveryMode; success: boolean }> {
  const httpsAttempt = alertsAPI.trigger(latitude, longitude, 'https');
  const timeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));

  const race = await Promise.race([httpsAttempt, timeout]);

  if (race !== 'timeout' && race.success) {
    return { mode: 'https', success: true };
  }

  // Either the request failed outright or it's taking too long (likely no
  // connectivity) — queue it for mesh relay / auto-sync instead of blocking
  // the user waiting on a request that may never return.
  await queueAlertForMesh(userId, latitude, longitude);
  return { mode: 'mesh', success: true };
}

let autoSyncUnsubscribe: (() => void) | null = null;

/**
 * Start listening for connectivity changes and auto-sync the mesh queue
 * the moment the device is back online. Call once (e.g. from AuthContext).
 */
export function startMeshAutoSync() {
  if (autoSyncUnsubscribe) return;
  autoSyncUnsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      syncQueuedPackets().catch(() => {});
    }
  });
}

export function stopMeshAutoSync() {
  autoSyncUnsubscribe?.();
  autoSyncUnsubscribe = null;
}

// ─── Best-effort BLE relay ──────────────────────────────────────
// True peer-to-peer BLE mesh needs native modules on both the scanning
// (central) and advertising (peripheral) side. react-native-ble-plx gives
// us central-mode scanning; advertising as a discoverable peripheral needs
// an additional native module per platform. This function is written so it
// degrades to a silent no-op wherever that native support isn't present
// (e.g. Expo Go) — the packet stays safely queued and still gets delivered
// via syncQueuedPackets() as soon as any relaying device reaches the internet.
const SAFE_MESH_SERVICE_UUID = '0000safe-0000-1000-8000-00805f9b34fb';

async function relayViaBLE(packet: QueuedPacket): Promise<void> {
  try {
    // Lazy require so bundling/running without the native module linked
    // (e.g. in Expo Go) never crashes the JS bundle.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BleManager } = require('react-native-ble-plx');
    const manager = new BleManager();
    const state = await manager.state();
    if (state !== 'PoweredOn') {
      manager.destroy();
      return;
    }

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        manager.stopDeviceScan();
        manager.destroy();
        resolve();
      }, 8000);

      manager.startDeviceScan([SAFE_MESH_SERVICE_UUID], null, async (error: any, device: any) => {
        if (error || !device) return;
        try {
          manager.stopDeviceScan();
          clearTimeout(timeout);
          const connected = await device.connect();
          await connected.discoverAllServicesAndCharacteristics();
          const payloadBase64 = CryptoJS.enc.Base64.stringify(
            CryptoJS.enc.Utf8.parse(JSON.stringify(packet))
          );
          await connected.writeCharacteristicWithResponseForService(
            SAFE_MESH_SERVICE_UUID,
            SAFE_MESH_SERVICE_UUID,
            payloadBase64
          );
          await connected.cancelConnection();
        } catch {
          // Peer unreachable/unsupported — packet remains safely queued.
        } finally {
          manager.destroy();
          resolve();
        }
      });
    });
  } catch {
    // react-native-ble-plx isn't linked in this build (e.g. Expo Go).
    // No-op: the packet stays in the queue and syncs over HTTPS once
    // any device carrying it reaches connectivity.
  }
}
