'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, Share2, Bookmark, Clock, Tag, MessageSquare, ChevronRight 
} from "lucide-react"; 
import Link from 'next/link';
import { useContent } from '@/components/PreviewProvider';

// 🎯 Component imports
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewStats from '@/components/reviews/ReviewStats';

interface JournalDetailClientProps {
  slug: string;
  initialPost: any;
  initialReviews: any[];
}

export default function JournalDetailClient({ slug, initialPost, initialReviews }: JournalDetailClientProps) {
  const router = useRouter();
  const liveContent = useContent();
  
  const [isSaved, setIsSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);

  // 🎯 RESTORED: Micro-precision Star Gradient Logic
  const StarIcon = ({ fillPercentage }: { fillPercentage: number }) => {
    const gradientId = useMemo(() => `grad-blog-detail-${Math.random().toString(36).substr(2, 9)}`, []);
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((index) => {
            let fill = rating >= index ? 100 : rating > index - 1 ? (rating - (index - 1)) * 100 : 0;
            return <StarIcon key={index} fillPercentage={fill} />;
          })}
        </div>
        <span className="text-[10px] font-black text-[var(--accent-light)] tracking-widest">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getUI = (key: string, fallback: string) => liveContent[`blog_detail_global:${key}`] || fallback;

  const ui = {
    back_label: getUI('back_label', "Back to Journal"),
    author_title: getUI('author_title', "Risa Studio"),
    author_role: getUI('author_role', "Studio Narrative"),
    related_label: getUI('related_label', "Inquiry Context"),
    protocol_cta: getUI('protocol_cta', "View Protocol"),
    footer_subtitle: getUI('footer_subtitle', "Inquiry Protocol"),
    footer_title: getUI('footer_title', "Have a similar vision?"),
    footer_button: getUI('footer_button', "Start a conversation"),
    review_header: getUI('review_header', "Featured Perspectives")
  };

  // 🎯 RESTORED: Saved articles persistence
  useEffect(() => {
    if (initialPost) {
      const saved = JSON.parse(localStorage.getItem('risa_saved_journal') || '[]');
      if (saved.includes(initialPost.slug)) setIsSaved(true);
    }
  }, [initialPost]);

  const readingTime = useMemo(() => 
    initialPost ? Math.ceil(initialPost.content.split(/\s+/).length / 200) || 1 : 0
  , [initialPost]);

  const featuredReviews = useMemo(() => 
    initialReviews.filter(r => r.is_featured === true)
  , [initialReviews]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus(true);
      setTimeout(() => setShareStatus(false), 2000);
    } catch (err) { console.error("Copy failed", err); }
  };

  const toggleSave = () => {
    let saved = JSON.parse(localStorage.getItem('risa_saved_journal') || '[]');
    if (isSaved) {
      saved = saved.filter((s: string) => s !== initialPost.slug);
      setIsSaved(false);
    } else {
      saved.push(initialPost.slug);
      setIsSaved(true);
    }
    localStorage.setItem('risa_saved_journal', JSON.stringify(saved));
  };

  if (!initialPost) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)] uppercase tracking-widest text-xs">Chronicle Not Found</div>;

  return (
    <main className="pt-32 pb-20 bg-[var(--bg-warm)] min-h-screen selection:bg-[var(--accent-gold)]/10 overflow-x-hidden">
      <article className="max-w-[1100px] mx-auto px-6">
        
        <button onClick={() => router.back()} className="group flex items-center gap-3 mb-16 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 hover:text-[var(--accent-gold)] transition-all">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {ui.back_label}
        </button>

        <header className="mb-20">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-200">
            <div className="flex items-center gap-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--accent-gold)]">{initialPost.category}</span>
              <time dateTime={initialPost.date} className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400">
                {new Date(initialPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
            
            <div className="flex gap-6 items-center">
               <button onClick={handleShare} className="relative outline-none">
                 {shareStatus && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] uppercase tracking-widest px-3 py-1 rounded">URL Copied</span>}
                 <Share2 size={16} className={shareStatus ? 'text-[var(--accent-gold)]' : 'text-zinc-300 hover:text-zinc-900 transition-colors'} />
               </button>
               <button onClick={toggleSave} className="outline-none">
                 <Bookmark size={16} className={isSaved ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]' : 'text-zinc-300 hover:text-zinc-900 transition-colors'} />
               </button>
            </div>
          </div>
          
          <h1 className="text-[10vw] lg:text-[7vw] leading-[0.85] mb-12 text-zinc-900 font-bold tracking-tighter uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {initialPost.title}
          </h1>
          
          {initialPost.excerpt?.trim() && (
            <p className="max-w-3xl text-xl md:text-2xl text-zinc-500 font-light leading-relaxed mb-12 border-l-2 border-[var(--accent-gold)]/20 pl-8 italic font-serif">
              "{initialPost.excerpt}"
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-6 mt-12">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-[12px] font-black text-zinc-900 tracking-tighter shadow-sm">RS</div>
               <div>
                 <p className="text-[11px] uppercase tracking-[0.2em] font-black text-zinc-900">{ui.author_title}</p>
                 <p className="text-[9px] text-zinc-400 uppercase tracking-[0.3em] mt-0.5 italic">{ui.author_role}</p>
               </div>
            </div>
            <div className="flex items-center gap-8">
                {initialPost.focus_keyword && (
                  <div className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-400 font-bold italic">
                    <Tag size={12} className="text-[var(--accent-gold)]" /> 
                    <span>Focus: <strong className="font-black">{initialPost.focus_keyword}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full text-[9px] uppercase tracking-widest text-zinc-500 font-black border border-zinc-100 shadow-sm">
                  <Clock size={12} className="text-[var(--accent-gold)]" /> {readingTime} Min Read
                </div>
            </div>
          </div>
        </header>

        <figure className="w-full aspect-[21/9] overflow-hidden bg-zinc-100 mb-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative">
          <img src={initialPost.image_url} alt={initialPost.title} className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000" />
        </figure>

        <div className="max-w-[750px] mx-auto">
          {initialPost.meta_description?.trim() && (
            <aside className="mb-20 p-12 bg-white border border-zinc-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-gold)]" />
                <p className="text-2xl md:text-3xl font-light leading-snug text-zinc-800 italic font-serif tracking-tight">
                    {initialPost.meta_description}
                </p>
            </aside>
          )}
          
          <div className="space-y-12 text-[#333333] font-normal text-xl md:text-2xl leading-[1.8] font-sans tracking-tight">
            {initialPost.content.split('\n').map((paragraph: string, i: number) => {
               if (!paragraph.trim()) return null;
               return <p key={`${initialPost.slug}-p-${i}`} className="opacity-95 first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-[var(--accent-gold)] first-letter:font-bold">{paragraph}</p>
            })}
          </div>

          {initialPost.related_service && (
            <section className="mt-32 group relative p-12 bg-[var(--text-primary)] text-white border border-zinc-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageSquare size={120} />
              </div>
              <div className="space-y-3 relative z-10">
                <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-black">{ui.related_label}</p>
                <h4 className="text-2xl font-bold uppercase tracking-tighter">{initialPost.related_service}</h4>
              </div>
              <Link href="/services" className="relative z-10 flex items-center gap-4 px-8 py-4 bg-white text-zinc-900 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[var(--accent-gold)] hover:text-white transition-all">
                {ui.protocol_cta} <ChevronRight size={14} />
              </Link>
            </section>
          )}
        </div>

        <footer className="mt-40 pt-32 border-t border-zinc-200">
            <div className="max-w-2xl mx-auto text-center space-y-12">
              <span className="text-[11px] uppercase tracking-[0.8em] text-[var(--accent-gold)] font-black block">{ui.footer_subtitle}</span>
              <h3 className="text-4xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.9]">{ui.footer_title}</h3>
              <Link href="/contact" className="inline-block">
                <button className="px-20 py-8 bg-[var(--text-primary)] text-white text-[11px] uppercase tracking-[0.6em] font-black hover:bg-[var(--accent-gold)] transition-all shadow-2xl active:scale-95">
                  {ui.footer_button}
                </button>
              </Link>
            </div>
        </footer>

        <section className="mt-40 max-w-[750px] mx-auto border-t border-zinc-200 pt-32 mb-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
              <h2 className="text-[10px] uppercase tracking-[0.6em] font-bold text-zinc-900">{ui.review_header}</h2>
              <Link href={`/reviews?type=blog&slug=${slug}`}>
                <button className="group flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-zinc-400 hover:text-[var(--accent-gold)] transition-colors">
                  See All {initialReviews.length} Reviews <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
          </div>
          
          <ReviewStats reviews={initialReviews} />

          <div className="space-y-16 mb-24">
            {featuredReviews.length > 0 ? (
              featuredReviews.map((rev) => (
                <div key={rev.id} className="relative pl-10 animate-in fade-in duration-700">
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#B89B5E] to-transparent" />
                  <div className="mb-4">{renderStars(rev.rating)}</div>
                  <p className="text-lg text-zinc-600 italic font-serif leading-relaxed mb-4">"{rev.review_text}"</p>
                  <p className="text-[9px] uppercase tracking-widest font-black text-zinc-900">— {rev.name}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] uppercase tracking-widest text-zinc-300 italic">No featured perspectives documented for this narrative.</p>
            )}
          </div>

          <div className="pt-10 border-t border-zinc-100">
            <ReviewForm pageType="blog" pageSlug={slug} />
          </div>
        </section>
      </article>
    </main>
  );
}