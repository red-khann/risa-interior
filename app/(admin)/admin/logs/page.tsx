'use client'
import { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Search, User, Filter, 
  Calendar, ShieldCheck, Database, Loader2, ArrowUpDown, Box
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const ACTION_TYPES = ["All Actions", "CREATE", "UPDATE", "DELETE", "TOGGLE", "LOGIN"];
const MODULE_TYPES = ["All Modules", "AUTH", "PROJECT", "SERVICE", "JOURNAL", "CONTENT"];

export default function AdminLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAction, setActiveAction] = useState('All Actions');
  const [activeModule, setActiveModule] = useState('All Modules');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  async function fetchAllLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        *,
        profiles:admin_id (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) setLogs(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchAllLogs(); }, []);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        const matchesSearch = 
          (log.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = activeAction === 'All Actions' || log.action_type === activeAction;
        const matchesModule = activeModule === 'All Modules' || log.module === activeModule;
        return matchesSearch && matchesAction && matchesModule;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === 'desc' ? -1 : 1;
        if (sortConfig.key === 'created_at') {
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * factor;
        }
        // Handle sorting for profiles object vs top-level keys
        const valA = sortConfig.key === 'profiles' ? (a.profiles?.full_name || "") : (a[sortConfig.key] || "");
        const valB = sortConfig.key === 'profiles' ? (b.profiles?.full_name || "") : (b[sortConfig.key] || "");
        return valA.toString().localeCompare(valB.toString()) * factor;
      });
  }, [logs, searchTerm, activeAction, activeModule, sortConfig]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} />
      <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold italic">Accessing Protocol Archive...</span>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 relative pb-20">
      
      {/* 🏛️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 md:px-0">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-2">Audit Trails</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-[var(--text-primary)]">Protocol Archive</h2>
        </div>
        <div className="flex gap-6 md:gap-10 border-l border-zinc-200 pl-6 md:pl-10">
          <div className="flex flex-col text-center md:text-left">
            <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Narrative Count</span>
            <span className="text-lg md:text-xl font-bold text-[var(--text-primary)] tabular-nums">{logs.length}</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-[var(--accent-gold)] font-bold mb-1">Live Sync</span>
            <span className="text-sm font-bold text-zinc-500 uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* 🔍 COMMAND BAR */}
      <div className="mx-4 md:mx-0 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-zinc-100 shadow-sm sticky top-0 z-30">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input 
            type="text" 
            placeholder="SEARCH ARCHITECT OR ITEM..." 
            className="bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2 text-[10px] tracking-widest font-bold w-full outline-none focus:border-[var(--accent-gold)] uppercase text-zinc-800" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <select 
            className="flex-1 md:w-40 bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-[var(--accent-gold)]"
            value={activeAction}
            onChange={(e) => setActiveAction(e.target.value)}
          >
            {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select 
            className="flex-1 md:w-40 bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-zinc-500"
            value={activeModule}
            onChange={(e) => setActiveModule(e.target.value)}
          >
            {MODULE_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* 📱 MOBILE VIEW: Protocol Cards */}
      <div className="md:hidden space-y-4 px-4">
        {filteredLogs.map((log, index) => (
          <div key={log.id} className="bg-white border border-zinc-100 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-200 overflow-hidden shadow-inner flex items-center justify-center">
                  {log.profiles?.avatar_url ? (
                    <img src={log.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : <User size={14} className="text-zinc-300" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase truncate leading-none">
                    {log.profiles?.full_name || log.admin_email || 'System'}
                  </p>
                  <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-1">#{(logs.length - index).toString().padStart(3, '0')}</p>
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                log.action_type === 'DELETE' ? 'bg-red-50 text-red-600' : 
                log.action_type === 'CREATE' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-[var(--text-primary)]'
              }`}>
                {log.action_type}
              </span>
            </div>
            
            <div className="bg-zinc-50/50 p-3 rounded-lg border border-zinc-50 italic text-[10px] text-zinc-600">
               "{log.item_name || 'Narrative Change'}"
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
               <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 text-zinc-500 rounded-sm">
                 {log.module}
               </span>
               <span className="text-[9px] text-[var(--accent-gold)] font-bold uppercase tracking-tighter">
                 {new Date(log.created_at).toLocaleDateString()} — {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* 💻 DESKTOP VIEW: Audit Table */}
      <div className="hidden md:block bg-white border border-zinc-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--text-primary)] text-white">
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[var(--accent-light)] transition-colors" onClick={() => handleSort('profiles')}>
                Architect <ArrowUpDown size={10} className="inline ml-1" />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[var(--accent-light)] transition-colors" onClick={() => handleSort('action_type')}>
                Protocol <ArrowUpDown size={10} className="inline ml-1" />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold">Item Identity</th>
              {/* 🎯 NEW: Sortable Module Column */}
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-center cursor-pointer hover:text-[var(--accent-light)] transition-colors" onClick={() => handleSort('module')}>
                Module <ArrowUpDown size={10} className="inline ml-1" />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right cursor-pointer hover:text-[var(--accent-light)] transition-colors" onClick={() => handleSort('created_at')}>
                Timestamp <ArrowUpDown size={10} className="inline ml-1" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 shadow-sm">
                      {log.profiles?.avatar_url ? (
                        <img src={log.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : <div className="w-full h-full flex items-center justify-center text-zinc-300"><User size={16} /></div>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)] uppercase truncate">
                        {log.profiles?.full_name || log.admin_email || 'System'}
                      </p>
                      <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-1">Studio Admin</p>
                    </div>
                  </div>
                </td>
                
                <td className="p-6">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    log.action_type === 'DELETE' ? 'text-red-500' : 
                    log.action_type === 'CREATE' ? 'text-emerald-600' : 'text-[var(--text-primary)]'
                  }`}>
                    {log.action_type}
                  </span>
                </td>

                <td className="p-6">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase italic">"{log.item_name || 'N/A'}"</p>
                </td>

                <td className="p-6 text-center">
                  <span className="text-[8px] font-black uppercase tracking-tighter px-3 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-sm">
                    {log.module}
                  </span>
                </td>

                <td className="p-6 text-right">
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[9px] text-[var(--accent-gold)] font-bold">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-lg mx-4 md:mx-0">
          <Database size={40} className="text-zinc-100 mb-4" />
          <p className="text-zinc-400 text-[10px] uppercase tracking-[0.4em] font-bold">No entries archived for this criteria.</p>
        </div>
      )}
    </div>
  );
}