'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search as SearchIcon, Edit3, Trash2, 
  Eye, EyeOff, ArrowUpDown, Briefcase, Loader2, 
  AlertTriangle, ChevronLeft, ChevronRight, Filter, Inbox 
} from 'lucide-react';
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 15;
const CATEGORIES = ["All", "Residential Architecture", "Commercial Design", "Spatial Consulting", "Turnkey Interior Solutions"];
const STATUS_FILTERS = ["All Status", "Active", "Draft"];

export default function AdminServicesPage() {
  const supabase = createClient();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering, Search & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All Status');
  const [sortBy, setSortBy] = useState('newest');

  // 🗑️ Themed Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '', imageUrl: '' });

  useEffect(() => {
    fetchServices();
  }, [currentPage, activeCategory, activeStatus, searchTerm, sortBy]);

  async function fetchServices() {
    setLoading(true);
    try {
      let query = supabase
        .from('services')
        .select('*', { count: 'exact' });

      // 🎯 Search Logic
      if (searchTerm.trim() !== '') {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Category Filter
      if (activeCategory !== 'All') {
        query = query.eq('service_type', activeCategory);
      }

      // Status Filter
      if (activeStatus !== 'All Status') {
        query = query.eq('status', activeStatus);
      }

      // 🎯 Sorting Logic
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'name') {
        query = query.order('name', { ascending: true });
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      if (data) setServices(data);
      if (count !== null) setTotalCount(count);
    } catch (err) {
      toast.error("Fetch Error", { description: "Failed to synchronize with expertise archive." });
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

  const handleStatusToggle = async (id: string, currentStatus: string, title: string) => {
    const newStatus = currentStatus === 'Active' ? 'Draft' : 'Active';
    const { error } = await supabase.from('services').update({ status: newStatus }).eq('id', id);
    
    if (!error) {
      await logActivity('TOGGLE', `${title} to ${newStatus}`, 'SERVICE');
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast.success(`Protocol Updated`, { description: `${title} set to ${newStatus}.` });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    if (deleteModal.imageUrl) {
      await deleteFromCloudinary(deleteModal.imageUrl);
    }
    const { error } = await supabase.from('services').delete().eq('id', deleteModal.id);
    if (!error) {
      await logActivity('DELETE', deleteModal.title, 'SERVICE');
      toast.error("Expertise Purged", { description: "Record permanently removed from archive." });
      setDeleteModal({ show: false, id: '', title: '', imageUrl: '' });
      fetchServices();
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
              <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-[var(--accent-gold)] mb-4 block italic">Studio Expertise</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-none">
                Service <span className="font-serif italic font-light text-zinc-400">Pulse</span>
              </h2>
            </motion.div>
            <Link href="/admin/services/new">
              <button className="bg-zinc-900 text-white px-8 py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[var(--accent-gold)] transition-all flex items-center gap-3 shadow-xl">
                <Plus size={16} /> Add New Expertise
              </button>
            </Link>
          </div>

          {/* 🎯 THEME COMMAND BAR */}
          <div className="flex flex-wrap gap-4 pt-8 border-t border-zinc-200">
            <div className="flex flex-1 min-w-[280px] items-center gap-3 bg-white px-4 py-2 border border-zinc-100 focus-within:border-[var(--accent-gold)] transition-colors">
              <SearchIcon size={14} className="text-[var(--accent-gold)]" />
              <input 
                type="text"
                placeholder="Search Expertise..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full text-[10px] uppercase font-bold tracking-widest outline-none bg-transparent placeholder:text-zinc-300"
              />
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Filter size={14} className="text-[var(--accent-gold)]" />
              <select 
                value={activeCategory} 
                onChange={(e) => { setActiveCategory(e.target.value); setCurrentPage(1); }}
                className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Eye size={14} className="text-[var(--accent-gold)]" />
              <select 
                value={activeStatus} 
                onChange={(e) => { setActiveStatus(e.target.value); setCurrentPage(1); }}
                className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent"
              >
                {STATUS_FILTERS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <ArrowUpDown size={14} className="text-[var(--accent-gold)]" />
              <select 
                value={sortBy} 
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Alphabetical</option>
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
              {services.length > 0 ? (
                services.map((service) => (
                  <motion.div layout key={service.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-white border border-zinc-100 p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center justify-between lg:justify-start gap-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${service.status === 'Draft' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                          <span className={`text-[9px] uppercase tracking-widest font-black ${service.status === 'Draft' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {service.status}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">Protocol Entry: {new Date(service.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 shrink-0 group-hover:bg-zinc-900 group-hover:text-[var(--accent-gold)] transition-all">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 text-xl uppercase tracking-tight leading-none mb-1">
                            {service.name}
                          </h3>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            {service.service_type || 'General Expertise'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-zinc-50">
                      <button onClick={() => handleStatusToggle(service.id, service.status, service.name)} className="p-4 border border-zinc-100 text-zinc-300 hover:text-[var(--accent-gold)] transition-all">
                        {service.status === 'Draft' ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <Link href={`/admin/services/edit/${service.id}`} className="flex-1 lg:flex-none">
                        <button className="w-full p-4 border border-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                          <Edit3 size={16} /> Edit
                        </button>
                      </Link>
                      <button 
                        onClick={() => setDeleteModal({ show: true, id: service.id, title: service.name, imageUrl: service.image_url })} 
                        className="p-4 border border-zinc-100 text-zinc-200 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-40 text-center border border-dashed border-zinc-200 bg-white/50">
                  <Inbox size={40} className="mx-auto mb-4 text-zinc-300" />
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">Archive Void: No Expertise Documented</p>
                </div>
              )}
            </AnimatePresence>

            {/* 🎯 THEME PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 pt-12">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }}
                  className="p-4 border border-zinc-100 disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
                  Folio {currentPage} <span className="mx-2 text-zinc-200">/</span> {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }}
                  className="p-4 border border-zinc-100 disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
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
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-red-500 mb-6 text-center italic">Destructive Protocol</h3>
              <p className="text-2xl font-serif italic text-zinc-900 mb-10 leading-snug text-center">
                Delete <span className="text-[var(--accent-gold)]">"{deleteModal.title}"</span> from the studio archive?
              </p>
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