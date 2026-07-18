import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { incidentsAPI, messagesAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { getSocket, joinIncidentRoom, leaveIncidentRoom } from '@/services/socket';

interface ChatMessage {
  id: number;
  incident_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  resolved: '#16a34a',
  investigating: '#f59e0b',
  received: '#ef4444',
};

export default function IncidentChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const incidentId = Number(id);

  const [incident, setIncident] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadData = useCallback(async () => {
    const [incRes, msgRes] = await Promise.all([
      incidentsAPI.getById(incidentId),
      messagesAPI.getByIncident(incidentId),
    ]);
    if (incRes.success && incRes.data) setIncident(incRes.data.incident);
    if (msgRes.success && msgRes.data) setMessages(msgRes.data.messages || []);
    setLoading(false);
  }, [incidentId]);

  useEffect(() => {
    if (!incidentId) return;
    loadData();

    joinIncidentRoom(incidentId);
    const socket = getSocket();

    const onNewMessage = (msg: ChatMessage) => {
      if (msg.incident_id !== incidentId) return;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setOtherTyping(false);
    };
    const onStatusUpdate = (payload: { incidentId: string | number; status: string; assigned_officer?: string }) => {
      if (Number(payload.incidentId) !== incidentId) return;
      setIncident((prev: any) => (prev ? { ...prev, status: payload.status, assigned_officer_name: payload.assigned_officer } : prev));
    };
    const onTyping = ({ userId }: { userId: number }) => {
      if (userId !== user?.id) setOtherTyping(true);
    };
    const onStopTyping = ({ userId }: { userId: number }) => {
      if (userId !== user?.id) setOtherTyping(false);
    };

    socket?.on('new_message', onNewMessage);
    socket?.on('status_update', onStatusUpdate);
    socket?.on('user_typing', onTyping);
    socket?.on('user_stop_typing', onStopTyping);

    return () => {
      leaveIncidentRoom(incidentId);
      socket?.off('new_message', onNewMessage);
      socket?.off('status_update', onStatusUpdate);
      socket?.off('user_typing', onTyping);
      socket?.off('user_stop_typing', onStopTyping);
    };
  }, [incidentId, loadData, user?.id]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);
    const res = await messagesAPI.send(incidentId, content);
    if (res.success && res.data) {
      const sentMsg = res.data.message as ChatMessage;
      setMessages((prev) => (prev.some((m) => m.id === sentMsg.id) ? prev : [...prev, sentMsg]));
    }
    setSending(false);
    getSocket()?.emit('stop_typing', { incidentId, userId: user?.id });
  };

  const handleTyping = (text: string) => {
    setInput(text);
    const socket = getSocket();
    if (text.length > 0) {
      socket?.emit('typing', { incidentId, userId: user?.id });
    } else {
      socket?.emit('stop_typing', { incidentId, userId: user?.id });
    }
  };

  const statusColor = incident?.status ? STATUS_COLORS[incident.status] || '#6b7280' : '#6b7280';

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#b91c1c" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{incident?.category || 'Incident'}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {incident?.status ? incident.status.charAt(0).toUpperCase() + incident.status.slice(1) : 'Received'}
            </Text>
            {incident?.assigned_officer_name && (
              <Text style={styles.officerText}> · Officer {incident.assigned_officer_name}</Text>
            )}
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              This is a secure line to campus security about your report.{'\n'}Send a message if you need to add details or ask about status.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isMine = item.sender_id === user?.id;
          return (
            <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {!isMine && <Text style={styles.senderLabel}>{item.sender_name} · {item.sender_role === 'standard_user' ? 'You' : 'Security'}</Text>}
                <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.content}</Text>
                <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {otherTyping && (
        <Text style={styles.typingIndicator}>Security is typing…</Text>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Message campus security…"
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={handleTyping}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { marginRight: 12, padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
  officerText: { fontSize: 12, color: '#6b7280' },
  listContent: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 12, lineHeight: 20 },
  bubbleRow: { marginBottom: 10, flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: '#b91c1c', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e5e7eb' },
  senderLabel: { fontSize: 11, fontWeight: '700', color: '#4f46e5', marginBottom: 3 },
  bubbleText: { fontSize: 15, color: '#1f2937', lineHeight: 20 },
  bubbleTextMine: { color: 'white' },
  bubbleTime: { fontSize: 10, color: '#9ca3af', marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeMine: { color: '#fecaca' },
  typingIndicator: { paddingHorizontal: 20, paddingBottom: 4, fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#b91c1c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#d1d5db' },
});
