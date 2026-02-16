'use client';

import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Quote, ChevronLeft, ChevronRight, Search, ChevronDown, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/components/PreviewProvider';
import ReviewStats from '@/components/reviews/ReviewStats';

const ARCHIVE_CONFIG = {
  categories: [
    { label: 'All Classifications', value: 'all' },
    { label: 'Expertise', value: 'service' },
    { label: 'Portfolio', value: 'project' },
    { label: 'Journal', value: 'blog' },
  ],
  sortOptions: [
    { label: 'Newest Chronicles', value: 'newest' },
    { label: 'Oldest Chronicles', value: 'oldest' },
    { label: 'Highest Rated', value: 'rating-high' },
    { label: 'Lowest Rated', value: 'rating-low' }
  ],
  itemsPerPage: 12
};

interface ReviewsClientProps {
  initialReviews: any[];
  initialTotalCount: number;
}

export default function ReviewsClient({ initialReviews, initialTotalCount }: ReviewsClientProps) {
  return (
    <Suspense fallback={null}>
      <ReviewsArchiveContent initialReviews={initialReviews} initialTotalCount={initialTotalCount} />
    </Suspense>
  );
}

function ReviewsArchiveContent({ initialReviews, initialTotalCount }: ReviewsClientProps) {
  const liveContent = useContent(); 
  const searchParams = useSearchParams();
  
  const initialType = searchParams.get('type') || 'all';
  const initialSlug = searchParams.get('slug') || '';

  // 🎯 Use server data as initial state
  const [activeCategory, setActiveCategory] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState(initialSlug);
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const pageSubtitle = liveContent['reviews:page_subtitle'] || "Client Narratives";
  const pageTitle = liveContent['reviews:page_title'] || "Perspectives Archive";
  const pageDescription = liveContent['reviews:page_description'] || "A documented pulse of global expertise and spatial transformation.";

  // 🎯 RESTORED: Dynamic Star logic
  const StarIcon = ({ fillPercentage }: { fillPercentage: number }) => {
    const gradientId = useMemo(() => `grad-archive-${Math.random().toString(36).substr(2, 9)}`, []);
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
      <div className="flex items-center gap-2">
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

  // 🎯 Interactive Filtering logic (Client-side for instant feedback)
  const filteredAndSortedReviews = useMemo(() => {
    let result = initialReviews.filter((rev) => {
      const matchesSearch = 
        rev.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        rev.review_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.page_slug.toLowerCase() === searchQuery.toLowerCase();
      
      const matchesCategory = activeCategory === 'all' || rev.page_type === activeCategory;
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortOrder === 'rating-high') return b.rating - a.rating;
      if (sortOrder === 'rating-low') return a.rating - b.rating;
      return 0;
    });
  }, [initialReviews, searchQuery, activeCategory, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedReviews.length / ARCHIVE_CONFIG.itemsPerPage);
  const paginatedReviews = filteredAndSortedReviews.slice(
    (currentPage - 1) * ARCHIVE_CONFIG.itemsPerPage,
    currentPage * ARCHIVE_CONFIG.itemsPerPage
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) setIsCatOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCatLabel = ARCHIVE_CONFIG.categories.find(c => c.value === activeCategory)?.label;
  const activeSortLabel = ARCHIVE_CONFIG.sortOptions.find(s => s.value === sortOrder)?.label;

  return (
    <main className="min-h-screen bg-[var(--bg-warm)] pt-32 pb-20 px-6 max-w-7xl mx-auto selection:bg-[var(--accent-gold)]/20 overflow-x-hidden">
      <header className="mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col space-y-8 text-left">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-black italic">{pageSubtitle}</p>
          <h1 className="text-[10vw] lg:text-[5vw] leading-[0.95] text-zinc-900 font-bold tracking-tighter uppercase break-words">
            <span className="block sm:inline">{pageTitle.split(' ')[0]}</span>
            <span className="sm:ml-4 block sm:inline font-serif italic font-light text-zinc-400">
              {pageTitle.split(' ').slice(1).join(' ')}
            </span>
          </h1>
          <p className="max-w-2xl text-zinc-500 text-sm md:text-base uppercase tracking-widest leading-relaxed font-medium">{pageDescription}</p>
        </motion.div>
      </header>

      <section className="mb-24 border-b border-zinc-200 pb-16">
        <ReviewStats reviews={initialReviews} />
      </section>

      <nav className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-20 pb-10 border-b border-zinc-200 relative z-30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 w-full lg:w-auto">
          <div className="relative w-full sm:w-64" ref={catRef}>
            <button onClick={() => setIsCatOpen(!isCatOpen)} className="w-full flex justify-between items-center py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-900 outline-none hover:text-[var(--accent-gold)] transition-all">
              <span>{activeCategory === 'all' ? "All Classifications" : activeCatLabel}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isCatOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 w-full bg-white border border-zinc-100 shadow-2xl mt-2 z-40 overflow-hidden">
                  {ARCHIVE_CONFIG.categories.map((cat) => (
                    <button key={cat.value} onClick={() => { setActiveCategory(cat.value); setIsCatOpen(false); setCurrentPage(1); }} className={`w-full text-left px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-black transition-colors border-b border-zinc-50 last:border-none ${activeCategory === cat.value ? "bg-zinc-50 text-[var(--accent-gold)]" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>{cat.label}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative w-full sm:w-64" ref={sortRef}>
            <button onClick={() => setIsSortOpen(!isSortOpen)} className="w-full flex justify-between items-center py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 outline-none hover:text-[var(--accent-gold)] transition-all">
              <span>{activeSortLabel}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isSortOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 w-full bg-white border border-zinc-100 shadow-2xl mt-2 z-40 overflow-hidden">
                  {ARCHIVE_CONFIG.sortOptions.map((opt) => (
                    <button key={opt.value} onClick={() => { setSortOrder(opt.value); setIsSortOpen(false); setCurrentPage(1); }} className={`w-full text-left px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-black transition-colors border-b border-zinc-50 last:border-none ${sortOrder === opt.value ? "bg-zinc-50 text-[var(--accent-gold)]" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>{opt.label}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="relative w-full lg:w-72 group">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--accent-gold)] transition-colors" />
          <input type="text" placeholder="SEARCH NARRATIVES..." className="bg-transparent border-b border-zinc-300 py-2 pl-8 text-[10px] tracking-widest outline-none focus:border-[var(--accent-gold)] w-full uppercase font-black text-zinc-800 transition-all" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
      </nav>

      <section className="min-h-[40vh]">
        {paginatedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {paginatedReviews.map((rev) => (
                <motion.div layout key={rev.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-10 border border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col justify-between group h-full relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700"> <Quote size={120} className="text-zinc-900" /> </div>
                  <div className="space-y-6 relative z-10">
                    {renderStars(rev.rating)}
                    <p className="text-xl font-serif italic text-zinc-700 leading-relaxed">"{rev.review_text}"</p>
                  </div>
                  <div className="mt-10 pt-8 border-t border-zinc-50 relative z-10">
                    <h4 className="font-bold text-zinc-900 uppercase tracking-tighter text-lg">{rev.name}</h4>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-black mt-1">Protocol: <span className="text-[var(--accent-gold)]">{rev.page_slug}</span></p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-40 text-center border-2 border-dashed border-zinc-200 bg-white/50 rounded-3xl"> <MessageSquare size={40} className="mx-auto mb-6 text-zinc-200" /> <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-black">No Narrative Matches this Query.</p> </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-8 mt-20">
          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-5 border border-zinc-200 hover:bg-white disabled:opacity-20 transition-all rounded-full"> <ChevronLeft size={20} className="text-zinc-400" /> </button>
          <span className="text-[10px] uppercase tracking-[0.6em] font-black text-zinc-900"> Folio {currentPage} <span className="text-zinc-200 mx-2">/</span> {totalPages} </span>
          <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-5 border border-zinc-200 hover:bg-white disabled:opacity-20 transition-all rounded-full"> <ChevronRight size={20} className="text-zinc-400" /> </button>
        </div>
      )}
    </main>
  );
}