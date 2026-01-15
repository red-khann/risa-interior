'use client'
import { useState, useMemo, useEffect } from 'react';
import { 
  Mail, Search, Trash2, ExternalLink, 
  MessageSquare, User, ArrowUpDown, X, Loader2, Copy, Check, AlertTriangle, Phone, CalendarDays,
  Square, CheckSquare
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const TIME_FILTERS = [
  { label: "All Time", value: "all" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "365 Days", value: "365d" }
];

export default function AdminEnquiriesPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All Status'); 
  const [activeTime, setActiveTime] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🛡️ Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', isBulk: false });

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

  const getContactType = (info: string) => {
    if (!info) return { isEmail: false, label: 'Contact' };
    const isEmail = info.includes('@');
    return { isEmail, label: isEmail ? 'Email' : 'Phone' };
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField('contact');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ✅ Marks as Read in DB
  const closeMessage = async () => {
    if (selectedLead && selectedLead.protocol_status === 'New Lead') {
      const { error } = await supabase
        .from('enquiries')
        .update({ protocol_status: 'Read' })
        .eq('id', selectedLead.id);
      
      if (!error) {
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, protocol_status: 'Read' } : l));
      }
    }
    setSelectedLead(null);
  };

  // 🛠️ Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const confirmDelete = async () => {
    const idsToDelete = deleteModal.isBulk ? selectedIds : [deleteModal.id];
    const { error } = await supabase.from('enquiries').delete().in('id', idsToDelete);
    
    if (!error) {
      setLeads(prev => prev.filter(l => !idsToDelete.includes(l.id)));
      setSelectedIds([]);
      setDeleteModal({ show: false, id: '', isBulk: false });
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
        const matchesSearch = (lead.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (lead.contact_info || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (lead.service_type || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = activeStatus === 'All Status' || lead.protocol_status === activeStatus; 
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
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 relative pb-20">
      
      {/* DELETE MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white border border-zinc-200 p-8 md:p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-2">
              {deleteModal.isBulk ? `Delete ${selectedIds.length} Leads?` : 'Delete Lead?'}
            </h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest leading-relaxed mb-8">Permanently remove this record.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({ show: false, id: '', isBulk: false })} className="flex-1 py-3 border border-zinc-200 text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white text-[9px] uppercase font-bold tracking-widest hover:bg-red-700 transition-all">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 md:px-0">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-2">Studio Enquiries</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-[#1C1C1C]">Enquiry Pulse</h2>
        </div>
        <div className="flex gap-6 md:gap-10 border-l border-zinc-200 pl-6 md:pl-10">
          <div className="flex flex-col"><span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Total Narrative</span><span className="text-xl font-bold text-zinc-900 tabular-nums">{leads.length}</span></div>
          <div className="flex flex-col"><span className="text-[8px] uppercase tracking-widest text-[#B89B5E] font-bold mb-1">Response Due</span><div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /><span className="text-xl font-bold text-zinc-900 tabular-nums">{leads.filter(l => l.protocol_status === "New Lead").length}</span></div></div>
        </div>
      </div>

      {/* COMMAND BAR */}
      <div className="mx-4 md:mx-0 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-zinc-100 shadow-sm sticky top-0 z-30 md:relative">
        <div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} /><input type="text" placeholder="SEARCH IDENTITY..." className="bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2 text-[10px] tracking-widest font-bold w-full outline-none focus:border-[#B89B5E] uppercase text-zinc-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
        <div className="flex overflow-x-auto w-full md:w-auto gap-3">
          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-zinc-600" value={activeTime} onChange={(e) => setActiveTime(e.target.value)}>{TIME_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>)}</select>
          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-[#B89B5E]" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}><option value="All Status">ALL STATUS</option><option value="New Lead">NEW LEAD</option><option value="Read">READ</option></select>
          {selectedIds.length > 0 && (<button onClick={() => setDeleteModal({ show: true, id: '', isBulk: true })} className="hidden md:flex items-center gap-2 bg-red-600 text-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest animate-in slide-in-from-right-4"><Trash2 size={12} /> Delete ({selectedIds.length})</button>)}
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4 px-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-white border border-zinc-100 p-5 rounded-2xl shadow-sm space-y-4 active:scale-[0.98] transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400"><User size={16} /></div><div><h4 className="text-[12px] font-bold uppercase tracking-tighter text-zinc-900">{lead.client_name}</h4><p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">{lead.service_type}</p></div></div>
              <div className={`w-2 h-2 rounded-full ${lead.protocol_status === "New Lead" ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
               <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-[0.2em]">{new Date(lead.created_at).toLocaleDateString()}</span>
               <span className="text-[9px] text-[#B89B5E] font-bold uppercase tracking-widest">View Details</span>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white border border-zinc-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1C1C1C] text-white">
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold w-12"><button onClick={toggleSelectAll}>{selectedIds.length === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}</button></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('identity')}>Client Identity <ArrowUpDown size={10} className="inline ml-1" /></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('service')}>Service Interest <ArrowUpDown size={10} className="inline ml-1" /></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-center cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('status')}>Status <ArrowUpDown size={10} className="inline ml-1" /></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('date')}>Received <ArrowUpDown size={10} className="inline ml-1" /></th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className={`hover:bg-zinc-50 transition-colors group ${selectedIds.includes(lead.id) ? 'bg-zinc-50/80' : ''}`}>
                <td className="p-6"><button onClick={() => toggleSelect(lead.id)} className={selectedIds.includes(lead.id) ? 'text-[#B89B5E]' : 'text-zinc-200'}>{selectedIds.includes(lead.id) ? <CheckSquare size={16} /> : <Square size={16} />}</button></td>
                <td className="p-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 text-[#B89B5E]"><User size={16} /></div><div><p className="text-sm font-bold text-[#1C1C1C] uppercase tracking-tighter">{lead.client_name}</p><p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{lead.contact_info}</p></div></div></td>
                <td className="p-6 text-[10px] uppercase tracking-widest font-bold text-zinc-800">{lead.service_type}</td>
                <td className="p-6 text-center"><div className="flex flex-col items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${lead.protocol_status === "New Lead" ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} /><span className="text-[8px] font-bold uppercase">{lead.protocol_status}</span></div></td>
                <td className="p-6 text-right text-[10px] font-bold text-zinc-400 uppercase">{new Date(lead.created_at).toLocaleDateString()}</td>
                <td className="p-6 text-right"><div className="flex justify-end items-center gap-6"><button onClick={() => setSelectedLead(lead)} className="text-[10px] uppercase font-bold text-[#B89B5E] hover:text-black transition-all">View</button><button onClick={() => setDeleteModal({ show: true, id: lead.id, isBulk: false })} className="text-zinc-200 hover:text-red-600 transition-all"><Trash2 size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMessage} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-zinc-100 animate-in slide-in-from-bottom-8">
            <header className="bg-[#1C1C1C] p-8 md:p-10 text-white flex justify-between items-center"><div><span className="text-[10px] uppercase tracking-[0.4em] text-[#B89B5E] font-bold">Inquiry Protocol</span><h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">{selectedLead.client_name}</h2></div><button onClick={closeMessage} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-white hover:text-black"><X size={18} /></button></header>
            <div className="p-8 md:p-10 space-y-6 md:space-y-8">
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex justify-between items-center"><div><p className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest mb-1">Contact Protocol</p><p className="text-xs font-bold text-zinc-800 tabular-nums">{selectedLead.contact_info}</p></div><div className="flex gap-2"><button onClick={() => copyToClipboard(selectedLead.contact_info)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm">{copiedField === 'contact' ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-zinc-400" />}</button><a href={selectedLead.contact_info.includes('@') ? `mailto:${selectedLead.contact_info}` : `tel:${selectedLead.contact_info}`} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm text-[#B89B5E]"><ExternalLink size={12} /></a></div></div>
              <div className="space-y-4"><p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2"><MessageSquare size={12} className="text-[#B89B5E]" /> Message Brief</p><div className="bg-zinc-50/50 p-6 md:p-8 rounded-3xl border border-zinc-50 leading-relaxed text-zinc-600 italic text-sm max-h-[200px] overflow-y-auto">"{selectedLead.description}"</div></div>
              <button onClick={closeMessage} className="w-full bg-[#1C1C1C] text-white py-4 text-[9px] uppercase font-bold tracking-[0.2em] hover:bg-[#B89B5E] transition-all rounded-xl shadow-lg uppercase">Archive Protocol</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}