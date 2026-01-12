'use client'
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Globe, Search, AlertTriangle, CheckCircle, Plus, Camera, 
  Layout, Save, Send, Calendar, Star, Tag, ArrowLeft,
  ChevronDown, Trash2, Loader2, X, Hammer
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger'; // ✅ Integrated Logger

const PRESET_CATEGORIES = ["Residential", "Commercial", "Hospitality", "Interior", "Restoration"];

export default function CompleteSEOProjectForm({ initialData, isEdit }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    focusKeyword: initialData?.focus_keyword || '',
    metaDescription: initialData?.meta_description || '',
    city: initialData?.city || '',
    locality: initialData?.locality || '',
    state: initialData?.state || '',
    category: initialData?.category || 'Residential', 
    designStyle: initialData?.design_style || 'Modern Luxury',
    materials: initialData?.materials || '', 
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const [phase, setPhase] = useState(initialData?.phase || 'Completed'); 
  const [showTransformation, setShowTransformation] = useState(initialData?.show_transformation || false);
  const [coverIndex, setCoverIndex] = useState(0); 

  const [galleryItems, setGalleryItems] = useState<{file?: File, preview: string, alt: string}[]>(
    initialData?.gallery?.map((url: string, i: number) => ({
      preview: url,
      alt: initialData.gallery_alts?.[i] || ''
    })) || []
  );

  const [beforeAsset, setBeforeAsset] = useState<{file?: File, preview: string, alt: string} | null>(
    initialData?.transformation_before ? { preview: initialData.transformation_before, alt: initialData.before_alt || '' } : null
  );
  const [afterAsset, setAfterAsset] = useState<{file?: File, preview: string, alt: string} | null>(
    initialData?.transformation_after ? { preview: initialData.transformation_after, alt: initialData.after_alt || '' } : null
  );

  const seoAudit = useMemo(() => {
    const slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    return {
      slug,
      isReady: formData.title.length > 2 && galleryItems.length > 0 && formData.city !== ''
    };
  }, [formData, galleryItems]);

  const uploadFile = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
    const json = await res.json();
    return json.secure_url;
  };

  const handleDelete = async () => {
    setLoading(true);
    const itemName = initialData?.title;
    const { error } = await supabase.from('projects').delete().eq('id', initialData.id);
    
    if (!error) {
      // 🛡️ UNIVERSAL LOGGING: Records project deletion
      await logActivity('DELETE', itemName, 'PROJECT');
      router.push('/admin/projects');
    }
    setLoading(false);
  };

  const handleSubmit = async (statusArg: string) => {
    if (!seoAudit.isReady) return alert("Required: Title, City, and Gallery Image.");
    setLoading(true);
    try {
      const gUrls = await Promise.all(galleryItems.map(async item => {
        if (item.file) return await uploadFile(item.file);
        return item.preview;
      }));
      const gAlts = galleryItems.map(item => item.alt || formData.title);

      let bUrl = beforeAsset?.preview || '', aUrl = afterAsset?.preview || '';
      if (showTransformation) {
        if (beforeAsset?.file) bUrl = await uploadFile(beforeAsset.file);
        if (afterAsset?.file) aUrl = await uploadFile(afterAsset.file);
      }

      const payload = {
        title: formData.title,
        slug: seoAudit.slug,
        content: formData.content,
        focus_keyword: formData.focusKeyword,
        meta_description: formData.metaDescription,
        category: formData.category,
        city: formData.city,
        locality: formData.locality,
        state: formData.state,
        location: `${formData.locality}, ${formData.city}`,
        design_style: formData.designStyle,
        materials: formData.materials,
        date: formData.date,
        phase: phase,
        status: statusArg,
        image_url: gUrls[coverIndex] || gUrls[0],
        gallery: gUrls,
        gallery_alts: gAlts,
        show_transformation: showTransformation,
        transformation_before: bUrl,
        transformation_after: aUrl,
        before_alt: beforeAsset?.alt || '',
        after_alt: afterAsset?.alt || '',
        created_at: initialData?.created_at || new Date().toISOString()
      };

      const { error } = isEdit 
        ? await supabase.from('projects').update(payload).eq('id', initialData.id)
        : await supabase.from('projects').insert([payload]);

      if (error) throw error;

      // 🛡️ UNIVERSAL LOGGING: Syncs Narrative creation/update to the Dashboard
      await logActivity(isEdit ? 'UPDATE' : 'CREATE', formData.title, 'PROJECT');

      setShowSuccessModal(true);
    } catch (err: any) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-20 animate-in fade-in duration-700">
      
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-2">Narrative Updated</h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest leading-relaxed mb-8">The archive has been synced successfully.</p>
            <button onClick={() => router.push('/admin/projects')} className="w-full py-3 bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest hover:bg-[#B89B5E] transition-all">Go to Archive</button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-2">Delete Project?</h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest leading-relaxed mb-8">This action is permanent and cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-zinc-200 text-[9px] uppercase font-bold hover:bg-zinc-50 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white text-[9px] uppercase font-bold hover:bg-red-700 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 py-4 px-8">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
             <Link href="/admin/projects" className="group flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[#B89B5E] transition-all">
                   <ArrowLeft size={14} className="text-zinc-400 group-hover:text-[#B89B5E]" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400 group-hover:text-zinc-800">Archive</span>
             </Link>
             <div className="hidden md:flex flex-col border-l border-zinc-200 pl-8">
                <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">{isEdit ? 'Narrative Editor' : 'Project Drafter'}</span>
                <h1 className="text-xl font-bold tracking-tighter uppercase text-zinc-800">Command Center</h1>
             </div>
          </div>

          <div className="flex gap-4">
             {isEdit && (
               <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2 border border-red-100 text-red-400 text-[10px] uppercase font-bold hover:bg-red-50 transition-all flex items-center gap-2">
                 <Trash2 size={14} /> Remove
               </button>
             )}
             <button onClick={() => handleSubmit('Draft')} disabled={loading} className="px-6 py-2 border border-zinc-200 text-[10px] uppercase font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-2 transition-all">
               {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {isEdit ? 'Sync Draft' : 'Save Draft'}
             </button>
             <button onClick={() => handleSubmit('Active')} disabled={!seoAudit.isReady || loading} className={`px-6 py-2 text-[10px] uppercase font-bold transition-all flex items-center gap-2 ${seoAudit.isReady ? 'bg-[#1C1C1C] text-white hover:bg-[#B89B5E]' : 'bg-zinc-200 text-zinc-400'}`}>
               <Send size={14} /> {isEdit ? 'Sync Live' : 'Publish Live'}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          {/* Narrative Module */}
          <section className="bg-white p-12 border border-zinc-100 shadow-sm space-y-10">
            <div className="space-y-4">
              <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-[#B89B5E] flex items-center gap-2"><Sparkles size={12} /> Nomenclature</label>
              <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} type="text" placeholder="PROJECT NAME..." className="w-full bg-transparent border-b border-zinc-100 py-4 text-4xl font-light outline-none focus:border-[#B89B5E] text-zinc-800" />
            </div>
            <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={10} placeholder="Narrative..." className="w-full bg-zinc-50/50 p-10 text-base outline-none font-serif italic text-zinc-600 resize-none border-none" />
          </section>

          {/* Project Gallery Module */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-900">Gallery</h3>
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#B89B5E] cursor-pointer flex items-center gap-2">
                <Plus size={14} /> Add Media
                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => {
                  if(e.target.files) {
                    const files = Array.from(e.target.files).map(f => ({ file: f, preview: URL.createObjectURL(f), alt: '' }));
                    setGalleryItems(prev => [...prev, ...files]);
                  }
                }} />
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryItems.map((item, i) => (
                <div key={i} onClick={() => setCoverIndex(i)} className={`relative aspect-[4/5] bg-white border cursor-pointer group transition-all ${coverIndex === i ? 'border-[#B89B5E] ring-1 ring-[#B89B5E]' : 'border-zinc-100'}`}>
                    <div className={`absolute top-2 left-2 p-1 rounded-sm z-20 transition-all ${coverIndex === i ? 'bg-[#B89B5E] text-white' : 'bg-white/80 text-zinc-300 opacity-0 group-hover:opacity-100'}`}>
                      <Star size={10} fill={coverIndex === i ? "currentColor" : "none"} />
                    </div>
                    <img src={item.preview} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 border-t border-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <input type="text" placeholder="ALT TEXT..." className="w-full bg-transparent text-[8px] uppercase tracking-widest outline-none text-[#B89B5E] font-bold" value={item.alt} onClick={(e) => e.stopPropagation()} onChange={(e) => {
                          const newItems = [...galleryItems];
                          newItems[i].alt = e.target.value;
                          setGalleryItems(newItems);
                      }} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setGalleryItems(galleryItems.filter((_, idx) => idx !== i)); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 z-30"><X size={10} /></button>
                </div>
              ))}
              <label className="aspect-[4/5] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 group hover:bg-white cursor-pointer transition-all">
                <Camera size={20} className="text-zinc-200 group-hover:text-[#B89B5E]" />
                <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-300">Upload Frame</span>
                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => {
                  if(e.target.files) {
                    const files = Array.from(e.target.files).map(f => ({ file: f, preview: URL.createObjectURL(f), alt: '' }));
                    setGalleryItems(prev => [...prev, ...files]);
                  }
                }} />
              </label>
            </div>
          </section>

          {/* Transformation Module */}
          <section className="bg-white p-12 border border-zinc-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-[0.4em] text-[#B89B5E]"><Layout size={12} /> Transformation Module</label>
              <input type="checkbox" checked={showTransformation} onChange={() => setShowTransformation(!showTransformation)} className="w-4 h-4 accent-[#B89B5E] cursor-pointer" />
            </div>
            {showTransformation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-50 animate-in slide-in-from-top-4">
                <div className="space-y-4">
                   <div className="relative aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center group cursor-pointer">
                      {beforeAsset ? <img src={beforeAsset.preview} className="absolute inset-0 w-full h-full object-cover" /> : <Plus size={20} className="text-zinc-200" />}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && setBeforeAsset({file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0]), alt: ''})} />
                   </div>
                   <input value={beforeAsset?.alt || ''} type="text" placeholder="BEFORE ALT TEXT..." className="w-full bg-transparent border-b border-zinc-100 py-2 text-[9px] uppercase outline-none focus:border-[#B89B5E]" onChange={(e) => setBeforeAsset(prev => prev ? {...prev, alt: e.target.value} : { preview: '', alt: e.target.value })} />
                </div>
                <div className="space-y-4">
                   <div className="relative aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center group cursor-pointer">
                      {afterAsset ? <img src={afterAsset.preview} className="absolute inset-0 w-full h-full object-cover" /> : <Plus size={20} className="text-zinc-200" />}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && setAfterAsset({file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0]), alt: ''})} />
                   </div>
                   <input value={afterAsset?.alt || ''} type="text" placeholder="AFTER ALT TEXT..." className="w-full bg-transparent border-b border-zinc-100 py-2 text-[9px] uppercase outline-none focus:border-[#B89B5E]" onChange={(e) => setAfterAsset(prev => prev ? {...prev, alt: e.target.value} : { preview: '', alt: e.target.value })} />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-zinc-100 p-8 shadow-sm space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-[0.4em] text-zinc-400"><Tag size={12} /> Project Type</label>
              <div className="relative group">
                <select value={PRESET_CATEGORIES.includes(formData.category) ? formData.category : "Custom"} onChange={(e) => {
                     const val = e.target.value;
                     setFormData({...formData, category: val === "Custom" ? "" : val});
                }} className="w-full bg-zinc-50 border-none p-4 text-[10px] uppercase font-bold tracking-widest outline-none text-zinc-800 appearance-none cursor-pointer">
                  {PRESET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="Custom">Custom / Other</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
              {(!PRESET_CATEGORIES.includes(formData.category) || formData.category === "") && (
                <div className="pt-2 animate-in fade-in zoom-in-95">
                   <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="CUSTOM CATEGORY..." className="w-full p-4 bg-zinc-50 border border-zinc-100 text-[10px] font-bold uppercase tracking-widest outline-none text-[#B89B5E]" />
                </div>
              )}
            </div>
            <div className="space-y-4 pt-6 border-t border-zinc-50">
              <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-zinc-400 flex items-center gap-2"><Hammer size={12} /> Materials</label>
              <input value={formData.materials} type="text" onChange={(e) => setFormData({...formData, materials: e.target.value})} placeholder="BRASS, OAK..." className="w-full p-4 bg-zinc-50 border-none text-[10px] font-bold uppercase tracking-widest outline-none text-zinc-800" />
            </div>
          </div>
          
          <div className="bg-white border border-zinc-100 p-8 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-zinc-400 flex items-center gap-2"><Globe size={12} /> City</label>
              <input value={formData.city} type="text" onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="CITY..." className="w-full p-4 bg-zinc-50 text-[10px] font-bold uppercase outline-none" />
            </div>
            <div className="space-y-4 border-t border-zinc-50 pt-4">
               <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-zinc-400 flex items-center gap-2"><Calendar size={12} /> Date</label>
               <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-zinc-50 p-4 text-[10px] font-bold uppercase outline-none" />
            </div>
          </div>

          <div className="bg-white border border-zinc-100 p-8 shadow-sm space-y-6">
            <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-zinc-400">Phase</label>
            <div className="flex border border-zinc-100 p-1 bg-zinc-50">
              {['Under Development', 'Completed'].map((p) => (
                <button key={p} onClick={() => setPhase(p)} className={`flex-1 py-3 text-[9px] uppercase font-bold transition-all ${phase === p ? 'bg-white text-black shadow-sm' : 'text-zinc-400'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div className="bg-black p-8 text-white space-y-8 shadow-2xl border-t-4 border-[#B89B5E]">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold flex items-center gap-2"><Search size={14} className="text-[#B89B5E]" /> SEO COMMAND</h3>
            <div className="space-y-5">
              <input value={formData.focusKeyword} onChange={(e) => setFormData({...formData, focusKeyword: e.target.value})} placeholder="KEYWORD..." className="w-full bg-zinc-900 border border-zinc-800 p-4 text-[10px] font-bold tracking-widest text-[#B89B5E] outline-none" />
              <textarea value={formData.metaDescription} onChange={(e) => setFormData({...formData, metaDescription: e.target.value})} rows={3} placeholder="DESCRIPTION..." className="w-full bg-zinc-900 border border-zinc-800 p-4 text-[10px] font-bold tracking-widest text-white outline-none" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}