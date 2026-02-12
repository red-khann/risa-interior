'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  ArrowLeft, ShieldCheck, Layers, Loader2, FileText, Globe, Tag, Layout, Target, Star, StarHalf, ChevronRight 
} from "lucide-react";
import { useContent } from '@/components/PreviewProvider'; 
import Link from 'next/link';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewStats from '@/components/reviews/ReviewStats';

interface ServiceDetailClientProps {
  slug: string;
}

export default function ServiceDetailClient({ slug }: ServiceDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const liveContent = useContent();
  
  const [service, setService] = useState<any>(null);
  const [allApprovedReviews, setAllApprovedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to render stars
  const renderStars = (rating: number, size = 14) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = rating >= star;
          const isHalf = !isFull && rating > star - 1;
          return (
            <div key={star}>
              {isHalf ? (
                <StarHalf size={size} fill="#B89B5E" color="#B89B5E" />
              ) : (
                <Star size={size} fill={isFull ? "#B89B5E" : "none"} color={isFull ? "#B89B5E" : "#d1d5db"} strokeWidth={1} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getUI = (key: string, fallback: string) => liveContent[`service_detail_global:${key}`] || fallback;

  const ui = {
    specs_label: getUI('specs_label', "Service Specifications"),
    methodology_label: getUI('methodology_label', "Methodology & Process"),
    spatial_label: getUI('spatial_strategy_label', "Spatial Strategy"),
    spatial_desc: getUI('spatial_strategy_desc', "Optimization of environmental flow and structural logic."),
    quality_label: getUI('quality_control_label', "Quality Control"),
    quality_desc: getUI('quality_control_desc', "Rigorous oversight and material integrity protocols."),
    cta_description: getUI('cta_description', "Initiate the {service_name} protocol by requesting a formal studio consultation."),
    cta_button: getUI('cta_button_text', "Request Consultation"),
    next_steps: getUI('next_steps_label', "Next Steps")
  };

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setLoading(true);
      try {
        const { data: sData } = await supabase.from('services').select('*').eq('slug', slug).single();
        if (sData) setService(sData);

        const { data: rData } = await supabase
          .from('reviews')
          .select('*')
          .eq('page_slug', slug)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (rData) setAllApprovedReviews(rData);

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, supabase]);

  const featuredReviews = allApprovedReviews.filter(r => r.is_featured === true);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-warm)] flex items-center justify-center">
      <Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} />
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--bg-warm)] pt-24 md:pt-32 pb-20 overflow-x-hidden selection:bg-[var(--accent-gold)]/20">
      <article className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16" itemScope itemType="https://schema.org/Service">
        
        <button onClick={() => router.back()} className="group flex items-center gap-2 mb-12 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 hover:text-[var(--accent-gold)] transition-all">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Offerings
        </button>

        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-24 gap-y-16">
          
          <div className="col-span-12 lg:col-span-7 space-y-12 md:space-y-16 order-1">
            <header className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-bold block mb-4 italic">
                Protocol — {service?.service_type}
              </span>
              <h1 className="text-[10vw] lg:text-[7vw] leading-[0.85] mb-12 text-zinc-900 font-bold uppercase tracking-tighter">
                {service?.name}
              </h1>
              
              {/* 🎯 FIXED: Uses .trim() to verify the text isn't just whitespace */}
              {service?.meta_description && service.meta_description.trim().length > 0 && (
                <p className="text-lg md:text-2xl text-zinc-500 font-light leading-relaxed italic border-l-2 border-[var(--accent-gold)]/30 pl-6">
                  "{service.meta_description}"
                </p>
              )}
            </header>

            <figure className="w-full aspect-video overflow-hidden shadow-2xl border border-zinc-200">
              <img src={service?.image_url} alt={service?.name} className="w-full h-full object-cover" />
            </figure>

            <section className="space-y-8">
              <h2 className="text-[10px] uppercase tracking-[0.6em] font-bold text-zinc-900 flex items-center gap-3">
                <FileText size={14} className="text-[var(--accent-gold)]" /> {ui.methodology_label}
              </h2>
              <div className="text-base md:text-xl font-normal leading-[1.85] text-[#444444] whitespace-pre-line tracking-tight font-sans">
                {service?.description}
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-12 border-t border-zinc-200">
              <div className="space-y-4">
                <Layout className="text-[var(--accent-gold)]" size={24} />
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-zinc-900">{ui.spatial_label}</h3>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{ui.spatial_desc}</p>
              </div>
              <div className="space-y-4">
                <ShieldCheck className="text-[var(--accent-gold)]" size={24} />
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-zinc-900">{ui.quality_label}</h3>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{ui.quality_desc}</p>
              </div>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-5 order-2 lg:sticky lg:top-40 h-fit">
            <section className="border-t border-zinc-200 pt-10 space-y-10">
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-zinc-900">{ui.specs_label}</h3>
              <dl className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-zinc-200/60">
                  <dt className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Classification</dt>
                  <dd className="text-[10px] uppercase font-bold text-zinc-800">{service?.service_type}</dd>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-zinc-200/60">
                  <dt className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Investment</dt>
                  <dd className="text-[10px] uppercase font-bold text-[var(--accent-gold)]">{service?.starting_price}</dd>
                </div>
              </dl>

              <div className="space-y-6 bg-white p-8 border border-zinc-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--accent-gold)]">{ui.next_steps}</p>
                <p className="text-sm text-zinc-600 font-light italic leading-relaxed">
                  {ui.cta_description.replace('{service_name}', service?.name?.toLowerCase() || 'service')}
                </p>
                <Link href="/contact" className="block">
                  <button className="w-full bg-[var(--text-primary)] text-white py-6 text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-[var(--accent-gold)] transition-all">
                    {ui.cta_button}
                  </button>
                </Link>
              </div>
            </section>
          </aside>

          <section className="col-span-12 lg:col-span-7 pt-32 border-t border-zinc-200 mt-20 order-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
               <h2 className="text-[10px] uppercase tracking-[0.6em] font-bold text-zinc-900">Featured Experiences</h2>
               <Link href={`/reviews?type=service&slug=${slug}`}>
                 <button className="group flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-zinc-400 hover:text-[var(--accent-gold)] transition-colors">
                    See All {allApprovedReviews.length} Reviews <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
               </Link>
            </div>
            
            <ReviewStats reviews={allApprovedReviews} />

            <div className="space-y-16 mb-24">
              {featuredReviews.length > 0 ? (
                featuredReviews.map((rev) => (
                  <div key={rev.id} className="relative pl-10">
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#B89B5E] to-transparent" />
                    <div className="mb-4">{renderStars(rev.rating, 10)}</div>
                    <p className="text-lg text-zinc-600 italic font-serif leading-relaxed mb-4">"{rev.review_text}"</p>
                    <div className="flex items-center gap-3">
                         <div className="h-[1px] w-6 bg-zinc-200" />
                         <p className="text-[9px] uppercase tracking-widest font-black text-zinc-900">— {rev.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] uppercase tracking-widest text-zinc-300 italic">No featured testimonials documented for this protocol.</p>
              )}
            </div>

            <ReviewForm pageType="service" pageSlug={slug} />
          </section>

        </div>
      </article>
    </main>
  );
}