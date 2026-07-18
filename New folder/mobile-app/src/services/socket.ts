import { io, Socket } from 'socket.io-client';
import { API_URL, getToken } from './api';

let socket: Socket | null = null;

/**
 * Connect (or reuse) the single Socket.io connection for the app.
 * Call after login / on app start when a token is present.
 */
export async function connectSocket(): Promise<Socket | null> {
  if (socket?.connected) return socket;

  const token = await getToken();
  if (!token) return null;

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinIncidentRoom(incidentId: number | string) {
  socket?.emit('join_incident', incidentId);
}

export function leaveIncidentRoom(incidentId: number | string) {
  socket?.emit('leave_incident', incidentId);
}
