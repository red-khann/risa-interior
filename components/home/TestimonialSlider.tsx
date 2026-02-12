'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Quote, ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useContent } from '@/components/PreviewProvider';

export default function TestimonialSlider() {
  const supabase = createClient();
  const liveContent = useContent();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const getUI = (key: string, fallback: string) => {
    return liveContent[`home_testimonials:${key}`] || fallback;
  };

  const ui = {
    subtitle: getUI('subtitle', "Studio Reputation"),
    title: getUI('title', "Client Perspectives"),
    see_all: getUI('see_all_label', "See All Perspectives")
  };

  const StarIcon = ({ fillPercentage }: { fillPercentage: number }) => {
    const gradientId = `grad-testimonial-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId}>
            <stop offset={`${fillPercentage}%`} stopColor="var(--accent-light)" />
            <stop offset={`${fillPercentage}%`} stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path 
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill={`url(#${gradientId})`}
        />
      </svg>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-3 mb-10">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((index) => {
            let fill = 0;
            if (rating >= index) fill = 100;
            else if (rating > index - 1) fill = (rating - (index - 1)) * 100;
            return <StarIcon key={index} fillPercentage={fill} />;
          })}
        </div>
        <span className="text-[10px] font-black text-[var(--accent-light)] tracking-widest">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, reviews.length]);

  useEffect(() => {
    async function fetchHomeReviews() {
      setLoading(true);
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .eq('show_on_home', true)
        .order('created_at', { ascending: false });

      if (data) setReviews(data);
      setLoading(false);
    }
    fetchHomeReviews();
  }, [supabase]);

  if (loading) return (
    <div className="py-20 flex justify-center text-zinc-400">
      <Loader2 className="animate-spin text-[var(--accent-gold)]" size={20} />
    </div>
  );

  if (reviews.length === 0) return null;

  return (
    <section className="py-32 bg-[var(--bg-warm)] overflow-hidden border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* 🎯 FIXED: Changed items-end to items-start or md:items-end and ensured left alignment */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div className="space-y-4 text-left">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-black italic">
              {ui.subtitle}
            </p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-zinc-900 uppercase">
              {ui.title.split(' ').slice(0, -1).join(' ')} <span className="font-serif italic font-light text-zinc-400">{ui.title.split(' ').slice(-1)}</span>
            </h2>
          </div>
          <Link href="/reviews" className="group flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] font-black text-zinc-900 hover:text-[var(--accent-gold)] transition-all pb-2">
            {ui.see_all}
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform text-[var(--accent-gold)]" />
          </Link>
        </header>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-8 relative min-h-[350px] flex items-center">
            <Quote size={120} className="absolute -top-16 -left-10 text-zinc-200/40 -z-0" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 pl-12 border-l-2 border-[var(--accent-gold)]"
              >
                {renderStars(reviews[currentIndex].rating)}
                
                <p className="text-2xl md:text-4xl font-serif italic text-zinc-800 leading-[1.3] mb-12 tracking-tight">
                  "{reviews[currentIndex].review_text}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-[var(--accent-gold)]" />
                  <div>
                    <h4 className="text-[12px] uppercase tracking-[0.4em] font-black text-zinc-900">{reviews[currentIndex].name}</h4>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold mt-1">Verified: {reviews[currentIndex].page_slug}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center gap-12">
            <div className="flex items-center gap-4">
              <button onClick={prev} className="p-5 border border-zinc-200 rounded-full hover:bg-white hover:border-[var(--accent-gold)] transition-all group">
                <ChevronLeft size={18} className="text-zinc-400 group-hover:text-[var(--accent-gold)]" />
              </button>
              <button onClick={next} className="p-5 border border-zinc-200 rounded-full hover:bg-white hover:border-[var(--accent-gold)] transition-all group">
                <ChevronRight size={18} className="text-zinc-400 group-hover:text-[var(--accent-gold)]" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-zinc-900 tracking-widest">0{currentIndex + 1}</span>
              <div className="flex-1 h-[1px] bg-zinc-100 relative">
                <motion.div 
                   className="absolute top-0 left-0 h-full bg-[var(--accent-gold)]"
                   animate={{ width: `${((currentIndex + 1) / reviews.length) * 100}%` }}
                   transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-[10px] font-black text-zinc-300 tracking-widest">0{reviews.length}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}