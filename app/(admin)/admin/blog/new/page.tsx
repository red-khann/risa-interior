'use client'
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link'; 
import { 
  ArrowLeft, Hash, Search, CheckCircle, AlertTriangle, 
  Send, Save, Camera, Link as LinkIcon, Sparkles, X, Loader2, ChevronDown 
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger'; // ✅ Integrated Logger

const PRESET_BLOG_CATEGORIES = ["Studio News", "Design Philosophy", "Material Spotlight", "Exhibition"];

export default function NewBlogForm({ initialData, isEdit }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [fetchedServices, setFetchedServices] = useState<any[]>([]);

  // 📝 Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    focusKeyword: initialData?.focus_keyword || '', 
    metaDescription: initialData?.meta_description || '',
    category: initialData?.category || 'Design Philosophy',
    heroAltText: initialData?.hero_alt_text || '',
    relatedService: initialData?.related_service || '',
    excerpt: initialData?.excerpt || ''
  });

  const [imageAsset, setImageAsset] = useState<{file?: File, preview: string} | null>(
    initialData?.image_url ? { preview: initialData.image_url } : null
  );

  // 🔄 Fetch Services for Linking
  useEffect(() => {
    async function getServices() {
      const { data } = await supabase.from('services').select('name').order('name', { ascending: true });
      if (data) setFetchedServices(data);
    }
    getServices();
  }, []);

  // 📊 Live Stats Calculation
  const stats = useMemo(() => {
    const words = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
    const characters = formData.content.length;
    return { words, characters };
  }, [formData.content]);
  
  const seoAudit = useMemo(() => {
    const slug = formData.title.toLowerCase().replaceAll(' ', '-').replace(/[^\w-]+/g, '');
    const keywordInTitle = formData.focusKeyword.length > 2 && 
      formData.title.toLowerCase().includes(formData.focusKeyword.toLowerCase());
    
    return {
      slug,
      isWordCountValid: stats.words >= 300,
      isKeywordValid: keywordInTitle,
      isMetaValid: formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160,
      hasAltText: formData.heroAltText.trim().length >= 10,
      isReady: formData.title.trim().length > 5 && imageAsset !== null
    };
  }, [formData, stats.words, imageAsset]);

  const uploadFile = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
    const json = await res.json();
    return json.secure_url;
  };

  const handleSubmit = async (targetStatus: string) => {
    setLoading(true);
    try {
      let finalImageUrl = imageAsset?.preview || '';
      if (imageAsset?.file) finalImageUrl = await uploadFile(imageAsset.file);

      const payload = {
        title: formData.title,
        slug: seoAudit.slug,
        excerpt: formData.excerpt || formData.content.slice(0, 150) + '...',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        category: formData.category,
        status: targetStatus.charAt(0).toUpperCase() + targetStatus.slice(1).toLowerCase(),
        image_url: finalImageUrl,
        hero_alt_text: formData.heroAltText,
        meta_description: formData.metaDescription,
        content: formData.content,
        related_service: formData.relatedService,
        focus_keyword: formData.focusKeyword 
      };

      const { error } = isEdit 
        ? await supabase.from('blog').update(payload).eq('id', initialData.id)
        : await supabase.from('blog').insert([payload]);

      if (error) throw error;

      // 🛡️ UNIVERSAL LOGGING: Records Narrative publication or update for the Dashboard feed
      await logActivity(isEdit ? 'UPDATE' : 'CREATE', formData.title, 'JOURNAL');

      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-20 animate-in fade-in duration-700">
      
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 py-4 px-8 text-zinc-800">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <NextLink href="/admin/blog" className="group flex items-center gap-3 transition-all">
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[#B89B5E] transition-all">
                <ArrowLeft size={14} className="group-hover:text-[#B89B5E] transition-colors" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400 group-hover:text-zinc-800 transition-colors">Journal Archive</span>
            </NextLink>
            <div className="hidden md:flex flex-col border-l border-zinc-200 pl-8">
              <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">Journalist Architect</span>
              <h1 className="text-xl font-bold tracking-tighter uppercase text-zinc-800">{isEdit ? 'Update Narrative' : 'New Narrative'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => handleSubmit('Draft')} disabled={loading} className="px-6 py-2 border border-zinc-200 text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all text-zinc-600 flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {isEdit ? 'Sync Draft' : 'Save Draft'}
             </button>
             <button disabled={!seoAudit.isReady || loading} onClick={() => handleSubmit('Active')} className={`px-6 py-2 text-[10px] uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${seoAudit.isReady ? 'bg-[#1C1C1C] text-white hover:bg-[#B89B5E]' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}>
                <Send size={14} /> {isEdit ? 'Sync Live' : 'Publish Post'}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <section className="bg-white p-12 border border-zinc-100 shadow-sm space-y-10">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-[0.4em] text-[#B89B5E]"><Sparkles size={12} /> Narrative Title</label>
              <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full text-5xl font-light tracking-tighter italic font-serif border-b border-zinc-100 py-6 outline-none focus:border-[#B89B5E] transition-all text-zinc-800" placeholder="The Alchemy of Light & Space..." />
            </div>

            <div className="space-y-6">
              <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={20} className="w-full text-lg leading-relaxed font-serif italic text-zinc-600 outline-none border-none resize-none" placeholder="Begin the design narrative..." />
              
              <div className="flex items-center justify-between border-t border-zinc-50 pt-6">
                 <div className="flex gap-10">
                    <div className="flex flex-col">
                       <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Words</span>
                       <span className="text-sm font-bold text-zinc-800 tabular-nums">{stats.words}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Characters</span>
                       <span className="text-sm font-bold text-zinc-800 tabular-nums">{stats.characters}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${stats.words >= 300 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-amber-400 animate-pulse'}`} />
                    <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest">
                        {stats.words >= 300 ? 'Narrative Verified' : 'Narrative Depth'}
                    </span>
                 </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 border border-zinc-100 space-y-8 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-900">Journal Cover</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-[16/9] bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-4 hover:border-[#B89B5E] transition-all cursor-pointer group overflow-hidden">
                {imageAsset ? (
                  <>
                    <img src={imageAsset.preview} className="absolute inset-0 w-full h-full object-cover" />
                    <button onClick={() => setImageAsset(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                  </>
                ) : (
                  <>
                    <Camera size={32} className="text-zinc-200 group-hover:text-[#B89B5E]" />
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Upload Cover</p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && setImageAsset({file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0])})} />
                  </>
                )}
              </div>
              <div className="space-y-4">
                <label className="text-[9px] uppercase font-bold tracking-widest text-[#B89B5E]">SEO Alt Text</label>
                <textarea value={formData.heroAltText} onChange={(e) => setFormData({...formData, heroAltText: e.target.value})} rows={4} placeholder="Describe this image..." className="w-full p-4 bg-zinc-50 border-none text-[11px] italic text-zinc-500 outline-none resize-none" />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 border border-zinc-100 shadow-sm space-y-8 text-zinc-800">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold text-zinc-400"><Hash size={14} /> Category</label>
              <div className="relative">
                <select value={PRESET_BLOG_CATEGORIES.includes(formData.category) ? formData.category : "Custom"} className="w-full p-4 bg-zinc-50 border-none text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer" onChange={(e) => {
                    const val = e.target.value;
                    setFormData({...formData, category: val === "Custom" ? "" : val});
                }}>
                  {PRESET_BLOG_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="Custom">Custom Category</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={14} />
              </div>
              {(!PRESET_BLOG_CATEGORIES.includes(formData.category) || formData.category === "") && (
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="NEW TAXONOMY..." className="w-full p-4 bg-zinc-50 border border-zinc-100 text-[10px] font-bold uppercase tracking-widest outline-none text-[#B89B5E] outline-none animate-in slide-in-from-top-2" />
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold text-zinc-400"><LinkIcon size={14} /> Service Linking</label>
              <div className="relative">
                <select value={formData.relatedService} className="w-full p-4 bg-zinc-50 border-none text-[10px] font-bold uppercase tracking-widest outline-none text-zinc-800 appearance-none cursor-pointer" onChange={(e) => setFormData({...formData, relatedService: e.target.value})}>
                  <option value="">None Selected</option>
                  {fetchedServices.map((service, idx) => (
                    <option key={idx} value={service.name}>{service.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          <div className="bg-black p-8 text-white space-y-8 shadow-2xl rounded-sm border-t-4 border-[#B89B5E]">
            <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-white flex items-center gap-2"><Search size={14} className="text-[#B89B5E]" /> SEO AUDIT</h3>
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${seoAudit.isReady ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-amber-500'}`} />
            </header>
            <div className="space-y-5">
              <input value={formData.focusKeyword} onChange={(e) => setFormData({...formData, focusKeyword: e.target.value})} placeholder="FOCUS KEYWORD" className="w-full bg-zinc-900 border border-zinc-800 p-4 text-[10px] font-bold tracking-widest text-[#B89B5E] outline-none" />
              <textarea value={formData.metaDescription} onChange={(e) => setFormData({...formData, metaDescription: e.target.value})} rows={3} placeholder="META DESCRIPTION" className="w-full bg-zinc-900 border border-zinc-800 p-4 text-[10px] font-bold tracking-widest text-white outline-none resize-none" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
