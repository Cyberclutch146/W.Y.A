'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createEvent } from '@/services/eventService';
import { uploadImage } from '@/services/storageService';
import { toast } from 'sonner';
import LocationPickerWrapper from '@/components/LocationPickerWrapper';
import DateTimePicker from '@/components/DateTimePicker';
import PromotionModal from '@/components/PromotionModal';
import { Sparkles, ImageIcon, CloudUpload, Loader2, Plus, X, Megaphone, Rocket, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateEventPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Urgent Needs');
  const [distance, setDistance] = useState('Local');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [urgency, setUrgency] = useState<'high' | 'normal'>('normal');

  const [needFunds, setNeedFunds] = useState(false);
  const [fundGoal, setFundGoal] = useState(1000);
  const [needVols, setNeedVols] = useState(false);
  const [volGoal, setVolGoal] = useState(10);
  const [needGoods, setNeedGoods] = useState(false);
  const [goodsItem, setGoodsItem] = useState('');
  const [goodsList, setGoodsList] = useState<string[]>([]);

  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || loading) return;
    setLoading(true);
    try {
      const newEventId = await createEvent({
        title, description,
        organizer: profile.displayName || 'Anonymous',
        organizerId: user.uid,
        location: locationName || profile.location || 'Unknown Location',
        lat, lng, distance, category, urgency,
        imageUrl: image, eventDate,
        needs: {
          ...(needFunds ? { funds: { goal: fundGoal, current: 0 } } : {}),
          ...(needVols ? { volunteers: { goal: volGoal, current: 0 } } : {}),
          ...(needGoods && goodsList.length > 0 ? { goods: goodsList } : {}),
        },
      });
      toast.success('Event published successfully!');
      router.push(`/event/${newEventId}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create event. Please try again.');
      setLoading(false);
    }
  };

  const CATEGORIES = ['Urgent Needs', 'Food Drive', 'Volunteers', 'Community'];
  const URGENCY_OPTS = [
    { key: 'normal' as const, label: '🟢 Normal', accent: 'var(--cp-secondary)', bg: 'hsl(from var(--cp-secondary) h s l / 0.1)' },
    { key: 'high' as const, label: '🔴 High', accent: 'var(--cp-accent)', bg: 'hsl(from var(--cp-accent) h s l / 0.1)' },
  ];

  return (
    <main className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full pb-28 md:pb-10" style={{ color: 'var(--cp-text-1)' }}>
      {/* Header */}
      <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: 'hsl(from var(--cp-secondary) h s l / 0.12)', color: 'var(--cp-secondary)', border: '1px solid hsl(from var(--cp-secondary) h s l / 0.3)' }}>
          <Rocket size={12} /> Organizer
        </div>
        <h1 className="font-headline font-bold text-5xl md:text-7xl tracking-tight leading-none mb-3" style={{ color: 'var(--cp-text-1)' }}>
          Create an <span className="energy-gradient-text">Event</span>
        </h1>
        <p className="max-w-md leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>Start a campus response initiative and rally your community around real change.</p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        className="rounded-2xl p-6 md:p-10"
        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-lg)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }}>Event Title</label>
            <input
              type="text" required className="input-base"
              placeholder="e.g. Campus Cleanup Drive"
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--cp-text-2)' }}>Description</label>
              <button
                type="button"
                onClick={async () => {
                  if (!title) { toast.error('Please enter a title first.'); return; }
                  setGeneratingAi(true);
                  try {
                    const res = await fetch('/api/generate-description', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title, category }),
                    });
                    const data = await res.json();
                    if (res.ok) { setDescription(data.description); toast.success('Description generated!'); }
                    else toast.error(data.error || 'Failed to generate');
                  } catch { toast.error('An error occurred while generating.'); }
                  finally { setGeneratingAi(false); }
                }}
                disabled={generatingAi}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                style={{ background: 'hsl(from var(--cp-primary) h s l / 0.1)', color: 'var(--cp-primary)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)' }}
              >
                {generatingAi ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {generatingAi ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea
              required className="input-base h-32 resize-none"
              placeholder="Describe the goal of your event..."
              value={description} onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category + Urgency */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }}>Category</label>
              <select className="input-base" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }}>Urgency Level</label>
              <div className="flex gap-3">
                {URGENCY_OPTS.map((u) => (
                  <button
                    key={u.key} type="button" onClick={() => setUrgency(u.key)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
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

          {/* Date + Image */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }}>Event Date & Time</label>
              <DateTimePicker value={eventDate} onChange={(val) => setEventDate(val)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--cp-text-2)' }}>Event Image</label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!title) { toast.error('Enter a title first.'); return; }
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
                  }}
                  disabled={generatingImage || uploadingImage}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                  style={{ background: 'hsl(from var(--cp-cyan) h s l / 0.1)', color: 'var(--cp-cyan)', border: '1px solid hsl(from var(--cp-cyan) h s l / 0.25)' }}
                >
                  {generatingImage ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                  {generatingImage ? 'Generating...' : 'AI Image'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <label
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold cursor-pointer transition-all ${generatingImage ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                  style={{ background: 'var(--cp-surface-dim)', border: '1px dashed var(--cp-border)', color: 'var(--cp-text-2)' }}
                >
                  <CloudUpload size={16} style={{ color: 'var(--cp-text-3)' }} />
                  {uploadingImage ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file" accept="image/*" className="hidden"
                    disabled={uploadingImage || generatingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingImage(true);
                      try {
                        const url = await uploadImage(file, 'campaigns');
                        setImage(url);
                      } catch { toast.error('Failed to upload image.'); }
                      finally { setUploadingImage(false); }
                    }}
                  />
                </label>
                {image && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '2px solid var(--cp-border)' }}>
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--cp-text-3)' }}>Optional. Leave blank to use a default image.</p>
            </div>
          </div>

          {/* Location */}
          <div className="pt-6" style={{ borderTop: '1px solid var(--cp-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={15} style={{ color: 'var(--cp-primary)' }} />
              <label className="text-sm font-semibold" style={{ color: 'var(--cp-text-2)' }}>Event Location</label>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--cp-text-3)' }}>Search for an address or click on the map to set the exact location.</p>
            <LocationPickerWrapper
              onLocationSelect={(loc) => { setLocationName(loc.name); setLat(loc.lat); setLng(loc.lng); }}
            />
          </div>

          {/* Needs */}
          <div className="rounded-xl p-5" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
            <div className="text-sm font-semibold mb-4" style={{ color: 'var(--cp-text-2)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--cp-border)' }}>What do you need?</div>
            <div className="space-y-4">
              {/* Funds */}
              <div className="flex items-center gap-4">
                <input type="checkbox" id="needFunds" checked={needFunds} onChange={(e) => setNeedFunds(e.target.checked)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: 'var(--cp-primary)' }} />
                <label htmlFor="needFunds" className="text-sm font-semibold cursor-pointer flex-1" style={{ color: 'var(--cp-text-1)' }}>💰 Funds</label>
                {needFunds && (
                  <input
                    type="number" value={fundGoal} onChange={(e) => setFundGoal(Number(e.target.value))}
                    placeholder="Goal ($)" className="input-base w-32"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
                  />
                )}
              </div>
              {/* Volunteers */}
              <div className="flex items-center gap-4">
                <input type="checkbox" id="needVols" checked={needVols} onChange={(e) => setNeedVols(e.target.checked)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: 'var(--cp-primary)' }} />
                <label htmlFor="needVols" className="text-sm font-semibold cursor-pointer flex-1" style={{ color: 'var(--cp-text-1)' }}>🙋 Volunteers</label>
                {needVols && (
                  <input
                    type="number" value={volGoal} onChange={(e) => setVolGoal(Number(e.target.value))}
                    placeholder="Goal (people)" className="input-base w-32"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
                  />
                )}
              </div>
              {/* Goods */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <input type="checkbox" id="needGoods" checked={needGoods} onChange={(e) => setNeedGoods(e.target.checked)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: 'var(--cp-primary)' }} />
                  <label htmlFor="needGoods" className="text-sm font-semibold cursor-pointer" style={{ color: 'var(--cp-text-1)' }}>📦 Specific Goods</label>
                </div>
                {needGoods && (
                  <div className="pl-8 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text" value={goodsItem} onChange={(e) => setGoodsItem(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (goodsItem.trim()) { setGoodsList([...goodsList, goodsItem.trim()]); setGoodsItem(''); } } }}
                        placeholder="Add item (e.g. Blankets) then Enter"
                        className="input-base flex-1" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => { if (goodsItem.trim()) { setGoodsList([...goodsList, goodsItem.trim()]); setGoodsItem(''); } }}
                        className="btn-primary px-4"
                        style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    {goodsList.length > 0 && (
                      <ul className="space-y-1.5">
                        {goodsList.map((item, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium"
                            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => setGoodsList(goodsList.filter((_, i) => i !== index))}
                              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                              style={{ background: 'hsl(from var(--cp-accent) h s l / 0.1)', color: 'var(--cp-accent)' }}
                            >
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
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !user}
              className="btn-primary flex-1 justify-center text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={17} className="animate-spin" /> Publishing...</> : <><Rocket size={17} /> {user ? 'Publish Event' : 'Sign in to publish'}</>}
            </button>
            <button
              type="button"
              onClick={() => setPromotionModalOpen(true)}
              className="btn-secondary flex-1 justify-center text-base py-4"
            >
              <Megaphone size={17} /> Promote Event
            </button>
          </div>
        </form>
      </motion.div>

      <PromotionModal isOpen={promotionModalOpen} onClose={() => setPromotionModalOpen(false)} />
    </main>
  );
}
