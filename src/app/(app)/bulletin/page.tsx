'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pin, Megaphone, Search, PackageSearch, Tag, FileText,
  ChevronRight, ChevronDown, AlertTriangle, X, Loader2,
  BookOpen, ShieldAlert, PlusCircle, Clock, MapPin, Phone,
} from 'lucide-react'
import { BulletinAlert, BulletinAlertType } from '@/types/bulletin'
import { subscribeToBulletins, deleteBulletin } from '@/services/bulletinService'
import { useAuth } from '@/context/AuthContext'
import { ADMIN_EMAILS } from '@/services/eventService'
import CreateNoticeModal from './_components/CreateNoticeModal'

// ─── Type configuration ──────────────────────────────────

const TYPE_CONFIG: Record<BulletinAlertType, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  label: string;
}> = {
  ANNOUNCEMENT:  { icon: Megaphone,     color: 'text-purple-500', bg: 'bg-purple-500/10',  border: 'border-purple-500/25',  label: 'Announcement'  },
  LOST_AND_FOUND:{ icon: PackageSearch, color: 'text-amber-500',  bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   label: 'Lost & Found'  },
  MARKETPLACE:   { icon: Tag,           color: 'text-green-500',  bg: 'bg-green-500/10',   border: 'border-green-500/25',   label: 'Marketplace'   },
  ACADEMIC:      { icon: BookOpen,      color: 'text-blue-500',   bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    label: 'Academic'      },
  ADMIN:         { icon: FileText,      color: 'text-sky-500',    bg: 'bg-sky-500/10',     border: 'border-sky-500/25',     label: 'Admin'         },
  SOCIAL:        { icon: Megaphone,     color: 'text-pink-500',   bg: 'bg-pink-500/10',    border: 'border-pink-500/25',    label: 'Social'        },
  EMERGENCY:     { icon: ShieldAlert,   color: 'text-red-500',    bg: 'bg-red-500/10',     border: 'border-red-500/25',     label: 'Emergency'     },
}

const FILTER_TABS = [
  { id: 'ALL',           label: 'All' },
  { id: 'ANNOUNCEMENT',  label: 'Announcements' },
  { id: 'ACADEMIC',      label: 'Academic' },
  { id: 'MARKETPLACE',   label: 'Marketplace' },
  { id: 'LOST_AND_FOUND',label: 'Lost & Found' },
  { id: 'SOCIAL',        label: 'Social' },
  { id: 'EMERGENCY',     label: 'Emergency' },
] as const

type FilterTab = typeof FILTER_TABS[number]['id']

// ─── Relative time helper ────────────────────────────────

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ─── Skeleton card ───────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="relative p-5 sm:p-6 rounded-2xl border border-border/30 bg-muted/30 animate-pulse">
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-muted" />
      <div className="flex justify-between items-start mb-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <div className="w-20 h-3 rounded bg-muted" />
        </div>
        <div className="w-12 h-5 rounded bg-muted" />
      </div>
      <div className="w-3/4 h-5 rounded bg-muted mb-3" />
      <div className="space-y-2 mb-4">
        <div className="w-full h-3 rounded bg-muted" />
        <div className="w-5/6 h-3 rounded bg-muted" />
        <div className="w-4/6 h-3 rounded bg-muted" />
      </div>
      <div className="flex justify-between pt-4 border-t border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted" />
          <div className="w-24 h-3 rounded bg-muted" />
        </div>
        <div className="w-6 h-6 rounded-full bg-muted" />
      </div>
    </div>
  )
}

// ─── Notice card ─────────────────────────────────────────

interface NoticeCardProps {
  notice: BulletinAlert
  canDelete: boolean
  onDelete: (id: string) => void
}

