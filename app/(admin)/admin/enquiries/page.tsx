'use client'
import { useState, useMemo, useEffect } from 'react';
import { 
  Mail, Search, Trash2, ExternalLink, 
  MessageSquare, User, ArrowUpDown, X, Loader2, Copy, Check, AlertTriangle, Phone, CalendarDays
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const TIME_FILTERS = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last Month", value: "30d" },
  { label: "Last Year", value: "365d" }
];

export default function AdminEnquiriesPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All Status'); 
  const [activeTime, setActiveTime] = useState('all'); // 🕒 Temporal Filter State
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '' });

  const getContactType = (info: string) => {
    if (!info) return { isEmail: false, label: 'Contact' };
    const isEmail = info.includes('@');
    return { isEmail, label: isEmail ? 'Email' : 'Phone' };
  };

  async function fetchLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setLeads(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchLeads(); }, []);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField('contact');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const closeMessage = async () => {
    if (selectedLead && selectedLead.protocol_status === 'New Lead') {
      const { error } = await supabase.from('enquiries').update({ protocol_status: 'Read' }).eq('id', selectedLead.id);
      if (!error) {
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, protocol_status: 'Read' } : l));
      }
    }
    setSelectedLead(null);
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (!error) {
      setLeads(prev => prev.filter(l => l.id !== id));
      setDeleteModal({ show: false, id: '' });
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => {
        // 1. Search Logic
        const matchesSearch = (lead.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (lead.contact_info || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (lead.service_type || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        // 2. Status Logic
        const matchesStatus = activeStatus === 'All Status' || lead.protocol_status === activeStatus; 

        // 3. 🕒 Temporal Logic (Time Filtering)
        let matchesTime = true;
        if (activeTime !== 'all') {
          const leadDate = new Date(lead.created_at).getTime();
          const now = new Date().getTime();
          const daysInMs = parseInt(activeTime) * 24 * 60 * 60 * 1000;
          matchesTime = (now - leadDate) <= daysInMs;
        }

        return matchesSearch && matchesStatus && matchesTime;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === 'desc' ? -1 : 1;
        if (sortConfig.key === 'date') return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * factor;
        if (sortConfig.key === 'identity') return (a.client_name || "").localeCompare(b.client_name || "") * factor;
        if (sortConfig.key === 'service') return (a.service_type || "").localeCompare(b.service_type || "") * factor;
        if (sortConfig.key === 'status') return (a.protocol_status || "").localeCompare(b.protocol_status || "") * factor;
        return 0;
      });
  }, [searchTerm, activeStatus, activeTime, sortConfig, leads]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">
      
      {/* 🏛️ THEMED DELETE MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white border border-zinc-200 p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-2">Purge Lead?</h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest leading-relaxed mb-8">Permanently remove this record.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({ show: false, id: '' })} className="flex-1 py-3 border border-zinc-200 text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all">Retain</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white text-[9px] uppercase font-bold tracking-widest hover:bg-red-700 transition-all">Purge</button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 STATS OVERVIEW HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-2">Studio Enquiries</span>
          <h2 className="text-4xl font-bold tracking-tighter uppercase text-[#1C1C1C]">Enquiry Pulse</h2>
        </div>
        
        <div className="flex gap-10 border-l border-zinc-200 pl-10">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Total Narrative</span>
            <span className="text-xl font-bold text-zinc-900 tabular-nums">{leads.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-[#B89B5E] font-bold mb-1">Response Due</span>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
               <span className="text-xl font-bold text-zinc-900 tabular-nums">{leads.filter(l => l.protocol_status === "New Lead").length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 FILTER COMMAND BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-zinc-100 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input type="text" placeholder="SEARCH IDENTITY..." className="bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2 text-[10px] tracking-widest font-bold w-full outline-none focus:border-[#B89B5E] uppercase text-zinc-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* 🕒 TIME FILTER DROPDOWN */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-sm group hover:border-[#B89B5E] transition-all">
            <CalendarDays size={14} className="text-zinc-400 group-hover:text-[#B89B5E]" />
            <select 
              className="bg-transparent text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-zinc-600" 
              value={activeTime} 
              onChange={(e) => setActiveTime(e.target.value)}
            >
              {TIME_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-[#B89B5E]" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
            <option value="All Status">All Status</option>
            <option value="New Lead">New Leads</option>
            <option value="Read">Read Enquiries</option>
          </select>
        </div>
      </div>

      {/* 🏛️ DATA TABLE */}
      <div className="bg-white border border-zinc-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1C1C1C] text-white">
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('identity')}>Client Identity <ArrowUpDown size={10} className="inline ml-1" /></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('service')}>Service Interest <ArrowUpDown size={10} className="inline ml-1" /></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-center cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('status')}>Protocol Status <ArrowUpDown size={10} className="inline ml-1" /></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('date')}>Received <ArrowUpDown size={10} className="inline ml-1" /></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredLeads.map((lead) => {
              const isNew = lead.protocol_status === "New Lead";
              const type = getContactType(lead.contact_info);
              return (
                <tr key={lead.id} className={`hover:bg-zinc-50 transition-colors group ${!isNew ? 'opacity-60' : ''}`}>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNew ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-800 text-[#B89B5E]'}`}><User size={16} /></div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1C1C] uppercase tracking-tighter">{lead.client_name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 italic">
                          {type.isEmail ? <Mail size={10} /> : <Phone size={10} />}
                          {lead.contact_info}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-[10px] uppercase tracking-widest font-bold text-zinc-800">{lead.service_type}</td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isNew ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                      <span className="text-[8px] font-bold uppercase">{lead.protocol_status}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                    {new Date(lead.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center gap-6">
                      <button onClick={() => setSelectedLead(lead)} className="text-[10px] uppercase font-bold text-[#B89B5E] hover:text-black transition-all">View</button>
                      <button onClick={() => setDeleteModal({ show: true, id: lead.id })} className="text-zinc-200 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="p-20 text-center text-zinc-400 text-[10px] uppercase tracking-widest font-bold">No enquiries found in this time protocol.</div>
        )}
      </div>

      {/* 🎭 NARRATIVE MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMessage} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-zinc-100 animate-in slide-in-from-bottom-8">
            <header className="bg-[#1C1C1C] p-10 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#B89B5E] font-bold">Client Protocol</span>
                <h2 className="text-2xl font-bold uppercase tracking-tighter">{selectedLead.client_name}</h2>
              </div>
              <button onClick={closeMessage} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-white hover:text-black"><X size={18} /></button>
            </header>
            <div className="p-10 space-y-8">
              <div onClick={() => copyToClipboard(selectedLead.contact_info)} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 group cursor-pointer hover:border-[#B89B5E] transition-all relative">
                <div className="flex justify-between items-start mb-2">
                  {getContactType(selectedLead.contact_info).isEmail ? <Mail size={16} className="text-[#B89B5E]" /> : <Phone size={16} className="text-[#B89B5E]" />}
                  {copiedField === 'contact' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-zinc-300 group-hover:text-[#B89B5E]" />}
                </div>
                <p className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest mb-1">{getContactType(selectedLead.contact_info).label} Protocol</p>
                <p className="text-xs font-bold text-zinc-800 tabular-nums">{selectedLead.contact_info}</p>
                {copiedField === 'contact' && <span className="absolute bottom-2 right-4 text-[7px] font-bold text-green-600 uppercase">Copied</span>}
              </div>
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2"><MessageSquare size={12} className="text-[#B89B5E]" /> Message Brief</p>
                <div className="bg-zinc-50/50 p-8 rounded-3xl border border-zinc-50 leading-relaxed text-zinc-600 italic text-sm">"{selectedLead.description}"</div>
              </div>
              <button onClick={closeMessage} className="w-full bg-[#1C1C1C] text-white py-4 text-[9px] uppercase font-bold tracking-[0.2em] hover:bg-[#B89B5E] transition-all rounded-xl shadow-lg">Archive Protocol</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}