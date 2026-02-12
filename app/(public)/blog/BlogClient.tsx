'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link'
import { Search, ChevronDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import { useContent } from '@/components/PreviewProvider'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogClient() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const liveContent = useContent();
  const supabase = createClient();

  const pageSubtitle = liveContent['journal_page:page_subtitle'] || "The Journal";
  const pageTitle = liveContent['journal_page:page_title'] || "Perspectives";
  const pageDescription = liveContent['journal_page:page_description'] || "Periodic insights into architectural theory, studio life, and design evolution.";

  // 🎯 MICRO-PRECISION STAR COMPONENT
  const StarIcon = ({ fillPercentage }: { fillPercentage: number }) => {
    const gradientId = `grad-blog-${Math.random().toString(36).substr(2, 9)}`;
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

  useEffect(() => {
    async function fetchBlogData() {
      setLoading(true);
      try {
        // 1. Fetch active blog posts
        const { data: blogData } = await supabase
          .from('blog')
          .select('*')
          .eq('status', 'Active');

        // 2. Fetch all approved blog reviews
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('rating, page_slug')
          .eq('page_type', 'blog')
          .eq('status', 'approved');

        if (blogData) {
          // 3. Precision Merge
          const formattedPosts = blogData.map(post => {
            const relevantReviews = reviewData?.filter(r => r.page_slug === post.slug) || [];
            const avg = relevantReviews.length > 0 
              ? relevantReviews.reduce((acc, r) => acc + r.rating, 0) / relevantReviews.length 
              : 0;
            return { ...post, avgRating: avg };
          });
          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogData();
  }, [supabase]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesSearch = 
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = activeCategory === "All Categories" || post.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [searchQuery, activeCategory, sortOrder, posts]);

  const BLOG_CATEGORIES = useMemo(() => {
    const types = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
    return ["All Categories", ...types];
  }, [posts]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <main className="pt-32 pb-20 bg-[var(--bg-warm)] min-h-screen selection:bg-[var(--accent-gold)]/10 overflow-x-hidden">
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        
        <header className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-8 text-left"
          >
            <h2 className="sr-only">{pageDescription}</h2>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-bold italic">{pageSubtitle}</p>
            <h1 className="text-[10vw] lg:text-[5vw] leading-[0.95] text-zinc-900 font-bold tracking-tighter uppercase break-words">
              <span className="block sm:inline">{pageTitle.split(' ')[0]}</span>
              <span className="sm:ml-4 block sm:inline font-serif italic font-light text-zinc-400">
                {pageTitle.split(' ').slice(1).join(' ')}
              </span>
            </h1>
            <p className="max-w-2xl text-zinc-500 text-sm md:text-base uppercase tracking-widest leading-relaxed font-medium">{pageDescription}</p>
          </motion.div>
        </header>

        <nav className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-20 pb-10 border-b border-zinc-200 relative z-[50]" aria-label="Journal Filters">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 w-full lg:w-auto">
            <div className="relative w-full sm:w-64" ref={catRef}>
              <button onClick={() => setCatOpen(!catOpen)} className="w-full flex justify-between items-center py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-900 outline-none hover:text-[var(--accent-gold)] transition-all">
                <span>{activeCategory}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 w-full bg-white border border-zinc-100 shadow-2xl mt-2 z-[60]">
                    {BLOG_CATEGORIES.map((cat) => (
                      <button key={cat} onClick={() => { setActiveCategory(cat); setCatOpen(false); }} className={`w-full text-left px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors border-b border-zinc-50 last:border-none ${activeCategory === cat ? "bg-zinc-50 text-[var(--accent-gold)]" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>{cat}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")} className="group flex items-center gap-3 py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 hover:text-[var(--accent-gold)] transition-all">
              <span className="hidden md:inline">{sortOrder === "newest" ? "Newest Chronicles" : "Oldest Chronicles"}</span>
              <div className="flex flex-col items-center justify-center">
                <ArrowUp size={12} className={sortOrder === "newest" ? "text-[var(--accent-gold)]" : "text-zinc-200"} />
                <ArrowDown size={12} className={`-mt-1 ${sortOrder === "oldest" ? "text-[var(--accent-gold)]" : "text-zinc-200"}`} />
              </div>
            </button>
          </div>
          <div className="relative w-full lg:w-72 group">
            <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--accent-gold)] transition-colors" />
            <input type="text" placeholder="SEARCH CHRONICLES..." className="bg-transparent border-b border-zinc-300 py-2 pl-8 text-[10px] tracking-widest outline-none focus:border-[var(--accent-gold)] w-full uppercase font-black text-zinc-800 transition-all" onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </nav>

        <div className="max-w-5xl mx-auto space-y-32 md:space-y-48">
          {loading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-4 text-center uppercase tracking-widest text-[10px] text-zinc-400">
                <Loader2 className="animate-spin text-[var(--accent-gold)]" size={20} /> Archiving Chronicles...
              </div>
          ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center text-zinc-400 uppercase tracking-widest text-[10px] font-bold">No matching journal entries found.</div>
          ) : filteredPosts.map((post) => (
            <article key={post.id} className="group grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-20 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="md:col-span-7 relative aspect-[4/3] overflow-hidden bg-zinc-50 border border-zinc-100 cursor-pointer shadow-sm">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative w-full h-full overflow-hidden">
                    <img src={post.image_url} alt={post.hero_alt_text || post.title} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1500ms] group-hover:brightness-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-black/20">
                      <span className="text-white text-[11px] uppercase tracking-[0.8em] font-black transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">View Journal</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="md:col-span-5 space-y-8">
                <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.4em] font-black text-zinc-400">
                  <span className="text-[var(--accent-gold)] italic font-serif lowercase tracking-normal text-sm">#{post.category?.replace(/\s+/g, '')}</span>
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                </div>
                
                <div className="space-y-4">
                  {/* 🎯 Applied Micro-Precision Ratings for individual blog posts */}
                  {post.avgRating > 0 && renderStars(post.avgRating)}
                  
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-3xl lg:text-5xl font-bold leading-[1.0] text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors uppercase tracking-tighter">
                      {post.title}
                    </h2>
                  </Link>
                </div>
                
                {/* 🎯 FIXED: Conditional description logic with .trim() */}
                {post.excerpt?.trim() && (
                  <blockquote className="text-zinc-500 font-light text-lg leading-relaxed italic font-serif opacity-85 border-none p-0 bg-transparent shadow-none">
                    "{post.excerpt}"
                  </blockquote>
                )}
                
                <Link href={`/blog/${post.slug}`}>
                  <button className="text-[10px] uppercase tracking-[0.5em] font-black text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]/10 pb-1 pt-4 hover:border-[var(--accent-gold)] transition-all">
                    Read Full Story —
                  </button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}