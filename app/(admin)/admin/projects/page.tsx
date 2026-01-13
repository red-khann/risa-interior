'use client'
import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search as SearchIcon, Edit3, Trash2, 
  Eye, EyeOff, Globe, ArrowUpDown, Loader2, AlertTriangle,
  Star, StarOff, Hash
} from 'lucide-react';
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger';

const CATEGORIES = ["All", "Residential", "Commercial", "Hospitality", "Interior", "Restoration"];
const STATUS_OPTIONS = ["All Status", "Completed", "Under Development"];
const VISIBILITY_OPTIONS = ["All Visibility", "Active (Live)", "Draft (Internal)", "Featured on Home"];

export default function AdminProjectsPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All Status');
  const [activeVisibility, setActiveVisibility] = useState('All Visibility');
  const [loading, setLoading] = useState(true);
  
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [projects, setProjects] = useState<any[]>([]);

  // 🗑️ 🔄 UPDATED: Added imageUrl to modal state to handle Cloudinary cleanup
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '', imageUrl: '' });

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchProjects(); }, []);

  // 🔄 UPDATED: Helper to call your Cloudinary Janitor API
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
    }
  };

  const handleOrderUpdate = async (id: string, newOrder: number) => {
    const { error } = await supabase.from('projects').update({ featured_order: newOrder }).eq('id', id);
    if (!error) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, featured_order: newOrder } : p));
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string, title: string) => {
    // 🔄 UPDATED: Strictly enforcing case-sensitive 'Active' and 'Draft'
    const newStatus = currentStatus === 'Draft' ? 'Active' : 'Draft';
    const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', id);
    if (!error) {
      await logActivity('TOGGLE', `${title} to ${newStatus}`, 'PROJECT');
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    // 🔄 UPDATED: Delete the image from Cloudinary first
    if (deleteModal.imageUrl) {
      await deleteFromCloudinary(deleteModal.imageUrl);
    }
    
    const { error } = await supabase.from('projects').delete().eq('id', deleteModal.id);
    if (!error) {
      await logActivity('DELETE', deleteModal.title, 'PROJECT');
      setProjects(prev => prev.filter(p => p.id !== deleteModal.id));
      // 🔄 UPDATED: Clean reset of modal state
      setDeleteModal({ show: false, id: '', title: '', imageUrl: '' });
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || project.category === activeCategory;
        const matchesStatus = activeStatus === "All Status" || project.phase === activeStatus;
        
        const matchesVisibility = activeVisibility === "All Visibility" || 
                                   (activeVisibility === "Active (Live)" && project.status === "Active") ||
                                   (activeVisibility === "Draft (Internal)" && project.status === "Draft") ||
                                   (activeVisibility === "Featured on Home" && project.is_featured);
        
        return matchesSearch && matchesCategory && matchesStatus && matchesVisibility;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === 'desc' ? -1 : 1;
        if (sortConfig.key === 'order') return (a.featured_order - b.featured_order) * factor;
        if (sortConfig.key === 'date') return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * factor;
        if (sortConfig.key === 'identity') return (a.title || "").localeCompare(b.title || "") * factor;
        if (sortConfig.key === 'status') return (a.phase || "").localeCompare(b.phase || "") * factor;
        if (sortConfig.key === 'visibility') return (a.status || "").localeCompare(b.status || "") * factor;
        return 0;
      });
  }, [searchTerm, activeCategory, activeStatus, activeVisibility, sortConfig, projects]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">
      
      {/* 🏛️ THEMED CUSTOM DELETE MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-2">Confirm Removal</h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest leading-relaxed mb-8">
              Are you certain you wish to delete <span className="text-zinc-900 font-bold">"{deleteModal.title}"</span>? This action is permanent.
            </p>
            <div className="flex gap-4">
              {/* 🔄 UPDATED: Clean reset on cancel */}
              <button onClick={() => setDeleteModal({ show: false, id: '', title: '', imageUrl: '' })} className="flex-1 py-3 border border-zinc-200 text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all">Retain</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white text-[9px] uppercase font-bold tracking-widest hover:bg-red-700 transition-all">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-2">Studio Archive</span>
          <h2 className="text-4xl font-bold tracking-tighter uppercase text-[#1C1C1C]">Portfolio Management</h2>
        </div>
        <Link href="/admin/projects/new">
          <button className="bg-[#1C1C1C] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B89B5E] transition-all flex items-center gap-3 shadow-lg rounded-sm">
            <Plus size={16} /> Add New Narrative
          </button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-zinc-100 shadow-sm">
        <div className="relative w-full md:w-64">
           <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
           <input type="text" placeholder="SEARCH PROJECTS..." className="bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2 text-[10px] tracking-widest font-bold w-full outline-none focus:border-[#B89B5E] uppercase text-zinc-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-[#B89B5E]" value={activeVisibility} onChange={(e) => setActiveVisibility(e.target.value)}>
            {VISIBILITY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-zinc-500" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-zinc-500" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1C1C1C] text-white">
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-center">Featured</th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('order')}>
                Order <Hash size={10} className="inline ml-1" />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('identity')}>
                Identity <ArrowUpDown size={10} className="inline ml-1" />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('status')}>
                Project Status <ArrowUpDown size={10} className="inline ml-1" />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-center cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('visibility')}>
                Lifecycle <ArrowUpDown size={10} className="inline ml-1" />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('date')}>
                Date <ArrowUpDown size={10} className="inline ml-1" />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filteredProjects.map((project) => {
               // 🔄 UPDATED: Use Case-Sensitive check
               const isDraft = project.status === "Draft";
               return (
                <tr key={project.id} className={`hover:bg-zinc-50/50 group transition-colors ${project.is_featured ? 'bg-zinc-50/30' : ''}`}>
                  <td className="p-6 text-center">
                    <button onClick={() => handleFeatureToggle(project.id, project.is_featured, project.title)} className={`transition-all duration-300 transform hover:scale-125 ${project.is_featured ? 'text-amber-500' : 'text-zinc-200 hover:text-zinc-400'}`}>
                      {project.is_featured ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                    </button>
                  </td>
                  <td className="p-6">
                    <input type="number" min="0" className="w-12 bg-transparent border-b border-zinc-100 text-[10px] font-bold text-zinc-900 focus:border-[#B89B5E] outline-none" value={project.featured_order || 0} onChange={(e) => handleOrderUpdate(project.id, parseInt(e.target.value))} disabled={!project.is_featured} />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-200 overflow-hidden border border-zinc-100 shadow-sm">
                        <img src={project.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1C1C] tracking-tight uppercase">{project.title}</p>
                        <p className="text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                          <Globe size={10} className="text-[#B89B5E]" /> {project.location || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-1 rounded-sm border ${project.phase === 'Under Development' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {project.phase || 'N/A'}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isDraft ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isDraft ? 'text-amber-600' : 'text-green-600'}`}>{project.status}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStatusToggle(project.id, project.status, project.title)} className="text-zinc-400 hover:text-[#B89B5E] transition-colors">
                        {isDraft ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link href={`/admin/projects/edit/${project.id}`} className="text-zinc-400 hover:text-black"><Edit3 size={14} /></Link>
                      {/* 🔄 UPDATED: Passing project data and image_url to modal */}
                      <button onClick={() => setDeleteModal({ show: true, id: project.id, title: project.title, imageUrl: project.image_url })} className="text-zinc-300 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
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