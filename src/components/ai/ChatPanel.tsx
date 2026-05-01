"use client";

import { useState } from "react";
import type { AiMessage } from "@/types/ai";

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
      content: "Hi — I'm CampusPulse AI. I can help with volunteering, donations, event discovery, and platform questions.",
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
    <div className="w-[360px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
      <div className="flex items-center justify-between border-b-4 border-black px-4 py-3" style={{ background: 'var(--color-tertiary-container-base)' }}>
        <div>
          <h3 className="font-headline font-black text-sm uppercase tracking-tight text-on-surface">Ask CampusPulse AI</h3>
          <p className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant">Chat for quick help</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center border-2 border-black text-xs font-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ background: 'var(--color-surface-container-lowest-base)' }}>✕</button>
      </div>
      <div className="h-[420px] space-y-3 overflow-y-auto px-4 py-3" style={{ background: 'var(--color-surface-container-base)' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`max-w-[85%] px-3 py-2 text-sm border-2 border-black ${msg.role === "user" ? "ml-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : ""}`} style={msg.role === "user" ? { background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' } : { background: 'var(--color-surface-container-lowest-base)' }}>{msg.content}</div>
        ))}
        {loading && <div className="max-w-[85%] px-3 py-2 text-sm border-2 border-black text-on-surface-variant" style={{ background: 'var(--color-surface-container-lowest-base)' }}>Thinking...</div>}
      </div>
      <div className="border-t-4 border-black p-3" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about events..." className="flex-1 border-4 border-black px-3 py-2 text-sm outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ background: 'var(--color-surface-container-base)' }} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} />
          <button onClick={sendMessage} disabled={loading} className="px-4 py-2 text-sm font-label font-black uppercase tracking-wider border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>Send</button>
        </div>
      </div>
    </div>
  );
}