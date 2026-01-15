'use client'
import { useState, useMemo, useEffect } from 'react';
import Link from "next/link";
import { 
  Plus, Search as SearchIcon, Edit3, Trash2, 
  Eye, EyeOff, ArrowUpDown, Loader2, AlertTriangle, Newspaper, Calendar
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger';

const BLOG_CATEGORIES = ["All", "Design Trends", "Studio News", "Exhibition", "Design Philosophy", "Material Spotlight"];
const STATUS_FILTERS = ["All Status", "Active", "Draft"];

export default function AdminBlogPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All Status');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🗑️ Themed Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '', imageUrl: '' });

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
    const { error } = await supabase.from('blog').update({ status: newStatus }).eq('id', id);
    
    if (!error) {
      await logActivity('TOGGLE', `${title} to ${newStatus}`, 'JOURNAL');
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    if (deleteModal.imageUrl) {
      await deleteFromCloudinary(deleteModal.imageUrl);
    }
    const { error } = await supabase.from('blog').delete().eq('id', deleteModal.id);
    if (!error) {
      await logActivity('DELETE', deleteModal.title, 'JOURNAL');
      setPosts(prev => prev.filter(p => p.id !== deleteModal.id));
      setDeleteModal({ show: false, id: '', title: '', imageUrl: '' });
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
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 relative pb-20 w-full overflow-x-hidden">
      
      {/* 🏛️ THEMED DELETE MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white border border-zinc-200 p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-2">Delete Narrative?</h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest leading-relaxed mb-8">
              Are you certain you wish to remove <span className="text-zinc-900 font-bold">"{deleteModal.title}"</span>?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({ show: false, id: '', title: '', imageUrl: '' })} className="flex-1 py-3 border border-zinc-200 text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white text-[9px] uppercase font-bold tracking-widest hover:bg-red-700 transition-all">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 md:px-0">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-2">Studio Journal</span>
          <h2 className="md:hidden text-3xl font-bold tracking-tighter uppercase text-[#1C1C1C]">Journal Pulse</h2>
          <h2 className="hidden md:block text-4xl font-bold tracking-tighter uppercase text-[#1C1C1C]">Journal Management</h2>
        </div>
        <Link href="/admin/blog/new" className="hidden md:block">
          <button className="bg-[#1C1C1C] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B89B5E] transition-all flex items-center gap-3 shadow-lg rounded-sm">
            <Plus size={16} /> Write New Narrative
          </button>
        </Link>
      </div>

      {/* COMMAND BAR */}
      <div className="mx-4 md:mx-0 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-zinc-100 shadow-sm sticky top-0 z-30 md:relative">
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
        
        <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar gap-3">
          {/* Status Filter - Hidden on Mobile to follow your Project Pulse request */}
          <select className="hidden md:block bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-[#B89B5E] min-w-[130px]" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <select className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer text-zinc-500 min-w-[130px]" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
            {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* 📱 MOBILE VIEW: Mirroring Enquiries Card Style with Toggles */}
      <div className="md:hidden space-y-4 px-4">
        {filteredPosts.map((post) => {
          const isDraft = post.status === "Draft";
          return (
            <div key={post.id} className="bg-white border border-zinc-100 p-6 rounded-[2rem] shadow-sm space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 overflow-hidden flex items-center justify-center border border-zinc-100 shrink-0">
                    {post.image_url ? (
                      <img src={post.image_url} className="w-full h-full object-cover grayscale" alt="" />
                    ) : (
                      <Newspaper size={18} className="text-zinc-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold uppercase tracking-tighter text-zinc-900 leading-none mb-1 truncate">{post.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase truncate">{post.category}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${isDraft ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                 <div className="flex items-center gap-2 overflow-hidden">
                   <Calendar size={10} className="text-zinc-300 shrink-0" />
                   <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest truncate">
                     {new Date(post.date || post.created_at).toLocaleDateString()}
                   </span>
                 </div>
                 
                 {/* MOBILE TOGGLE - Status Only */}
                 <div className="flex items-center gap-5 shrink-0 pl-2">
                    <button 
                      onClick={() => handleStatusToggle(post.id, post.status, post.title)} 
                      className="text-zinc-300"
                    >
                      {isDraft ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 💻 DESKTOP VIEW: Full Original Table */}
      <div className="hidden md:block bg-white border border-zinc-100 shadow-xl overflow-hidden">
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
               const isDraft = post.status === "Draft";
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
                      <button 
                        onClick={() => setDeleteModal({ 
                          show: true, 
                          id: post.id, 
                          title: post.title, 
                          imageUrl: post.image_url 
                        })} 
                        className="text-zinc-200 hover:text-red-600 transition-colors"
                      >
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

      {filteredPosts.length === 0 && (
        <div className="py-20 text-center text-zinc-400 text-[10px] uppercase font-bold tracking-[0.4em]">
          No narratives found in archive
        </div>
      )}
    </div>
  );
}