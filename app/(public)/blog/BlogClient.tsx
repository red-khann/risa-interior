'use client'
import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link'
import { Search, ChevronDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import { useContent } from '@/components/PreviewProvider'; 

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

  const pageSubtitle = liveContent['blog_page:page_subtitle'] || "The Journal";
  const pageTitle = liveContent['blog_page:page_title'] || "Perspectives";

  useEffect(() => {
    async function fetchBlogPosts() {
      setLoading(true);
      try {
        // 🎯 FIX: Removing strict status filter to ensure data arrives, 
        // then we filter in JS to be safe with capitalization.
        const { data: blogData, error } = await supabase
          .from('blog')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        if (blogData) {
          // Only show posts that are explicitly 'Active' (case insensitive)
          const activeOnly = blogData.filter(p => 
            p.status?.toLowerCase() === 'active'
          );
          setPosts(activeOnly);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogPosts();
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
    <main className="pt-32 pb-20 bg-[#F7F5F2] min-h-screen selection:bg-[#B89B5E]/10">
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        
        <header className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#B89B5E] font-bold mb-4 italic">
              {pageSubtitle}
          </p>
          <h1 className="text-[10vw] lg:text-[7vw] leading-[0.85] mb-12 text-zinc-900 font-bold tracking-tighter uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {pageTitle}
          </h1>
        </header>

        <nav className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-20 pb-10 border-b border-zinc-200 relative z-[50]" aria-label="Journal Filters">
          <div className="flex items-center gap-8 w-full lg:w-auto">
            <div className="relative w-full md:w-64" ref={catRef}>
              <button 
                onClick={() => setCatOpen(!catOpen)}
                className="w-full flex justify-between items-center py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-900 outline-none hover:text-[#B89B5E] transition-all"
              >
                <span>{activeCategory}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-zinc-100 shadow-2xl mt-2 z-[60]">
                  {BLOG_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setCatOpen(false); }}
                      className={`w-full text-left px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors border-b border-zinc-50 last:border-none ${
                        activeCategory === cat ? "bg-zinc-50 text-[#B89B5E]" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              className="group flex items-center gap-3 py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 hover:text-[#B89B5E] transition-colors"
            >
              <span className="hidden md:inline">{sortOrder === "newest" ? "Newest Chronicles" : "Oldest Chronicles"}</span>
              <div className="flex flex-col items-center justify-center">
                <ArrowUp size={12} className={sortOrder === "newest" ? "text-[#B89B5E]" : "text-zinc-200"} />
                <ArrowDown size={12} className={`-mt-1 ${sortOrder === "oldest" ? "text-[#B89B5E]" : "text-zinc-200"}`} />
              </div>
            </button>
          </div>

          <div className="relative w-full lg:w-72 group">
            <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#B89B5E] transition-colors" />
            <input
              type="text"
              placeholder="SEARCH CHRONICLES..."
              className="bg-transparent border-b border-zinc-300 py-2 pl-8 text-[10px] tracking-widest outline-none focus:border-[#B89B5E] w-full uppercase font-black text-zinc-800 transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </nav>

        <div className="max-w-5xl mx-auto space-y-32 md:space-y-48">
          {loading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-4 text-center uppercase tracking-widest text-[10px] text-zinc-400">
                <Loader2 className="animate-spin text-[#B89B5E]" size={20} />
                Archiving Chronicles...
              </div>
          ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center text-zinc-400 uppercase tracking-widest text-[10px] font-bold">No matching journal entries found.</div>
          ) : filteredPosts.map((post) => (
            <article key={post.id} className="group grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-20 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="md:col-span-7 relative aspect-[4/3] overflow-hidden bg-zinc-50 border border-zinc-100 cursor-pointer shadow-sm">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative w-full h-full overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.hero_alt_text || post.title}
                      className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1500ms] group-hover:brightness-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-black/20">
                      <span className="text-white text-[11px] uppercase tracking-[0.8em] font-black transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                        View Journal
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="md:col-span-5 space-y-8">
                <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.4em] font-black text-zinc-400">
                  <span className="text-[#B89B5E] italic font-serif lowercase tracking-normal text-sm">#{post.category?.replace(/\s+/g, '')}</span>
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                </div>
                
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-3xl lg:text-5xl font-bold leading-[1.0] text-[#1C1C1C] group-hover:text-[#B89B5E] transition-colors uppercase tracking-tighter">
                    {post.title}
                  </h2>
                </Link>
                
                <blockquote className="text-zinc-500 font-light text-lg leading-relaxed italic font-serif opacity-85 border-none p-0 bg-transparent shadow-none">
                  "{post.excerpt}"
                </blockquote>
                
                <Link href={`/blog/${post.slug}`}>
                  <button className="text-[10px] uppercase tracking-[0.5em] font-black text-[#B89B5E] border-b-2 border-[#B89B5E]/10 pb-1 pt-4 hover:border-[#B89B5E] transition-all">
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