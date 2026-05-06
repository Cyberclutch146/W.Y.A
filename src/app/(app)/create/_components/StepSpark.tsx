'use client';

import { useState } from 'react';
import {
  Sparkles, Loader2, Check, MousePointerClick,
  GraduationCap, Users, Trophy, Code2, Palette,
  Heart, Coffee, Briefcase, Tag, Zap,
} from 'lucide-react';
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

const CATEGORIES = [
  { value: '🎓 Academic',       label: 'Academic',       Icon: GraduationCap },
  { value: '🎉 Social',         label: 'Social',         Icon: Users         },
  { value: '🏆 Sports & Fitness', label: 'Sports',       Icon: Trophy        },
  { value: '💻 Tech',           label: 'Tech',           Icon: Code2         },
  { value: '🎨 Arts & Culture', label: 'Arts & Culture', Icon: Palette       },
  { value: '🤝 Participanting',   label: 'Participanting',   Icon: Heart         },
  { value: '🍕 Food & Hangouts', label: 'Food & Hangouts', Icon: Coffee      },
  { value: '💼 Career',         label: 'Career',         Icon: Briefcase     },
];

interface AiSuggestion {
  suggestedCategory: string;
  suggestedUrgency: string;
  suggestedTags: string[];
  draftDescription: string;
}

const suggestionCache = new Map<string, AiSuggestion>();
let sessionCallCount = 0;
const SESSION_LIMIT = 5;

// ── Shared section style ──────────────────────────────────────
const sectionStyle = {
  borderBottom: '1px solid var(--cp-border)',
  paddingBottom: '2rem',
  marginBottom: '2rem',
};

