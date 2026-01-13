'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Bookmark, Clock, Tag, MessageSquare } from "lucide-react"; 
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useContent } from '@/components/PreviewProvider';

export default function JournalDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);

  const liveContent = useContent();

  const getUI = (key: string, fallback: string) => {
    return liveContent[`blog_detail_global:${key}`] || fallback;
  };

  const ui = {
    back_label: getUI('back_label', "Back to Journal"),
    author_title: getUI('author_title', "Risa Studio"),
    author_role: getUI('author_role', "Studio Narrative"),
    related_label: getUI('related_label', "Inquiry Context"),
    protocol_cta: getUI('protocol_cta', "View Protocol"),
    footer_subtitle: getUI('footer_subtitle', "Inquiry Protocol"),
    footer_title: getUI('footer_title', "Have a similar vision?"),
    footer_button: getUI('footer_button', "Start a conversation")
  };

  useEffect(() => {
    async function fetchJournalPost() {
      setLoading(true);
      const { data: blogData } = await supabase
        .from('blog')
        .select('*')
        .eq('slug', slug)
        .single();

      if (blogData) setPost(blogData);
      setLoading(false);
    }
    if (slug) fetchJournalPost();
  }, [slug, supabase]);

  useEffect(() => {
    if (post) {
      const saved = JSON.parse(localStorage.getItem('risa_saved_journal') || '[]');
      if (saved.includes(post.slug)) setIsSaved(true);
    }
  }, [post]);

  const readingTime = post ? Math.ceil(post.content.split(/\s+/).length / 200) || 1 : 0;

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
      saved = saved.filter((s: string) => s !== post.slug);
      setIsSaved(false);
    } else {
      saved.push(post.slug);
      setIsSaved(true);
    }
    localStorage.setItem('risa_saved_journal', JSON.stringify(saved));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center animate-pulse text-[10px] tracking-[0.4em] text-zinc-400 uppercase">
      Initiating Narrative...
    </div>
  );
  
  if (!post) return <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2] uppercase tracking-widest text-xs">Chronicle Not Found</div>;

  return (
    <main className="pt-32 pb-20 bg-[#F7F5F2] min-h-screen selection:bg-[#B89B5E]/10 overflow-x-hidden">
      {/* 🎯 SEO: Using 'article' tag with schema-friendly structure */}
      <article className="max-w-[1100px] mx-auto px-6" itemScope itemType="https://schema.org/BlogPosting">
        
        <button onClick={() => router.back()} className="group flex items-center gap-3 mb-16 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 hover:text-[#B89B5E] transition-all" aria-label="Return to journal">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {ui.back_label}
        </button>

        <header className="mb-20">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-200">
            <div className="flex items-center gap-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B89B5E]">{post.category}</span>
              <time dateTime={post.date} className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400" itemProp="datePublished">
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
            
            <div className="flex gap-6 items-center" aria-label="Social Actions">
               <button onClick={handleShare} className="relative outline-none" title="Copy Link">
                 {shareStatus && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] uppercase tracking-widest px-3 py-1 rounded">URL Copied</span>}
                 <Share2 size={16} className={shareStatus ? 'text-[#B89B5E]' : 'text-zinc-300 hover:text-zinc-900 transition-colors'} />
               </button>
               <button onClick={toggleSave} className="outline-none" title="Save Article">
                 <Bookmark size={16} className={isSaved ? 'fill-[#B89B5E] text-[#B89B5E]' : 'text-zinc-300 hover:text-zinc-900 transition-colors'} />
               </button>
            </div>
          </div>
          
         <h1 className="text-[10vw] lg:text-[7vw] leading-[0.85] mb-12 text-zinc-900 font-bold tracking-tighter uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="max-w-3xl text-xl md:text-2xl text-zinc-500 font-light leading-relaxed mb-12 border-l-2 border-[#B89B5E]/20 pl-8 italic font-serif" itemProp="description">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-6 mt-12">
            <div className="flex items-center gap-4" itemProp="author" itemScope itemType="https://schema.org/Organization">
               <div className="w-14 h-14 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-[12px] font-black text-zinc-900 tracking-tighter shadow-sm" aria-hidden="true">RS</div>
               <div>
                 <p className="text-[11px] uppercase tracking-[0.2em] font-black text-zinc-900" itemProp="name">{ui.author_title}</p>
                 <p className="text-[9px] text-zinc-400 uppercase tracking-[0.3em] mt-0.5 italic">{ui.author_role}</p>
               </div>
            </div>
            <div className="flex items-center gap-8">
                {post.focus_keyword && (
                  <div className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-400 font-bold italic">
                    <Tag size={12} className="text-[#B89B5E]" aria-hidden="true" /> 
                    <span>Focus: <strong className="font-black">{post.focus_keyword}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full text-[9px] uppercase tracking-widest text-zinc-500 font-black border border-zinc-100 shadow-sm">
                  <Clock size={12} className="text-[#B89B5E]" aria-hidden="true" /> {readingTime} Min Read
                </div>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <figure className="w-full aspect-[21/9] overflow-hidden bg-zinc-100 mb-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative">
          <img 
            src={post.image_url} 
            alt={post.hero_alt_text || post.title} 
            className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000" 
            itemProp="image"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" aria-hidden="true" />
        </figure>

        {/* Article Body */}
        <div className="max-w-[750px] mx-auto">
          {post.meta_description && (
            <aside className="mb-20 p-12 bg-white border border-zinc-100 shadow-sm relative overflow-hidden" aria-label="Article Summary">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#B89B5E]" aria-hidden="true" />
                <p className="text-2xl md:text-3xl font-light leading-snug text-zinc-800 italic font-serif tracking-tight">
                    {post.meta_description}
                </p>
            </aside>
          )}
          
          <div className="space-y-12 text-[#333333] font-normal text-xl md:text-2xl leading-[1.8] font-sans tracking-tight" itemProp="articleBody">
            {post.content.split('\n').map((paragraph: string, i: number) => {
               if (!paragraph.trim()) return null;
               return <p key={`${post.slug}-p-${i}`} className="opacity-95 first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-[#B89B5E] first-letter:font-bold">{paragraph}</p>
            })}
          </div>

          {post.related_service && (
            <section className="mt-32 group relative p-12 bg-[#1C1C1C] text-white border border-zinc-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 overflow-hidden" aria-label="Related Service">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
                <MessageSquare size={120} />
              </div>
              <div className="space-y-3 relative z-10">
                <p className="text-[10px] uppercase tracking-[0.5em] text-[#B89B5E] font-black">{ui.related_label}</p>
                <h4 className="text-2xl font-bold uppercase tracking-tighter">{post.related_service}</h4>
              </div>
              <Link href="/services" className="relative z-10 flex items-center gap-4 px-8 py-4 bg-white text-zinc-900 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#B89B5E] hover:text-white transition-all">
                {ui.protocol_cta} <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </section>
          )}
        </div>

        <footer className="mt-40 pt-32 border-t border-zinc-200">
            <div className="max-w-2xl mx-auto text-center space-y-12">
              <span className="text-[11px] uppercase tracking-[0.8em] text-[#B89B5E] font-black block">{ui.footer_subtitle}</span>
              <h3 className="text-4xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-[0.9]">{ui.footer_title}</h3>
              <button onClick={() => router.push('/contact')} className="px-20 py-8 bg-[#1C1C1C] text-white text-[11px] uppercase tracking-[0.6em] font-black hover:bg-[#B89B5E] transition-all shadow-2xl active:scale-95">
                {ui.footer_button}
              </button>
            </div>
        </footer>
      </article>
    </main>
  );
}