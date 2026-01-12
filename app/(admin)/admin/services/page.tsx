'use client'
import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search as SearchIcon, Edit3, Trash2, 
  Eye, EyeOff, ArrowUpDown, Briefcase, Loader2, AlertTriangle 
} from 'lucide-react';
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger'; // ✅ Integrated Logger

// 🛠️ Updated Categories to match your DB service_type presets
const CATEGORIES = ["All", "Residential Architecture", "Commercial Design", "Spatial Consulting", "Turnkey Interior Solutions"];
const STATUS_FILTERS = ["All Status", "Active", "Draft"];

export default function AdminServicesPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All Status');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);

  // 🗑️ Themed Delete Modal State - Added 'title' to track for logging
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '' });

  async function fetchServices() {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setServices(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchServices(); }, []);

  // 🧪 Logic: Toggle status in Database
  const handleStatusToggle = async (id: string, currentStatus: string, title: string) => {
    const newStatus = currentStatus === 'Active' ? 'Draft' : 'Active';
    const { error } = await supabase.from('services').update({ status: newStatus }).eq('id', id);
    
    if (!error) {
      // 🛡️ SYNC TO DASHBOARD: Records the visibility change
      await logActivity('TOGGLE', `${title} to ${newStatus}`, 'SERVICE');
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
  };

  // 🗑️ Logic: Themed Delete
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    const { error } = await supabase.from('services').delete().eq('id', deleteModal.id);
    
    if (!error) {
      // 🛡️ SYNC TO DASHBOARD: Records the service removal permanently
      await logActivity('DELETE', deleteModal.title, 'SERVICE');
      setServices(prev => prev.filter(s => s.id !== deleteModal.id));
      setDeleteModal({ show: false, id: '', title: '' });
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        const matchesSearch = (service.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || service.service_type === activeCategory;
        const matchesStatus = activeStatus === "All Status" || service.status === activeStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === 'desc' ? -1 : 1;
        const valA = (a[sortConfig.key] || "").toString();
        const valB = (b[sortConfig.key] || "").toString();
        return valA.localeCompare(valB) * factor;
      });
  }, [searchTerm, activeCategory, activeStatus, sortConfig, services]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">
      
      {/* 🏛️ THEMED DELETE MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-2">Remove Expertise?</h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest leading-relaxed mb-8">
               Are you certain you wish to delete <span className="text-zinc-900 font-bold">"{deleteModal.title}"</span>? This action is permanent.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({ show: false, id: '', title: '' })} className="flex-1 py-3 border border-zinc-200 text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all">Retain</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white text-[9px] uppercase font-bold tracking-widest hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-2">Studio Expertise</span>
          <h2 className="text-4xl font-bold tracking-tighter uppercase text-[#1C1C1C]">Services Management</h2>
        </div>
        <Link href="/admin/services/new">
          <button className="bg-[#1C1C1C] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B89B5E] transition-all flex items-center gap-3 shadow-lg rounded-sm">
            <Plus size={16} /> Add New Expertise
          </button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-zinc-100 shadow-sm">
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input 
            type="text" 
            placeholder="SEARCH SERVICES..."
            className="bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2 text-[10px] tracking-widest font-bold w-full outline-none focus:border-[#B89B5E] uppercase text-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-[#B89B5E]" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-zinc-500" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1C1C1C] text-white">
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('name')}>
                Expertise Identity <ArrowUpDown size={10} className={`inline ml-1 ${sortConfig.key === 'name' ? 'text-[#B89B5E]' : ''}`} />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('service_type')}>
                Category <ArrowUpDown size={10} className={`inline ml-1 ${sortConfig.key === 'service_type' ? 'text-[#B89B5E]' : ''}`} />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-center cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('status')}>
                Protocol Status <ArrowUpDown size={10} className={`inline ml-1 ${sortConfig.key === 'status' ? 'text-[#B89B5E]' : ''}`} />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredServices.map((service) => {
               const isDraft = service.status === "Draft";
               return (
                <tr key={service.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-[#1C1C1C] group-hover:text-[#B89B5E] transition-all shadow-sm">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1C1C] tracking-tighter uppercase">{service.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase line-clamp-1">{service.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[9px] font-bold uppercase tracking-tighter px-3 py-1.5 border border-zinc-200 bg-zinc-50 text-zinc-500 rounded-sm">
                      {service.service_type || 'N/A'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isDraft ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isDraft ? 'text-amber-600' : 'text-green-600'}`}>{service.status}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center gap-6">
                      <button onClick={() => handleStatusToggle(service.id, service.status, service.name)} className="text-zinc-300 hover:text-[#B89B5E] transition-colors">
                        {isDraft ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link href={`/admin/services/edit/${service.id}`} className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-400 hover:text-black transition-colors">
                        <Edit3 size={14} /> Edit
                      </Link>
                      <button onClick={() => setDeleteModal({ show: true, id: service.id, title: service.name })} className="text-zinc-200 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}