'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search as SearchIcon, Edit3, Trash2, 
  Eye, EyeOff, Globe, ArrowUpDown, Loader2, AlertTriangle,
  Star, StarOff, Hash, Folder, ChevronLeft, ChevronRight, Filter, Inbox
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// 🎯 Range set to 15 as per studio standards
const ITEMS_PER_PAGE = 15;
const CATEGORIES = ["All", "Residential", "Commercial", "Hospitality", "Interior", "Restoration"];
const STATUS_OPTIONS = ["All Status", "Completed", "Under Development"];
const VISIBILITY_OPTIONS = ["All Visibility", "Active (Live)", "Draft (Internal)", "Featured on Home"];

export default function AdminProjectsPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering, Search & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All Status');
  const [activeVisibility, setActiveVisibility] = useState('All Visibility');
  const [sortBy, setSortBy] = useState('newest');

  // 🗑️ Themed Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '', imageUrl: '' });

  useEffect(() => {
    fetchProjects();
  }, [currentPage, activeCategory, activeStatus, activeVisibility, searchTerm, sortBy]);

  async function fetchProjects() {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' });

      // 🎯 Search Logic
      if (searchTerm.trim() !== '') {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      // Category Filter
      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory);
      }

      // Project Phase Status Filter
      if (activeStatus !== 'All Status') {
        query = query.eq('phase', activeStatus);
      }

      // Visibility Logic
      if (activeVisibility !== 'All Visibility') {
        if (activeVisibility === "Active (Live)") query = query.eq('status', 'Active');
        if (activeVisibility === "Draft (Internal)") query = query.eq('status', 'Draft');
        if (activeVisibility === "Featured on Home") query = query.eq('is_featured', true);
      }

      // 🎯 Sorting Logic
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'order') {
        query = query.order('featured_order', { ascending: true });
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      if (data) setProjects(data);
      if (count !== null) setTotalCount(count);
    } catch (err) {
      toast.error("Fetch Error", { description: "Failed to synchronize with project archive." });
    } finally {
      setLoading(false);
    }
  }

  const deleteFromCloudinary = async (url: string) => {
    try {
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });
    } catch (err) {
      console.error("Cloudinary Cleanup Error:", err);
    }
  };

  const handleFeatureToggle = async (id: string, currentVal: boolean, title: string) => {
    const newVal = !currentVal;
    const { error } = await supabase.from('projects').update({ is_featured: newVal }).eq('id', id);
    if (!error) {
      await logActivity('UPDATE', `${title} ${newVal ? 'set as Featured' : 'removed from Featured'}`, 'PROJECT');
      setProjects(prev => prev.map(p => p.id === id ? { ...p, is_featured: newVal } : p));
      toast.success("Spotlight Updated", { description: `${title} status synchronized.` });
    }
  };

  const handleOrderUpdate = async (id: string, newOrder: number) => {
    const { error } = await supabase.from('projects').update({ featured_order: newOrder }).eq('id', id);
    if (!error) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, featured_order: newOrder } : p));
      toast.success("Order Documented");
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string, title: string) => {
    const newStatus = currentStatus === 'Draft' ? 'Active' : 'Draft';
    const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', id);
    
    if (!error) {
      await logActivity('TOGGLE', `${title} to ${newStatus}`, 'PROJECT');
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast.success("Lifecycle Updated");
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    if (deleteModal.imageUrl) {
      await deleteFromCloudinary(deleteModal.imageUrl);
    }
    const { error } = await supabase.from('projects').delete().eq('id', deleteModal.id);
    if (!error) {
      await logActivity('DELETE', deleteModal.title, 'PROJECT');
      toast.error("Narrative Purged");
      setDeleteModal({ show: false, id: '', title: '', imageUrl: '' });
      fetchProjects();
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen bg-[#F7F5F2] pt-24 md:pt-32 pb-20 px-4 md:px-10 selection:bg-[var(--accent-gold)]/20">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-[var(--accent-gold)] mb-4 block italic">Studio Archive</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-none">
                Portfolio <span className="font-serif italic font-light text-zinc-400">Manager</span>
              </h2>
            </motion.div>
            <Link href="/admin/projects/new">
              <button className="bg-zinc-900 text-white px-8 py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[var(--accent-gold)] transition-all flex items-center gap-3 shadow-xl">
                <Plus size={16} /> Add New Narrative
              </button>
            </Link>
          </div>

          {/* 🎯 THEME COMMAND BAR */}
          <div className="flex flex-wrap gap-4 pt-8 border-t border-zinc-200">
            <div className="flex flex-1 min-w-[280px] items-center gap-3 bg-white px-4 py-2 border border-zinc-100 focus-within:border-[var(--accent-gold)] transition-colors">
              <SearchIcon size={14} className="text-[var(--accent-gold)]" />
              <input 
                type="text"
                placeholder="Search Identity..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full text-[10px] uppercase font-bold tracking-widest outline-none bg-transparent placeholder:text-zinc-300"
              />
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Globe size={14} className="text-[var(--accent-gold)]" />
              <select value={activeVisibility} onChange={(e) => { setActiveVisibility(e.target.value); setCurrentPage(1); }} className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent">
                {VISIBILITY_OPTIONS.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Filter size={14} className="text-[var(--accent-gold)]" />
              <select value={activeCategory} onChange={(e) => { setActiveCategory(e.target.value); setCurrentPage(1); }} className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <ArrowUpDown size={14} className="text-[var(--accent-gold)]" />
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="order">Featured Order</option>
              </select>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4">
            <Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <motion.div layout key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-white border border-zinc-100 p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center justify-between lg:justify-start gap-6">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleFeatureToggle(project.id, project.is_featured, project.title)} className={`transition-all duration-300 ${project.is_featured ? 'text-amber-500' : 'text-zinc-200 hover:text-zinc-400'}`}>
                            {project.is_featured ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                          </button>
                          <div className={`w-2 h-2 rounded-full ${project.status === 'Draft' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                          <span className={`text-[9px] uppercase tracking-widest font-black ${project.status === 'Draft' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {project.status}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-16 bg-zinc-100 overflow-hidden shrink-0 border border-zinc-100">
                          {project.image_url ? (
                            <img src={project.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                          ) : <div className="w-full h-full flex items-center justify-center text-zinc-200"><Folder size={20} /></div>}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 text-xl uppercase tracking-tight leading-none mb-2">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-3">
                             <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-sm border ${project.phase === 'Under Development' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{project.phase || 'Completed'}</span>
                             <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-1 bg-zinc-50 text-zinc-400 border border-zinc-100 rounded-sm italic">{project.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-zinc-50">
                      {project.is_featured && (
                         <div className="flex flex-col items-center gap-1 p-2 border border-zinc-100">
                            <span className="text-[7px] font-black text-zinc-300 uppercase">Order</span>
                            <input type="number" min="0" className="w-10 bg-transparent text-center text-[10px] font-bold text-zinc-900 outline-none" value={project.featured_order || 0} onChange={(e) => handleOrderUpdate(project.id, parseInt(e.target.value))} />
                         </div>
                      )}
                      <button onClick={() => handleStatusToggle(project.id, project.status, project.title)} className="p-4 border border-zinc-100 text-zinc-300 hover:text-[var(--accent-gold)] transition-all">
                        {project.status === 'Draft' ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <Link href={`/admin/projects/edit/${project.id}`} className="flex-1 lg:flex-none">
                        <button className="w-full p-4 border border-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                          <Edit3 size={16} /> Edit
                        </button>
                      </Link>
                      <button onClick={() => setDeleteModal({ show: true, id: project.id, title: project.title, imageUrl: project.image_url })} className="p-4 border border-zinc-100 text-zinc-200 hover:text-red-600 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-40 text-center border border-dashed border-zinc-200 bg-white/50">
                  <Inbox size={40} className="mx-auto mb-4 text-zinc-300" />
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">Archive Void: No Narratives Found</p>
                </div>
              )}
            </AnimatePresence>

            {/* 🎯 THEME PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 pt-12">
                <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }} className="p-4 border border-zinc-100 disabled:opacity-30 hover:bg-white transition-all shadow-sm"><ChevronLeft size={20} /></button>
                <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Folio {currentPage} <span className="mx-2 text-zinc-200">/</span> {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }} className="p-4 border border-zinc-100 disabled:opacity-30 hover:bg-white transition-all shadow-sm"><ChevronRight size={20} /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🏛️ THEME-MATCHED DESTRUCTIVE MODAL */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white p-8 md:p-12 max-w-md w-full border border-zinc-100 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6"><AlertTriangle className="text-red-500" size={32} /></div>
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-red-500 mb-6 text-center italic">Destructive Protocol</h3>
              <p className="text-2xl font-serif italic text-zinc-900 mb-10 leading-snug text-center">Purge <span className="text-[var(--accent-gold)]">"{deleteModal.title}"</span> from the studio archive?</p>
              <div className="flex gap-4">
                <button onClick={confirmDelete} className="flex-1 py-4 bg-zinc-900 text-white text-[10px] uppercase font-bold hover:bg-red-600 transition-colors">Confirm Purge</button>
                <button onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="flex-1 py-4 border border-zinc-200 text-[10px] uppercase font-bold hover:bg-zinc-50 transition-all shadow-sm">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}