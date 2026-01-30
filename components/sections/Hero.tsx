'use client'
import { useContent } from '@/components/PreviewProvider';

export const Hero = () => {
  const content = useContent();

  const getVal = (key: string, fallback: string) => {
    return content[`home:${key}`] || fallback;
  };

  const heroData = {
    watermark: getVal('hero_watermark', "CREATE"),
    established: getVal('hero_established', "Established 2015"),
    title: getVal('hero_title', "The Soul of Minimalism."),
    description: getVal('hero_description', "Architectural precision meets the poetry of light and shadow."),
    hero_image: getVal('hero_image_url', "https://res.cloudinary.com/risa-interior/image/upload/v1768235958/heroimage_mi1qzn.jpg"),
    accent_label: getVal('hero_accent_label', "Featured Concept"),
    accent_title: getVal('hero_accent_title', "Architectural Integrity")
  };

  return (
    // 🎯 Use --bg-warm for background consistency
    <header className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[var(--bg-warm)]">
      
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 select-none pointer-events-none opacity-[0.04] z-0" aria-hidden="true">
        {/* 🎯 Fetches current --text-primary (Rich Black) */}
        <p className="text-[25vw] font-bold uppercase tracking-tighter leading-none text-[var(--text-primary)]">
          {heroData.watermark}
        </p>
      </div>

      <div className="section-container w-full grid grid-cols-12 gap-10 items-center px-6 lg:px-12 relative z-10">
        <div className="col-span-12 lg:col-span-5 z-20">
          <p className="text-[10px] uppercase tracking-[0.6em] text-zinc-400 font-bold mb-8 italic animate-in fade-in slide-in-from-left-4 duration-700">
            {heroData.established}
          </p>
          
          {/* 🎯 Hero Title updated to --text-primary (Rich Black) */}
          <h1 className="text-[10vw] lg:text-[7vw] leading-[0.85] mb-12 text-[var(--text-primary)] font-bold tracking-tighter uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {heroData.title.replace(/\\n/g, '\n')}
          </h1>

          {/* 🎯 Decorative Accent Line updated to --accent-gold (RISA Green) */}
          <div className="h-[2px] w-24 bg-[var(--accent-gold)] mb-12" aria-hidden="true"></div>
          
          <p className="max-w-xs text-zinc-500 text-[11px] font-black leading-relaxed mb-12 uppercase tracking-[0.3em] opacity-80 italic">
            {heroData.description}
          </p>
        </div>

        <div className="col-span-12 lg:col-span-7 relative h-[70vh] lg:h-[85vh]">
          <div className="group absolute inset-0 bg-zinc-100 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-zinc-200/50">
            <img 
              src={heroData.hero_image} 
              className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0" 
              alt={`${heroData.title} - Architectural Vision by RISA`} 
              loading="eager" 
              fetchPriority="high" 
            />
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          </div>

          {/* Floating Detail Card */}
          <aside className="absolute -bottom-10 -left-10 bg-white p-12 hidden xl:block border border-zinc-100 z-30 shadow-2xl animate-in zoom-in-95 duration-1000 delay-300">
             {/* 🎯 Floating label updated to --accent-gold (RISA Green) */}
             <p className="text-[9px] uppercase tracking-[0.5em] text-[var(--accent-light)] mb-4 font-black italic">
               {heroData.accent_label}
             </p>
             <h3 className="text-2xl font-serif italic text-zinc-800 tracking-tight leading-none">
               {heroData.accent_title}
             </h3>
          </aside>
        </div>
      </div>
    </header>
  );
};