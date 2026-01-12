'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, MapPin, Zap, FileText, Clock } from "lucide-react";
import { useContent } from '@/components/PreviewProvider';

export default function ProjectDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const supabase = createClient();
  const liveContent = useContent();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visiblePhotos, setVisiblePhotos] = useState(6); 

  const getUI = (key: string, fallback: string) => {
    return liveContent[`project_detail_global:${key}`] || fallback;
  };

  const ui = {
    spec_header: getUI('spec_header', "Core Specifications"),
    essence_header: getUI('essence_header', "The Essence"),
    narrative_header: getUI('narrative_header', "Philosophical Approach"),
    gallery_header: getUI('gallery_header', "The Narrative in Frames"),
    gallery_subtitle: getUI('gallery_subtitle', "Visual Protocol"),
    cta_subtitle: getUI('cta_subtitle', "Collaborative Inquiry"),
    cta_title: getUI('cta_title', "Discuss your vision?"),
    cta_button: getUI('cta_button', "Initiate Conversation")
  };

  useEffect(() => {
    async function fetchProjectData() {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        setProject({
          ...data,
          gallery: typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery
        });
      }
      setLoading(false);
    }
    if (slug) fetchProjectData();
  }, [slug, supabase]);

  if (loading) return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center animate-pulse text-[10px] tracking-[0.4em] text-zinc-400 uppercase font-black">
      Synchronizing Project Protocol...
    </div>
  );
  
  if (!project) return <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2] uppercase tracking-widest text-[10px] font-black text-zinc-400">Archive Entry Not Found</div>;

  return (
    <main className="pt-32 pb-20 bg-[#F7F5F2] min-h-screen selection:bg-[#B89B5E]/20">
      {/* 🎯 SEO: Article tag with Schema.org CreativeWork properties */}
      <article className="max-w-[1440px] mx-auto px-8 md:px-16" itemScope itemType="https://schema.org/CreativeWork">
        
        <button onClick={() => router.back()} className="group flex items-center gap-3 mb-16 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 hover:text-[#B89B5E] transition-all" aria-label="Back to Portfolio">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Portfolio
        </button>

        <header className="mb-20 border-b border-zinc-200 pb-16">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.6em] text-[#B89B5E] font-bold mb-8 italic">
            <span itemProp="genre">{project.category}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" aria-hidden="true"></span>
            <span>{project.phase}</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-[#1C1C1C] uppercase mb-10 leading-[0.85]" itemProp="name">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-10">
            <div className="flex items-center gap-3 text-zinc-500 tracking-[0.4em] text-[10px] uppercase font-black">
                <MapPin size={14} className="text-[#B89B5E]" aria-hidden="true" /> 
                <span itemProp="locationCreated">{project.location || `${project.city}, ${project.state}`}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500 tracking-[0.4em] text-[10px] uppercase font-black">
                <Clock size={14} className="text-[#B89B5E]" aria-hidden="true" /> 
                <time dateTime={project.date}>{project.display_date}</time>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <figure className="aspect-[21/9] overflow-hidden bg-zinc-200 mb-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative">
          <img 
            src={project.image_url} 
            alt={`${project.title} - ${project.category} in ${project.city}`} 
            className="w-full h-full object-cover" 
            itemProp="image"
          />
        </figure>

        {/* Dynamic Narrative & Specs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mb-40 pt-24 border-t border-zinc-200">
          <aside className="lg:col-span-4 space-y-20">
            <section className="space-y-10" aria-labelledby="specs-title">
              <h4 id="specs-title" className="text-[11px] uppercase tracking-[0.5em] font-black text-zinc-900 flex items-center gap-3">
                <Zap size={14} className="text-[#B89B5E]" aria-hidden="true" /> {ui.spec_header}
              </h4>
              <dl className="space-y-10 text-[10px] uppercase tracking-[0.3em] font-black">
                <div className="group border-l-2 border-zinc-100 pl-6 hover:border-[#B89B5E] transition-all">
                    <dt className="text-zinc-400 mb-2 italic">Composition</dt>
                    <dd className="text-zinc-900 block leading-relaxed">{project.materials}</dd>
                </div>
                <div className="group border-l-2 border-zinc-100 pl-6 hover:border-[#B89B5E] transition-all">
                    <dt className="text-zinc-400 mb-2 italic">Style</dt>
                    <dd className="text-zinc-900 block">{project.design_style}</dd>
                </div>
              </dl>
            </section>
            
            <section className="pt-12 border-t border-zinc-200">
               <h4 className="text-[10px] uppercase tracking-[0.5em] text-[#B89B5E] font-black mb-8 italic">
                 {ui.essence_header}
               </h4>
               <blockquote className="text-2xl leading-relaxed text-zinc-500 italic font-serif opacity-90 border-none p-0 bg-transparent shadow-none">
                 "{project.meta_description}"
               </blockquote>
            </section>
          </aside>

          <section className="lg:col-span-8" aria-labelledby="narrative-title">
            <h4 id="narrative-title" className="text-[11px] uppercase tracking-[0.6em] font-black text-zinc-900 mb-12 flex items-center gap-3">
              <FileText size={16} className="text-[#B89B5E]" aria-hidden="true" /> {ui.narrative_header}
            </h4>
            <div className="space-y-12 text-[#333333] font-normal text-xl md:text-2xl leading-[1.8] font-sans tracking-tight" itemProp="description">
              {project.content?.split('\n').map((paragraph: string, i: number) => (
                <p key={i} className="opacity-95">{paragraph}</p>
              ))}
            </div>
          </section>
        </div>

        {/* Masonry Gallery */}
        {project.gallery && (
          <section className="pt-32 border-t border-zinc-200 mb-40" aria-label="Project Gallery">
            <header className="flex flex-col items-center text-center mb-24 space-y-6">
              <h4 className="text-[11px] uppercase tracking-[0.8em] text-[#B89B5E] font-black italic">{ui.gallery_header}</h4>
              <p className="text-zinc-400 text-[10px] tracking-[0.5em] uppercase font-bold opacity-70">{ui.gallery_subtitle}</p>
            </header>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {project.gallery.slice(0, visiblePhotos).map((img: string, index: number) => (
                <figure key={index} className="overflow-hidden bg-white border border-zinc-100 transition-all duration-1000 group hover:shadow-2xl">
                  <img src={img} alt={`${project.title} - Visual Detail ${index + 1}`} className="w-full h-auto grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s] ease-out" loading="lazy" />
                </figure>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-48 pt-40 border-t border-zinc-200 text-center">
            <div className="max-w-3xl mx-auto space-y-12">
              <p className="text-[11px] uppercase tracking-[0.8em] text-[#B89B5E] font-black block italic">
                {ui.cta_subtitle}
              </p>
              <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.85]">
                {ui.cta_title}
              </h2>
              <button 
                onClick={() => router.push('/contact')} 
                className="px-24 py-8 bg-[#1C1C1C] text-white text-[11px] uppercase tracking-[0.6em] font-black hover:bg-[#B89B5E] transition-all shadow-2xl active:scale-95"
              >
                {ui.cta_button}
              </button>
            </div>
        </footer>
      </article>
    </main>
  );
}