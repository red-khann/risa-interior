'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useContent } from '@/components/PreviewProvider'; 
import { Loader2 } from 'lucide-react';

export default function AboutClient() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  
  const liveData = useContent();
  const supabase = createClient();

  const getUI = (key: string, fallback: string) => {
    return liveData[`about:${key}`] || fallback;
  };

  const content = {
    image: getUI('about_hero_image', ""),
    subtitle: getUI('about_subtitle', "The Philosophy"),
    title: getUI('about_title', "Spaces that [breathe] and inspire."),
    description: getUI('about_description', ""),
    quote: getUI('about_quote', ""),
    author: getUI('about_author', "Studio Visionary"),
    awards: getUI('about_awards', "0"),
    projects_label: getUI('projects_label', "Projects Completed"),
    awards_label: getUI('awards_label', "Industry Awards")
  };

  const renderStylishTitle = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={i} className="font-serif italic text-zinc-400">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part.replace(/\\n/g, '\n');
    });
  };

  useEffect(() => {
    async function fetchProjectCount() {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');
      
      if (count) setTotalProjects(count);
      setLoadingCount(false);
    }
    fetchProjectCount();
  }, [supabase]);

  if (loadingCount) return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
    </div>
  );

  return (
    <main className="pt-32 pb-24 bg-[#F7F5F2] min-h-screen selection:bg-[#B89B5E]/10">
      <article className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          <figure className="group relative aspect-[4/5] overflow-hidden bg-zinc-100 shadow-2xl">
            <img 
              src={content.image} 
              alt={`Studio Philosophy - ${content.author}`}
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105 grayscale-[0.2] hover:grayscale-0" 
              loading="eager" 
            />
            <div className="absolute inset-0 bg-black/5 pointer-events-none" aria-hidden="true" />
          </figure>

          <div className="space-y-16">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[#B89B5E] font-black mb-8 italic">
                {content.subtitle}
              </p>
              
              <h1 className="text-[10vw] lg:text-[6vw] leading-[0.85] mb-12 text-zinc-900 font-bold tracking-tighter uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
               {renderStylishTitle(content.title)}
              </h1>
              <p className="text-xl text-zinc-600 leading-relaxed font-light font-sans max-w-xl">
                {content.description}
              </p>
            </div>

            <section className="grid grid-cols-2 gap-12 pt-16 border-t border-zinc-200" aria-label="Studio Statistics">
              <div className="space-y-2">
                <p className="text-6xl font-bold tracking-tighter text-zinc-900">{totalProjects}+</p>
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-black italic">
                  {content.projects_label}
                </h2>
              </div>
              <div className="space-y-2">
                <p className="text-6xl font-bold tracking-tighter text-zinc-900">{content.awards}+</p>
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-black italic">
                  {content.awards_label}
                </h2>
              </div>
            </section>

            <blockquote className="bg-white border-l-4 border-[#B89B5E] p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <span className="absolute top-0 right-0 text-9xl text-zinc-50 opacity-10 font-serif font-black tracking-tighter" aria-hidden="true">"</span>
              <p className="italic text-zinc-800 font-serif leading-relaxed text-2xl relative z-10">
                "{content.quote}"
              </p>
              <footer className="flex items-center gap-4 mt-8 relative z-10">
                <div className="w-8 h-[1px] bg-[#B89B5E]" aria-hidden="true" />
                <cite className="text-[10px] not-italic uppercase tracking-[0.4em] font-black text-zinc-900">
                  {content.author}
                </cite>
              </footer>
            </blockquote>
          </div>
        </div>
      </article>
    </main>
  );
}