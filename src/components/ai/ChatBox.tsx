"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToMessages, sendMessage } from '@/services/chatService';
import { ChatMessage } from '@/types';

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
    <div className="flex flex-col h-[500px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
      {/* Header */}
      <div className="p-4 border-b-4 border-black flex items-center justify-between" style={{ background: 'var(--color-primary-container-base)' }}>
        <h3 className="font-headline text-base font-black uppercase tracking-tight text-on-surface flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
          </div>
          Community Chat
        </h3>
        <span className="text-[10px] font-label font-black uppercase tracking-wider px-2.5 py-1 border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
          {messages.length} {messages.length === 1 ? 'msg' : 'msgs'}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'var(--color-surface-container-base)' }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/60">
            <span className="material-symbols-outlined text-[48px] mb-3 opacity-40">chat_bubble_outline</span>
            <p className="text-sm font-label font-bold uppercase tracking-wider">No messages yet.</p>
            <p className="text-xs mt-1">Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user?.uid === msg.userId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-8 h-8 flex items-center justify-center text-xs font-black mr-2 flex-shrink-0 mt-0.5 border-2 border-black" style={{ background: 'var(--color-secondary-container-base)' }}>
                    {msg.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant ml-1 mb-1">{msg.userName}</span>}
                  <div 
                    className={`px-4 py-2.5 text-sm border-2 border-black ${
                      isMe 
                        ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                        : ''
                    }`}
                    style={isMe ? {
                      background: 'var(--color-primary-container-base)',
                      color: 'var(--color-on-primary-container-base)',
                    } : {
                      background: 'var(--color-surface-container-lowest-base)',
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
      <div className="p-3 border-t-4 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
        {!user ? (
          <div className="text-center p-3 border-2 border-black text-sm text-on-surface-variant" style={{ background: 'var(--color-surface-container-base)' }}>
            Please <a href="/login" className="font-black uppercase underline text-on-surface">log in</a> to participate.
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 border-4 border-black px-4 py-2.5 text-sm focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none text-on-surface disabled:opacity-50 transition-all"
              style={{ background: 'var(--color-surface-container-base)' }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-11 h-11 flex items-center justify-center border-4 border-black disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95 flex-shrink-0"
              style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
              aria-label="Send message"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">send</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}