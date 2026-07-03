import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import type { Message, Incident } from '../types';
import { cn } from '../utils/cn';
import { useApp } from '../context/AppContext';

interface ChatModalProps {
  incident: Incident;
  messages: Message[];
  onClose: () => void;
  onSend: (content: string) => void;
  currentUserId: number;
}

function timeStr(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatModal({ incident, messages, onClose, onSend, currentUserId }: ChatModalProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { fetchIncidentMessages, joinIncidentChat, leaveIncidentChat } = useApp();

  useEffect(() => {
    fetchIncidentMessages(incident.id);
    joinIncidentChat(incident.id);
    
    return () => {
      leaveIncidentChat(incident.id);
    };
  }, [incident.id, fetchIncidentMessages, joinIncidentChat, leaveIncidentChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 rounded-t-2xl">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-red-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Incident #{incident.id} — {incident.category}</p>
            <p className="text-xs text-gray-400">Two-way communication with security</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[250px]">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              No messages yet. Start the conversation.
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === currentUserId;
            const isAdmin = msg.sender_role === 'security_admin' || msg.sender_role === 'super_admin';
            return (
              <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] space-y-1')}>
                  {!isMe && (
                    <p className="text-xs text-gray-400 px-1">
                      {msg.sender_name} {isAdmin && '· Security'}
                    </p>
                  )}
                  <div className={cn(
                    'px-4 py-2.5 rounded-2xl text-sm',
                    isMe
                      ? 'bg-red-700 text-white rounded-tr-sm'
                      : isAdmin
                        ? 'bg-blue-600 text-white rounded-tl-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  )}>
                    {msg.content}
                  </div>
                  <p className={cn('text-xs text-gray-400 px-1', isMe && 'text-right')}>
                    {timeStr(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-end gap-2">
            <textarea
              placeholder="Type a message…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="p-2.5 bg-red-700 text-white rounded-xl hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
