'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { uploadImage } from '@/services/storageService';
import { toast } from 'sonner';
import { getUserAvatar } from '@/lib/avatar';
import { Camera, Loader2, MapPin, Clock, ArrowLeft, CheckCircle, Wrench, BarChart3, Heart, Sparkles, Compass, ChevronDown, Check, GraduationCap, BookOpen, User, AlignLeft, Award, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SKILL_COLORS = [
  'hsl(from var(--cp-primary) h s l / 0.12)', 'hsl(from var(--cp-secondary) h s l / 0.12)',
  'hsl(from var(--cp-accent) h s l / 0.12)', 'hsl(from var(--cp-cyan) h s l / 0.12)',
  'hsl(from var(--cp-orange) h s l / 0.12)'
];
const SKILL_TEXT_COLORS = ['var(--cp-primary)', 'var(--cp-secondary)', 'var(--cp-accent)', 'var(--cp-cyan)', 'var(--cp-orange)'];

const SKILL_DATABASE = [
  // Tech & Engineering
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Node.js', 
  'Express', 'Django', 'Flask', 'PostgreSQL', 'MongoDB', 'Firebase', 'AWS', 'Docker', 'Kubernetes', 
  'Git', 'Tailwind CSS', 'CSS3', 'HTML5', 'Flutter', 'React Native', 'Android Dev', 'iOS Dev',
  // Data & AI
  'Machine Learning', 'Deep Learning', 'Data Science', 'Artificial Intelligence', 'SQL', 'R', 
  'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Tableau', 'Power BI', 'Excel',
  // Design & Creative
  'UI/UX Design', 'Product Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Premiere Pro', 
  'After Effects', 'Lightroom', 'Photography', 'Videography', 'Motion Graphics', 'Blender', '3D Modeling', 
  'Canva', 'Graphic Design', 'Sketch',
  // Marketing & Business
  'Digital Marketing', 'Social Media Management', 'SEO', 'SEM', 'Content Writing', 'Copywriting', 
  'Public Speaking', 'Leadership', 'Project Management', 'Agile', 'Scrum', 'Entrepreneurship', 
  'Financial Analysis', 'Business Strategy', 'Marketing Research', 'Sales',
  // Soft Skills & Campus
  'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Time Management', 
  'Event Planning', 'Volunteering', 'Community Organizing', 'Debate', 'Foreign Languages', 
  'First Aid', 'Music Production', 'Guitar', 'Piano', 'Cooking', 'Fitness'
].sort();

interface CustomSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

function CustomSelect({ label, value, options, onChange, placeholder, icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }}>{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-base w-full text-left flex items-center justify-between transition-all group"
        style={{
          borderColor: isOpen ? 'var(--cp-primary)' : 'var(--cp-border)',
          boxShadow: isOpen ? '0 0 0 4px hsl(from var(--cp-primary) h s l / 0.1)' : 'none',
          background: isOpen ? 'var(--cp-surface)' : 'var(--cp-surface-dim)'
        }}
      >
        <div className="flex items-center gap-3 truncate">
          {icon && <span className="transition-colors" style={{ color: isOpen ? 'var(--cp-primary)' : 'var(--cp-text-3)' }}>{icon}</span>}
          <span style={{ color: value ? 'var(--cp-text-1)' : 'var(--cp-text-3)' }} className="font-medium">
            {value || placeholder || `Select ${label}`}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'rotate-180 text-primary' : 'text-text-3'}`} 
          style={{ color: isOpen ? 'var(--cp-primary)' : 'var(--cp-text-3)' }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[100] top-[calc(100%+8px)] left-0 w-full rounded-2xl overflow-hidden glass-panel"
            style={{
              background: 'var(--cp-surface)',
              border: '1px solid var(--cp-border)',
              boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)',
              maxHeight: '280px',
              overflowY: 'auto',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div className="p-2 space-y-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${value !== opt ? 'hover:bg-[var(--cp-surface-dim)]' : ''}`}
                  style={{
                    background: value === opt ? 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))' : 'transparent',
                    color: value === opt ? 'white' : 'var(--cp-text-1)',
                  }}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check size={14} className="shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillTagInput({ value, onChange }: { value: string[]; onChange: (val: string[]) => void }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = SKILL_DATABASE.filter(
        skill => skill.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(skill)
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex]);
      } else {
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <div className="relative group">
        <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors z-10" style={{ color: 'var(--cp-text-3)' }} />
        <input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={value.length === 0 ? "Add skills (e.g. React, Figma...)" : "Add another..."}
          className="input-base w-full h-[48px] pl-11 pr-12 text-sm font-medium rounded-xl transition-all focus:bg-surface"
          style={{ background: 'var(--cp-surface-dim)', paddingLeft: '2.75rem' }}
        />
        <button 
          type="button"
          onClick={() => addTag(inputValue)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-primary/10 text-primary"
        >
          <Plus size={18} />
        </button>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 z-[100] rounded-2xl overflow-hidden shadow-xl glass-panel p-1.5"
              style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
            >
              {suggestions.map((skill, idx) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addTag(skill)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                  style={{ 
                    background: selectedIndex === idx ? 'var(--cp-surface-dim)' : 'transparent',
                    color: selectedIndex === idx ? 'var(--cp-primary)' : 'var(--cp-text-2)'
                  }}
                >
                  <Sparkles size={14} className={selectedIndex === idx ? 'text-primary' : 'text-text-3'} />
                  {skill}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        <AnimatePresence mode="popLayout">
          {value.map((tag, idx) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
              layout
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-[1.03] hover:shadow-sm select-none"
              style={{ 
                background: SKILL_COLORS[idx % SKILL_COLORS.length], 
                color: SKILL_TEXT_COLORS[idx % SKILL_TEXT_COLORS.length],
                borderColor: `hsl(from ${SKILL_TEXT_COLORS[idx % SKILL_TEXT_COLORS.length]} h s l / 0.15)`
              }}
            >
              {tag}
              <button 
                type="button" 
                onClick={() => onChange(value.filter(t => t !== tag))}
                className="p-0.5 rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [availability, setAvailability] = useState('anytime');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setSkills(profile.skills || []);
      setDepartment(profile.department || '');
      setYear(profile.year || '');
      setAvailability(profile.availability || 'anytime');
    }
  }, [profile, isEditing]);

  if (!user || !profile) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10 flex justify-center items-center">
        {!user ? (
          <p className="font-semibold" style={{ color: 'var(--cp-text-1)' }}>Please sign in to view your profile.</p>
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))' }}>
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
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
        skills: skills.map(s => s.trim()).filter(Boolean),
        department,
        year,
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

  const AVAIL_OPTIONS = [
    { key: 'weekdays', label: '📅 Weekdays' },
    { key: 'weekends', label: '🌴 Weekends' },
    { key: 'evenings', label: '🌙 Evenings' },
    { key: 'anytime', label: '🕐 Anytime' },
  ] as const;

  const DEPARTMENTS = [
    'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 
    'Information Technology', 'Business Administration', 'Arts & Humanities', 
    'Law', 'Medicine', 'Architecture', 'Other'
  ];

  const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

  if (isEditing) {
    return (
      <main className="flex-grow w-full relative min-h-screen overflow-hidden pb-28 md:pb-12" style={{ color: 'var(--cp-text-1)' }}>
        {/* Ambient bg */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.08] blur-[100px]" style={{ background: 'var(--cp-primary)' }} />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-[0.08] blur-[100px]" style={{ background: 'var(--cp-accent)' }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsEditing(false)} className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }} aria-label="Go back" type="button">
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" style={{ color: 'var(--cp-text-2)' }} />
              </button>
              <div>
                <h1 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">Edit Profile</h1>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--cp-text-3)' }}>Personalize your campus presence</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              {/* ═══ CARD 1: Photo ═══ */}
              <motion.div className="rounded-3xl p-6 md:p-8" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6">
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-[var(--cp-primary)] to-[var(--cp-accent)] shadow-glow transition-transform duration-500 group-hover:scale-[1.04]">
                      <div className="w-full h-full rounded-full overflow-hidden relative border-[3px]" style={{ borderColor: 'var(--cp-surface)', background: 'var(--cp-surface-dim)' }}>
                        {uploadingImage ? <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--cp-primary)' }} /></div> : <Image src={currentAvatar} alt={profile.displayName || 'User'} className="w-full h-full object-cover" fill />}
                      </div>
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))', boxShadow: '0 6px 20px -4px hsl(from var(--cp-primary) h s l / 0.5)', border: '3px solid var(--cp-surface)' }}>
                      <Camera size={15} className="text-white" />
                    </button>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} disabled={uploadingImage} />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h2 className="font-headline font-bold text-lg mb-1">Profile Photo</h2>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--cp-text-3)' }}>A recognizable photo helps others find you at events.</p>
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-80" style={{ color: 'var(--cp-primary)', background: 'var(--cp-primary-light)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.15)' }}>Upload New</button>
                      {profile.avatarUrl && <button onClick={handleRemoveImage} disabled={uploadingImage} className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-80" type="button" style={{ color: 'var(--cp-accent)', background: 'var(--cp-accent-light)', border: '1px solid hsl(from var(--cp-accent) h s l / 0.15)' }}>Remove</button>}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ═══ CARD 2: Personal Info ═══ */}
              <motion.div className="rounded-3xl p-6 md:p-8 space-y-5" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--cp-border)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}><User size={18} /></div>
                  <div><h3 className="font-headline font-bold text-sm">Personal Info</h3><p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>How you appear to the community</p></div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 px-0.5" style={{ color: 'var(--cp-text-3)' }}>Display Name</label>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name on campus" className="input-base w-full h-[48px] text-sm font-medium rounded-xl" style={{ background: 'var(--cp-surface-dim)' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 px-0.5" style={{ color: 'var(--cp-text-3)' }}>Bio</label>
                  <div className="relative">
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community about yourself..." rows={3} className="input-base w-full text-sm font-medium resize-none rounded-xl" style={{ background: 'var(--cp-surface-dim)' }} maxLength={300} />
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded" style={{ color: bio.length > 260 ? 'var(--cp-accent)' : 'var(--cp-text-3)', background: bio.length > 260 ? 'var(--cp-accent-light)' : 'transparent' }}>{bio.length}/300</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 px-0.5" style={{ color: 'var(--cp-text-3)' }}>Location</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--cp-text-3)' }} />
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Campus / City" className="input-base w-full h-[48px] pl-11 text-sm font-medium rounded-xl" style={{ background: 'var(--cp-surface-dim)', paddingLeft: '2.75rem' }} />
                  </div>
                </div>
              </motion.div>

              {/* ═══ CARD 3: Academic ═══ */}
              <motion.div className="rounded-3xl p-6 md:p-8 space-y-5" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--cp-border)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-secondary-light)', color: 'var(--cp-secondary)' }}><GraduationCap size={18} /></div>
                  <div><h3 className="font-headline font-bold text-sm">Academics</h3><p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>Helps match events to your department</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <CustomSelect label="Department / Major" value={department} options={DEPARTMENTS} onChange={setDepartment} placeholder="Select Major" icon={<GraduationCap size={16} />} />
                  <CustomSelect label="Academic Year" value={year} options={YEARS} onChange={setYear} placeholder="Select Year" icon={<BookOpen size={16} />} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 px-0.5" style={{ color: 'var(--cp-text-3)' }}>Skills & Interests</label>
                  <SkillTagInput value={skills} onChange={setSkills} />
                </div>
              </motion.div>

              {/* ═══ CARD 4: Availability ═══ */}
              <motion.div className="rounded-3xl p-6 md:p-8 space-y-4" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--cp-border)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-accent-light)', color: 'var(--cp-accent)' }}><Clock size={18} /></div>
                  <div><h3 className="font-headline font-bold text-sm">Availability</h3><p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>When are you free for events?</p></div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {AVAIL_OPTIONS.map((opt) => (
                    <button key={opt.key} type="button" onClick={() => setAvailability(opt.key)} className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95" style={{ background: availability === opt.key ? 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))' : 'var(--cp-surface-dim)', color: availability === opt.key ? 'white' : 'var(--cp-text-2)', border: availability === opt.key ? 'none' : '1px solid var(--cp-border)', boxShadow: availability === opt.key ? '0 6px 20px -6px hsl(from var(--cp-primary) h s l / 0.45)' : 'none' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <button onClick={() => setIsEditing(false)} disabled={loading} className="h-12 px-8 rounded-2xl text-sm font-bold transition-all hover:opacity-80" type="button" style={{ background: 'var(--cp-surface)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }}>Cancel</button>
                <button disabled={loading} className="h-12 px-10 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2" type="submit" style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))', boxShadow: '0 8px 24px -6px hsl(from var(--cp-primary) h s l / 0.4)' }}>
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Check size={16} /> Save Changes</>}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col w-full pb-32 md:pb-12" style={{ color: 'var(--cp-text-1)' }}>
      {/* ── Banner Section ── */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <div className="absolute inset-0 premium-gradient-bg opacity-10" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 -mt-24 md:-mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Side Column: Profile Card ── */}
          <motion.div 
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="card-base p-6 md:p-8 flex flex-col items-center text-center sticky top-24" style={{ boxShadow: 'var(--shadow-lg)' }}>
              {/* Avatar */}
              <div className="relative mb-8">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-1.5 bg-gradient-to-tr from-[var(--cp-primary)] to-[var(--cp-accent)] shadow-glow">
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface relative border-4 border-surface">
                    <Image src={currentAvatar} alt={profile.displayName || 'User'} className="w-full h-full object-cover" fill />
                  </div>
                </div>
                {profile.profileComplete && (
                  <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-white border-4 border-surface shadow-md">
                    <CheckCircle size={20} />
                  </div>
                )}
              </div>

              <h1 className="font-headline font-bold text-2xl md:text-3xl mb-1 tracking-tight">
                {profile.displayName || 'Anonymous'}
              </h1>
              <p className="text-sm font-medium mb-4" style={{ color: 'var(--cp-text-3)' }}>@{user.email?.split('@')[0]}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="pill-tag px-4 py-1.5 font-bold" style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(280, 80%, 60%))', color: '#fff', border: 'none', boxShadow: '0 4px 12px -2px hsl(from var(--cp-primary) h s l / 0.3)' }}>
                  <Heart size={12} className="mr-1.5" />
                  {profile.role === 'organizer' ? 'Organizer' : 'Volunteer'}
                </span>
                {profile.location && (
                  <span className="pill-tag px-4 py-1.5 font-bold" style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }}>
                    <MapPin size={12} className="mr-1.5" />
                    {profile.location}
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm leading-relaxed mb-8 px-2" style={{ color: 'var(--cp-text-2)' }}>
                  {profile.bio}
                </p>
              )}

              <button 
                onClick={() => setIsEditing(true)} 
                className="btn-primary w-full"
              >
                Edit Profile
              </button>

              {/* Stats Mini Grid */}
              <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-border">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cp-text-3)' }}>Impact</p>
                  <p className="font-headline font-bold text-xl text-primary">{profile.volunteerHours || 0}h</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cp-text-3)' }}>Points</p>
                  <p className="font-headline font-bold text-xl text-secondary">{profile.xp || 0}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Main Column: Content ── */}
          <motion.div 
            className="lg:col-span-8 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Impact Dashboard */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary-light text-primary shadow-sm" style={{ border: '1px solid hsl(from var(--cp-primary) h s l / 0.1)' }}>
                  <BarChart3 size={20} />
                </div>
                <h2 className="font-headline font-bold text-2xl" style={{ color: 'var(--cp-text-1)' }}>Impact Dashboard</h2>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="stat-card p-8 group overflow-hidden relative">
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary-light/30 transition-transform group-hover:scale-125" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary-light text-primary border border-primary/10">
                        <Clock size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/10">+12% month</span>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cp-text-3)' }}>Volunteered Time</p>
                    <h3 className="font-headline font-bold text-4xl energy-gradient-text">{profile.volunteerHours || 0} Hours</h3>
                  </div>
                </div>
  
                <div className="stat-card p-8 group overflow-hidden relative">
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-secondary-light/30 transition-transform group-hover:scale-125" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary-light text-secondary border border-secondary/10">
                        <Heart size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-secondary bg-secondary-light px-2.5 py-1 rounded-full uppercase tracking-wider border border-secondary/10">Top 5% Donor</span>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cp-text-3)' }}>Community Support</p>
                    <h3 className="font-headline font-bold text-4xl energy-gradient-text">${(profile.totalDonated || 0).toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Expertise & Gear */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Skills Card */}
              <div className="card-base p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-accent-light text-accent shadow-sm" style={{ border: '1px solid hsl(from var(--cp-accent) h s l / 0.1)' }}>
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-headline font-bold text-xl">Expertise</h3>
                </div>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 hover:shadow-sm" 
                        style={{ 
                          background: SKILL_COLORS[idx % SKILL_COLORS.length], 
                          color: SKILL_TEXT_COLORS[idx % SKILL_TEXT_COLORS.length],
                          border: `1px solid hsl(from ${SKILL_TEXT_COLORS[idx % SKILL_TEXT_COLORS.length]} h s l / 0.1)` 
                        }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 rounded-2xl bg-surface-dim border border-dashed border-border">
                    <p className="text-sm font-medium" style={{ color: 'var(--cp-text-3)' }}>No skills listed yet.</p>
                  </div>
                )}
              </div>
  
  
              {/* Department Card */}
              <div className="card-base p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-light text-cyan shadow-sm" style={{ border: '1px solid hsl(from var(--cp-cyan) h s l / 0.1)' }}>
                    <BarChart3 size={20} />
                  </div>
                  <h3 className="font-headline font-bold text-xl">Academic Pulse</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-dim border border-border group transition-all hover:bg-surface">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cp-text-3)' }}>Department</p>
                      <p className="font-bold text-sm">{profile.department || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-dim border border-border group transition-all hover:bg-surface">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cp-text-3)' }}>Year</p>
                      <p className="font-bold text-sm">{profile.year || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Logistics Card */}
            {(profile.availability && profile.availability !== 'anytime') && (
              <div className="card-base p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gold-light text-gold shadow-sm" style={{ border: '1px solid hsl(from var(--cp-gold) h s l / 0.1)' }}>
                    <Compass size={20} />
                  </div>
                  <h3 className="font-headline font-bold text-xl">Availability</h3>
                </div>
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-surface-dim border border-border transition-all hover:bg-surface group">
                  <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-sm text-secondary transition-transform group-hover:scale-110">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cp-text-3)' }}>Availability</p>
                    <p className="font-bold text-lg capitalize">{profile.availability}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </main>
  );
}
