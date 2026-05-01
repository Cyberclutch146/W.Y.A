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
        title,
        description,
        organizer: profile.displayName || 'Anonymous',
        organizerId: user.uid,
        location: locationName || profile.location || 'Unknown Location',
        lat,
        lng,
        distance,
        category,
        urgency,
        imageUrl: image,
        eventDate,
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

  // Shared brutalist input class
  const inputCls = 'w-full border-2 border-black bg-white py-3 px-4 text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#ffd93d] transition-all placeholder:text-black/40';
  const labelCls = 'block text-sm font-black text-black mb-2 uppercase';

  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black text-xs font-black uppercase tracking-widest mb-4 bg-[#93f59c]"
          style={{ boxShadow: '2px 2px 0 #000' }}
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Organizer
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black uppercase leading-none mb-2">
          Create an <span className="bg-[#ffd93d] px-2 border-4 border-black">Event</span>
        </h1>
        <p className="text-black/60 font-medium mt-2">Start a campus response initiative and rally your community.</p>
      </div>

      {/* Form Card */}
      <div
        className="border-4 border-black p-6 md:p-8 bg-white animate-fade-in-up delay-100"
        style={{ boxShadow: '6px 6px 0 #000' }}
      >
        <p className="text-black/60 font-medium mb-6 pb-6 border-b-2 border-black">
          Share your vision and rally your community around local needs.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {/* Title */}
          <div>
            <label className={labelCls}>Event Title</label>
            <input
              type="text"
              required
              className={inputCls}
              placeholder="e.g. Campus Cleanup Drive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ boxShadow: '2px 2px 0 #000' }}
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>Description</label>
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
                className="text-xs flex items-center gap-1 font-black border-2 border-black px-3 py-1 bg-[#ffd93d] hover:bg-black hover:text-white transition-colors uppercase disabled:opacity-50"
                style={{ boxShadow: '2px 2px 0 #000' }}
              >
                {generatingAi ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                )}
                {generatingAi ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea
              required
              className={`${inputCls} h-32 resize-none`}
              placeholder="Describe the goal of your event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ boxShadow: '2px 2px 0 #000' }}
            />
          </div>

          {/* Category + Urgency */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className={labelCls}>Category</label>
              <select
                className={inputCls}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ boxShadow: '2px 2px 0 #000' }}
              >
                <option>Urgent Needs</option>
                <option>Food Drive</option>
                <option>Volunteers</option>
                <option>Community</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelCls}>Urgency Level</label>
              <div className="flex gap-3">
                {(['normal', 'high'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUrgency(u)}
                    className={`flex-1 py-3 text-sm font-black border-2 border-black uppercase transition-all ${
                      urgency === u
                        ? u === 'high' ? 'bg-red-500 text-white' : 'bg-black text-white'
                        : 'bg-white text-black hover:bg-[#ffd93d]'
                    }`}
                    style={{ boxShadow: urgency === u ? 'none' : '2px 2px 0 #000' }}
                  >
                    {u === 'high' ? '🔴 High' : '🟢 Normal'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date + Image */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className={labelCls}>Event Date &amp; Time</label>
              <DateTimePicker value={eventDate} onChange={(val) => setEventDate(val)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>Event Image</label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!title) { toast.error('Enter a title first.'); return; }
                    setGeneratingImage(true);
                    try {
                      toast.info('Generating image with AI...');
                      const prompt = `High-quality cover photo for a campus event: ${title}. ${category}. Beautiful lighting, no text.`;
                      const response = await fetch('/api/generate-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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
                  className="text-xs flex items-center gap-1 font-black border-2 border-black px-3 py-1 bg-[#ffd93d] hover:bg-black hover:text-white transition-colors uppercase disabled:opacity-50"
                  style={{ boxShadow: '2px 2px 0 #000' }}
                >
                  {generatingImage ? <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[16px]">image</span>}
                  {generatingImage ? 'Generating...' : 'AI Image'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <label
                  className={`border-2 border-black px-4 py-3 text-sm font-black flex-1 text-center cursor-pointer flex items-center justify-center gap-2 bg-white hover:bg-[#ccdcff] transition-colors uppercase ${generatingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ boxShadow: '2px 2px 0 #000' }}
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  {uploadingImage ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
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
                  <div className="w-14 h-14 border-2 border-black overflow-hidden flex-shrink-0">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-black/50 mt-2 font-medium">Optional. Leave blank to use a default image.</p>
            </div>
          </div>

          {/* Location */}
          <div className="pt-6 border-t-2 border-black">
            <label className={labelCls}>Event Location</label>
            <p className="text-xs text-black/50 mb-4 font-medium">Search for an address or click on the map to set the exact location.</p>
            <LocationPickerWrapper
              onLocationSelect={(loc) => {
                setLocationName(loc.name);
                setLat(loc.lat);
                setLng(loc.lng);
              }}
            />
          </div>

          {/* Needs */}
          <div
            className="border-2 border-black p-5 bg-[#ffd93d]/10"
            style={{ boxShadow: '2px 2px 0 #000' }}
          >
            <div className="font-black text-sm mb-4 text-black uppercase border-b-2 border-black pb-3">What do you need?</div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input type="checkbox" id="needFunds" checked={needFunds} onChange={(e) => setNeedFunds(e.target.checked)} className="w-5 h-5 border-2 border-black accent-black" />
                <label htmlFor="needFunds" className="text-sm font-black uppercase cursor-pointer">💰 Funds</label>
                {needFunds && (
                  <input
                    type="number"
                    value={fundGoal}
                    onChange={(e) => setFundGoal(Number(e.target.value))}
                    placeholder="Goal ($)"
                    className="ml-auto w-32 border-2 border-black px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ffd93d] bg-white"
                    style={{ boxShadow: '2px 2px 0 #000' }}
                  />
                )}
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" id="needVols" checked={needVols} onChange={(e) => setNeedVols(e.target.checked)} className="w-5 h-5 border-2 border-black accent-black" />
                <label htmlFor="needVols" className="text-sm font-black uppercase cursor-pointer">🙋 Volunteers</label>
                {needVols && (
                  <input
                    type="number"
                    value={volGoal}
                    onChange={(e) => setVolGoal(Number(e.target.value))}
                    placeholder="Goal (people)"
                    className="ml-auto w-32 border-2 border-black px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ffd93d] bg-white"
                    style={{ boxShadow: '2px 2px 0 #000' }}
                  />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <input type="checkbox" id="needGoods" checked={needGoods} onChange={(e) => setNeedGoods(e.target.checked)} className="w-5 h-5 border-2 border-black accent-black" />
                  <label htmlFor="needGoods" className="text-sm font-black uppercase cursor-pointer">📦 Specific Goods</label>
                </div>
                {needGoods && (
                  <div className="pl-9 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={goodsItem}
                        onChange={(e) => setGoodsItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (goodsItem.trim()) { setGoodsList([...goodsList, goodsItem.trim()]); setGoodsItem(''); }
                          }
                        }}
                        placeholder="Add item (e.g. Blankets) then Enter"
                        className="flex-1 border-2 border-black px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ffd93d] bg-white"
                        style={{ boxShadow: '2px 2px 0 #000' }}
                      />
                      <button
                        type="button"
                        onClick={() => { if (goodsItem.trim()) { setGoodsList([...goodsList, goodsItem.trim()]); setGoodsItem(''); } }}
                        className="px-4 py-1.5 border-2 border-black text-sm font-black bg-black text-white hover:bg-[#ffd93d] hover:text-black transition-colors uppercase"
                        style={{ boxShadow: '2px 2px 0 #555' }}
                      >
                        Add
                      </button>
                    </div>
                    {goodsList.length > 0 && (
                      <ul className="space-y-2">
                        {goodsList.map((item, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center px-3 py-2 text-sm border-2 border-black bg-white font-medium"
                            style={{ boxShadow: '2px 2px 0 #000' }}
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => setGoodsList(goodsList.filter((_, i) => i !== index))}
                              className="text-red-500 hover:bg-red-50 p-1 border border-red-200 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
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
              className="flex-1 px-8 py-4 border-2 border-black font-black text-white bg-black hover:bg-[#ffd93d] hover:text-black transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
              style={{ boxShadow: '4px 4px 0 #555' }}
            >
              {loading ? 'Publishing...' : user ? '🚀 Publish Event' : 'Sign in to publish'}
            </button>

            <button
              type="button"
              onClick={() => setPromotionModalOpen(true)}
              className="flex-1 px-8 py-4 border-2 border-black font-black text-black bg-[#ccdcff] hover:bg-[#ffd93d] transition-colors uppercase flex items-center justify-center gap-2 active:scale-[0.97]"
              style={{ boxShadow: '4px 4px 0 #000' }}
            >
              <span className="material-symbols-outlined text-[20px]">campaign</span>
              Promote Event
            </button>
          </div>
        </form>
      </div>

      <PromotionModal isOpen={promotionModalOpen} onClose={() => setPromotionModalOpen(false)} />
    </main>
  );
}
