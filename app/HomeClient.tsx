'use client';
import { useMemo } from 'react';
import { Hero } from "@/components/sections/Hero";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { WorkProcedure } from "@/components/sections/WorkProcedure";
import Link from "next/link";
import { useContent } from '@/components/PreviewProvider'; 
import TestimonialSlider from '@/components/home/TestimonialSlider';

interface HomeClientProps {
  initialProjects: any[];
  projectReviews: any[];
  initialTestimonials: any[];
  initialProjectCount: number;
  initialAvgRating: number;
}

export default function HomeClient({ 
  initialProjects, 
  projectReviews,
  initialTestimonials,
  initialProjectCount, 
  initialAvgRating 
}: HomeClientProps) {
  
  const pageContent = useContent();
  const experienceYears = new Date().getFullYear() - 2012;
  const starIds = useMemo(() => Array.from({ length: 5 }, () => crypto.randomUUID()), []);

  const getUI = (key: string, fallback: string) => pageContent[`home:${key}`] || fallback;

  const ui = {
    portfolio_subtitle: getUI('portfolio_subtitle', "Portfolio"),
    portfolio_title: getUI('portfolio_title', "Selected Works"),
    portfolio_browse_label: getUI('portfolio_browse_label', "View All"),
    stat_focus_label: getUI('stat_focus_label', "Client Satisfaction"),
    cta_subtitle: getUI('cta_subtitle', "Start Now"),
    cta_title: getUI('cta_title', "Let's Build Together"),
    cta_button_label: getUI('cta_button_label', "Get in Touch")
  };

  const DynamicStar = ({ fill, id }: { fill: number; id: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" className="text-[var(--accent-light)]">
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
        strokeOpacity={fill > 0 ? "1" : "0.3"}
      />
    </svg>
  );

  const renderTitle = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, i) => 
      part.startsWith('[') ? <span key={i} className="font-serif italic font-light text-[var(--accent-gold)]">{part.slice(1, -1)}</span> : part
    );
  };

  return (
    <main className="bg-[var(--bg-warm)] min-h-screen selection:bg-[var(--accent-gold)]/20">
      <Hero />

      <section className="py-24 max-w-7xl mx-auto px-6" aria-labelledby="portfolio-title">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-6">
          <header className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold italic">{ui.portfolio_subtitle}</h2>
            <p id="portfolio-title" className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.9]">
              {renderTitle(ui.portfolio_title)}
            </p>
          </header>
          <Link href="/projects" className="group text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-4 hover:text-[var(--accent-gold)] transition-all">
            {ui.portfolio_browse_label} 
            <span className="w-12 h-[2px] bg-zinc-200 group-hover:w-20 group-hover:bg-[var(--accent-gold)] transition-all" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32">
          {initialProjects.map((project) => {
            // Filter reviews for this specific project slug
            const relevant = projectReviews.filter(r => r.page_slug === project.slug);
            const avg = relevant.length > 0 ? relevant.reduce((acc, r) => acc + r.rating, 0) / relevant.length : 0;

            return (
              <Link key={project.id} href={`/projects/${project.slug}`} className="block">
                <ProjectCard project={project} avgRating={avg} />
              </Link>
            );
          })}
        </div>
      </section>

      <WorkProcedure />

      <section className="py-32 bg-[var(--text-primary)] border-y border-zinc-800" aria-label="Agency Statistics">
        <div className="max-w-7xl mx-auto text-white text-center grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-3">
            <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[var(--accent-light)] tabular-nums">{experienceYears}+</p>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Years Experience</h3>
          </div>
          <div className="space-y-3">
            <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[var(--accent-light)] tabular-nums">{initialProjectCount}+</p>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Completed Works</h3>
          </div>
          <div className="space-y-4 flex flex-col items-center justify-center">
            <div className="flex gap-1">
              {starIds.map((id, i) => {
                const fill = initialAvgRating >= i + 1 ? 100 : initialAvgRating > i ? (initialAvgRating - i) * 100 : 0;
                return <DynamicStar key={id} fill={fill} id={id} />;
              })}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tighter text-white tabular-nums">{initialAvgRating.toFixed(1)} / 5.0</p>
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">{ui.stat_focus_label}</h3>
            </div>
          </div>
        </div>
      </section>

      <TestimonialSlider initialReviews={initialTestimonials} />

      <section className="py-48 px-8 text-center bg-[var(--bg-warm)] border-t border-zinc-200">
        <div className="max-w-4xl mx-auto space-y-12">
          <p className="text-[11px] uppercase tracking-[0.8em] text-[var(--accent-gold)] font-black italic">{ui.cta_subtitle}</p>
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.85]">
            {renderTitle(ui.cta_title)}
          </h2>
          <div className="pt-10">
            <Link href="/contact" className="inline-block px-16 py-8 bg-[var(--text-primary)] text-white text-[11px] uppercase tracking-[0.6em] font-black hover:bg-[var(--accent-gold)] transition-all shadow-2xl active:scale-95">
              {ui.cta_button_label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}