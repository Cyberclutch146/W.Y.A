"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToMessages, sendMessage } from '@/services/chatService';
import { ChatMessage } from '@/types';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

export function ChatBox({ eventId }: { eventId?: string }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventId) return;
    
    // Subscribe to real-time messages
    const unsubscribe = subscribeToMessages(eventId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [eventId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !eventId || sending) return;

    setSending(true);
    const displayName = profile?.displayName || user?.displayName || 'Anonymous';
    
    try {
      await sendMessage(eventId, user.uid, displayName, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!eventId) return null;

  return (
    <div
      className="flex flex-col h-[500px] overflow-hidden rounded-2xl"
      style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--cp-border)' }}
      >
        <h3 className="font-headline text-base font-bold flex items-center gap-3" style={{ color: 'var(--cp-text-1)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))' }}
          >
            <MessageCircle size={14} className="text-white" />
          </div>
          Community Chat
        </h3>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
          style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-3)' }}
        >
          {messages.length} {messages.length === 1 ? 'msg' : 'msgs'}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--cp-surface-dim)' }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <MessageCircle size={36} className="mb-3 opacity-20" style={{ color: 'var(--cp-text-3)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-3)' }}>No messages yet.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cp-text-3)' }}>Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user?.uid === msg.userId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold mr-2 flex-shrink-0 mt-0.5"
                    style={{ background: 'hsl(from var(--cp-secondary) h s l / 0.15)', color: 'var(--cp-secondary)' }}
                  >
                    {msg.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[10px] font-semibold ml-1 mb-1" style={{ color: 'var(--cp-text-3)' }}>{msg.userName}</span>}
                  <div 
                    className="px-4 py-2.5 text-sm rounded-xl"
                    style={isMe ? {
                      background: 'var(--cp-primary)',
                      color: 'white',
                      borderBottomRightRadius: '4px',
                    } : {
                      background: 'var(--cp-surface)',
                      color: 'var(--cp-text-1)',
                      border: '1px solid var(--cp-border)',
                      borderBottomLeftRadius: '4px',
                    }}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3" style={{ background: 'var(--cp-surface)', borderTop: '1px solid var(--cp-border)' }}>
        {!user ? (
          <div className="text-center p-3 text-sm rounded-xl" style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-3)' }}>
            Please <a href="/login" className="font-bold underline" style={{ color: 'var(--cp-primary)' }}>log in</a> to participate.
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="input-base flex-1"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: 'var(--cp-primary)', color: 'white' }}
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}