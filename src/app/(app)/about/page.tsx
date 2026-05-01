'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Globe, Shield, Code, Briefcase, HeartHandshake, Sparkles, ArrowUpRight } from 'lucide-react'

const TEAM_MEMBERS = [
  {
    name: 'Swagata Ganguly',
    role: 'Full Stack Web and MLOps Engineer',
    summary: 'Leads backend architecture, managing databases, APIs, and map integrations to ensure scalable AI powered features for reliable system performance.',
    linkedin: 'https://www.linkedin.com/in/swagata-ganguly-453aa6327',
    github: 'https://github.com/Cyberclutch146',
    bg: '--color-tertiary-container-base',
  },
  {
    name: 'Anuvab Das',
    role: 'Full Stack App/Web Developer',
    summary: 'Drives UI/UX design, implements payment system integration, and refines backend logic for seamless user experience and performance.',
    linkedin: 'https://www.linkedin.com/in/anv-dev/',
    github: 'https://github.com/Stewy8506',
    bg: '--color-primary-container-base',
  },
  {
    name: 'Debadree Sekhar Das',
    role: 'AI Specialist & Integration',
    summary: 'Develops and integrates AI-driven features, powering intelligent search, content generation, and contextual automation across the platform.',
    linkedin: 'https://www.linkedin.com/in/swagata-ganguly-453aa6327',
    github: 'https://github.com/Cyberclutch146',
    bg: '--color-secondary-container-base',
  },
  {
    name: 'Dhritiman Siva',
    role: 'Backend Developer',
    summary: 'Builds and maintains core backend services including authentication, messaging systems, email workflows, and server-side operations.',
    linkedin: 'https://www.linkedin.com/in/dhritiman-siva-8501b9324/',
    github: 'https://github.com/Dhritiman-Siva',
    bg: '--color-primary-container-base',
  }
]

const VALUES = [
  {
    icon: Users,
    title: 'Community First',
    desc: 'Every interaction is built to reduce friction between people who need help and people ready to step in.',
    bg: '--color-primary-container-base',
  },
  {
    icon: Globe,
    title: 'Local, Not Distant',
    desc: 'We focus on neighborhood-scale coordination so support stays immediate, visible, and actionable.',
    bg: '--color-secondary-container-base',
  },
  {
    icon: Shield,
    title: 'Trust Through Clarity',
    desc: 'Transparent organizers, visible needs, and live safety context help people act with confidence.',
    bg: '--color-tertiary-container-base',
  },
]

// --- Sub-components ---

function ValueCard({ card, index }: { card: typeof VALUES[0], index: number }) {
  return (
    <div
      className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
      style={{ background: `var(${card.bg})` }}
    >
      <div
        className="w-14 h-14 flex items-center justify-center mb-6 border-4 border-black"
        style={{ background: 'var(--color-surface-container-lowest-base)' }}
      >
        <card.icon size={28} className="text-on-surface" />
      </div>
      <h3 className="font-headline font-black text-xl uppercase tracking-tight text-on-surface mb-3">{card.title}</h3>
      <p className="text-on-surface-variant leading-relaxed font-body">{card.desc}</p>
    </div>
  )
}

