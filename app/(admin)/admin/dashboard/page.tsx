'use client';
import { useState, useEffect } from 'react';
import {
  Plus, ArrowRight, Activity, Search,
  Loader2, X, FolderKanban, Briefcase, PenTool, ChevronDown, User,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const LOGS_PER_PAGE = 15;

export default function DashboardPage() {
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  
  const [data, setData] = useState({
    stats: [],
    recentActivity: [],
    health: [],
    isLoading: true
  });

  const fetchData = async () => {
    setData(prev => ({ ...prev, isLoading: true }));

    let dateLimit = new Date();
    let isFiltering = timeFilter !== 'All Time';
    if (timeFilter === 'Last 7 Days') dateLimit.setDate(dateLimit.getDate() - 7);
    else if (timeFilter === 'Last Month') dateLimit.setMonth(dateLimit.getMonth() - 1);
    else if (timeFilter === 'Last Year') dateLimit.setFullYear(dateLimit.getFullYear() - 1);

    const isoDate = dateLimit.toISOString();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const from = (currentPage - 1) * LOGS_PER_PAGE;
    const to = from + LOGS_PER_PAGE - 1;

    let pQuery = supabase.from('projects').select('*');
    let sQuery = supabase.from('services').select('*');
    let bQuery = supabase.from('blog').select('*');
    let eQuery = supabase.from('enquiries').select('*');

    if (isFiltering) {
      pQuery = pQuery.gte('created_at', isoDate);
      sQuery = sQuery.gte('created_at', isoDate);
      bQuery = bQuery.gte('created_at', isoDate);
      eQuery = eQuery.gte('created_at', isoDate);
    }

    const [projects, services, blogs, leads, logs] = await Promise.all([
      pQuery,
      sQuery,
      bQuery,
      eQuery,
      supabase
        .from('admin_logs')
        .select(`*, profiles:admin_id (full_name, avatar_url)`, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to) 
    ]);

    const projData = projects.data || [];
    const leadData = leads.data || [];
    const blogData = blogs.data || [];
    setTotalLogs(logs.count || 0);

    const projectsWithDesc = projData.filter(p => (p.description || p.desc || p.content)?.length > 20).length;
    const metaScore = projData.length ? Math.round((projectsWithDesc / projData.length) * 100) : 100;
    const recentPosts = blogData.filter(b => new Date(b.created_at) > thirtyDaysAgo).length;
    const seoScore = recentPosts > 0 ? 100 : 45;
    const activeProjs = projData.filter(p => p.status === 'Active').length;
    const visibilityScore = projData.length ? Math.round((activeProjs / projData.length) * 100) : 0;

    setData({
      stats: [
        { label: 'Portfolio Entries', value: projData.length.toString().padStart(2, '0'), detail: 'Audit Archive', link: '/admin/projects' },
        { label: 'Active Expertise', value: (services.data?.length || 0).toString().padStart(2, '0'), detail: 'Manage Protocols', link: '/admin/services' },
        { label: 'Client Enquiries', value: leadData.length.toString().padStart(2, '0'), detail: `Due: ${leadData.filter(l => l.protocol_status === 'New Lead').length}`, link: '/admin/enquiries' },
        { label: 'Journal Volume', value: blogData.length.toString().padStart(2, '0'), detail: 'Edit Narratives', link: '/admin/blog' }
      ],
      recentActivity: logs.data || [],
      health: [
        { label: 'Content SEO', status: seoScore > 70 ? 'OPTIMAL' : 'STAGNANT', value: seoScore },
        { label: 'Metadata Depth', status: metaScore > 70 ? 'HEALTHY' : 'INCOMPLETE', value: metaScore },
        { label: 'Public Visibility', status: visibilityScore > 50 ? 'HIGH' : 'LOW IMPACT', value: visibilityScore }
      ],
      isLoading: false
    });
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [timeFilter, currentPage]);

  if (!mounted) return null;

  const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative text-zinc-800 pb-10 bg-[#F7F5F2]">

      {/* 🏛️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 md:px-0 mb-8 pt-10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--accent-gold)] font-bold block mb-2 italic">Architectural Overview</span>
          <h2 className="text-5xl font-bold tracking-tighter uppercase text-[var(--text-primary)]">Dashboard</h2>
        </div>
        
        <div className="relative w-full md:w-auto">
          <select
            value={timeFilter}
            onChange={e => { setTimeFilter(e.target.value); setCurrentPage(1); }}
            className="appearance-none w-full md:w-auto bg-white border border-zinc-100 px-6 py-3 pr-12 text-[10px] uppercase font-bold tracking-widest text-[var(--accent-gold)] outline-none cursor-pointer hover:border-[var(--accent-gold)] transition-all shadow-sm"
          >
            <option>Last 7 Days</option>
            <option>Last Month</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent-gold)] pointer-events-none" />
        </div>
      </div>

      {/* STAT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
        {data.stats.map((stat: any) => (
          <div key={stat.label} className="bg-white border border-zinc-100 p-8 hover:shadow-xl transition-all duration-500 group relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-[var(--accent-gold)] translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-6">{stat.label}</p>
            <p className="text-5xl font-bold text-[var(--text-primary)] mb-6 tracking-tighter tabular-nums">{stat.value}</p>
            <Link href={stat.link} className="flex items-center gap-2 text-[9px] uppercase font-bold text-[var(--accent-gold)] tracking-widest hover:text-black">
              {stat.detail} <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 md:px-0">
        {/* 📋 PROTOCOL LOGS SECTION */}
        <div className="lg:col-span-8 bg-white border border-zinc-100 p-8 md:p-10 shadow-sm min-h-[750px] flex flex-col">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-6 mb-8">
            <div className="flex items-center gap-3">
               <Activity size={16} className="text-[var(--accent-gold)]" />
               <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-zinc-900 italic">Audit Narrative</h3>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center gap-2 px-6 py-2 bg-[var(--text-primary)] text-white text-[9px] uppercase font-bold tracking-[0.2em] hover:bg-[var(--accent-gold)] transition-all shadow-lg rounded-sm">
              <Plus size={14} /> New Vessel
            </button>
          </div>
          
          {/* 🎯 SCROLLABLE LOG CONTAINER */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px] custom-scrollbar mb-8">
            {data.isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-[var(--accent-gold)]" />
                <span className="text-[9px] uppercase font-bold text-zinc-300 tracking-widest">Syncing Protocols...</span>
              </div>
            ) : data.recentActivity.length > 0 ? (
              data.recentActivity.map((log: any) => (
                <div key={log.id} className="flex justify-between items-center p-5 bg-zinc-50 border-l-4 border-[var(--accent-gold)] hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 overflow-hidden flex-shrink-0 shadow-inner">
                      {log.profiles?.avatar_url ? (
                        <img src={log.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100"><User size={20} /></div>
                      )}
                    </div>
                    <div>
                      <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">{log.action_type}</p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase italic mt-1 bg-white px-2 py-0.5 inline-block border border-zinc-100 rounded-sm truncate max-w-[200px] md:max-w-md">Item: {log.item_name}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">
                        Architected by {log.profiles?.full_name ?? log.admin_email ?? "System"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end hidden sm:flex">
                    <p className="text-[10px] font-black text-zinc-900 uppercase mb-1">{new Date(log.created_at).toLocaleDateString()}</p>
                    <p className="text-[9px] text-[var(--accent-gold)] font-black uppercase bg-[var(--accent-gold)]/10 px-2 py-0.5 border border-[var(--accent-gold)]/10">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-zinc-100">
                <Search size={24} className="text-zinc-200" />
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">Archive Sequence Clear.</p>
              </div>
            )}
          </div>

          {/* 🎯 STABLE PAGINATION POSITION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 pt-6 border-t border-zinc-100">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-3 border border-zinc-100 disabled:opacity-30 hover:bg-zinc-50 transition-all shadow-sm"
              >
                <ChevronLeft size={18} className="text-[var(--accent-gold)]" />
              </button>
              <span className="text-[9px] uppercase tracking-widest font-black text-zinc-400">
                Protocol {currentPage} <span className="mx-1 text-zinc-200">/</span> {totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-3 border border-zinc-100 disabled:opacity-30 hover:bg-zinc-50 transition-all shadow-sm"
              >
                <ChevronRight size={18} className="text-[var(--accent-gold)]" />
              </button>
            </div>
          )}
        </div>

        {/* HEALTH SECTION */}
        <div className="lg:col-span-4 bg-[var(--text-primary)] p-10 text-white shadow-2xl border-t-4 border-[var(--accent-gold)]">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--accent-light)] mb-10">Live Site Health</h3>
          <ul className="space-y-10">
            {data.health.map((item: any) => (
              <li key={item.label} className="space-y-4 border-b border-zinc-800/50 pb-8 last:border-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-300">{item.label}</span>
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-[var(--accent-light)]">{item.status}</span>
                </div>
                <div className="w-full bg-zinc-900 h-[4px] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--accent-light)] transition-all duration-1000" 
                    style={{ width: `${item.value}%` }} 
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* COMPOSITION MODAL (Animation logic preserved) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-zinc-100">
              <header className="bg-[#1C1C1C] p-10 text-white flex justify-between items-center border-b border-[var(--accent-gold)]">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--accent-light)] font-bold">Studio Protocol</span>
                  <h2 className="text-2xl font-bold tracking-tighter uppercase">Initialize New Vessel</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[var(--accent-gold)] transition-all">
                  <X size={18} className="text-white" />
                </button>
              </header>
              <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Portfolio', icon: FolderKanban, link: '/admin/projects/new' },
                  { name: 'Expertise', icon: Briefcase, link: '/admin/services/new' },
                  { name: 'Journal', icon: PenTool, link: '/admin/blog/new' }
                ].map((vessel) => (
                  <Link key={vessel.name} href={vessel.link} onClick={() => setIsModalOpen(false)} className="group flex flex-col items-center text-center gap-5 p-6 rounded-[2rem] hover:bg-zinc-50 transition-all">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-[var(--text-primary)] group-hover:border-[var(--accent-gold)] transition-all relative overflow-hidden">
                      <div className="absolute inset-0 bg-[var(--accent-gold)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <vessel.icon size={24} className="text-zinc-400 group-hover:text-[var(--text-primary)] relative z-10" />
                    </div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800">{vessel.name}</h4>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}