export default function StepSpark({
  title, setTitle, category, setCategory,
  urgency, setUrgency, setDraftDescription,
}: StepSparkProps) {
  const [aiLoading, setAiLoading]         = useState(false);
  const [aiSuggestion, setAiSuggestion]   = useState<AiSuggestion | null>(null);
  const [appliedCategory, setAppliedCategory] = useState(false);
  const [appliedUrgency, setAppliedUrgency]   = useState(false);
  const [rateLimited, setRateLimited]     = useState(false);
  const [lastFetchedTitle, setLastFetchedTitle] = useState('');
  const [titleTouched, setTitleTouched]   = useState(false);

  const titleChanged = title.trim() !== lastFetchedTitle.trim() && aiSuggestion !== null;
  const isReadyToSuggest = title.trim().length >= 5;
  const titleError = titleTouched && title.trim().length > 0 && title.trim().length < 5;
  const canFetch = isReadyToSuggest && !aiLoading && !rateLimited;

  const fetchSuggestions = async () => {
    const trimmed = title.trim();
    if (trimmed.length < 5) return;
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
    if (sessionCallCount >= SESSION_LIMIT) { setRateLimited(true); return; }
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
        suggestionCache.set(cacheKey, data);
        setAiSuggestion(data);
        setLastFetchedTitle(trimmed);
        if (data.draftDescription) setDraftDescription(data.draftDescription);
      }
    } catch (err) {
      console.error(err);
      sessionCallCount--;
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      {/* ── Title ── */}
      <div style={sectionStyle}>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--cp-text-3)' }}>
          Event Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setTitleTouched(true); }}
          onBlur={() => setTitleTouched(true)}
          placeholder="e.g. Midnight Hackathon, Campus Cleanup Drive..."
          className="input-base w-full text-2xl md:text-3xl font-headline font-bold py-4 px-0"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: titleError
              ? '2px solid var(--cp-accent)'
              : isReadyToSuggest
              ? '2px solid var(--cp-primary)'
              : '2px solid var(--cp-border)',
            borderRadius: 0,
            letterSpacing: '-0.02em',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          autoFocus
        />

        {/* Status row */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs" style={{ color: titleError ? 'var(--cp-accent)' : 'var(--cp-text-3)' }}>
            {titleError && 'Title must be at least 5 characters'}
            {!titleError && !isReadyToSuggest && (title.length === 0 ? 'Give your event a name' : 'Keep going...')}
            {!titleError && isReadyToSuggest && !rateLimited && !aiSuggestion && !aiLoading && 'Ready — click Suggest for AI recommendations'}
            {!titleError && isReadyToSuggest && !rateLimited && aiSuggestion && !titleChanged && 'AI suggestions ready'}
            {!titleError && isReadyToSuggest && !rateLimited && aiSuggestion && titleChanged && 'Title changed — refresh suggestions'}
            {!titleError && rateLimited && `AI call limit reached (${SESSION_LIMIT} per session)`}
            {!titleError && aiLoading && 'Analyzing your title...'}
          </p>
          <div className="flex items-center gap-3">
            {isReadyToSuggest && !rateLimited && (
              <button
                type="button"
                onClick={fetchSuggestions}
                disabled={aiLoading || (!titleChanged && !!aiSuggestion)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all disabled:opacity-40"
                style={{
                  borderRadius: '4px',
                  background: 'hsl(from var(--cp-primary) h s l / 0.08)',
                  color: 'var(--cp-primary)',
                  border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)',
                }}
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {aiLoading ? 'Thinking...' : titleChanged ? 'Refresh' : aiSuggestion ? 'Done' : 'Suggest'}
              </button>
            )}
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--cp-text-3)' }}>
              {sessionCallCount}/{SESSION_LIMIT}
            </span>
          </div>
        </div>
      </div>

      {/* ── AI Panel ── */}
      <AnimatePresence mode="wait">
        {aiLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mb-8 p-5 flex items-center gap-4"
            style={{ border: '1px solid var(--cp-border)', borderRadius: 0, background: 'var(--cp-surface-dim)' }}>
            <Loader2 size={16} className="animate-spin shrink-0" style={{ color: 'var(--cp-primary)' }} />
            <div>
              <p className="text-sm font-semibold">Analyzing your event title</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cp-text-3)' }}>Generating category, urgency, and description suggestions</p>
            </div>
          </motion.div>
        )}

        {rateLimited && !aiLoading && (
          <motion.div key="ratelimit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-8 p-5"
            style={{ border: '1px solid hsl(from var(--cp-gold) h s l / 0.3)', borderRadius: 0, background: 'hsl(from var(--cp-gold) h s l / 0.06)' }}>
            <p className="text-sm font-semibold">AI limit reached</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cp-text-3)' }}>
              You have used {SESSION_LIMIT} AI calls this session. Select a category and urgency manually below.
            </p>
          </motion.div>
        )}

        {!aiLoading && aiSuggestion && (
          <motion.div key="suggestions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 space-y-3"
            style={{
              border: `1px solid ${titleChanged ? 'hsl(from var(--cp-gold) h s l / 0.3)' : 'hsl(from var(--cp-primary) h s l / 0.2)'}`,
              borderRadius: 0,
              background: titleChanged ? 'hsl(from var(--cp-gold) h s l / 0.04)' : 'hsl(from var(--cp-primary) h s l / 0.04)',
            }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} style={{ color: titleChanged ? 'var(--cp-gold)' : 'var(--cp-primary)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: titleChanged ? 'var(--cp-gold)' : 'var(--cp-primary)' }}>
                {titleChanged ? 'Stale — title changed' : 'AI Suggestions'}
              </span>
              {suggestionCache.has(title.trim().toLowerCase()) && !titleChanged && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5"
                  style={{ borderRadius: '3px', background: 'var(--cp-secondary-light)', color: 'var(--cp-secondary)' }}>
                  Cached
                </span>
              )}
            </div>

            {aiSuggestion.suggestedCategory && (
              <button type="button" disabled={appliedCategory}
                onClick={() => { setCategory(aiSuggestion.suggestedCategory); setAppliedCategory(true); }}
                className="w-full flex items-center gap-3 p-3 text-left transition-all"
                style={{
                  borderRadius: 0,
                  background: appliedCategory ? 'hsl(from var(--cp-secondary) h s l / 0.08)' : 'var(--cp-surface)',
                  border: appliedCategory ? '1px solid var(--cp-secondary)' : '1px solid var(--cp-border)',
                }}>
                <Tag size={14} style={{ color: appliedCategory ? 'var(--cp-secondary)' : 'var(--cp-text-3)' }} />
                <span className="text-sm font-semibold flex-1"
                  style={{ color: appliedCategory ? 'var(--cp-secondary)' : 'var(--cp-text-1)' }}>
                  {appliedCategory ? `Applied: ${aiSuggestion.suggestedCategory.replace(/^\S+\s/, '')}` : `Category: ${aiSuggestion.suggestedCategory.replace(/^\S+\s/, '')}`}
                </span>
                {!appliedCategory && <span className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>Apply</span>}
                {appliedCategory && <Check size={14} style={{ color: 'var(--cp-secondary)' }} />}
              </button>
            )}

            {aiSuggestion.suggestedUrgency && (
              <button type="button" disabled={appliedUrgency}
                onClick={() => { setUrgency(aiSuggestion.suggestedUrgency as 'high' | 'normal'); setAppliedUrgency(true); }}
                className="w-full flex items-center gap-3 p-3 text-left transition-all"
                style={{
                  borderRadius: 0,
                  background: appliedUrgency ? 'hsl(from var(--cp-secondary) h s l / 0.08)' : 'var(--cp-surface)',
                  border: appliedUrgency ? '1px solid var(--cp-secondary)' : '1px solid var(--cp-border)',
                }}>
                <Zap size={14} style={{ color: appliedUrgency ? 'var(--cp-secondary)' : 'var(--cp-text-3)' }} />
                <span className="text-sm font-semibold flex-1"
                  style={{ color: appliedUrgency ? 'var(--cp-secondary)' : 'var(--cp-text-1)' }}>
                  {appliedUrgency ? `Applied: ${aiSuggestion.suggestedUrgency}` : `Urgency: ${aiSuggestion.suggestedUrgency === 'high' ? 'High Priority' : 'Normal'}`}
                </span>
                {!appliedUrgency && <span className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>Apply</span>}
                {appliedUrgency && <Check size={14} style={{ color: 'var(--cp-secondary)' }} />}
              </button>
            )}

            {aiSuggestion.suggestedTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {aiSuggestion.suggestedTags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 text-[11px] font-semibold"
                    style={{ borderRadius: '3px', background: 'hsl(from var(--cp-primary) h s l / 0.08)', color: 'var(--cp-primary)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.15)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!aiLoading && !aiSuggestion && isReadyToSuggest && !rateLimited && (
          <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mb-8 p-5 flex items-center gap-4"
            style={{ border: '1px dashed var(--cp-border)', borderRadius: 0 }}>
            <MousePointerClick size={16} style={{ color: 'var(--cp-text-3)', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold">Get AI suggestions</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cp-text-3)' }}>
                Click Suggest above — AI will recommend a category, urgency, tags, and a draft description.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category ── */}
      <div style={sectionStyle}>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cp-text-3)' }}>
          Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(({ value, label, Icon }) => {
            const isSelected = category === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`flex flex-col items-center justify-center gap-3 py-5 px-2 transition-all ${isSelected ? '' : 'hover:scale-[1.02] active:scale-95'}`}
                style={{
                  borderRadius: '4px',
                  background: isSelected ? 'var(--cp-primary)' : 'var(--cp-surface-dim)',
                  color: isSelected ? 'white' : 'var(--cp-text-2)',
                  border: isSelected ? '1px solid var(--cp-primary)' : '1px solid var(--cp-border)',
                }}
              >
                <Icon size={20} />
                <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Urgency ── */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cp-text-3)' }}>
          Urgency Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['normal', 'high'] as const).map(u => {
            const isSelected = urgency === u;
            return (
              <button
                key={u}
                type="button"
                onClick={() => setUrgency(u)}
                className={`py-4 px-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${isSelected ? '' : 'hover:scale-[1.02] active:scale-95'}`}
                style={{
                  borderRadius: '4px',
                  background: isSelected
                    ? u === 'high'
                      ? 'hsl(from var(--cp-accent) h s l / 0.1)'
                      : 'hsl(from var(--cp-secondary) h s l / 0.1)'
                    : 'var(--cp-surface-dim)',
                  color: isSelected
                    ? u === 'high' ? 'var(--cp-accent)' : 'var(--cp-secondary)'
                    : 'var(--cp-text-2)',
                  border: isSelected
                    ? `1.5px solid ${u === 'high' ? 'var(--cp-accent)' : 'var(--cp-secondary)'}`
                    : '1px solid var(--cp-border)',
                }}
              >
                {u === 'high' && <Zap size={16} />}
                {u === 'normal' ? 'Normal' : 'High Priority'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
