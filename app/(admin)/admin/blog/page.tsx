'use client'
import { useState, useMemo, useEffect } from 'react';
import Link from "next/link";
import { 
  Plus, Search as SearchIcon, Edit3, Trash2, 
  Eye, EyeOff, ArrowUpDown, Loader2, AlertTriangle 
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger'; // ✅ Integrated Logger

const BLOG_CATEGORIES = ["All", "Design Trends", "Studio News", "Exhibition", "Design Philosophy", "Material Spotlight"];
const STATUS_FILTERS = ["All Status", "active", "draft"];

export default function AdminBlogPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All Status');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🗑️ Themed Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '' });

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setPosts(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, []);

  // 🧪 Logic: Toggle status in Database
  const handleStatusToggle = async (id: string, currentStatus: string, title: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const { error } = await supabase.from('blog').update({ status: newStatus }).eq('id', id);
    
    if (!error) {
      // 🛡️ SYNC TO DASHBOARD: Records the visibility change in the journal
      await logActivity('TOGGLE', `${title} to ${newStatus}`, 'JOURNAL');
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  // 🗑️ Logic: Themed Delete
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    const { error } = await supabase.from('blog').delete().eq('id', deleteModal.id);
    
    if (!error) {
      // 🛡️ SYNC TO DASHBOARD: Records the narrative removal
      await logActivity('DELETE', deleteModal.title, 'JOURNAL');
      setPosts(prev => prev.filter(p => p.id !== deleteModal.id));
      setDeleteModal({ show: false, id: '', title: '' });
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesSearch = (post.title || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || post.category === activeCategory;
        const matchesStatus = activeStatus === "All Status" || post.status === activeStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === 'desc' ? -1 : 1;
        if (sortConfig.key === 'date') {
          return (new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime()) * factor;
        }
        const valA = (a[sortConfig.key] || "").toString();
        const valB = (b[sortConfig.key] || "").toString();
        return valA.localeCompare(valB) * factor;
      });
  }, [searchTerm, activeCategory, activeStatus, sortConfig, posts]);

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
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-2">Delete Narrative?</h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest leading-relaxed mb-8">
              Are you certain you wish to remove <span className="text-zinc-900 font-bold">"{deleteModal.title}"</span>? This action is permanent.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({ show: false, id: '', title: '' })} className="flex-1 py-3 border border-zinc-200 text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all">Retain</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white text-[9px] uppercase font-bold tracking-widest hover:bg-red-700 transition-all">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* 🧭 Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-2">Studio Journal</span>
          <h2 className="text-4xl font-bold tracking-tighter uppercase text-[#1C1C1C]">Journal Management</h2>
        </div>
        <Link href="/admin/blog/new">
          <button className="bg-[#1C1C1C] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B89B5E] transition-all flex items-center gap-3 shadow-lg rounded-sm">
            <Plus size={16} /> Write New Narrative
          </button>
        </Link>
      </div>

      {/* 🔍 Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-zinc-100 shadow-sm">
        <div className="relative w-full md:w-64">
           <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
           <input 
            type="text" 
            placeholder="SEARCH ARTICLES..."
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
            {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 🏛️ Data Table */}
      <div className="bg-white border border-zinc-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1C1C1C] text-white">
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold">Preview</th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('title')}>
                Identity <ArrowUpDown size={10} className={`inline ml-1 ${sortConfig.key === 'title' ? 'text-[#B89B5E]' : ''}`} />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('category')}>
                Narrative Type <ArrowUpDown size={10} className={`inline ml-1 ${sortConfig.key === 'category' ? 'text-[#B89B5E]' : ''}`} />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-center cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('status')}>
                Lifecycle <ArrowUpDown size={10} className={`inline ml-1 ${sortConfig.key === 'status' ? 'text-[#B89B5E]' : ''}`} />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right cursor-pointer hover:text-[#B89B5E]" onClick={() => handleSort('date')}>
                Date <ArrowUpDown size={10} className={`inline ml-1 ${sortConfig.key === 'date' ? 'text-[#B89B5E]' : ''}`} />
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredPosts.map((post) => {
               const isDraft = post.status === "draft";
               return (
                <tr key={post.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="p-6">
                    <div className="w-16 h-12 bg-zinc-100 relative overflow-hidden border border-zinc-200 shadow-inner">
                      <img src={post.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-[#1C1C1C] tracking-tighter mb-1 uppercase leading-tight">{post.title}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{post.category}</p>
                  </td>
                  <td className="p-6">
                    <span className="text-[9px] font-bold uppercase tracking-tighter px-3 py-1.5 border border-zinc-200 bg-zinc-50 text-zinc-500 rounded-sm">
                      {post.category}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isDraft ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isDraft ? 'text-amber-600' : 'text-green-600'}`}>
                        {isDraft ? 'Draft' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                      {new Date(post.date || post.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center gap-6">
                      <button onClick={() => handleStatusToggle(post.id, post.status, post.title)} className="text-zinc-300 hover:text-[#B89B5E] transition-colors">
                        {isDraft ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link href={`/admin/blog/edit/${post.id}`} className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-400 hover:text-black transition-colors">
                        <Edit3 size={14} /> Edit
                      </Link>
                      <button onClick={() => setDeleteModal({ show: true, id: post.id, title: post.title })} className="text-zinc-200 hover:text-red-600 transition-colors">
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