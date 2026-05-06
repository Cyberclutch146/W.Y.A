'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, Send, AlertCircle } from 'lucide-react'
import { BulletinAlertType } from '@/types/bulletin'
import { createBulletin } from '@/services/bulletinService'
import { useAuth } from '@/context/AuthContext'

// ─── Type options ────────────────────────────────────────

const TYPE_OPTIONS: { value: BulletinAlertType; label: string; emoji: string; description: string }[] = [
  { value: 'ANNOUNCEMENT',   label: 'Announcement',  emoji: '📢', description: 'Club, event, or general campus news' },
  { value: 'ACADEMIC',       label: 'Academic',      emoji: '📚', description: 'Exams, schedules, course info' },
  { value: 'LOST_AND_FOUND', label: 'Lost & Found',  emoji: '🔍', description: 'Missing or found items on campus' },
  { value: 'MARKETPLACE',    label: 'Marketplace',   emoji: '🏷️', description: 'Buying or selling items' },
  { value: 'SOCIAL',         label: 'Social',        emoji: '🎉', description: 'Hangouts, events, or social plans' },
  { value: 'ADMIN',          label: 'Admin',         emoji: '📋', description: 'Administrative notices' },
]

interface Props {
  onClose: () => void
}

interface FormData {
  title: string
  type: BulletinAlertType
  description: string
  locationName: string
  contactInfo: string
}

const DEFAULT_FORM: FormData = {
  title: '',
  type: 'ANNOUNCEMENT',
  description: '',
  locationName: '',
  contactInfo: '',
}

// ─── Component ───────────────────────────────────────────

export default function CreateNoticeModal({ onClose }: Props) {
  const { user, profile } = useAuth()
  const [form, setForm]     = useState<FormData>(DEFAULT_FORM)
  const [error, setError]   = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const validate = (): string | null => {
    if (!form.title.trim() || form.title.trim().length < 5)
      return 'Title must be at least 5 characters.'
    if (!form.description.trim() || form.description.trim().length < 10)
      return 'Description must be at least 10 characters.'
    if (!user)
      return 'You must be logged in to post a notice.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setSubmitting(true)
    setError(null)

    try {
      await createBulletin({
        title:       form.title.trim(),
        description: form.description.trim(),
        type:        form.type,
        severity:    'Minor',
        source:      profile?.displayName || user?.displayName || user?.email || 'Anonymous',
        locationName: form.locationName.trim() || 'Campus',
        contactInfo: form.contactInfo.trim() || undefined,
        authorId:    user!.uid,
        authorAvatar: profile?.avatarUrl || user?.photoURL || undefined,
        pinned:      false,
      })

      setSuccess(true)

      // Auto close after success feedback
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to post notice. Please try again.')
      setSubmitting(false)
    }
  }

  const showContact = form.type === 'MARKETPLACE' || form.type === 'LOST_AND_FOUND'

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-x-4 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 pointer-events-none"
      >
        <div
          className="w-full sm:max-w-lg bg-background border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50">
            <div>
              <h2 className="text-lg font-bold text-foreground">Post a Notice</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Visible to all campus members</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {/* Success state */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 px-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <span className="text-3xl">📌</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Notice Posted!</h3>
              <p className="text-sm text-muted-foreground">Your notice is now live on the board.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {/* Type selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('type', opt.value)}
                      className={`flex flex-col items-center text-center p-3 rounded-xl border text-xs font-medium transition-all ${
                        form.type === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      <span className="text-xl mb-1">{opt.emoji}</span>
                      <span className="font-semibold leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="notice-title">
                  Title *
                </label>
                <input
                  id="notice-title"
                  type="text"
                  placeholder="e.g. 'Found: AirPods near Library'"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  maxLength={120}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
                />
                <p className="text-right text-xs text-muted-foreground">{form.title.length}/120</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="notice-desc">
                  Description *
                </label>
                <textarea
                  id="notice-desc"
                  placeholder="Give all the details people need to know…"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  maxLength={600}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none placeholder:text-muted-foreground/60 font-body"
                />
                <p className="text-right text-xs text-muted-foreground">{form.description.length}/600</p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="notice-location">
                  Location <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  id="notice-location"
                  type="text"
                  placeholder="e.g. 'Main Library', 'Block B Gate'"
                  value={form.locationName}
                  onChange={(e) => update('locationName', e.target.value)}
                  maxLength={80}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Contact info — shown for marketplace & lost+found */}
              {showContact && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-foreground" htmlFor="notice-contact">
                    Contact Info <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    id="notice-contact"
                    type="text"
                    placeholder="WhatsApp number, email, or Instagram handle"
                    value={form.contactInfo}
                    onChange={(e) => update('contactInfo', e.target.value)}
                    maxLength={80}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
                  />
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !form.title.trim() || !form.description.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Posting…</>
                ) : (
                  <><Send size={16} /> Post Notice</>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                By posting, you agree to keep notices respectful and relevant to campus life.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </>
  )
}
