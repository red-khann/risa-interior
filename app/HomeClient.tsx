'use client';
import { useState, useEffect } from 'react';
import { Hero } from "../components/sections/Hero";
import { ProjectCard } from "../components/shared/ProjectCard";
import { WorkProcedure } from "../components/sections/WorkProcedure";
import { createClient } from '@/utils/supabase/client';
import Link from "next/link";
import { useContent } from '../components/PreviewProvider'; 
import { Loader2 } from 'lucide-react';

export default function HomeClient() {
  const [projects, setProjects] = useState<any[]>([]);
  const [totalProjectCount, setTotalProjectCount] = useState(0); 
  const [loading, setLoading] = useState(true);
  
  const pageContent = useContent();
  const supabase = createClient();
  const experienceYears = new Date().getFullYear() - 2012;

  const getUI = (key: string, fallback: string) => {
    return pageContent[`home:${key}`] || fallback;
  };

  const ui = {
    portfolio_subtitle: getUI('portfolio_subtitle', "Portfolio"),
    portfolio_title: getUI('portfolio_title', "Selected Works"),
    portfolio_browse_label: getUI('portfolio_browse_label', "View All"),
    stat_designers_count: getUI('stat_designers_count', "0"),
    stat_designers_label: getUI('stat_designers_label', "Designers"),
    stat_focus_count: getUI('stat_focus_count', "0"),
    stat_focus_label: getUI('stat_focus_label', "Focus"),
    cta_subtitle: getUI('cta_subtitle', "Start Now"),
    cta_title: getUI('cta_title', "Let's Build Together"),
    cta_button_label: getUI('cta_button_label', "Get in Touch")
  };

  const renderTitle = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, i) => 
      part.startsWith('[') ? <span key={i} className="font-serif italic font-light text-[#B89B5E]">{part.slice(1, -1)}</span> : part
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
      
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');
      
      if (projData) setProjects(projData);
      if (count !== null) setTotalProjectCount(count);
      setLoading(false);
    }
    fetchHomeData();
  }, [supabase]);

  return (
    <main className="bg-[#F7F5F2] min-h-screen selection:bg-[#B89B5E]/20">
      <Hero />

      {/* 2. Portfolio Section */}
      <section className="py-24 max-w-7xl mx-auto px-6" aria-labelledby="portfolio-title">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-6">
          <header className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-1000">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold italic">
              {ui.portfolio_subtitle}
            </h2>
            {/* 🎯 Changed to H2 for correct document outline */}
            <p id="portfolio-title" className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {renderTitle(ui.portfolio_title)}
            </p>
          </header>
          <Link href="/projects" className="group text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-4 hover:text-[#B89B5E] transition-all" aria-label="Browse all projects">
            {ui.portfolio_browse_label} 
            <span className="w-12 h-[2px] bg-zinc-200 group-hover:w-20 group-hover:bg-[#B89B5E] transition-all" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32">
          {loading ? (
             <div className="col-span-full py-20 flex justify-center">
               <Loader2 className="animate-spin text-zinc-300" size={32} />
             </div>
          ) : projects.length === 0 ? (
            <p className="col-span-full py-20 text-center text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">
              No featured projects selected in database.
            </p>
          ) : (
            projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="group block" title={`View project: ${project.title}`}>
                <ProjectCard project={project} />
              </Link>
            ))
          )}
        </div>
      </section>

      <WorkProcedure />

      {/* 4. Live Stats Section */}
      <section className="py-32 bg-[#121212] border-y border-zinc-800" aria-label="Agency Statistics">
        <div className="max-w-7xl mx-auto text-white text-center grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="space-y-3">
            <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[#B89B5E]">{experienceYears}+</p>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Years Experience</h3>
          </div>
          
          <div className="space-y-3">
            <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[#B89B5E]">{totalProjectCount}+</p>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Completed Works</h3>
          </div>

          <div className="space-y-3">
            <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[#B89B5E]">
              {ui.stat_designers_count}
            </p>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">
              {ui.stat_designers_label}
            </h3>
          </div>
          <div className="space-y-3">
            <p className="text-5xl md:text-6xl font-bold tracking-tighter text-[#B89B5E]">
              {ui.stat_focus_count}
            </p>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">
              {ui.stat_focus_label}
            </h3>
          </div>
        </div>
      </section>

      {/* 5. Call to Action Section */}
      <section className="py-48 px-8 text-center bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto space-y-12">
          <p className="text-[11px] uppercase tracking-[0.8em] text-[#B89B5E] font-black italic">
            {ui.cta_subtitle}
          </p>
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.85]">
            {renderTitle(ui.cta_title)}
          </h2>
          <div className="pt-10">
            <Link href="/contact" className="inline-block px-16 py-8 bg-[#1C1C1C] text-white text-[11px] uppercase tracking-[0.6em] font-black hover:bg-[#B89B5E] transition-all shadow-2xl active:scale-95">
              {ui.cta_button_label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}