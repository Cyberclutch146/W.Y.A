'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2, Zap, Tag, Check, MousePointerClick } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepSparkProps {
  title: string;
  setTitle: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  urgency: 'high' | 'normal';
  setUrgency: (v: 'high' | 'normal') => void;
  setDraftDescription: (v: string) => void;
}

const CATEGORIES = ['Urgent Needs', 'Food Drive', 'Volunteers', 'Community'];
const URGENCY_OPTS = [
  { key: 'normal' as const, label: '🟢 Normal', accent: 'var(--cp-secondary)', bg: 'hsl(from var(--cp-secondary) h s l / 0.1)' },
  { key: 'high' as const, label: '🔴 High', accent: 'var(--cp-accent)', bg: 'hsl(from var(--cp-accent) h s l / 0.1)' },
];

interface AiSuggestion {
  suggestedCategory: string;
  suggestedUrgency: string;
  suggestedTags: string[];
  draftDescription: string;
}

// ─── Module-level cache (persists for the entire browser session, survives re-renders) ───
const suggestionCache = new Map<string, AiSuggestion>();

// ─── Session rate limit: max 5 AI calls per page visit ───
let sessionCallCount = 0;
const SESSION_LIMIT = 5;

export default function StepSpark({
  title, setTitle, category, setCategory,
  urgency, setUrgency, setDraftDescription,
}: StepSparkProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [appliedCategory, setAppliedCategory] = useState(false);
  const [appliedUrgency, setAppliedUrgency] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [lastFetchedTitle, setLastFetchedTitle] = useState('');

  // The title used for the last fetch — to show "stale" state if title changed
  const titleChanged = title.trim() !== lastFetchedTitle.trim() && aiSuggestion !== null;

  const fetchSuggestions = async () => {
    const trimmed = title.trim();

    if (trimmed.length < 5) return;

    // ── GUARD 1: Already fetched this exact title (case-insensitive) ──
    const cacheKey = trimmed.toLowerCase();
    if (suggestionCache.has(cacheKey)) {
      const cached = suggestionCache.get(cacheKey)!;
      setAiSuggestion(cached);
      setDraftDescription(cached.draftDescription);
      setLastFetchedTitle(trimmed);
      setAppliedCategory(false);
      setAppliedUrgency(false);
      return;
    }

    // ── GUARD 2: Session rate limit ──
    if (sessionCallCount >= SESSION_LIMIT) {
      setRateLimited(true);
      return;
    }

    setAiLoading(true);
    setAppliedCategory(false);
    setAppliedUrgency(false);

    try {
      sessionCallCount++;
      const res = await fetch('/api/generate-event-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        // ── GUARD 3: Write to cache before setting state ──
        suggestionCache.set(cacheKey, data);
        setAiSuggestion(data);
        setLastFetchedTitle(trimmed);
        if (data.draftDescription) {
          setDraftDescription(data.draftDescription);
        }
      }
    } catch (err) {
      console.error('AI suggest error:', err);
      sessionCallCount--; // Don't count failed calls
    } finally {
      setAiLoading(false);
    }
  };

  const canFetch = title.trim().length >= 5 && !aiLoading && !rateLimited;
  const isReadyToSuggest = title.trim().length >= 5;

  return (
    <div className="space-y-8">
      {/* Title Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-3 px-0.5" style={{ color: 'var(--cp-text-3)' }}>
          What's your event called?
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Campus Cleanup Drive, Midnight Hackathon..."
          className="input-base w-full text-xl md:text-2xl font-headline font-bold py-5 px-5 rounded-2xl"
          style={{ background: 'var(--cp-surface-dim)', letterSpacing: '-0.02em' }}
          autoFocus
        />

        {/* Status line + manual trigger button */}
        <div className="flex items-center justify-between mt-2 px-1 min-h-[24px]">
          <p className="text-xs" style={{ color: 'var(--cp-text-3)' }}>
            {!isReadyToSuggest && 'Type at least 5 characters for AI suggestions ✨'}
            {isReadyToSuggest && !rateLimited && aiSuggestion && !titleChanged && '✅ AI suggestions loaded'}
            {isReadyToSuggest && !rateLimited && aiSuggestion && titleChanged && '⚡ Title changed — click to refresh suggestions'}
            {isReadyToSuggest && !rateLimited && !aiSuggestion && !aiLoading && 'Ready — click to get AI suggestions'}
            {rateLimited && `⚠️ AI limit reached for this session (${SESSION_LIMIT} calls max)`}
            {aiLoading && 'AI is thinking...'}
          </p>
          {isReadyToSuggest && !rateLimited && (
            <button
              type="button"
              onClick={fetchSuggestions}
              disabled={aiLoading || (!titleChanged && !!aiSuggestion)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
              style={{
                background: 'hsl(from var(--cp-primary) h s l / 0.1)',
                color: 'var(--cp-primary)',
                border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)',
              }}
            >
              {aiLoading
                ? <><Loader2 size={12} className="animate-spin" /> Thinking...</>
                : titleChanged
                ? <><Sparkles size={12} /> Refresh ✨</>
                : aiSuggestion
                ? <><Check size={12} /> Done</>
                : <><Sparkles size={12} /> Suggest ✨</>
              }
            </button>
          )}
        </div>

        {/* Quota badge */}
        {isReadyToSuggest && (
          <div className="flex justify-end mt-1 px-1">
            <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--cp-text-3)' }}>
              {sessionCallCount}/{SESSION_LIMIT} AI calls used this session
            </span>
          </div>
        )}
      </div>

      {/* AI Suggestion Panel */}
      <AnimatePresence mode="wait">
        {aiLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--cp-text-1)' }}>AI is thinking...</p>
                <p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>Analyzing your event title for smart suggestions</p>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--cp-border)', opacity: 0.5, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Rate limited notice */}
        {rateLimited && !aiLoading && (
          <motion.div
            key="rate-limited"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'hsl(from var(--cp-gold) h s l / 0.08)', border: '1px solid hsl(from var(--cp-gold) h s l / 0.2)' }}
          >
            <span className="text-xl">⚡</span>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--cp-text-1)' }}>AI suggestion limit reached</p>
              <p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>
                You've used {SESSION_LIMIT} AI calls this session. Manually pick a category and urgency below — you're still good to go!
              </p>
            </div>
          </motion.div>
        )}

        {!aiLoading && aiSuggestion && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: titleChanged
                ? 'hsl(from var(--cp-gold) h s l / 0.04)'
                : 'hsl(from var(--cp-primary) h s l / 0.04)',
              border: `1px solid ${titleChanged
                ? 'hsl(from var(--cp-gold) h s l / 0.2)'
                : 'hsl(from var(--cp-primary) h s l / 0.15)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: titleChanged ? 'var(--cp-gold)' : 'var(--cp-primary)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: titleChanged ? 'var(--cp-gold)' : 'var(--cp-primary)' }}>
                  {titleChanged ? 'Stale — title changed' : 'AI Suggestions'}
                </span>
              </div>
              {/* Cache hit indicator */}
              {suggestionCache.has(title.trim().toLowerCase()) && !titleChanged && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--cp-secondary-light)', color: 'var(--cp-secondary)' }}>
                  ⚡ Cached
                </span>
              )}
            </div>

            {/* Category suggestion */}
            {aiSuggestion.suggestedCategory && (
              <button
                type="button"
                onClick={() => { setCategory(aiSuggestion.suggestedCategory); setAppliedCategory(true); }}
                disabled={appliedCategory}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left hover:scale-[1.01]"
                style={{
                  background: appliedCategory ? 'hsl(from var(--cp-secondary) h s l / 0.1)' : 'var(--cp-surface)',
                  border: appliedCategory ? '1.5px solid var(--cp-secondary)' : '1px solid var(--cp-border)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: appliedCategory ? 'var(--cp-secondary)' : 'var(--cp-primary-light)', color: appliedCategory ? 'white' : 'var(--cp-primary)' }}>
                  {appliedCategory ? <Check size={16} /> : <Tag size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: appliedCategory ? 'var(--cp-secondary)' : 'var(--cp-text-1)' }}>
                    {appliedCategory ? 'Applied!' : `We think this is a "${aiSuggestion.suggestedCategory}" event`}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>
                    {appliedCategory ? `Category set to ${aiSuggestion.suggestedCategory}` : 'Click to auto-set category'}
                  </p>
                </div>
              </button>
            )}

            {/* Urgency suggestion */}
            {aiSuggestion.suggestedUrgency && (
              <button
                type="button"
                onClick={() => { setUrgency(aiSuggestion.suggestedUrgency as 'high' | 'normal'); setAppliedUrgency(true); }}
                disabled={appliedUrgency}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left hover:scale-[1.01]"
                style={{
                  background: appliedUrgency ? 'hsl(from var(--cp-secondary) h s l / 0.1)' : 'var(--cp-surface)',
                  border: appliedUrgency ? '1.5px solid var(--cp-secondary)' : '1px solid var(--cp-border)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: appliedUrgency ? 'var(--cp-secondary)' : 'hsl(from var(--cp-accent) h s l / 0.12)', color: appliedUrgency ? 'white' : 'var(--cp-accent)' }}>
                  {appliedUrgency ? <Check size={16} /> : <Zap size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: appliedUrgency ? 'var(--cp-secondary)' : 'var(--cp-text-1)' }}>
                    {appliedUrgency ? 'Applied!' : `Urgency: ${aiSuggestion.suggestedUrgency === 'high' ? '🔴 High Priority' : '🟢 Normal'}`}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>
                    {appliedUrgency ? `Urgency set to ${aiSuggestion.suggestedUrgency}` : 'Click to apply'}
                  </p>
                </div>
              </button>
            )}

            {/* Tags */}
            {aiSuggestion.suggestedTags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {aiSuggestion.suggestedTags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'hsl(from var(--cp-primary) h s l / 0.1)', color: 'var(--cp-primary)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.15)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state — ready but not fetched yet */}
        {!aiLoading && !aiSuggestion && isReadyToSuggest && !rateLimited && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--cp-surface-dim)', border: '1px dashed var(--cp-border)' }}
          >
            <MousePointerClick size={20} style={{ color: 'var(--cp-text-3)', shrink: 0 }} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--cp-text-2)' }}>Get AI suggestions</p>
              <p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>
                Click "Suggest ✨" above to let AI recommend a category, urgency, tags, and a draft description.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-3 px-0.5" style={{ color: 'var(--cp-text-3)' }}>
          Category
        </label>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => setCategory(cat)}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{
                background: category === cat ? 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))' : 'var(--cp-surface-dim)',
                color: category === cat ? 'white' : 'var(--cp-text-2)',
                border: category === cat ? 'none' : '1px solid var(--cp-border)',
                boxShadow: category === cat ? '0 6px 20px -6px hsl(from var(--cp-primary) h s l / 0.45)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-3 px-0.5" style={{ color: 'var(--cp-text-3)' }}>
          Urgency Level
        </label>
        <div className="flex gap-3">
          {URGENCY_OPTS.map((u) => (
            <button key={u.key} type="button" onClick={() => setUrgency(u.key)}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{
                background: urgency === u.key ? u.bg : 'var(--cp-surface-dim)',
                color: urgency === u.key ? u.accent : 'var(--cp-text-2)',
                border: urgency === u.key ? `1.5px solid ${u.accent}` : '1px solid var(--cp-border)',
              }}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
