'use client';
import { useState, useEffect, useMemo } from 'react';
import { Hero } from "@/components/sections/Hero";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { WorkProcedure } from "@/components/sections/WorkProcedure";
import { createClient } from '@/utils/supabase/client';
import Link from "next/link";
import { useContent } from '@/components/PreviewProvider'; 
import { Loader2 } from 'lucide-react';
import TestimonialSlider from '@/components/home/TestimonialSlider';

export default function HomeClient() {
  const [projects, setProjects] = useState<any[]>([]);
  const [totalProjectCount, setTotalProjectCount] = useState(0); 
  const [avgRating, setAvgRating] = useState(0); 
  const [loading, setLoading] = useState(true);
  
  const pageContent = useContent();
  const supabase = createClient();
  const experienceYears = new Date().getFullYear() - 2012;

  const starIds = useMemo(() => Array.from({ length: 5 }, () => crypto.randomUUID()), []);

  const getUI = (key: string, fallback: string) => {
    return pageContent[`home:${key}`] || fallback;
  };

  const ui = {
    portfolio_subtitle: getUI('portfolio_subtitle', "Portfolio"),
    portfolio_title: getUI('portfolio_title', "Selected Works"),
    portfolio_browse_label: getUI('portfolio_browse_label', "View All"),
    stat_focus_label: getUI('stat_focus_label', "Client Satisfaction"),
    cta_subtitle: getUI('cta_subtitle', "Start Now"),
    cta_title: getUI('cta_title', "Let's Build Together"),
    cta_button_label: getUI('cta_button_label', "Get in Touch")
  };

  // 🎯 SVG Component updated with --accent-light color logic
  const DynamicStar = ({ fill, id }: { fill: number; id: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" className="text-[var(--accent-light)]">
      <defs>
        <linearGradient id={id}>
          {/* Filled part uses the accent-light variable */}
          <stop offset={`${fill}%`} stopColor="currentColor" />
          {/* Unfilled part uses a subtle transparent zinc for a high-end look */}
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

  useEffect(() => {
    async function fetchHomeData() {
      setLoading(true);
      const { data: projData } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'Active')
        .eq('is_featured', true) 
        .order('featured_order', { ascending: true })
        .limit(4);
      
      const { count: projCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('status', 'approved');
      
      if (projData) setProjects(projData);
      if (projCount !== null) setTotalProjectCount(projCount);
      
      if (reviewData && reviewData.length > 0) {
        const total = reviewData.reduce((acc, curr) => acc + curr.rating, 0);
        setAvgRating(total / reviewData.length);
      } else {
        setAvgRating(5.0); 
      }

      setLoading(false);
    }
    fetchHomeData();
  }, [supabase]);

  return (
    <main className="bg-[var(--bg-warm)] min-h-screen selection:bg-[var(--accent-gold)]/20">
      <Hero />

      {/* Portfolio Section */}
      <section className="py-24 max-w-7xl mx-auto px-6" aria-labelledby="portfolio-title">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-6">
          <header className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold italic">
              {ui.portfolio_subtitle}
            </h2>
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
          {loading ? (
             <div className="col-span-full py-20 flex justify-center">
               <Loader2 className="animate-spin text-zinc-300" size={32} />
             </div>
          ) : (
            projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="group block">
                <ProjectCard project={project} />
              </Link>
            ))
          )}
        </div>
      </section>

      <WorkProcedure />

      {/* Live Stats Section */}
      <section className="py-32 bg-[var(--text-primary)] border-y border-zinc-800" aria-label="Agency Statistics">
        <div className="max-w-7xl mx-auto text-white text-center grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="space-y-3">
            <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[var(--accent-light)] tabular-nums">{experienceYears}+</p>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Years Experience</h3>
          </div>

          <div className="space-y-3">
            <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[var(--accent-light)] tabular-nums">{totalProjectCount}+</p>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Completed Works</h3>
          </div>

          <div className="space-y-4 flex flex-col items-center justify-center">
            <div className="flex gap-1">
              {starIds.map((id, i) => {
                const fill = avgRating >= i + 1 
                  ? 100 
                  : avgRating > i 
                    ? (avgRating - i) * 100 
                    : 0;
                return <DynamicStar key={id} fill={fill} id={id} />;
              })}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tighter text-white tabular-nums">{avgRating.toFixed(1)} / 5.0</p>
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">{ui.stat_focus_label}</h3>
            </div>
          </div>

        </div>
      </section>

      <TestimonialSlider />

      <section className="py-48 px-8 text-center bg-[var(--bg-warm)] border-t border-zinc-200">
        <div className="max-w-4xl mx-auto space-y-12">
          <p className="text-[11px] uppercase tracking-[0.8em] text-[var(--accent-gold)] font-black italic">
            {ui.cta_subtitle}
          </p>
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.85]">
            {renderTitle(ui.cta_title)}
          </h2>
          <div className="pt-10">
            <Link 
              href="/contact" 
              className="inline-block px-16 py-8 bg-[var(--text-primary)] text-white text-[11px] uppercase tracking-[0.6em] font-black hover:bg-[var(--accent-gold)] transition-all shadow-2xl active:scale-95"
            >
              {ui.cta_button_label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}