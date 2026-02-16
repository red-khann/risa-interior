'use client'

import { useMemo } from 'react'
import { useContent } from '@/components/PreviewProvider'
import {
  Target,
  Eye,
  Gem,
  ShieldCheck,
} from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'

interface AboutClientProps {
  initialProjectsCount: number;
  initialAvgRating: number;
  initialReviewsCount: number;
}

export default function AboutClient({
  initialProjectsCount,
  initialAvgRating,
  initialReviewsCount
}: AboutClientProps) {
  const liveData = useContent()

  // 🎯 Calculate Years of Mastery Dynamically
  const FOUNDED_YEAR = 2012;
  const currentYear = new Date().getFullYear();
  const calculatedYears = currentYear - FOUNDED_YEAR;

  const { scrollYProgress } = useScroll()
  const yHero = useTransform(scrollYProgress, [0, 0.6], [0, -40])

  const getUI = (key: string, fallback: string) => liveData[`about:${key}`] || fallback

  const content = {
    hero_label: getUI('hero_label', 'Philosophy'),
    hero_image: getUI('about_hero_image', ''),
    title: getUI('about_title', 'Architectural [integrity] meets interior poetry.'),
    description: getUI('about_description', 'We curate environments that reflect the silent dialogue between raw materiality and human inhabitancy.'),
    founder_title: getUI('founder_title', 'Leadership Narrative'),
    founder_name: getUI('founder_name', 'Mohd Rizwan Khan'),
    founder_role: getUI('founder_role', 'Principal Lead'),
    founder_bio: getUI('founder_bio', 'Driven by the principle of Architectural Integrity...'),
    founder_image: getUI('founder_image', ''),
    leadership_main_title: getUI('leadership_main_title', 'Architectural'),
    leadership_serif_title: getUI('leadership_serif_title', 'Integrity'),
    projects_label: getUI('projects_label', 'Built Protocols'),
    feedback_label: getUI('feedback_label', 'Client Satisfaction'),
    years_label: getUI('years_label', 'Years of Mastery'),
    years_value: calculatedYears.toString(), 
    mission_title: getUI('mission_title', 'Our Mission'),
    mission_text: getUI('mission_text', 'To craft architectural environments that unite precision engineering with human-centered design.'),
    vision_title: getUI('vision_title', 'Our Vision'),
    vision_text: getUI('vision_text', 'To establish a benchmark of architectural excellence where every structure reflects spatial intelligence.'),
    values_title: getUI('values_title', 'Our Values'),
    values_text: getUI('values_text', 'Material honesty. Structural integrity. Client transparency. Timeless spatial composition.'),
    wcu_title: getUI('wcu_title', "Why RISA Interior?"),
    wcu_subtitle: getUI('wcu_subtitle', "The Distinction"),
    wcu_points: [
      getUI('wcu_point_1', "Zero-Tolerance Construction Quality"),
      getUI('wcu_point_2', "Architectural-Grade Interior Synthesis"),
      getUI('wcu_point_3', "Transparent Material Sourcing Protocol"),
      getUI('wcu_point_4', "Lead-Principal Oversight on Every Site")
    ],
    wcu_quote: getUI('wcu_quote', "Integrity is the only material that never ages."),
    cta_title: getUI('cta_title', "Start your [narrative]"),
    cta_button: getUI('cta_button', "Initiate Conversation")
  }

  const starIds = useMemo(() => Array.from({ length: 5 }, () => crypto.randomUUID()), [])

  const DynamicStar = ({ fill, id }: { fill: number; id: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" className="text-[var(--accent-light)]">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill}%`} stopColor="currentColor" />
          <stop offset={`${fill}%`} stopColor="rgba(161, 161, 170, 0.2)" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
        fill={`url(#${id})`} 
        stroke="currentColor" 
        strokeWidth="1" 
      />
    </svg>
  )

  const renderStylishTitle = (text: string) => {
    const parts = text.split(/(\[.*?\])/g)
    return parts.map((p, i) => p.startsWith('[') ? <span key={i} className="font-serif italic font-light text-[var(--accent-gold)]">{p.slice(1, -1)}</span> : p)
  }

  const cardStyle = "p-10 lg:p-14 bg-white/60 backdrop-blur-md border border-white shadow-sm relative transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:z-30 cursor-default"

  return (
    <main className="bg-[var(--bg-warm)] min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] mix-blend-multiply" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />

      {/* ACT I: HERO */}
      <section className="relative pt-40 pb-28 max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 relative z-20 w-full">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-black italic mb-8">
                {content.hero_label}
              </p>
              <h1 className="text-[10vw] lg:text-[6vw] xl:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.9] max-w-2xl relative z-30">
                {renderStylishTitle(content.title)}
              </h1>
              <p className="max-w-xl text-zinc-500 text-sm md:text-base uppercase tracking-widest leading-relaxed font-medium mt-10 lg:mt-10 border-l-2 border-zinc-200 pl-8 italic relative z-10">
                {content.description}
              </p>
            </motion.div>
          </div>

          <motion.div style={{ y: yHero }} className="lg:col-span-5 relative z-10">
            <div className="aspect-[3/4] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.12)] bg-zinc-200">
               <img src={content.hero_image} alt={content.hero_label} className="w-full h-full object-cover scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ACT II: LEADERSHIP */}
      <section className="py-40 border-t border-zinc-200/60 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="flex items-center gap-3 text-[var(--accent-gold)]">
              <ShieldCheck size={20} />
              <p className="text-[10px] uppercase tracking-[0.4em] font-black italic">{content.founder_title}</p>
            </div>
            <h2 className="text-[10vw] lg:text-[4.5vw] xl:text-7xl font-bold tracking-tighter leading-[0.9] uppercase text-zinc-900 max-w-lg">
              {content.leadership_main_title} <br />
              <span className="italic text-zinc-400 font-serif font-light lowercase">
                {content.leadership_serif_title}
              </span>
            </h2>
            <p className="text-xl font-serif italic text-zinc-700 leading-relaxed max-w-md border-l-2 border-[var(--accent-gold)] pl-8">
              {content.founder_bio}
            </p>
            <div className="pt-6">
               <h4 className="font-bold text-zinc-900 uppercase tracking-tighter text-lg">{content.founder_name}</h4>
               <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-black mt-1">
                 {content.founder_role}
               </p>
            </div>
          </div>
          <div className="aspect-square overflow-hidden transition duration-[1200ms] shadow-2xl relative">
            <img src={content.founder_image} alt={content.founder_name} className="w-full h-full object-cover" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[var(--bg-warm)] -z-10" />
          </div>
        </div>
      </section>

      {/* ACT III: REPUTATION METRICS */}
      <section className="py-28 border-y border-zinc-200/60 bg-[var(--bg-warm)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Projects Card */}
          <div className={cardStyle + " text-center bg-white/60"}>
            <p className="text-8xl font-bold text-zinc-900 tracking-tighter tabular-nums">
              {initialProjectsCount}<span className="text-[var(--accent-light)]">+</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black mt-4">{content.projects_label}</p>
          </div>

          {/* Feedback/Stars Card */}
          <div className={cardStyle + " text-center bg-white/80"}>
            <div className="flex justify-center gap-1 text-[var(--accent-light)] mb-4">
              {starIds.map((id, i) => {
                const fill = initialAvgRating >= i + 1 ? 100 : initialAvgRating > i ? (initialAvgRating - i) * 100 : 0
                return <DynamicStar key={id} fill={fill} id={id} />
              })}
            </div>
            <p className="text-5xl lg:text-6xl font-bold tracking-tighter text-zinc-900 tabular-nums">{initialAvgRating.toFixed(1)}</p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black mt-2">{content.feedback_label} ({initialReviewsCount})</p>
          </div>

          {/* Years Card */}
          <div className={cardStyle + " text-center bg-white/60"}>
            <p className="text-8xl font-bold text-zinc-900 tracking-tighter tabular-nums">
              {content.years_value}<span className="text-[var(--accent-light)]">+</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black mt-4">{content.years_label}</p>
          </div>

        </div>
      </section>

      {/* ACT IV: STRATEGIC INTENT */}
      <section className="py-36 max-w-7xl mx-auto px-6 lg:px-8 bg-[var(--bg-warm)]">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {[
            { icon:<Target className="w-8 h-8"/>, title:content.mission_title, text:content.mission_text },
            { icon:<Eye className="w-8 h-8"/>, title:content.vision_title, text:content.vision_text },
            { icon:<Gem className="w-8 h-8"/>, title:content.values_title, text:content.values_text }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={cardStyle + " bg-white/60 group"}
            >
              <div className="text-[var(--accent-gold)] mb-10 transition-transform duration-500 relative z-10 group-hover:scale-110">
                {item.icon}
              </div>
              <h3 className="font-bold text-zinc-900 uppercase tracking-tighter text-lg mb-6 relative z-10">{item.title}</h3>
              <p className="text-xl font-serif italic text-zinc-500 leading-relaxed relative z-10 group-hover:text-zinc-700 transition-colors max-w-[280px]">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ACT V: THE DISTINCTION */}
      <section className="py-48 bg-[#0A0A0A] text-white overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12 relative z-10">
                <header className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.8em] text-[var(--accent-gold)] font-black italic">{content.wcu_subtitle}</p>
                    <h2 className="text-[8vw] lg:text-[4.5vw] xl:text-7xl font-bold tracking-tighter uppercase leading-[0.9] max-w-xl">
                        {renderStylishTitle(content.wcu_title)}
                    </h2>
                </header>
                <div className="space-y-8">
                    {content.wcu_points.map((point, i) => (
                        <div key={i} className="flex items-center gap-6 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] group-hover:scale-150 transition-transform" />
                            <p className="text-sm md:text-base uppercase tracking-widest leading-relaxed font-medium group-hover:text-white transition-colors max-w-md">{point}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative border border-zinc-800 p-8 sm:p-12">
                <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-12 text-center space-y-8">
                    <ShieldCheck size={80} className="text-[var(--accent-gold)]" strokeWidth={1} />
                    <p className="text-lg lg:text-xl font-serif italic text-zinc-500 leading-relaxed max-w-xs">"{content.wcu_quote}"</p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/[0.03] rounded-full pointer-events-none" />
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-56 text-center border-t border-zinc-200/60 bg-white">
        <h2 className="text-6xl md:text-[4.5vw] xl:text-7xl font-bold tracking-tighter leading-[0.9] uppercase text-zinc-900 max-w-4xl mx-auto">
          {renderStylishTitle(content.cta_title)}
        </h2>
        <Link
          href="/contact"
          className="inline-block mt-16 px-14 py-10 bg-zinc-900 text-white uppercase tracking-[0.6em] text-[11px] font-black hover:bg-[var(--accent-gold)] transition-all shadow-2xl active:scale-95"
        > 
          {content.cta_button}
        </Link>
      </section>
    </main>
  )
}