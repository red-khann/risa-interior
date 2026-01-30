'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, MapPin, Zap, FileText, Clock, X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from '@/components/PreviewProvider';

export default function ProjectDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const supabase = createClient();
  const liveContent = useContent();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 🎯 Slider State
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 🎯 Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);

  const getUI = (key: string, fallback: string) => {
    return liveContent[`project_detail_global:${key}`] || fallback;
  };

  const ui = {
    spec_header: getUI('spec_header', "Core Specifications"),
    narrative_header: getUI('narrative_header', "Philosophical Approach"),
    gallery_header: getUI('gallery_header', "The Narrative in Frames"),
    gallery_subtitle: getUI('gallery_subtitle', "Visual Protocol"),
    comparison_header: getUI('comparison_header', "Evolutionary Shift"),
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
        const parsedGallery = typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery || [];
        setProject({ ...data, gallery: parsedGallery });
        
        const images = [
            data.image_url, 
            ...(data.transformation_before ? [data.transformation_before] : []), 
            ...(data.transformation_after ? [data.transformation_after] : []), 
            ...parsedGallery
        ].filter(Boolean);
        setAllImages(images);
      }
      setLoading(false);
    }
    if (slug) fetchProjectData();
  }, [slug, supabase]);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0));
  }, [allImages]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1));
  }, [allImages]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-warm)] flex items-center justify-center animate-pulse text-[10px] tracking-[0.4em] text-zinc-400 uppercase font-black">
      Synchronizing Project Protocol...
    </div>
  );
  
  if (!project) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)] uppercase tracking-widest text-[10px] font-black text-zinc-400">Archive Entry Not Found</div>;

  return (
    <main className="pt-32 pb-20 bg-[var(--bg-warm)] min-h-screen selection:bg-[var(--accent-gold)]/20">
      
      {/* 🖼️ High-Res Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setLightboxIndex(null)}
        >
          <button className="absolute top-8 right-8 text-white/50 hover:text-white z-[210] transition-colors"><X size={40} strokeWidth={1} /></button>
          <button onClick={prevImage} className="absolute left-8 text-white/30 hover:text-white transition-colors p-4"><ChevronLeft size={48} strokeWidth={1} /></button>
          <img src={allImages[lightboxIndex]} className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl" alt="Full size" onClick={(e) => e.stopPropagation()} />
          <button onClick={nextImage} className="absolute right-8 text-white/30 hover:text-white transition-colors p-4"><ChevronRight size={48} strokeWidth={1} /></button>
        </div>
      )}

      <article className="max-w-[1440px] mx-auto px-8 md:px-16">
        <button onClick={() => router.back()} className="group flex items-center gap-3 mb-16 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 hover:text-[var(--accent-gold)] transition-all">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Portfolio
        </button>

        <header className="mb-20 border-b border-zinc-200 pb-16">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.6em] text-[var(--accent-gold)] font-bold mb-8 italic">
            <span>{project.category}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
            <span>{project.phase}</span>
          </div>
          <h1 className="text-[7vw] leading-[0.85] mb-12 text-zinc-900 font-bold tracking-tighter uppercase whitespace-pre-line">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-10">
            <div className="flex items-center gap-3 text-zinc-500 tracking-[0.4em] text-[10px] uppercase font-black">
                <MapPin size={14} className="text-[var(--accent-gold)]" /> 
                <span>{project.city}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500 tracking-[0.4em] text-[10px] uppercase font-black">
                <Clock size={14} className="text-[var(--accent-gold)]" /> 
                <time>{project.display_date || project.date}</time>
            </div>
          </div>
        </header>

        {/* Hero Figure */}
        <figure className="aspect-[21/9] overflow-hidden bg-zinc-200 mb-40 shadow-2xl relative cursor-zoom-in group" onClick={() => setLightboxIndex(0)}>
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
          </div>
        </figure>

        {/* 🏛️ 1. Description & Narrative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mb-32 pt-24 border-t border-zinc-200">
          <aside className="lg:col-span-4 space-y-20">
            <section className="space-y-10">
              <h4 className="text-[11px] uppercase tracking-[0.5em] font-black text-zinc-900 flex items-center gap-3">
                <Zap size={14} className="text-[var(--accent-gold)]" /> {ui.spec_header}
              </h4>
              <dl className="space-y-10 text-[10px] uppercase tracking-[0.3em] font-black">
                <div className="group border-l-2 border-zinc-100 pl-6 hover:border-[var(--accent-gold)] transition-all">
                    <dt className="text-zinc-400 mb-2 italic">Composition</dt>
                    <dd className="text-zinc-900">{project.materials}</dd>
                </div>
                <div className="group border-l-2 border-zinc-100 pl-6 hover:border-[var(--accent-gold)] transition-all">
                    <dt className="text-zinc-400 mb-2 italic">Design Style</dt>
                    <dd className="text-zinc-900">{project.design_style}</dd>
                </div>
              </dl>
            </section>
          </aside>

          <section className="lg:col-span-8">
            <h4 className="text-[11px] uppercase tracking-[0.6em] font-black text-zinc-900 mb-12 flex items-center gap-3">
              <FileText size={16} className="text-[var(--accent-gold)]" /> {ui.narrative_header}
            </h4>
            <div className="space-y-12 text-[#333333] font-normal text-xl md:text-2xl leading-[1.8] font-sans tracking-tight">
              {project.content?.split('\n').map((paragraph: string, i: number) => <p key={i} className="opacity-95">{paragraph}</p>)}
            </div>
          </section>
        </div>

        {/* 🎯 2. SLIDE-TO-REVEAL TRANSITION (Now before Gallery) */}
        {project.show_transformation && project.transformation_before && project.transformation_after && (
          <section className="mb-40 space-y-12 pt-24 border-t border-zinc-200">
            <h4 className="text-[11px] uppercase tracking-[0.8em] text-[var(--accent-gold)] font-black italic text-center underline decoration-zinc-200 underline-offset-8">
              {ui.comparison_header}
            </h4>
            <div 
              ref={sliderRef}
              className="relative w-full aspect-[21/9] overflow-hidden cursor-ew-resize shadow-2xl select-none"
              onMouseMove={handleMove}
              onTouchMove={handleMove}
            >
              <img src={project.transformation_after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img src={project.transformation_before} alt="Before" className="absolute inset-0 w-full h-full object-cover grayscale" />
                <span className="absolute bottom-6 left-6 bg-black/60 text-white text-[8px] tracking-[0.3em] px-4 py-2 uppercase font-bold">Pre-Protocol</span>
              </div>
              <div 
                className="absolute inset-y-0 w-1 bg-white shadow-xl z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl">
                   <ChevronLeft size={16} className="text-zinc-400" />
                   <ChevronRight size={16} className="text-zinc-400" />
                </div>
              </div>
              <span className="absolute bottom-6 right-6 bg-[var(--accent-gold)] text-white text-[8px] tracking-[0.3em] px-4 py-2 uppercase font-bold">Post-Protocol</span>
            </div>
          </section>
        )}

        {/* 🏛️ 3. Gallery Section */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="pt-32 border-t border-zinc-200 mb-40">
            <header className="flex flex-col items-center text-center mb-24 space-y-6">
              <h4 className="text-[11px] uppercase tracking-[0.8em] text-[var(--accent-gold)] font-black italic">{ui.gallery_header}</h4>
            </header>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {project.gallery.map((img: string, index: number) => (
                <figure key={index} className="overflow-hidden bg-white border border-zinc-100 group relative cursor-zoom-in" onClick={() => setLightboxIndex(allImages.indexOf(img))}>
                  <img src={img} alt="Gallery" className="w-full h-auto grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10"><Maximize2 className="text-white" size={24} /></div>
                </figure>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-48 pt-40 border-t border-zinc-200 text-center">
            <div className="max-w-3xl mx-auto space-y-12">
              <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.85]">{ui.cta_title}</h2>
              <button onClick={() => router.push('/contact')} className="px-24 py-8 bg-[var(--text-primary)] text-white text-[11px] uppercase tracking-[0.6em] font-black hover:bg-[var(--accent-gold)] transition-all shadow-2xl">
                {ui.cta_button}
              </button>
            </div>
        </footer>
      </article>
    </main>
  );
}