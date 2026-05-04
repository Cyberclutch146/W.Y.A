'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Globe, Shield, Code, Briefcase, HeartHandshake, Sparkles, ArrowUpRight } from 'lucide-react'

const TEAM_MEMBERS = [
  {
    name: 'Swagata Ganguly',
    role: 'Full Stack Web and MLOps Engineer',
    summary: 'Leads backend architecture, managing databases, APIs, and map integrations to ensure scalable AI powered features for reliable system performance.',
    linkedin: 'https://www.linkedin.com/in/swagata-ganguly-453aa6327',
    github: 'https://github.com/Cyberclutch146',
    gradient: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))',
  },
  {
    name: 'Anuvab Das',
    role: 'Full Stack App/Web Developer',
    summary: 'Drives UI/UX design, implements payment system integration, and refines backend logic for seamless user experience and performance.',
    linkedin: 'https://www.linkedin.com/in/anv-dev/',
    github: 'https://github.com/Stewy8506',
    gradient: 'linear-gradient(135deg, var(--cp-orange), var(--cp-pink))',
  },
  {
    name: 'Debadree Sekhar Das',
    role: 'AI Specialist & Integration',
    summary: 'Develops and integrates AI-driven features, powering intelligent search, content generation, and contextual automation across the platform.',
    linkedin: 'https://www.linkedin.com/in/swagata-ganguly-453aa6327',
    github: 'https://github.com/Cyberclutch146',
    gradient: 'linear-gradient(135deg, var(--cp-secondary), var(--cp-lime))',
  },
  {
    name: 'Dhritiman Siva',
    role: 'Backend Developer',
    summary: 'Builds and maintains core backend services including authentication, messaging systems, email workflows, and server-side operations.',
    linkedin: 'https://www.linkedin.com/in/dhritiman-siva-8501b9324/',
    github: 'https://github.com/Dhritiman-Siva',
    gradient: 'linear-gradient(135deg, var(--cp-gold), var(--cp-orange))',
  }
]

const VALUES = [
  {
    icon: Users,
    title: 'Community First',
    desc: 'Every interaction is built to reduce friction between people who need help and people ready to step in.',
    gradient: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))',
  },
  {
    icon: Globe,
    title: 'Local, Not Distant',
    desc: 'We focus on neighborhood-scale coordination so support stays immediate, visible, and actionable.',
    gradient: 'linear-gradient(135deg, var(--cp-secondary), var(--cp-lime))',
  },
  {
    icon: Shield,
    title: 'Trust Through Clarity',
    desc: 'Transparent organizers, visible needs, and live safety context help people act with confidence.',
    gradient: 'linear-gradient(135deg, var(--cp-orange), var(--cp-pink))',
  },
]

// --- Sub-components ---

function ValueCard({ card, index }: { card: typeof VALUES[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.2 }}
      className="p-6 rounded-2xl transition-all hover:shadow-lg group"
      style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
        style={{ background: card.gradient }}
      >
        <card.icon size={22} className="text-white" />
      </div>
      <h3 className="font-headline font-bold text-xl mb-3" style={{ color: 'var(--cp-text-1)' }}>{card.title}</h3>
      <p className="leading-relaxed text-sm" style={{ color: 'var(--cp-text-2)' }}>{card.desc}</p>
    </motion.div>
  )
}

