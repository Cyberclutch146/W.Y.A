"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: 'navigate' | 'signed_up' | 'confirm_signup' | 'search_results';
    url?: string;
    eventId?: string;
    eventTitle?: string;
    results?: Array<{ id: string; title: string; category: string; location: string }>;
  };
};

function renderMessageContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    const lines = part.split('\n');
    return lines.map((line, j) => (
      <React.Fragment key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </React.Fragment>
    ));
  });
}

export default function AIChatWidget() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSignup, setPendingSignup] = useState<{ eventId: string; eventTitle: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      const greeting = user && profile
        ? `Hi ${profile.displayName?.split(' ')[0] || 'there'}! 👋 I'm the W.Y.A AI. I can help you find events, sign you up to volunteer, and navigate the platform. What would you like to do?`
        : "Hi there! 👋 I'm the W.Y.A AI assistant. How can I help you today?";
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  };

  const handleNavigate = (url: string) => { router.push(url); setIsOpen(false); };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: inputMessage.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user?.uid || '',
          userName: profile?.displayName || 'Volunteer',
          userEmail: user?.email || '',
          userSkills: profile?.skills || [],
          userEquipment: profile?.equipment || [],
          userAvailability: profile?.availability || 'anytime',
          userTravelRadius: profile?.travelRadius || 0,
          pendingSignup: pendingSignup || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to get a response');

      const assistantMsg: Message = { role: 'assistant', content: data.reply, action: data.action || undefined };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.action?.type === 'confirm_signup') {
        setPendingSignup({ eventId: data.action.eventId || '', eventTitle: data.action.eventTitle || '' });
      } else if (data.action?.type === 'signed_up') {
        setPendingSignup(null);
        toast.success(`🎉 You've been signed up for ${data.action.eventTitle}!`, {
          duration: 5000,
          action: { label: 'View Event', onClick: () => router.push(data.action.url) },
        });
      }
    } catch (error: any) {
      if (!error.message?.includes('Rate limits hit')) console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: error.message || "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 md:bottom-8 md:right-8 z-[60] w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
        aria-label="Toggle AI Chat"
        style={{
          background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))',
          boxShadow: '0 8px 30px -6px hsl(from var(--cp-primary) h s l / 0.6)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 md:bottom-24 md:right-8 z-[60] w-[calc(100vw-32px)] md:w-[400px] flex flex-col overflow-hidden"
            style={{
              height: 'min(540px, calc(100vh - 7rem - env(safe-area-inset-bottom)))',
              background: 'var(--cp-surface)',
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--r-2xl)',
              boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.04)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 shrink-0"
              style={{ borderBottom: '1px solid var(--cp-border)', background: 'var(--cp-surface)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))' }}
                >
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm" style={{ color: 'var(--cp-text-1)' }}>W.Y.A AI</h3>
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--cp-text-3)' }}>
                    <Sparkles size={10} style={{ color: 'var(--cp-secondary)' }} />
                    <span>Search • Sign up • Navigate</span>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{ color: 'var(--cp-text-2)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cp-surface-dim)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--cp-surface-dim)' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed"
                    style={{
                      borderRadius: msg.role === 'user' ? 'var(--r-lg) var(--r-lg) var(--r-sm) var(--r-lg)' : 'var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm)',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))'
                        : 'var(--cp-surface)',
                      color: msg.role === 'user' ? 'white' : 'var(--cp-text-1)',
                      boxShadow: 'var(--shadow-xs)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--cp-border)',
                    }}
                  >
                    <div className="whitespace-pre-wrap">{renderMessageContent(msg.content)}</div>

                    {msg.action && (
                      <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        {msg.action.type === 'navigate' && msg.action.url && (
                          <button
                            onClick={() => handleNavigate(msg.action!.url!)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                            style={{ background: msg.role === 'user' ? 'rgba(255,255,255,0.25)' : 'var(--cp-primary-light)', color: msg.role === 'user' ? 'white' : 'var(--cp-primary)' }}
                          >
                            <ExternalLink size={11} /> View Page
                          </button>
                        )}
                        {msg.action.type === 'signed_up' && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                              <CheckCircle2 size={11} /> Signed up!
                            </span>
                            {msg.action.url && (
                              <button onClick={() => handleNavigate(msg.action!.url!)} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <ExternalLink size={11} /> View Event
                              </button>
                            )}
                          </div>
                        )}
                        {msg.action.type === 'search_results' && msg.action.results && msg.action.results.length > 0 && (
                          <div className="space-y-1.5 mt-1">
                            {msg.action.results.slice(0, 3).map((r) => (
                              <button
                                key={r.id}
                                onClick={() => handleNavigate(`/event/${r.id}`)}
                                className="w-full text-left text-xs px-3 py-2 rounded-xl flex items-center justify-between transition-all"
                                style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--cp-primary)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--cp-border)'; }}
                              >
                                <div><span className="font-semibold">{r.title}</span><span style={{ color: 'var(--cp-text-3)' }} className="ml-1.5">• {r.category}</span></div>
                                <ExternalLink size={10} style={{ color: 'var(--cp-text-3)' }} />
                              </button>
                            ))}
                          </div>
                        )}
                        {msg.action.type === 'confirm_signup' && (
                          <span className="text-xs font-medium opacity-80">💬 Reply &quot;yes&quot; to confirm</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="px-3.5 py-2.5 flex items-center gap-2 text-sm"
                    style={{ borderRadius: 'var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm)', background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-2)', boxShadow: 'var(--shadow-xs)' }}
                  >
                    <Loader2 size={14} className="animate-spin" style={{ color: 'var(--cp-primary)' }} />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 flex gap-2 shrink-0"
              style={{ background: 'var(--cp-surface)', borderTop: '1px solid var(--cp-border)' }}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={user ? "Ask me anything..." : "Log in for full features..."}
                className="input-base"
                style={{ flex: 1, fontSize: '0.875rem', padding: '0.625rem 1rem', borderRadius: 'var(--r-lg)' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))', color: 'white', boxShadow: '0 4px 16px -4px hsl(from var(--cp-primary) h s l / 0.5)', opacity: !inputMessage.trim() || isLoading ? 0.5 : 1 }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
