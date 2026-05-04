'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, Megaphone, Search, PackageSearch, Tag, MoreHorizontal, FileText, ChevronRight } from 'lucide-react'
import { BulletinAlert } from '@/types/bulletin'

// Dummy data for now, since we haven't built the live backend route for bulletin yet
const DUMMY_NOTICES: BulletinAlert[] = [
  {
    id: '1',
    source: 'Student Council',
    type: 'ANNOUNCEMENT',
    severity: 'Moderate',
    title: 'Spring Fest 2026 Core Committee Applications',
    description: 'We are looking for enthusiastic students to join the organizing committee for the upcoming Spring Fest. Interviews start next week!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    locationName: 'Admin Block, Room 104',
  },
  {
    id: '2',
    source: 'Campus Security',
    type: 'LOST_AND_FOUND',
    severity: 'Minor',
    title: 'Found: Black Apple Pencil',
    description: 'A black Apple Pencil (2nd Gen) with a blue silicone grip was found near the Library cafe. Please contact security to claim it.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    locationName: 'Main Library',
  },
  {
    id: '3',
    source: 'Alex M. (3rd Year)',
    type: 'MARKETPLACE',
    severity: 'Minor',
    title: 'Selling Engineering Physics Textbook (Like New)',
    description: 'Resnick Halliday Walker 11th Edition. Barely used, no highlights. Asking for $40 (negotiable). DM if interested!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    locationName: 'Campus Res',
  },
  {
    id: '4',
    source: 'Dean of Academics',
    type: 'ACADEMIC',
    severity: 'Severe',
    title: 'Revised End-Sem Exam Schedule',
    description: 'Due to unforeseen circumstances, the exam dates for CS301 and EE302 have been swapped. Please check the portal for the updated timetable.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    locationName: 'Online Portal',
  },
]

const TYPE_CONFIG = {
  ANNOUNCEMENT: { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  LOST_AND_FOUND: { icon: PackageSearch, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  MARKETPLACE: { icon: Tag, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ACADEMIC: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  ADMIN: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  SOCIAL: { icon: Megaphone, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  EMERGENCY: { icon: Megaphone, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
}

export default function BulletinPage() {
  const [notices, setNotices] = useState<BulletinAlert[]>([])
  const [filter, setFilter] = useState<'ALL' | 'ANNOUNCEMENT' | 'LOST_AND_FOUND' | 'MARKETPLACE'>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Simulated fetch
    setNotices(DUMMY_NOTICES)
  }, [])

  const filteredNotices = notices.filter(n => {
    if (filter !== 'ALL' && n.type !== filter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6"
          >
            <Pin size={16} />
            <span className="text-sm font-bold tracking-wide uppercase">Community Hub</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-headline font-bold text-foreground mb-4"
          >
            Campus Noticeboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto font-body"
          >
            Stay in the loop with what\'s happening around campus. Announcements, lost & found, marketplace, and more.
          </motion.p>
        </div>

        {/* The Clipboard UI */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
          className="relative pt-12"
        >
          {/* Top Metal Clip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            {/* Hanger hole */}
            <div className="w-16 h-8 -mb-4 bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 rounded-t-xl border-t border-l border-r border-zinc-500/50 flex items-start justify-center pt-2 shadow-lg">
               <div className="w-6 h-3 rounded-full bg-background shadow-inner border border-zinc-500/50"></div>
            </div>
            {/* Main clip mechanism */}
            <div className="w-48 sm:w-64 h-12 bg-gradient-to-b from-zinc-200 to-zinc-400 dark:from-zinc-600 dark:to-zinc-800 rounded-lg shadow-xl border border-zinc-400/50 dark:border-zinc-500/50 flex flex-col items-center justify-center relative">
               <div className="w-full px-4 flex justify-between items-center opacity-50">
                  <div className="w-2 h-2 rounded-full bg-zinc-600 dark:bg-zinc-900 shadow-inner"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-600 dark:bg-zinc-900 shadow-inner"></div>
               </div>
               <div className="absolute bottom-1 w-32 sm:w-48 h-3 bg-gradient-to-b from-zinc-300 to-zinc-500 dark:from-zinc-500 dark:to-zinc-700 rounded-md border-b-2 border-zinc-500 dark:border-zinc-900 shadow-sm"></div>
            </div>
          </div>

          {/* Clipboard Board */}
          <div className="relative bg-[#f8f5f0] dark:bg-[#1a1814] rounded-3xl p-4 sm:p-8 pt-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-[#e5dcd0] dark:border-[#2a2620]">
            
            {/* Paper */}
            <div className="relative bg-white dark:bg-[#111] min-h-[600px] rounded-xl shadow-sm border border-border/50 overflow-hidden">
              
              {/* Paper Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--border) 31px, var(--border) 32px)' }}></div>
              
              <div className="relative z-10 p-6 sm:p-10">
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10 pb-6 border-b border-border/50 border-dashed">
                  <div className="flex bg-muted/50 p-1 rounded-xl w-full sm:w-auto">
                    {(['ALL', 'ANNOUNCEMENT', 'MARKETPLACE', 'LOST_AND_FOUND'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {f.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search notices..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>

                {/* Notices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <AnimatePresence>
                    {filteredNotices.length > 0 ? (
                      filteredNotices.map((notice, i) => {
                        // @ts-ignore
                        const config = TYPE_CONFIG[notice.type] || TYPE_CONFIG.ADMIN;
                        const Icon = config.icon;
                        return (
                          <motion.div
                            key={notice.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ delay: i * 0.05 }}
                            className={`group relative p-6 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1`}
                          >
                            {/* Pin graphic */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shadow-sm">
                              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)]"></div>
                            </div>
                            
                            <div className="flex justify-between items-start mb-4 mt-2">
                              <div className="flex items-center gap-2">
                                <Icon size={16} className={config.color} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                                  {notice.type.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground font-medium bg-background/50 px-2 py-1 rounded-md">
                                {new Date(notice.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                              {notice.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                              {notice.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border/30">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                  {notice.source.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-foreground">{notice.source}</span>
                              </div>
                              <button className="text-primary hover:text-primary/80 transition-colors p-1 bg-primary/10 rounded-full">
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-60">
                        <PackageSearch size={48} className="text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No notices found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  )
}