function TeamMemberCard({ member, index }: { member: typeof TEAM_MEMBERS[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.3 }}
      className="group overflow-hidden rounded-2xl flex flex-col h-full transition-all hover:shadow-lg"
      style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Top accent bar */}
      <div className="h-1.5" style={{ background: member.gradient }} />

      <div className="flex flex-col h-full p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white group-hover:scale-110 transition-transform"
            style={{ background: member.gradient }}
          >
            {member.name.charAt(0)}
          </div>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md"
            style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-3)' }}
          >
            Core
          </span>
        </div>

        <h3 className="mt-4 text-lg font-headline font-bold" style={{ color: 'var(--cp-text-1)' }}>{member.name}</h3>
        <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--cp-text-3)' }}>
          {member.role}
        </p>
        <p className="mt-3 text-sm leading-relaxed flex-1" style={{ color: 'var(--cp-text-2)' }}>
          {member.summary}
        </p>

        <div className="mt-5 flex items-center gap-2 pt-4" style={{ borderTop: '1px solid var(--cp-border)' }}>
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all hover:shadow-sm"
            style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }}
            title="LinkedIn Profile"
          >
            <Briefcase size={14} />
            LinkedIn
          </a>
          <a
            href={member.github.includes('github.com') ? member.github : `https://${member.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all hover:shadow-sm"
            style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }}
            title="GitHub Profile"
          >
            <Code size={14} />
            GitHub
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export default function AboutPage() {
  const router = useRouter()

  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-24">
      <button
        onClick={() => router.back()}
        className="btn-secondary mb-10"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10"
        style={{
          background: 'linear-gradient(135deg, hsl(from var(--cp-primary) h s l / 0.08), hsl(from var(--cp-violet) h s l / 0.05))',
          border: '1px solid var(--cp-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full mb-5"
              style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
            >
              <HeartHandshake size={14} style={{ color: 'var(--cp-primary)' }} />
              <span style={{ color: 'var(--cp-text-2)' }}>Our mission</span>
            </div>

            <h1 className="font-headline font-bold tracking-tight leading-[1.05]" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--cp-text-1)' }}>
              Building calmer, faster{' '}
              <span style={{ color: 'var(--cp-primary)' }}>campus response.</span>
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
              W.Y.A helps students organize events, surface urgent needs, and respond with more clarity when time matters most.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
              >
                <Sparkles size={14} style={{ color: 'var(--cp-primary)' }} />
                Student-centered
              </span>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
              >
                <Shield size={14} style={{ color: 'var(--cp-secondary)' }} />
                Trusted action
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Designed For', value: 'Campus life' },
              { label: 'Core Focus', value: 'Event coordination' },
              { label: 'Approach', value: 'Direct support' },
              { label: 'Experience', value: 'Premium by design' },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>{item.label}</p>
                <p className="mt-2 text-xl md:text-2xl font-headline font-bold tracking-tight" style={{ color: 'var(--cp-text-1)' }}>{item.value}</p>
                <div className="mt-3 h-1 rounded-full w-full" style={{ background: 'var(--cp-primary)', opacity: 0.2 }} />
              </div>
            ))}
          </div>
        </div>
      </motion.section>


      {/* Values */}
      <section className="mt-12">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>Principles</p>
          <h2 className="mt-2 font-headline font-bold text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--cp-text-1)' }}>The values behind every interaction.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {VALUES.map((card, i) => (
            <ValueCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mt-14 pt-10" style={{ borderTop: '1px solid var(--cp-border)' }}>
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>The team</p>
          <h2 className="mt-2 font-headline font-bold text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--cp-text-1)' }}>The people shaping the platform.</h2>
          <p className="mt-3 text-lg max-w-2xl" style={{ color: 'var(--cp-text-2)' }}>
            A focused team of builders working across interface design, intelligence, systems, and campus tooling.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {TEAM_MEMBERS.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 p-6 md:p-8 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, hsl(from var(--cp-secondary) h s l / 0.06), hsl(from var(--cp-lime) h s l / 0.04))',
          border: '1px solid var(--cp-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>Join the mission</p>
            <h2 className="mt-2 font-headline font-bold text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--cp-text-1)' }}>Turn campus intent into coordinated action.</h2>
            <p className="mt-3 leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
              Explore live events, volunteer where you can help most, and build stronger campus connections together.
            </p>
          </div>

          <button
            onClick={() => router.push('/feed')}
            className="btn-primary"
          >
            Explore the platform
            <ArrowUpRight size={16} />
          </button>
        </div>
      </motion.section>
    </main>
  )
}