function TeamMemberCard({ member, index }: { member: typeof TEAM_MEMBERS[0], index: number }) {
  return (
    <div
      className="group overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 flex flex-col h-full"
      style={{ background: 'var(--color-surface-container-lowest-base)' }}
    >
      {/* Top accent bar */}
      <div className="h-3 border-b-4 border-black" style={{ background: `var(${member.bg})` }} />

      <div className="flex flex-col h-full p-6">
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-14 h-14 flex items-center justify-center text-2xl font-headline font-black text-on-surface border-4 border-black"
            style={{ background: `var(${member.bg})` }}
          >
            {member.name.charAt(0)}
          </div>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-label font-bold uppercase tracking-[0.14em] border-2 border-black"
            style={{ background: 'var(--color-surface-container-base)' }}
          >
            Core
          </span>
        </div>

        <h3 className="mt-5 text-lg font-headline font-black uppercase tracking-tight text-on-surface">{member.name}</h3>
        <p className="mt-1 text-sm font-label font-bold uppercase tracking-wider text-on-surface-variant">
          {member.role}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant flex-1 font-body">
          {member.summary}
        </p>

        <div className="mt-6 flex items-center gap-3 pt-4 border-t-2 border-black">
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-label font-bold uppercase tracking-wider border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 text-on-surface"
            style={{ background: 'var(--color-surface-container-base)' }}
            title="LinkedIn Profile"
          >
            <Briefcase size={16} />
            LinkedIn
          </a>
          <a
            href={member.github.includes('github.com') ? member.github : `https://${member.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-label font-bold uppercase tracking-wider border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 text-on-surface"
            style={{ background: 'var(--color-surface-container-base)' }}
            title="GitHub Profile"
          >
            <Code size={16} />
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const router = useRouter()

  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-24">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 px-4 py-2 text-on-surface-variant font-label font-bold uppercase tracking-wider mb-10 border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150"
        style={{ background: 'var(--color-surface-container-base)' }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 lg:p-10" style={{ background: 'var(--color-primary-container-base)' }}>
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-label font-bold uppercase tracking-[0.16em] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-5"
              style={{ background: 'var(--color-surface-container-lowest-base)' }}
            >
              <HeartHandshake size={14} />
              Our mission
            </div>

            <h1 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-on-surface leading-none">
              Building calmer, faster campus response.
            </h1>

            <p className="mt-4 max-w-3xl text-lg md:text-xl text-on-surface-variant leading-relaxed font-body">
              CampusPulse helps students organize events, surface urgent needs, and respond with more clarity when time matters most.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-label font-bold uppercase tracking-wider border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
                <Sparkles size={15} />
                Student-centered
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-label font-bold uppercase tracking-wider border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
                <Shield size={15} />
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
                className="p-4 border-4 border-black"
                style={{ background: 'var(--color-surface-container-lowest-base)' }}
              >
                <p className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface-variant">{item.label}</p>
                <p className="mt-2 text-xl md:text-2xl font-headline font-black tracking-tight text-on-surface">{item.value}</p>
                <div className="mt-3 h-2 border-2 border-black" style={{ background: 'var(--color-secondary-container-base)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Values */}
      <section className="mt-10">
        <div className="mb-6">
          <p className="text-[10px] font-label font-bold uppercase tracking-[0.16em] text-on-surface-variant">Principles</p>
          <h2 className="mt-2 font-headline font-black text-3xl md:text-4xl uppercase tracking-tight text-on-surface">The values behind every interaction.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((card, i) => (
            <ValueCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mt-14 pt-10 border-t-4 border-black">
        <div className="mb-8">
          <p className="text-[10px] font-label font-bold uppercase tracking-[0.16em] text-on-surface-variant">The team</p>
          <h2 className="mt-2 font-headline font-black text-3xl md:text-4xl uppercase tracking-tight text-on-surface">The people shaping the platform.</h2>
          <p className="mt-3 text-on-surface-variant text-lg max-w-2xl font-body">
            A focused team of builders working across interface design, intelligence, systems, and campus tooling.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="mt-12 p-6 md:p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        style={{ background: 'var(--color-secondary-container-base)' }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-label font-bold uppercase tracking-[0.16em] text-on-surface-variant">Join the mission</p>
            <h2 className="mt-2 font-headline font-black text-3xl md:text-4xl uppercase tracking-tight text-on-surface">Turn campus intent into coordinated action.</h2>
            <p className="mt-3 text-on-surface-variant leading-relaxed font-body">
              Explore live events, volunteer where you can help most, and build stronger campus connections together.
            </p>
          </div>

          <button
            onClick={() => router.push('/feed')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
            style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
          >
            Explore the platform
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>
    </main>
  )
}
