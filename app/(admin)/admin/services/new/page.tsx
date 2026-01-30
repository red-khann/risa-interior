'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Search, AlertTriangle, CheckCircle, 
  Camera, Save, Send, Layers, Target, ArrowLeft, Loader2, X, ChevronDown, MapPin
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { logActivity } from '@/utils/supabase/logger';

const PRESET_TYPES = ["Residential Architecture", "Commercial Design", "Spatial Consulting", "Turnkey Interior Solutions"];
const GEO_REACH_OPTIONS = ["Bareilly", "Uttar Pradesh (UP)", "All Over India", "Globally"];

export default function NewServiceForm({ initialData, isEdit }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    focusKeyword: initialData?.focus_keyword || '', 
    metaDescription: initialData?.meta_description || '',
    serviceType: initialData?.service_type || 'Residential Architecture',
    startingPrice: initialData?.starting_price || '',
    heroAltText: initialData?.hero_alt_text || '',
    availability: initialData?.availability || 'Bareilly' 
  });

  const [imageAsset, setImageAsset] = useState<{file?: File, preview: string} | null>(
    initialData?.image_url ? { preview: initialData.image_url } : null
  );

  const deleteFromCloudinary = async (url: string) => {
    if (!url || !url.includes('cloudinary')) return;
    try {
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });
    } catch (err) {
      console.error("Cloudinary cleanup failed:", err);
    }
  };

  const seoAudit = useMemo(() => {
    const wordCount = formData.description.split(/\s+/).filter(Boolean).length;
    const hasKeywordInTitle = formData.name.toLowerCase().includes(formData.focusKeyword.toLowerCase());
    const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    return {
      wordCount,
      slug,
      isWordCountValid: wordCount >= 300,
      isKeywordInTitle: formData.focusKeyword !== '' && hasKeywordInTitle,
      isMetaValid: formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160,
      hasAltText: formData.heroAltText.trim().length >= 10,
      isReady: formData.name.trim().length > 2 && imageAsset !== null
    };
  }, [formData, imageAsset]);

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
        name: formData.name,
        slug: seoAudit.slug,
        service_type: formData.serviceType,
        starting_price: formData.startingPrice,
        description: formData.description,
        meta_description: formData.metaDescription,
        focus_keyword: formData.focusKeyword,
        hero_alt_text: formData.heroAltText,
        image_url: finalImageUrl,
        availability: formData.availability,
        status: targetStatus === 'Active' ? 'Active' : 'Draft'
      };

      const { error } = isEdit 
        ? await supabase.from('services').update(payload).eq('id', initialData.id)
        : await supabase.from('services').insert([payload]);

      if (error) throw error;

      await logActivity(isEdit ? 'UPDATE' : 'CREATE', formData.name, 'SERVICE');
      router.push('/admin/services');
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] pb-20 animate-in fade-in duration-700">
      
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 py-4 px-8">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-8">
            <Link href="/admin/services" className="group flex items-center gap-3 transition-all">
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[var(--accent-gold)]">
                <ArrowLeft size={14} className="text-zinc-400 group-hover:text-[var(--accent-gold)]" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400 group-hover:text-zinc-800">Archive</span>
            </Link>

            <div className="hidden md:flex flex-col border-l border-zinc-200 pl-8">
              <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">Command Center</span>
              <h1 className="text-xl font-bold tracking-tighter uppercase text-zinc-800">
                {isEdit ? 'Update Expertise' : 'New Offering'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
              <button onClick={() => handleSubmit('Draft')} disabled={loading} className="px-6 py-2 border border-zinc-200 text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all text-zinc-600 flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
                {isEdit ? 'Sync Draft' : 'Save Draft'}
              </button>
              {/* 🎯 Branding: Button background Rich Black & Green hover */}
              <button 
                onClick={() => handleSubmit('Active')} 
                disabled={!seoAudit.isReady || loading} 
                className={`px-6 py-2 text-[10px] uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${seoAudit.isReady ? 'bg-[var(--text-primary)] text-white hover:bg-[var(--accent-gold)]' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
              >
                <Send size={14} /> 
                {isEdit ? 'Sync Live' : 'Publish Service'}
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        <div className="lg:col-span-8 space-y-12">
          {/* Narrative Module */}
          <section className="bg-white p-12 border border-zinc-100 shadow-sm space-y-10">
            <div className="space-y-4">
              {/* 🎯 Branding: Green accent */}
              <label className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-[0.4em] text-[var(--accent-gold)]">
                <Target size={12} /> Service Designation
              </label>
              <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" placeholder="SERVICE TITLE..." className="w-full bg-transparent border-b border-zinc-100 py-4 text-4xl font-light outline-none focus:border-[var(--accent-gold)] text-zinc-800" />
            </div>
            <div className="space-y-4">
              <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-zinc-400">Detailed Narrative</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={12} placeholder="Detail your studio's methodology..." className="w-full bg-zinc-50/50 p-10 text-base leading-relaxed outline-none font-serif italic text-zinc-600 resize-none border-none" />
            </div>
          </section>

          {/* Media Module */}
          <section className="bg-white p-8 border border-zinc-100 shadow-sm space-y-8">
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-900">Hero Representation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-4 hover:border-[var(--accent-gold)] transition-all cursor-pointer group overflow-hidden">
                {imageAsset ? (
                  <>
                    <img src={imageAsset.preview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                    <button type="button" onClick={() => setImageAsset(null)} className="absolute top-2 right-2 bg-black text-white p-1 rounded-full z-10 hover:bg-red-600 transition-colors"><X size={12}/></button>
                  </>
                ) : (
                  <>
                    <Camera size={24} className="text-zinc-200 group-hover:text-[var(--accent-gold)] transition-colors" />
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && setImageAsset({file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0])})} />
                  </>
                )}
              </div>
              <div className="space-y-4">
                <label className="text-[9px] uppercase font-bold tracking-widest text-[var(--accent-gold)]">SEO Alt Text</label>
                {/* 🎯 Branding: Focus ring uses Green */}
                <textarea value={formData.heroAltText} onChange={(e) => setFormData({...formData, heroAltText: e.target.value})} rows={4} placeholder="Describe this image for Google Indexing..." className="w-full p-4 bg-zinc-50 border-none text-[11px] italic text-zinc-500 outline-none resize-none focus:ring-1 focus:ring-[var(--accent-gold)]" />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-zinc-100 p-8 shadow-sm space-y-8">
            <div className="space-y-4">
                <label className="flex items-center gap-2 text-[9px] uppercase font-bold text-zinc-400"><Layers size={14} /> Category</label>
                <div className="relative">
                  <select value={PRESET_TYPES.includes(formData.serviceType) ? formData.serviceType : "Custom"} onChange={(e) => {
                       const val = e.target.value;
                       setFormData({...formData, serviceType: val === "Custom" ? "" : val});
                  }} className="w-full p-4 bg-zinc-50 border-none text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[var(--accent-gold)]">
                    {PRESET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    <option value="Custom">Custom Expertise</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={14} />
                </div>
                {(!PRESET_TYPES.includes(formData.serviceType) || formData.serviceType === "") && (
                  <input type="text" value={formData.serviceType} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} placeholder="DEFINE CATEGORY..." className="w-full p-4 bg-zinc-50 border border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)] outline-none animate-in slide-in-from-top-2" />
                )}
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-50">
                <label className="flex items-center gap-2 text-[9px] uppercase font-bold text-zinc-400"><MapPin size={14} /> Geographic Reach</label>
                <div className="relative">
                  <select value={GEO_REACH_OPTIONS.includes(formData.availability) ? formData.availability : "Custom"} onChange={(e) => {
                       const val = e.target.value;
                       setFormData({...formData, availability: val === "Custom" ? "" : val});
                  }} className="w-full p-4 bg-zinc-50 border-none text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[var(--accent-gold)]">
                    {GEO_REACH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="Custom">Custom Region</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={14} />
                </div>
                {(!GEO_REACH_OPTIONS.includes(formData.availability) || formData.availability === "") && (
                  <input type="text" value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} placeholder="E.G. PAN INDIA" className="w-full p-4 mt-2 bg-zinc-50 border border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)] outline-none animate-in slide-in-from-top-2" />
                )}
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-50">
                <label className="text-[9px] uppercase font-bold text-zinc-400">Starting Price</label>
                <input value={formData.startingPrice} onChange={(e) => setFormData({...formData, startingPrice: e.target.value})} placeholder="₹" className="w-full p-4 bg-zinc-50 border-none text-[10px] font-bold outline-none focus:ring-1 focus:ring-[var(--accent-gold)]" />
            </div>
          </div>

          {/* 🎯 Branding: SEO Module in Rich Black with Champagne accents */}
          <div className="bg-[var(--text-primary)] p-8 text-white space-y-8 shadow-2xl border-t-4 border-[var(--accent-gold)]">
            <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
              {/* 🎯 Contrast: Label updated to high-contrast Champagne Gold */}
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--accent-light)] flex items-center gap-2">
                <Search size={14} /> Search Safeguard
              </h3>
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${seoAudit.isReady ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-amber-500 animate-pulse'}`} />
            </header>
            <div className="space-y-4">
              <input value={formData.focusKeyword} onChange={(e) => setFormData({...formData, focusKeyword: e.target.value})} placeholder="FOCUS KEYWORD" className="w-full bg-zinc-900 border-none p-4 text-[10px] font-bold tracking-widest text-[var(--accent-light)] outline-none focus:border-[var(--accent-gold)]" />
              <textarea value={formData.metaDescription} onChange={(e) => setFormData({...formData, metaDescription: e.target.value})} rows={3} placeholder="META DESCRIPTION (120-160 chars)" className="w-full bg-zinc-900 border-none p-4 text-[10px] font-bold tracking-widest text-zinc-400 outline-none resize-none focus:border-[var(--accent-gold)]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}