function NoticeCard({ notice, canDelete, onDelete }: NoticeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting]  = useState(false)
  const config = TYPE_CONFIG[notice.type] || TYPE_CONFIG.ADMIN
  const Icon   = config.icon
  const isUrgent = notice.type === 'EMERGENCY' || notice.severity === 'Severe' || notice.severity === 'Extreme'

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this notice? This cannot be undone.')) return
    setDeleting(true)
    try {
      await onDelete(notice.id)
    } catch {
      setDeleting(false)
      alert('Failed to delete. Please try again.')
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className={`group relative p-5 sm:p-6 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer select-none ${isUrgent ? 'ring-1 ring-red-500/30' : ''}`}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Pinned badge */}
      {notice.pinned && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
            <Pin size={10} /> PINNED
          </div>
        </div>
      )}

      {/* Pin graphic */}
      <div className={`absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-sm ${isUrgent ? 'bg-red-500/30' : 'bg-red-500/20'}`}>
        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-red-500'}`} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3 mt-1 sm:mt-2">
        <div className="flex items-center gap-2">
          <Icon size={15} className={config.color} />
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${config.color}`}>
            {config.label}
          </span>
          {notice.severity === 'Severe' || notice.severity === 'Extreme' ? (
            <AlertTriangle size={12} className="text-red-500" />
          ) : null}
        </div>
        <span className="text-xs text-muted-foreground font-medium bg-background/50 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock size={10} />
          {relativeTime(notice.timestamp)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
        {notice.title}
      </h3>

      {/* Description */}
      <AnimatePresence initial={false}>
        <motion.p
          key={expanded ? 'expanded' : 'collapsed'}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className={`text-sm text-muted-foreground font-body ${expanded ? '' : 'line-clamp-3'} mb-4`}
        >
          {notice.description}
        </motion.p>
      </AnimatePresence>

      {/* Contact info (expanded) */}
      {expanded && notice.contactInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-background/40 px-3 py-2 rounded-lg"
        >
          <Phone size={12} className="shrink-0 text-primary" />
          <span>{notice.contactInfo}</span>
        </motion.div>
      )}

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <MapPin size={11} className="shrink-0" />
        <span>{notice.locationName}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          {notice.authorAvatar ? (
            <img
              src={notice.authorAvatar}
              alt={notice.source}
              className="w-6 h-6 rounded-full object-cover border border-border/50"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {notice.source.charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium text-foreground">{notice.source}</span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors"
              title="Delete notice"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            </button>
          )}
          <button
            className="text-primary hover:text-primary/80 transition-colors p-1 bg-primary/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
            title={expanded ? 'Collapse' : 'Read more'}
          >
            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────

export default function BulletinPage() {
  const { user, profile } = useAuth()
  const [notices, setNotices] = useState<BulletinAlert[]>([])
  const [filter,  setFilter]  = useState<FilterTab>('ALL')
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const isAdmin = !!(profile?.email && ADMIN_EMAILS.includes(profile.email)) ||
                  !!(user?.email && ADMIN_EMAILS.includes(user.email))

  // ── Real-time subscription ──────────────────────────────
  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToBulletins((data) => {
      // Filter expired notices client-side
      const now = new Date().toISOString()
      const live = data.filter((n) => !n.expiresAt || n.expiresAt > now)
      setNotices(live)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ── Delete handler ──────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated')
    await deleteBulletin(id, user.uid, user.email ?? undefined)
    // onSnapshot will auto-update; no manual state mutation needed
  }, [user])

  // ── Filtering ───────────────────────────────────────────
  const filtered = notices.filter((n) => {
    if (filter !== 'ALL' && n.type !== filter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (
        !n.title.toLowerCase().includes(q) &&
        !n.description.toLowerCase().includes(q) &&
        !n.source.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const canDelete = (notice: BulletinAlert) =>
    isAdmin || notice.authorId === user?.uid

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 sm:mb-6"
          >
            <Pin size={16} />
            <span className="text-sm font-bold tracking-wide uppercase">Community Hub</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl font-headline font-bold text-foreground mb-4"
          >
            Campus Noticeboard
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-body px-4"
          >
            Stay in the loop with what&apos;s happening around campus. Announcements, lost &amp; found, marketplace, and more.
          </motion.p>
        </div>

        {/* The Clipboard UI */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
          className="relative pt-8 sm:pt-12"
        >
          {/* Top Metal Clip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="w-12 h-6 sm:w-16 sm:h-8 -mb-3 sm:-mb-4 bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 rounded-t-xl border-t border-l border-r border-zinc-500/50 flex items-start justify-center pt-1 sm:pt-2 shadow-lg">
              <div className="w-4 h-2 sm:w-6 sm:h-3 rounded-full bg-background shadow-inner border border-zinc-500/50" />
            </div>
            <div className="w-40 sm:w-64 h-10 sm:h-12 bg-gradient-to-b from-zinc-200 to-zinc-400 dark:from-zinc-600 dark:to-zinc-800 rounded-lg shadow-xl border border-zinc-400/50 dark:border-zinc-500/50 flex flex-col items-center justify-center relative">
              <div className="w-full px-4 flex justify-between items-center opacity-50">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-zinc-600 dark:bg-zinc-900 shadow-inner" />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-zinc-600 dark:bg-zinc-900 shadow-inner" />
              </div>
              <div className="absolute bottom-1 w-24 sm:w-48 h-2 sm:h-3 bg-gradient-to-b from-zinc-300 to-zinc-500 dark:from-zinc-500 dark:to-zinc-700 rounded-md border-b-2 border-zinc-500 dark:border-zinc-900 shadow-sm" />
            </div>
          </div>

          {/* Clipboard Board */}
          <div className="relative bg-[#f8f5f0] dark:bg-[#1a1814] rounded-2xl sm:rounded-3xl p-3 sm:p-8 pt-12 sm:pt-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-[#e5dcd0] dark:border-[#2a2620]">

            {/* Paper */}
            <div className="relative bg-white dark:bg-[#111] min-h-[500px] sm:min-h-[600px] rounded-xl shadow-sm border border-border/50 overflow-hidden">

              {/* Paper Lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--border) 31px, var(--border) 32px)' }}
              />

              <div className="relative z-10 p-4 sm:p-8">

                {/* Controls Row */}
                <div className="flex flex-col gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border/50 border-dashed">

                  {/* Filter tabs */}
                  <div className="flex overflow-x-auto no-scrollbar bg-muted/50 p-1 rounded-xl gap-0.5">
                    {FILTER_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex-none px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${
                          filter === tab.id
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search + Post button */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                      <input
                        type="text"
                        placeholder="Search notices by title, content, or source…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body placeholder:text-muted-foreground/60"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setShowCreate(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm shrink-0"
                    >
                      <PlusCircle size={15} />
                      <span className="hidden sm:inline">Post Notice</span>
                      <span className="sm:hidden">Post</span>
                    </button>
                  </div>

                  {/* Count info */}
                  {!loading && (
                    <p className="text-xs text-muted-foreground">
                      {filtered.length === 0
                        ? 'No notices found.'
                        : `Showing ${filtered.length} notice${filtered.length !== 1 ? 's' : ''}${filter !== 'ALL' ? ` in ${FILTER_TABS.find(t => t.id === filter)?.label}` : ''}`}
                    </p>
                  )}
                </div>

                {/* ── Error state ── */}
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 mb-6">
                    <AlertTriangle size={18} className="shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* ── Content ── */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <AnimatePresence mode="popLayout">
                      {filtered.length > 0 ? (
                        filtered.map((notice) => (
                          <NoticeCard
                            key={notice.id}
                            notice={notice}
                            canDelete={canDelete(notice)}
                            onDelete={handleDelete}
                          />
                        ))
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-60"
                        >
                          <PackageSearch size={48} className="text-muted-foreground mb-4" />
                          <h3 className="text-xl font-bold text-foreground mb-2">No notices found</h3>
                          <p className="text-muted-foreground text-sm">
                            {search ? 'Try adjusting your search query.' : 'Be the first to post a notice!'}
                          </p>
                          {!search && (
                            <button
                              onClick={() => setShowCreate(true)}
                              className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors"
                            >
                              <PlusCircle size={15} /> Post the first notice
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Create Notice Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateNoticeModal
            onClose={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
