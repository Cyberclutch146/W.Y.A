"use client";

import { useState } from "react";
import type { AiMessage } from "@/types/ai";
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
}

export function ChatPanel({ onClose }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hi — I'm W.Y.A AI. I can help with volunteering, donations, event discovery, and platform questions.",
    },
  ]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const nextUserMessage: AiMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chatbot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages }) });
      if (!res.ok) throw new Error("Failed to get AI response");
      const data = await res.json();
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Sorry, I hit an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="w-[360px] overflow-hidden rounded-2xl"
      style={{
        background: 'var(--cp-surface)',
        border: '1px solid var(--cp-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))', color: 'white' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Bot size={16} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm">W.Y.A AI</h3>
            <p className="text-[10px] opacity-80">Chat for quick help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/20"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="h-[420px] space-y-3 overflow-y-auto px-4 py-3" style={{ background: 'var(--cp-surface-dim)' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] px-3.5 py-2.5 text-sm rounded-xl ${msg.role === "user" ? "ml-auto" : ""}`}
              style={msg.role === "user" ? {
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
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div
            className="max-w-[85%] px-3.5 py-2.5 text-sm rounded-xl flex items-center gap-2"
            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-3)' }}
          >
            <Loader2 size={14} className="animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3" style={{ borderTop: '1px solid var(--cp-border)' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about events..."
            className="input-base flex-1 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--cp-primary)', color: 'white' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}