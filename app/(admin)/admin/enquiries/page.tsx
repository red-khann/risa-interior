'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Mail, Search, Trash2, ExternalLink, MessageSquare, User, 
  ArrowUpDown, X, Loader2, Copy, Check, AlertTriangle, 
  ChevronLeft, ChevronRight, Filter, Inbox, Award
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// 🎯 Range set to 15 as per architectural standards
const ITEMS_PER_PAGE = 15;

const TIME_FILTERS = [
  { label: "All Time", value: "all" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "365 Days", value: "365d" }
];

export default function AdminEnquiriesPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('all'); 
  const [activeTime, setActiveTime] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [currentPage, activeStatus, activeTime, searchTerm, sortBy]);

  async function fetchLeads() {
    setLoading(true);
    try {
      let query = supabase
        .from('enquiries')
        .select('*', { count: 'exact' });

      // 🎯 Search Logic: Client Name or Contact Info
      if (searchTerm.trim() !== '') {
        query = query.or(`client_name.ilike.%${searchTerm}%,contact_info.ilike.%${searchTerm}%`);
      }

      // Status Filter
      if (activeStatus !== 'all') {
        query = query.eq('protocol_status', activeStatus);
      }

      // Time Filtering Logic (Handled via created_at)
      if (activeTime !== 'all') {
        const days = parseInt(activeTime);
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        query = query.gte('created_at', dateLimit.toISOString());
      }

      // 🎯 Sorting Logic Integration
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'identity') {
        query = query.order('client_name', { ascending: true });
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      if (data) setLeads(data);
      if (count !== null) setTotalCount(count);
    } catch (err) {
      toast.error("Fetch Error", { description: "Failed to synchronize with enquiry archive." });
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(true);
    toast.success("Identity Copied", { description: "Contact protocol saved to clipboard." });
    setTimeout(() => setCopiedField(false), 2000);
  };

  const markAsRead = async (lead: any) => {
    if (lead.protocol_status === 'New Lead') {
      const { error } = await supabase
        .from('enquiries')
        .update({ protocol_status: 'Read' })
        .eq('id', lead.id);
      
      if (!error) {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, protocol_status: 'Read' } : l));
      }
    }
    setSelectedLead(lead);
  };

  const confirmDelete = async (id: string) => {
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (!error) {
      toast.error("Protocol Purged");
      setDeletingId(null);
      fetchLeads();
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
              <h1 className="text-[10px] uppercase tracking-[0.6em] font-bold text-[var(--accent-gold)] mb-4 italic">Studio Enquiries</h1>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-none">
                Enquiry <span className="font-serif italic font-light text-zinc-400">Pulse</span>
              </h2>
            </motion.div>
            <div className="flex gap-10 bg-white px-8 py-4 border border-zinc-100 shadow-sm">
              <div className="text-right">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Total Narrative</p>
                <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
              </div>
              <div className="text-right border-l border-zinc-100 pl-10">
                <p className="text-[8px] font-black text-[var(--accent-gold)] uppercase tracking-[0.3em] mb-1">Response Due</p>
                <p className="text-2xl font-bold text-zinc-900">{leads.filter(l => l.protocol_status === "New Lead").length}</p>
              </div>
            </div>
          </div>

          {/* 🎯 THEME COMMAND BAR */}
          <div className="flex flex-wrap gap-4 pt-8 border-t border-zinc-200">
            <div className="flex flex-1 min-w-[280px] items-center gap-3 bg-white px-4 py-2 border border-zinc-100 focus-within:border-[var(--accent-gold)] transition-colors">
              <Search size={14} className="text-[var(--accent-gold)]" />
              <input 
                type="text"
                placeholder="Search Identity or Protocol..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full text-[10px] uppercase font-bold tracking-widest outline-none bg-transparent placeholder:text-zinc-300"
              />
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Filter size={14} className="text-[var(--accent-gold)]" />
              <select 
                value={activeStatus} 
                onChange={(e) => { setActiveStatus(e.target.value); setCurrentPage(1); }}
                className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent"
              >
                <option value="all">All Status</option>
                <option value="New Lead">New Lead</option>
                <option value="Read">Read</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <ChevronRight size={14} className="text-[var(--accent-gold)] rotate-90" />
              <select 
                value={activeTime} 
                onChange={(e) => { setActiveTime(e.target.value); setCurrentPage(1); }}
                className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent"
              >
                {TIME_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} /></div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <motion.div layout key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-white border border-zinc-100 p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center justify-between lg:justify-start gap-6">
                        <span className={`text-[9px] uppercase tracking-widest font-black px-3 py-1 border ${
                          lead.protocol_status === 'New Lead' ? 'border-amber-100 text-amber-600 bg-amber-50 animate-pulse' : 'border-green-100 text-green-600 bg-green-50'
                        }`}>{lead.protocol_status}</span>
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-zinc-900 text-lg uppercase tracking-tight flex flex-wrap items-center gap-2">
                          {lead.client_name} <span className="hidden md:block h-[1px] w-8 bg-zinc-200" />
                          <span className="text-zinc-400 font-light text-xs lowercase italic tracking-normal">{lead.contact_info}</span>
                        </h3>
                        <p className="text-zinc-500 italic text-lg font-serif mt-2 leading-relaxed truncate max-w-2xl">
                          "{lead.description}"
                        </p>
                      </div>
                      
                      <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent-gold)] italic flex items-center gap-2">
                         <Award size={12} /> Service Interest: <span className="text-zinc-900">{lead.service_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-50">
                      <button onClick={() => markAsRead(lead)} className="flex-1 lg:flex-none p-4 border border-zinc-100 text-zinc-400 hover:text-[var(--accent-gold)] transition-all uppercase text-[10px] font-bold tracking-widest">
                        View Details
                      </button>
                      <button onClick={() => setDeletingId(lead.id)} className="p-4 border border-zinc-100 text-zinc-300 hover:text-red-600 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-40 text-center border border-dashed border-zinc-200 bg-white/50">
                  <Inbox size={40} className="mx-auto mb-4 text-zinc-300" />
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">Enquiry Void: No Protocols Logged</p>
                </div>
              )}
            </AnimatePresence>

            {/* 🎯 THEME PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 pt-12">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }}
                  className="p-4 border border-zinc-100 disabled:opacity-30 hover:bg-white transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
                  Page {currentPage} <span className="mx-2 text-zinc-200">/</span> {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }}
                  className="p-4 border border-zinc-100 disabled:opacity-30 hover:bg-white transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎯 THEME-MATCHED DESTRUCTIVE MODAL */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeletingId(null)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white p-8 md:p-12 max-w-md w-full border border-zinc-100 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-red-500 mb-6 text-center italic">Destructive Protocol</h3>
              <p className="text-2xl font-serif italic text-zinc-900 mb-10 leading-snug text-center">Purge this enquiry from the pulse archive?</p>
              <div className="flex gap-4">
                <button onClick={() => confirmDelete(deletingId)} className="flex-1 py-4 bg-zinc-900 text-white text-[10px] uppercase font-bold hover:bg-red-600 transition-colors">Confirm Purge</button>
                <button onClick={() => setDeletingId(null)} className="flex-1 py-4 border border-zinc-200 text-[10px] uppercase font-bold hover:bg-zinc-50 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🎯 THEME-MATCHED DETAIL MODAL */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-2xl bg-white shadow-2xl border border-zinc-100 overflow-hidden">
              <header className="bg-zinc-900 p-8 md:p-10 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--accent-gold)] font-bold italic">Inquiry Protocol</span>
                  <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-white mt-2">{selectedLead.client_name}</h2>
                </div>
                <button onClick={() => setSelectedLead(null)} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[var(--accent-gold)] transition-all"><X size={18} /></button>
              </header>
              <div className="p-8 md:p-10 space-y-8">
                <div className="bg-zinc-50 p-6 border border-zinc-100 flex justify-between items-center">
                  <div>
                    <p className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest mb-1">Contact Protocol</p>
                    <p className="text-sm font-bold text-zinc-800 tabular-nums">{selectedLead.contact_info}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(selectedLead.contact_info)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm hover:border-[var(--accent-gold)] transition-colors">
                      {copiedField ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-zinc-400" />}
                    </button>
                    <a href={selectedLead.contact_info.includes('@') ? `mailto:${selectedLead.contact_info}` : `tel:${selectedLead.contact_info}`} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-white transition-all">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2 italic">
                    <MessageSquare size={12} className="text-[var(--accent-gold)]" /> Message Brief
                  </p>
                  <div className="bg-[#F7F5F2] p-8 md:p-10 rounded-lg border border-zinc-100 leading-relaxed text-zinc-700 italic text-lg font-serif">
                    "{selectedLead.description}"
                  </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="w-full bg-zinc-900 text-white py-6 text-[10px] uppercase font-bold tracking-[0.4em] hover:bg-[var(--accent-gold)] transition-all shadow-lg">
                  Archive Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}