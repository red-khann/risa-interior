'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  ArrowLeft, ShieldCheck, Layers, Loader2, FileText, Globe, Tag, Layout, Target 
} from "lucide-react";
import { useContent } from '@/components/PreviewProvider'; 
import Link from 'next/link';

// 🎯 FIX: Explicitly define the Props interface for TypeScript to pass the build
interface ServiceDetailClientProps {
  slug: string;
}

export default function ServiceDetailClient({ slug }: ServiceDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const liveContent = useContent();
  
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🏛️ Composite Key Logic for CMS labels
  const getUI = (key: string, fallback: string) => {
    return liveContent[`service_detail_global:${key}`] || fallback;
  };

  const ui = {
    specs_label: getUI('specs_label', "Service Specifications"),
    methodology_label: getUI('methodology_label', "Methodology & Process"),
    spatial_label: getUI('spatial_strategy_label', "Spatial Strategy"),
    spatial_desc: getUI('spatial_strategy_desc', "Optimization of environmental flow and structural logic."),
    quality_label: getUI('quality_control_label', "Quality Control"),
    quality_desc: getUI('quality_control_desc', "Rigorous oversight and material integrity protocols."),
    cta_description: getUI('cta_description', "Initiate the {service_name} protocol by requesting a formal studio consultation. We translate narrative intent into built reality."),
    cta_button: getUI('cta_button_text', "Request Consultation"),
    next_steps: getUI('next_steps_label', "Next Steps")
  };

  useEffect(() => {
    async function fetchServiceData() {
      // 🎯 Safety: Ensure slug is present from the Server Page before fetching
      if (!slug) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (data) setService(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServiceData();
  }, [slug, supabase]);

  // Logic: Dynamic placeholder replacement for CTA narrative
  const renderedCtaDesc = service 
    ? ui.cta_description.replace('{service_name}', service.name.toLowerCase()) 
    : ui.cta_description;

  // Loading State
  if (loading) return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
        <span className="text-[10px] tracking-[0.4em] text-zinc-400 uppercase font-black">Analyzing Protocol...</span>
      </div>
    </div>
  );
  
  // 404 State
  if (!service) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F2] px-6">
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 mb-8">Protocol Entry Not Found</p>
      <Link href="/services">
        <button className="px-8 py-4 border border-zinc-200 text-[9px] uppercase tracking-widest font-bold hover:bg-white transition-all">
          Return to Archive
        </button>
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F7F5F2] pt-24 md:pt-32 pb-20 overflow-x-hidden selection:bg-[#B89B5E]/20">
      {/* Article container with Schema.org tagging for SEO */}
      <article className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16" itemScope itemType="https://schema.org/Service">
        
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 mb-12 md:mb-16 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 hover:text-[#B89B5E] transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Offerings
        </button>

        <div className="grid grid-cols-12 gap-y-16 lg:gap-24">
          
          {/* 🖋️ Left Column: Narrative Content */}
          <div className="col-span-12 lg:col-span-7 space-y-12 md:space-y-16">
            <header className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#B89B5E] font-bold block mb-4 md:mb-6 italic">
                Protocol — <span itemProp="serviceType">{service.service_type}</span>
              </span>
              <h1 className="text-[10vw] lg:text-[7vw] leading-[0.85] mb-12 text-zinc-900 font-bold tracking-tighter uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {service.name}
              </h1>
              <p className="text-lg md:text-2xl text-zinc-500 font-light leading-relaxed italic font-serif border-l-2 border-[#B89B5E]/30 pl-6 md:pl-8">
                "{service.meta_description}"
              </p>
            </header>

            {/* Hero Image */}
            <figure className="w-full aspect-video overflow-hidden bg-zinc-200 shadow-2xl border border-zinc-200">
              <img 
                src={service.image_url} 
                alt={service.hero_alt_text || service.name} 
                className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105 grayscale-[0.2] hover:grayscale-0"
              />
            </figure>

            {/* Methodology Section */}
            <section className="space-y-8 md:space-y-10">
              <h2 className="text-[10px] uppercase tracking-[0.6em] font-bold text-zinc-900 flex items-center gap-3">
                <FileText size={14} className="text-[#B89B5E]" aria-hidden="true" /> {ui.methodology_label}
              </h2>
              <div className="text-base md:text-xl font-normal leading-[1.85] text-[#444444] space-y-8 whitespace-pre-line tracking-tight font-sans" itemProp="description">
                {service.description}
              </div>
            </section>

            {/* Technical Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-12 pt-12 border-t border-zinc-200">
              <div className="space-y-4">
                <Layout className="text-[#B89B5E]" size={24} aria-hidden="true" />
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-zinc-900">{ui.spatial_label}</h3>
                <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-widest">{ui.spatial_desc}</p>
              </div>
              <div className="space-y-4">
                <ShieldCheck className="text-[#B89B5E]" size={24} aria-hidden="true" />
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-zinc-900">{ui.quality_label}</h3>
                <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-widest">{ui.quality_desc}</p>
              </div>
            </div>
          </div>

          {/* 📬 Right Column: Sticky Specifications */}
          <aside className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-40 space-y-10 md:space-y-12">
              
              <section className="border-t border-zinc-200 pt-10">
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-zinc-900 mb-8 md:mb-10">{ui.specs_label}</h3>
                
                <dl className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center py-4 border-b border-zinc-200/60">
                    <dt className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                      <Layers size={14} /> Classification
                    </dt>
                    <dd className="text-[10px] uppercase font-bold text-zinc-800">{service.service_type}</dd>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 border-b border-zinc-200/60">
                    <dt className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                      <Tag size={14} /> Investment
                    </dt>
                    <dd className="text-[10px] uppercase font-bold text-[#B89B5E]">{service.starting_price}</dd>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-zinc-200/60">
                    <dt className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                      <Globe size={14} /> Consultation
                    </dt>
                    <dd className="text-[10px] uppercase font-bold text-zinc-800">{service.availability || 'Available Globally'}</dd>
                  </div>

                  {service.focus_keyword && (
                    <div className="flex justify-between items-center py-4 border-b border-zinc-200/60">
                      <dt className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                        <Target size={14} /> Primary Focus
                      </dt>
                      <dd className="text-[10px] uppercase font-bold text-zinc-800 italic">{service.focus_keyword}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Consultation Box */}
              <div className="space-y-6 bg-white p-8 md:p-10 border border-zinc-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B89B5E]">{ui.next_steps}</p>
                <p className="text-sm text-zinc-600 font-light leading-relaxed italic">
                  {renderedCtaDesc}
                </p>
                <Link href="/contact" className="block">
                  <button className="group w-full bg-[#1C1C1C] text-white py-5 md:py-6 text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-[#B89B5E] transition-all flex items-center justify-center gap-4 shadow-xl">
                    {ui.cta_button} <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>

            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}