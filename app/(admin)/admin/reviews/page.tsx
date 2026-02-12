'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger';
import { 
  Check, X, Star, Trash2, ExternalLink, Award, Loader2, 
  ChevronLeft, ChevronRight, Filter, Search, Inbox, Home 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 15;

export default function AdminReviewsPage() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [homeFilter, setHomeFilter] = useState('all'); // 🎯 NEW: Home page filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, statusFilter, typeFilter, homeFilter, searchQuery]);

  async function fetchReviews() {
    setLoading(true);
    try {
      let query = supabase.from('reviews').select('*', { count: 'exact' });

      if (searchQuery.trim() !== '') {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (typeFilter !== 'all') query = query.eq('page_type', typeFilter);
      if (homeFilter === 'home') query = query.eq('show_on_home', true); // 🎯 NEW: Home filtering

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, from + ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setReviews(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      toast.error("Fetch Error");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string, name: string) {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
    if (!error) {
      const action = status === 'approved' ? 'APPROVE' : 'REJECT';
      await logActivity(action as any, `Review by ${name}`, 'REVIEW');
      toast.success(`Protocol ${status.toUpperCase()}`);
      fetchReviews(); 
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean, name: string) {
    const { error } = await supabase.from('reviews').update({ is_featured: !currentFeatured }).eq('id', id);
    if (!error) {
      await logActivity('TOGGLE', `Spotlight for ${name}`, 'REVIEW');
      toast.success(currentFeatured ? "Removed from Spotlight" : "Featured in Spotlight");
      fetchReviews();
    }
  }

  // 🎯 NEW: Toggle Home Page Visibility
  async function toggleHome(id: string, currentHome: boolean, name: string) {
    const { error } = await supabase.from('reviews').update({ show_on_home: !currentHome }).eq('id', id);
    if (!error) {
      await logActivity('TOGGLE', `Home visibility for ${name}`, 'REVIEW');
      toast.success(currentHome ? "Removed from Home Page" : "Added to Home Page");
      fetchReviews();
    }
  }

  async function confirmDelete(id: string) {
    const reviewToDelete = reviews.find(r => r.id === id);
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      await logActivity('DELETE', `Review from ${reviewToDelete?.name}`, 'REVIEW');
      toast.error("Protocol Purged");
      setDeletingId(null);
      fetchReviews();
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen bg-[#F7F5F2] pt-24 md:pt-32 pb-20 px-4 md:px-10 selection:bg-[var(--accent-gold)]/20">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-[10px] uppercase tracking-[0.6em] font-bold text-[var(--accent-gold)] mb-4 italic">Studio Oversight</h1>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-none">
                Review <span className="font-serif italic font-light text-zinc-400">Moderation</span>
              </h2>
            </motion.div>
            <div className="bg-white px-6 py-4 border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Entries: <span className="text-zinc-900">{totalCount}</span></p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-8 border-t border-zinc-200">
            <div className="flex flex-1 min-w-[280px] items-center gap-3 bg-white px-4 py-2 border border-zinc-100 focus-within:border-[var(--accent-gold)] transition-colors">
              <Search size={14} className="text-[var(--accent-gold)]" />
              <input 
                type="text"
                placeholder="Search Client Identity..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full text-[10px] uppercase font-bold tracking-widest outline-none bg-transparent placeholder:text-zinc-300"
              />
            </div>

            {/* Home Filter */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Home size={14} className="text-[var(--accent-gold)]" />
              <select value={homeFilter} onChange={(e) => { setHomeFilter(e.target.value); setCurrentPage(1); }} className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent">
                <option value="all">Placement: All</option>
                <option value="home">Home Page Only</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Filter size={14} className="text-[var(--accent-gold)]" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <ExternalLink size={14} className="text-[var(--accent-gold)]" />
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent">
                <option value="all">All Types</option>
                <option value="service">Services</option>
                <option value="project">Projects</option>
                <option value="blog">Blogs</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} /></div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <motion.div layout key={rev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-white border border-zinc-100 p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center justify-between lg:justify-start gap-6">
                        <span className={`text-[9px] uppercase tracking-widest font-black px-3 py-1 border ${
                          rev.status === 'approved' ? 'border-green-100 text-green-600 bg-green-50' : 
                          rev.status === 'rejected' ? 'border-red-100 text-red-600 bg-red-50' : 'border-amber-100 text-amber-600 bg-amber-50'
                        }`}>{rev.status}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill={rev.rating >= s ? "var(--accent-gold)" : "none"} color={rev.rating >= s ? "var(--accent-gold)" : "#e5e7eb"} />)}
                        </div>
                        {rev.show_on_home && (
                          <span className="flex items-center gap-1 text-[8px] uppercase font-black text-[var(--accent-gold)] tracking-[0.2em]">
                            <Home size={10} /> Home Active
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-zinc-900 text-lg uppercase tracking-tight flex flex-wrap items-center gap-2">
                          {rev.name} <span className="hidden md:block h-[1px] w-8 bg-zinc-200" />
                          <span className="text-zinc-400 font-light text-xs lowercase italic">{rev.email}</span>
                        </h3>
                        <p className="text-zinc-500 italic text-lg font-serif mt-2 leading-relaxed">"{rev.review_text}"</p>
                      </div>
                      
                      <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 italic flex items-center gap-2">
                         <ExternalLink size={12} /> {rev.page_type}: <span className="text-zinc-900 underline underline-offset-4">{rev.page_slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-50">
                      <ActionButton active={rev.show_on_home} onClick={() => toggleHome(rev.id, rev.show_on_home, rev.name)} icon={<Home size={18} />} variant="gold" />
                      <ActionButton active={rev.is_featured} onClick={() => toggleFeatured(rev.id, rev.is_featured, rev.name)} icon={<Award size={18} />} variant="gold" />
                      <ActionButton onClick={() => updateStatus(rev.id, 'approved', rev.name)} icon={<Check size={18} />} variant="green" />
                      <ActionButton onClick={() => updateStatus(rev.id, 'rejected', rev.name)} icon={<X size={18} />} variant="amber" />
                      <ActionButton onClick={() => setDeletingId(rev.id)} icon={<Trash2 size={18} />} variant="red" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-40 text-center border border-dashed border-zinc-200 bg-white/50">
                  <Inbox size={40} className="mx-auto mb-4 text-zinc-300" />
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">No Protocols Logged</p>
                </div>
              )}
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 pt-12">
                <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }} className="p-4 border border-zinc-100 disabled:opacity-30 hover:bg-white transition-all"><ChevronLeft size={20} /></button>
                <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Page {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }} className="p-4 border border-zinc-100 disabled:opacity-30 hover:bg-white transition-all"><ChevronRight size={20} /></button>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeletingId(null)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white p-8 md:p-12 max-w-md w-full border border-zinc-100 shadow-2xl">
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-red-500 mb-6 italic text-center">Destructive Protocol</h3>
              <p className="text-2xl font-serif italic text-zinc-900 mb-10 text-center">Purge this testimonial?</p>
              <div className="flex gap-4">
                <button onClick={() => confirmDelete(deletingId)} className="flex-1 py-4 bg-zinc-900 text-white text-[10px] uppercase font-bold hover:bg-red-600 transition-colors">Delete</button>
                <button onClick={() => setDeletingId(null)} className="flex-1 py-4 border border-zinc-200 text-[10px] uppercase font-bold hover:bg-zinc-50 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ActionButton({ icon, onClick, active = false, variant }: any) {
  const styles: any = {
    gold: active ? "bg-[var(--accent-gold)] text-white border-[var(--accent-gold)]" : "text-zinc-400 hover:text-[var(--accent-gold)]",
    green: "hover:text-green-600 hover:bg-green-50",
    amber: "hover:text-amber-600 hover:bg-amber-50",
    red: "hover:text-red-600 hover:bg-red-50",
  };
  return (
    <button onClick={onClick} className={`flex-1 lg:flex-none p-4 border border-zinc-100 transition-all ${styles[variant]}`}>
      {icon}
    </button>
  );
}