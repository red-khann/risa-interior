'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, Search, User, Filter, Database, Loader2, 
  ArrowUpDown, ChevronLeft, ChevronRight, Inbox, Clock
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// 🎯 Range set to 15 as per studio standards
const ITEMS_PER_PAGE = 15;

const ACTION_TYPES = ["All Actions", "CREATE", "UPDATE", "DELETE", "TOGGLE", "LOGIN"];
const MODULE_TYPES = ["All Modules", "AUTH", "PROJECT", "SERVICE", "JOURNAL", "CONTENT", "REVIEW"];

export default function AdminLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAction, setActiveAction] = useState('All Actions');
  const [activeModule, setActiveModule] = useState('All Modules');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchLogs();
  }, [currentPage, activeAction, activeModule, searchTerm, sortBy]);

  async function fetchLogs() {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_logs')
        .select(`
          *,
          profiles:admin_id (
            full_name,
            avatar_url
          )
        `, { count: 'exact' });

      // 🎯 Search Logic: Architect Name or Item Identity
      if (searchTerm.trim() !== '') {
        // Note: For complex joins, ilike on joined tables is handled via filters or computed columns
        // Here we filter primary text fields
        query = query.ilike('item_name', `%${searchTerm}%`);
      }

      // Action Type Filter
      if (activeAction !== 'All Actions') {
        query = query.eq('action_type', activeAction);
      }

      // Module Filter
      if (activeModule !== 'All Modules') {
        query = query.eq('module', activeModule);
      }

      // 🎯 Dynamic Sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      if (data) setLogs(data);
      if (count !== null) setTotalCount(count);
    } catch (err) {
      toast.error("Fetch Error", { description: "Failed to synchronize with protocol archive." });
    } finally {
      setLoading(false);
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
              <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-[var(--accent-gold)] mb-4 block italic">Audit Trails</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 uppercase leading-none">
                Protocol <span className="font-serif italic font-light text-zinc-400">Archive</span>
              </h2>
            </motion.div>
            <div className="flex gap-10 bg-white px-8 py-4 border border-zinc-100 shadow-sm">
              <div className="text-right">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Narrative Count</p>
                <p className="text-2xl font-bold text-zinc-900 tabular-nums">{totalCount}</p>
              </div>
              <div className="hidden sm:block text-right border-l border-zinc-100 pl-10">
                <p className="text-[8px] font-black text-[var(--accent-gold)] uppercase tracking-[0.3em] mb-1">Live Sync</p>
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-bold text-zinc-500 uppercase">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 COMMAND BAR */}
          <div className="flex flex-wrap gap-4 pt-8 border-t border-zinc-200">
            <div className="flex flex-1 min-w-[280px] items-center gap-3 bg-white px-4 py-2 border border-zinc-100 focus-within:border-[var(--accent-gold)] transition-colors">
              <Search size={14} className="text-[var(--accent-gold)]" />
              <input 
                type="text"
                placeholder="Search Item Identity..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full text-[10px] uppercase font-bold tracking-widest outline-none bg-transparent placeholder:text-zinc-300"
              />
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Filter size={14} className="text-[var(--accent-gold)]" />
              <select 
                value={activeAction} 
                onChange={(e) => { setActiveAction(e.target.value); setCurrentPage(1); }}
                className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent"
              >
                {ACTION_TYPES.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Activity size={14} className="text-[var(--accent-gold)]" />
              <select 
                value={activeModule} 
                onChange={(e) => { setActiveModule(e.target.value); setCurrentPage(1); }}
                className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent"
              >
                {MODULE_TYPES.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 border border-zinc-100">
              <Clock size={14} className="text-[var(--accent-gold)]" />
              <select 
                value={sortBy} 
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="text-[10px] uppercase font-bold tracking-widest outline-none cursor-pointer bg-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
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
              {logs.length > 0 ? (
                logs.map((log) => (
                  <motion.div layout key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-white border border-zinc-100 p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center justify-between lg:justify-start gap-6">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border ${
                          log.action_type === 'DELETE' ? 'border-red-100 text-red-600 bg-red-50' : 
                          log.action_type === 'CREATE' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' : 'border-zinc-100 text-zinc-600 bg-zinc-50'
                        }`}>
                          {log.action_type}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-[0.2em]">
                          {new Date(log.created_at).toLocaleDateString()} — {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800 shadow-lg">
                          {log.profiles?.avatar_url ? (
                            <img src={log.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={16} /></div>}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 text-lg uppercase tracking-tight leading-none">
                            {log.profiles?.full_name || log.admin_email || 'System Protocol'}
                          </h3>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 italic">
                            Modified: <span className="text-zinc-600">"{log.item_name || 'System State'}"</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-50">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 mb-1">Module Access</span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-zinc-900 text-white rounded-sm">
                          {log.module}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-40 text-center border border-dashed border-zinc-200 bg-white/50">
                  <Database size={40} className="mx-auto mb-4 text-zinc-300" />
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">Archive Void: No Protocols Documented</p>
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
                  Protocol Page {currentPage} <span className="mx-2 text-zinc-200">/</span> {totalPages}
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
    </main>
  );
}