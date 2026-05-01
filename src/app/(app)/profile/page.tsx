'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { uploadImage } from '@/services/storageService';
import { toast } from 'sonner';
import { getUserAvatar } from '@/lib/avatar';

export default function ProfilePage() {
  const { user, profile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [equipment, setEquipment] = useState('');
  const [travelRadius, setTravelRadius] = useState(10);
  const [availability, setAvailability] = useState('anytime');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setSkills(profile.skills ? profile.skills.join(', ') : '');
      setEquipment(profile.equipment ? profile.equipment.join(', ') : '');
      setTravelRadius(profile.travelRadius || 10);
      setAvailability(profile.availability || 'anytime');
    }
  }, [profile, isEditing]);

  if (!user || !profile) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10 flex justify-center items-center">
        {!user ? (
          <p className="font-black uppercase text-black">Please sign in to view your profile.</p>
        ) : (
          <div className="w-12 h-12 border-4 border-black border-t-[#ffd93d] rounded-full animate-spin" />
        )}
      </main>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, `avatars/${user.uid}`);
      await updateUserProfile(user.uid, { avatarUrl: url });
      toast.success('Profile photo updated!');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!user) return;
    setUploadingImage(true);
    try {
      await updateUserProfile(user.uid, { avatarUrl: '' });
      toast.success('Profile photo removed!');
    } catch (err) {
      console.error('Error removing image:', err);
      toast.error('Failed to remove image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        equipment: equipment.split(',').map(s => s.trim()).filter(Boolean),
        travelRadius,
        availability,
        profileComplete: true,
      });
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const currentAvatar = getUserAvatar(profile?.avatarUrl, profile?.displayName);

  // Shared brutal input class
  const inputCls = 'w-full border-2 border-black bg-white py-3 px-4 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#ffd93d] transition-all placeholder:text-black/40';

  if (isEditing) {
    return (
      <main className="flex-grow w-full max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-12">
        {/* Mobile back */}
        <div className="md:hidden mb-6 flex items-center justify-between">
          <button onClick={() => setIsEditing(false)} aria-label="Go back" className="border-2 border-black p-2 bg-white hover:bg-[#ffd93d] transition-colors" style={{ boxShadow: '2px 2px 0 #000' }}>
            <span aria-hidden="true" className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-black uppercase">Edit Profile</h1>
          <div className="w-10" />
        </div>

        <div className="hidden md:block mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-black text-black uppercase mb-2">Edit Profile</h1>
          <p className="text-black/60 font-medium">Keep your profile current so your community can find you.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8 border-4 border-black p-6 md:p-10 bg-white animate-fade-in-up delay-100" style={{ boxShadow: '6px 6px 0 #000' }}>
          {/* Photo */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-8 border-b-2 border-black">
            <div className="w-28 h-28 border-4 border-black overflow-hidden flex items-center justify-center" style={{ background: '#ccdcff', boxShadow: '4px 4px 0 #000' }}>
              {uploadingImage ? (
                <div className="w-8 h-8 border-4 border-black border-t-[#ffd93d] rounded-full animate-spin" />
              ) : (
                <Image src={currentAvatar} alt={profile.displayName || 'User'} className="w-full h-full object-cover" fill />
              )}
            </div>
            <div className="text-center sm:text-left flex-1 mt-2 sm:mt-0">
              <h2 className="text-lg font-black text-black mb-1 uppercase">Profile Photo</h2>
              <p className="text-sm text-black/60 mb-4 max-w-sm font-medium">A clear photo helps build trust. Max 5MB.</p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <label
                  className="px-4 py-2 border-2 border-black text-sm font-black cursor-pointer bg-[#93f59c] hover:bg-[#ffd93d] transition-colors uppercase"
                  style={{ boxShadow: '2px 2px 0 #000' }}
                >
                  Upload New
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
                {profile.avatarUrl && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                    className="px-4 py-2 border-2 border-black text-sm font-black bg-white hover:bg-red-100 transition-colors uppercase"
                    style={{ boxShadow: '2px 2px 0 #000' }}
                    type="button"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase" htmlFor="displayName">Display Name</label>
              <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How should we call you?" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase" htmlFor="bio">Bio</label>
              <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community about yourself..." rows={4} className={`${inputCls} resize-y`} />
              <p className="text-xs text-black/50 mt-1 text-right font-medium">{bio.length} / 300</p>
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase" htmlFor="location">Location</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/50">
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">location_on</span>
                </span>
                <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State or Region" className={`${inputCls} pl-11`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase" htmlFor="skills">Skills (comma separated)</label>
              <input id="skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Design, Photography, Coding" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase" htmlFor="equipment">Equipment (comma separated)</label>
              <input id="equipment" type="text" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g. Camera, Laptop, Projector" className={inputCls} />
            </div>

            {/* Travel Radius */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase" htmlFor="travelRadius">
                Travel Radius: <span className="bg-[#ffd93d] px-1 border border-black">{travelRadius} km</span>
              </label>
              <input
                id="travelRadius"
                type="range" min={0} max={100} step={5}
                value={travelRadius}
                onChange={(e) => setTravelRadius(Number(e.target.value))}
                className="w-full h-3 appearance-none cursor-pointer border-2 border-black bg-white accent-black"
              />
              <div className="flex justify-between text-[10px] text-black/50 mt-1 font-black uppercase">
                <span>0 km</span><span>25</span><span>50</span><span>75</span><span>100 km</span>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-black text-black mb-3 uppercase">Availability</label>
              <div className="flex flex-wrap gap-2">
                {(['weekdays', 'weekends', 'evenings', 'anytime'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAvailability(opt)}
                    className={`px-4 py-2 text-sm font-black border-2 border-black uppercase transition-all ${
                      availability === opt ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'
                    }`}
                    style={{ boxShadow: availability === opt ? 'none' : '2px 2px 0 #000' }}
                  >
                    {opt === 'anytime' ? '🕐 Anytime' : opt === 'weekdays' ? '📅 Weekdays' : opt === 'weekends' ? '🌴 Weekends' : '🌙 Evenings'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-4 border-t-2 border-black">
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="px-6 py-3 border-2 border-black font-black text-black bg-white hover:bg-[#ffd93d] transition-colors uppercase sm:w-auto w-full"
              style={{ boxShadow: '3px 3px 0 #000' }}
              type="button"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="px-6 py-3 border-2 border-black font-black bg-black text-white hover:bg-[#ffd93d] hover:text-black transition-colors uppercase sm:w-auto w-full disabled:opacity-50"
              style={{ boxShadow: '3px 3px 0 #555' }}
              type="submit"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-28 md:pb-12 w-full">
      {/* Profile Header */}
      <section className="animate-fade-in-up">
        <div className="border-4 border-black p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 bg-white" style={{ boxShadow: '6px 6px 0 #000' }}>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 border-4 border-black overflow-hidden flex items-center justify-center" style={{ background: '#ccdcff', boxShadow: '4px 4px 0 #000' }}>
              <Image src={currentAvatar} alt={profile.displayName || 'User'} className="w-full h-full object-cover" fill />
            </div>
            {profile.profileComplete && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-2 border-black bg-[#93f59c] flex items-center justify-center" style={{ boxShadow: '2px 2px 0 #000' }}>
                <span className="material-symbols-outlined text-sm">verified</span>
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="font-black text-3xl md:text-4xl text-black uppercase mb-1">{profile.displayName || 'Anonymous'}</h1>
            <p className="font-black text-sm mb-3 flex items-center justify-center md:justify-start gap-1 bg-[#ffd93d] border-2 border-black px-3 py-1 inline-flex w-fit mx-auto md:mx-0" style={{ boxShadow: '2px 2px 0 #000' }}>
              <span className="material-symbols-outlined text-base">volunteer_activism</span>
              {profile.role === 'organizer' ? 'Campus Organizer' : 'Campus Volunteer'}
            </p>

            {profile.location && (
              <p className="text-black/60 text-sm flex items-center justify-center md:justify-start gap-1 mb-3 font-medium">
                <span className="material-symbols-outlined text-sm">public</span>
                {profile.location}
              </p>
            )}

            {profile.bio && (
              <p className="text-black/70 text-sm mb-4 max-w-xl leading-relaxed font-medium">{profile.bio}</p>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-4 justify-center md:justify-start">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="text-xs font-black px-3 py-1 border-2 border-black bg-[#ccdcff] uppercase" style={{ boxShadow: '2px 2px 0 #000' }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Equipment */}
            {profile.equipment && profile.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                {profile.equipment.map((item, idx) => (
                  <span key={idx} className="text-xs font-black px-3 py-1 border-2 border-black bg-[#93f59c] flex items-center gap-1 uppercase" style={{ boxShadow: '2px 2px 0 #000' }}>
                    <span className="material-symbols-outlined text-[12px]">build</span>
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* Chips */}
            {(profile.travelRadius > 0 || profile.availability) && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                {profile.travelRadius > 0 && (
                  <span className="text-xs font-black px-3 py-1 border-2 border-black bg-white flex items-center gap-1.5 uppercase" style={{ boxShadow: '2px 2px 0 #000' }}>
                    <span className="material-symbols-outlined text-[14px]">near_me</span>
                    Within {profile.travelRadius} km
                  </span>
                )}
                {profile.availability && profile.availability !== 'anytime' && (
                  <span className="text-xs font-black px-3 py-1 border-2 border-black bg-white flex items-center gap-1.5 uppercase" style={{ boxShadow: '2px 2px 0 #000' }}>
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1)}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 border-2 border-black font-black bg-black text-white hover:bg-[#ffd93d] hover:text-black transition-colors uppercase active:scale-95"
              style={{ boxShadow: '3px 3px 0 #555' }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* Impact Cards */}
      <section className="animate-fade-in-up delay-200">
        <h2 className="font-black text-2xl text-black uppercase mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined bg-[#ffd93d] p-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 #000' }}>monitoring</span>
          Your Impact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border-4 border-black p-6 bg-[#ccdcff] hover:-translate-y-0.5 transition-transform" style={{ boxShadow: '4px 4px 0 #000' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 border-2 border-black bg-white">
                <span className="material-symbols-outlined">schedule</span>
              </div>
            </div>
            <p className="text-black/60 text-sm font-black uppercase mb-1">Hours Volunteered</p>
            <p className="font-black text-4xl text-black">{profile.volunteerHours || 0}</p>
          </div>

          <div className="border-4 border-black p-6 bg-[#93f59c] hover:-translate-y-0.5 transition-transform" style={{ boxShadow: '4px 4px 0 #000' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 border-2 border-black bg-white">
                <span className="material-symbols-outlined">favorite</span>
              </div>
            </div>
            <p className="text-black/60 text-sm font-black uppercase mb-1">Total Donated</p>
            <p className="font-black text-4xl text-black">${(profile.totalDonated || 0).toLocaleString()}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
