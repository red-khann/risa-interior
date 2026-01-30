'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link'; 
import { 
  ArrowLeft, Hash, Search, CheckCircle, AlertTriangle, 
  Send, Save, Camera, Link as LinkIcon, Sparkles, X, Loader2, ChevronDown 
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger';

const PRESET_BLOG_CATEGORIES = ["Studio News", "Design Philosophy", "Material Spotlight", "Exhibition"];

export default function NewBlogForm({ initialData, isEdit }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [fetchedServices, setFetchedServices] = useState<any[]>([]);

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

  const deleteFromCloudinary = async (url: string) => {
    try {
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };

  useEffect(() => {
    async function getServices() {
      const { data } = await supabase.from('services').select('name').order('name', { ascending: true });
      if (data) setFetchedServices(data);
    }
    getServices();
  }, []);

  const stats = useMemo(() => {
    const words = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
    const characters = formData.content.length;
    return { words, characters };
  }, [formData.content]);
  
  const seoAudit = useMemo(() => {
    // 🎯 Logic: Enhanced slug generation
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
      
      if (imageAsset?.file) {
        if (isEdit && initialData?.image_url) {
          await deleteFromCloudinary(initialData.image_url);
        }
        finalImageUrl = await uploadFile(imageAsset.file);
      } 
      else if (isEdit && !imageAsset && initialData?.image_url) {
        await deleteFromCloudinary(initialData.image_url);
        finalImageUrl = '';
      }

      const payload = {
        title: formData.title,
        slug: seoAudit.slug,
        excerpt: formData.excerpt || formData.content.slice(0, 150) + '...',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        category: formData.category,
        status: targetStatus === 'Active' ? 'Active' : 'Draft',
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

      await logActivity(isEdit ? 'UPDATE' : 'CREATE', formData.title, 'JOURNAL');
      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] pb-20 animate-in fade-in duration-700">
      
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 py-4 px-8 text-zinc-800">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <NextLink href="/admin/blog" className="group flex items-center gap-3 transition-all">
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[var(--accent-gold)] transition-all">
                <ArrowLeft size={14} className="group-hover:text-[var(--accent-gold)] transition-colors" />
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
              {/* 🎯 Branding: Button background Rich Black & Green hover */}
              <button disabled={!seoAudit.isReady || loading} onClick={() => handleSubmit('Active')} className={`px-6 py-2 text-[10px] uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${seoAudit.isReady ? 'bg-[var(--text-primary)] text-white hover:bg-[var(--accent-gold)]' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}>
                <Send size={14} /> {isEdit ? 'Sync Live' : 'Publish Post'}
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <section className="bg-white p-12 border border-zinc-100 shadow-sm space-y-10">
            <div className="space-y-4">
              {/* 🎯 Branding: Green accent */}
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-[0.4em] text-[var(--accent-gold)]"><Sparkles size={12} /> Narrative Title</label>
              <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full text-5xl font-light tracking-tighter italic font-serif border-b border-zinc-100 py-6 outline-none focus:border-[var(--accent-gold)] transition-all text-zinc-800" placeholder="The Alchemy of Light & Space..." />
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
              <div className="relative aspect-[16/9] bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-4 hover:border-[var(--accent-gold)] transition-all cursor-pointer group overflow-hidden">
                {imageAsset ? (
                  <>
                    <img src={imageAsset.preview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setImageAsset(null)} 
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={14}/>
                    </button>
                  </>
                ) : (
                  <>
                    <Camera size={32} className="text-zinc-200 group-hover:text-[var(--accent-gold)]" />
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Upload Cover</p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && setImageAsset({file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0])})} />
                  </>
                )}
              </div>
              <div className="space-y-4">
                <label className="text-[9px] uppercase font-bold tracking-widest text-[var(--accent-gold)]">SEO Alt Text</label>
                {/* 🎯 Table Field: hero_alt_text utilized */}
                <textarea value={formData.heroAltText} onChange={(e) => setFormData({...formData, heroAltText: e.target.value})} rows={4} placeholder="Describe this image for Google Indexing..." className="w-full p-4 bg-zinc-50 border-none text-[11px] italic text-zinc-500 outline-none resize-none focus:ring-1 focus:ring-[var(--accent-gold)]" />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 border border-zinc-100 shadow-sm space-y-8 text-zinc-800">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold text-zinc-400"><Hash size={14} /> Category</label>
              <div className="relative">
                <select value={PRESET_BLOG_CATEGORIES.includes(formData.category) ? formData.category : "Custom"} className="w-full p-4 bg-zinc-50 border-none text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[var(--accent-gold)]" onChange={(e) => {
                    const val = e.target.value;
                    setFormData({...formData, category: val === "Custom" ? "" : val});
                }}>
                  {PRESET_BLOG_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="Custom">Custom Category</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={14} />
              </div>
              {(!PRESET_BLOG_CATEGORIES.includes(formData.category) || formData.category === "") && (
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="NEW TAXONOMY..." className="w-full p-4 bg-zinc-50 border border-zinc-100 text-[10px] font-bold uppercase tracking-widest outline-none text-[var(--accent-gold)] animate-in slide-in-from-top-2" />
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold text-zinc-400"><LinkIcon size={14} /> Service Linking</label>
              <div className="relative">
                {/* 🎯 Table Field: related_service utilized */}
                <select value={formData.relatedService} className="w-full p-4 bg-zinc-50 border-none text-[10px] font-bold uppercase tracking-widest outline-none text-zinc-800 appearance-none cursor-pointer focus:ring-1 focus:ring-[var(--accent-gold)]" onChange={(e) => setFormData({...formData, relatedService: e.target.value})}>
                  <option value="">None Selected</option>
                  {fetchedServices.map((service, idx) => (
                    <option key={idx} value={service.name}>{service.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          {/* 🎯 Branding: SEO box anchored in Rich Black */}
          <div className="bg-[var(--text-primary)] p-8 text-white space-y-8 shadow-2xl rounded-sm border-t-4 border-[var(--accent-gold)]">
            <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
              {/* 🎯 Contrast: Label updated to high-contrast Champagne Gold */}
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--accent-light)] flex items-center gap-2">
                <Search size={14} /> Seo Audit
              </h3>
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${seoAudit.isReady ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-amber-500'}`} />
            </header>
            <div className="space-y-5">
              {/* 🎯 Table Field: focus_keyword utilized with Champagne Gold text */}
              <input value={formData.focusKeyword} onChange={(e) => setFormData({...formData, focusKeyword: e.target.value})} placeholder="FOCUS KEYWORD" className="w-full bg-zinc-900 border border-zinc-800 p-4 text-[10px] font-bold tracking-widest text-[var(--accent-light)] outline-none focus:border-[var(--accent-gold)]" />
              {/* 🎯 Table Field: meta_description utilized */}
              <textarea value={formData.metaDescription} onChange={(e) => setFormData({...formData, metaDescription: e.target.value})} rows={3} placeholder="META DESCRIPTION (120-160 chars)" className="w-full bg-zinc-900 border border-zinc-800 p-4 text-[10px] font-bold tracking-widest text-white outline-none resize-none focus:border-[var(--accent-gold)]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}