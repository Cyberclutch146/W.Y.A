'use client';

import { useState } from 'react';
import { Sparkles, Loader2, CloudUpload, ImageIcon, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { uploadImage } from '@/services/storageService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface StepMediaProps {
  title: string;
  category: string;
  description: string;
  setDescription: (v: string) => void;
  image: string;
  setImage: (v: string) => void;
  needFunds: boolean;
  setNeedFunds: (v: boolean) => void;
  fundGoal: number;
  setFundGoal: (v: number) => void;
  needVols: boolean;
  setNeedVols: (v: boolean) => void;
  volGoal: number;
  setVolGoal: (v: number) => void;
  needGoods: boolean;
  setNeedGoods: (v: boolean) => void;
  goodsItem: string;
  setGoodsItem: (v: string) => void;
  goodsList: string[];
  setGoodsList: (v: string[]) => void;
}

export default function StepMedia({
  title, category, description, setDescription,
  image, setImage,
  needFunds, setNeedFunds, fundGoal, setFundGoal,
  needVols, setNeedVols, volGoal, setVolGoal,
  needGoods, setNeedGoods, goodsItem, setGoodsItem,
  goodsList, setGoodsList,
}: StepMediaProps) {
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [needsExpanded, setNeedsExpanded] = useState(needFunds || needVols || needGoods);

  const handleGenerateDescription = async () => {
    if (!title) { toast.error('Go back and enter a title first.'); return; }
    setGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category }),
      });
      const data = await res.json();
      if (res.ok) { setDescription(data.description); toast.success('Description regenerated!'); }
      else toast.error(data.error || 'Failed to generate');
    } catch { toast.error('An error occurred.'); }
    finally { setGeneratingAi(false); }
  };

  const handleGenerateImage = async () => {
    if (!title) { toast.error('Go back and enter a title first.'); return; }
    setGeneratingImage(true);
    try {
      toast.info('Generating image with AI...');
      const prompt = `High-quality cover photo for a campus event: ${title}. ${category}. Beautiful lighting, no text.`;
      const response = await fetch('/api/generate-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) { const d = await response.json().catch(() => ({})); throw new Error(d.error || 'Failed'); }
      const blob = await response.blob();
      const file = new File([blob], 'ai-event.jpg', { type: 'image/jpeg' });
      const url = await uploadImage(file, 'campaigns');
      setImage(url);
      toast.success('AI image generated!');
    } catch (err) { console.error(err); toast.error('Failed to generate image.'); }
    finally { setGeneratingImage(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'campaigns');
      setImage(url);
    } catch { toast.error('Failed to upload image.'); }
    finally { setUploadingImage(false); }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>Description</label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={generatingAi}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
            style={{ background: 'hsl(from var(--cp-primary) h s l / 0.1)', color: 'var(--cp-primary)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)' }}
          >
            {generatingAi ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {generatingAi ? 'Generating...' : 'Regenerate ✨'}
          </button>
        </div>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the goal of your event..."
            rows={5}
            className="input-base w-full resize-none text-sm font-medium rounded-xl"
            style={{ background: 'var(--cp-surface-dim)' }}
          />
          {description && (
            <span className="absolute bottom-3 right-3 text-[10px] font-bold tabular-nums" style={{ color: 'var(--cp-text-3)' }}>
              {description.length}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] mt-1.5 px-1" style={{ color: 'var(--cp-secondary)' }}>
            ✅ AI-drafted description ready — feel free to tweak it!
          </p>
        )}
      </div>

      {/* Image */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>Event Image</label>
          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={generatingImage || uploadingImage}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
            style={{ background: 'hsl(from var(--cp-cyan) h s l / 0.1)', color: 'var(--cp-cyan)', border: '1px solid hsl(from var(--cp-cyan) h s l / 0.25)' }}
          >
            {generatingImage ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
            {generatingImage ? 'Generating...' : 'AI Image'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <label
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold cursor-pointer transition-all ${generatingImage ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            style={{ background: 'var(--cp-surface-dim)', border: '1px dashed var(--cp-border)', color: 'var(--cp-text-2)' }}
          >
            <CloudUpload size={16} style={{ color: 'var(--cp-text-3)' }} />
            {uploadingImage ? 'Uploading...' : 'Choose File'}
            <input type="file" accept="image/*" className="hidden" disabled={uploadingImage || generatingImage} onChange={handleImageUpload} />
          </label>
          {image && (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group" style={{ border: '2px solid var(--cp-border)' }}>
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs mt-2 px-1" style={{ color: 'var(--cp-text-3)' }}>Optional. Leave blank for a default image.</p>
      </div>

      {/* Needs — Collapsible */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
        <button
          type="button"
          onClick={() => setNeedsExpanded(!needsExpanded)}
          className="w-full flex items-center justify-between p-5 transition-all hover:opacity-80"
        >
          <span className="text-sm font-bold" style={{ color: 'var(--cp-text-1)' }}>🎯 What do you need?</span>
          {needsExpanded ? <ChevronUp size={18} style={{ color: 'var(--cp-text-3)' }} /> : <ChevronDown size={18} style={{ color: 'var(--cp-text-3)' }} />}
        </button>

        <AnimatePresence>
          {needsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--cp-border)' }}>
                <div className="pt-4" />

                {/* Funds */}
                <div className="flex items-center gap-4">
                  <input type="checkbox" id="needFunds" checked={needFunds} onChange={(e) => setNeedFunds(e.target.checked)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: 'var(--cp-primary)' }} />
                  <label htmlFor="needFunds" className="text-sm font-bold cursor-pointer flex-1" style={{ color: 'var(--cp-text-1)' }}>💰 Funds</label>
                  {needFunds && (
                    <input type="number" value={fundGoal} onChange={(e) => setFundGoal(Number(e.target.value))} placeholder="Goal ($)" className="input-base w-32" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }} />
                  )}
                </div>

                {/* Volunteers */}
                <div className="flex items-center gap-4">
                  <input type="checkbox" id="needVols" checked={needVols} onChange={(e) => setNeedVols(e.target.checked)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: 'var(--cp-primary)' }} />
                  <label htmlFor="needVols" className="text-sm font-bold cursor-pointer flex-1" style={{ color: 'var(--cp-text-1)' }}>🙋 Volunteers</label>
                  {needVols && (
                    <input type="number" value={volGoal} onChange={(e) => setVolGoal(Number(e.target.value))} placeholder="Goal" className="input-base w-32" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }} />
                  )}
                </div>

                {/* Goods */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="needGoods" checked={needGoods} onChange={(e) => setNeedGoods(e.target.checked)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: 'var(--cp-primary)' }} />
                    <label htmlFor="needGoods" className="text-sm font-bold cursor-pointer" style={{ color: 'var(--cp-text-1)' }}>📦 Specific Goods</label>
                  </div>
                  {needGoods && (
                    <div className="pl-8 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text" value={goodsItem} onChange={(e) => setGoodsItem(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (goodsItem.trim()) { setGoodsList([...goodsList, goodsItem.trim()]); setGoodsItem(''); } } }}
                          placeholder="Add item then Enter" className="input-base flex-1" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
                        />
                        <button type="button" onClick={() => { if (goodsItem.trim()) { setGoodsList([...goodsList, goodsItem.trim()]); setGoodsItem(''); } }} className="btn-primary px-4" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}>
                          <Plus size={15} />
                        </button>
                      </div>
                      {goodsList.length > 0 && (
                        <ul className="space-y-1.5">
                          {goodsList.map((item, index) => (
                            <li key={index} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}>
                              <span>{item}</span>
                              <button type="button" onClick={() => setGoodsList(goodsList.filter((_, i) => i !== index))} className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ background: 'hsl(from var(--cp-accent) h s l / 0.1)', color: 'var(--cp-accent)' }}>
                                <X size={13} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
