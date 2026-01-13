'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { logActivity } from '@/utils/supabase/logger'
import CldUpload from '@/components/admin/CldUpload'
import { 
  Send, Loader2, AlertTriangle, ChevronDown, CheckCircle2,
  Monitor, Smartphone, Globe, Layout, Layers, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react'

export default function ProfessionalVisualCMS() {
  const supabase = createClient()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const [content, setContent] = useState<any[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({}) 
  const [originalContent, setOriginalContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('/') 
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [editGroup, setEditGroup] = useState<'page' | 'protocol' | 'global'>('page')
  
  const [isPublishing, setIsPublishing] = useState(false)
  const [showNavWarning, setShowNavWarning] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false) 
  const [pendingTab, setPendingTab] = useState<string | null>(null)

  useEffect(() => { fetchContent() }, [])

  const pageKeyMap: Record<string, string> = {
    '/': 'home',
    '/about': 'about',
    '/contact': 'contact',
    '/projects': 'projects_page',
    '/projects/[slug]': 'project_detail_global',
    '/services': 'services_page',
    '/services/[slug]': 'service_detail_global',
    '/blog': 'blog_page',
    '/blog/[slug]': 'blog_detail_global'
  };

  // 🔄 UPDATED: Helper to call our Cloudinary Janitor API
  const deleteFromCloudinary = async (url: string) => {
    if (!url || !url.includes('cloudinary')) return;
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
    if (iframeRef.current?.contentWindow) {
      content.forEach(item => {
        const draftValue = drafts[item.id];
        const compositeKey = `${item.page_key}:${item.section_key}`;

        iframeRef.current?.contentWindow?.postMessage({ 
          type: 'CMS_UPDATE', 
          key: compositeKey, 
          value: draftValue 
        }, window.location.origin);
      });
    }
  }, [drafts, content]); 

  async function fetchContent() {
    const { data } = await supabase.from('site_content').select('*').order('section_key')
    if (data) {
      setContent(data)
      const values: Record<string, string> = {}
      data.forEach(item => { values[item.id] = item.content_value || "" })
      setDrafts(values); setOriginalContent(values)
    }
    setLoading(false)
  }

  const sortItemsByAppearance = (items: any[]) => {
    const priority = ['brand', 'hero', 'title', 'subtitle', 'header', 'description', 'essence', 'narrative', 'gallery', 'cta', 'button', 'footer', 'ig_url', 'fb_url'];
    return [...items].sort((a, b) => {
      const aIndex = priority.findIndex(p => a.section_key.toLowerCase().includes(p));
      const bIndex = priority.findIndex(p => b.section_key.toLowerCase().includes(p));
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true)

    // 🔄 UPDATED: Identify old images that are being replaced to clean Cloudinary
    const replacedImages = content.filter(item => {
      const isImage = item.section_key.toLowerCase().includes('image') || item.section_key.toLowerCase().includes('logo');
      const hasChanged = drafts[item.id] !== originalContent[item.id];
      return isImage && hasChanged && originalContent[item.id];
    });

    // Delete replaced images from Cloudinary
    await Promise.all(replacedImages.map(item => deleteFromCloudinary(originalContent[item.id])));

    const updates = content.map(item => ({
      id: item.id,
      page_key: item.page_key,
      section_key: item.section_key,
      content_value: drafts[item.id]
    }))
    
    const { error } = await supabase.from('site_content').upsert(updates)
    if (!error) {
      await logActivity('UPDATE', `Published visual changes`, 'CONTENT')
      setOriginalContent(drafts)
      setShowSuccessPopup(true) 
      setTimeout(() => setShowSuccessPopup(false), 3000) 
    }
    setIsPublishing(false)
  }

  const filteredItems = sortItemsByAppearance(content.filter(c => {
    if (editGroup === 'global') return c.page_key === 'global';
    return c.page_key === pageKeyMap[activeTab];
  }));

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#F7F5F2]"><Loader2 className="animate-spin text-[#B89B5E]" /></div>

  return (
    <div className="flex h-[calc(100vh-140px)] -m-10 overflow-hidden bg-[#F7F5F2]">
      
      {/* ⬅️ LEFT: CMS EDITOR PANE */}
      <div className="w-[450px] border-r border-zinc-200 flex flex-col bg-white shadow-sm z-20">
        <div className="p-8 border-b border-zinc-200">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#B89B5E]">Content Engine</h2>
              <p className="text-[9px] text-zinc-400 uppercase mt-1 tracking-widest font-bold">Refining the narrative</p>
            </div>
            <button 
              onClick={handlePublish}
              disabled={JSON.stringify(drafts) === JSON.stringify(originalContent) || isPublishing}
              className={`px-8 py-3 rounded-full text-[10px] uppercase font-bold tracking-[0.3em] transition-all flex items-center gap-2 shadow-2xl active:scale-95 ${
                JSON.stringify(drafts) !== JSON.stringify(originalContent) ? 'bg-[#1C1C1C] text-white hover:bg-[#B89B5E]' : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
              Publish
            </button>
          </div>

          <div className="flex gap-1 bg-zinc-50 p-1 rounded-sm mb-6 border border-zinc-100">
            <button onClick={() => { setEditGroup('page'); setActiveTab('/') }} className={`flex-1 py-3 text-[8px] uppercase font-black tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 ${editGroup === 'page' ? 'bg-white shadow-md text-[#B89B5E]' : 'text-zinc-400'}`}><Layout size={12} /> Page</button>
            <button onClick={() => { setEditGroup('protocol'); setActiveTab('/projects/[slug]') }} className={`flex-1 py-3 text-[8px] uppercase font-black tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 ${editGroup === 'protocol' ? 'bg-white shadow-md text-[#B89B5E]' : 'text-zinc-400'}`}><Layers size={12} /> Detail</button>
            <button onClick={() => setEditGroup('global')} className={`flex-1 py-3 text-[8px] uppercase font-black tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 ${editGroup === 'global' ? 'bg-white shadow-md text-[#B89B5E]' : 'text-zinc-400'}`}><Globe size={12} /> Global</button>
          </div>

          {editGroup !== 'global' && (
            <div className="relative">
              <select 
                value={activeTab}
                onChange={(e) => {
                  const val = e.target.value
                  if (JSON.stringify(drafts) !== JSON.stringify(originalContent)) { setPendingTab(val); setShowNavWarning(true) }
                  else { setActiveTab(val) }
                }}
                className="w-full appearance-none bg-zinc-50 border border-zinc-200 p-4 rounded-sm text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
              >
                {editGroup === 'page' ? (
                  <>
                    <option value="/">Home Page</option>
                    <option value="/about">About Studio</option>
                    <option value="/projects">Portfolio Archive</option>
                    <option value="/services">Services Archive</option>
                    <option value="/blog">Journal Archive</option>
                    <option value="/contact">Contact Page</option>
                  </>
                ) : (
                  <>
                    <option value="/projects/[slug]">Project Detail Protocol</option>
                    <option value="/services/[slug]">Service Detail Protocol</option>
                    <option value="/blog/[slug]">Journal Detail Protocol</option>
                  </>
                )}
              </select>
              <ChevronDown className="absolute right-4 bottom-4 text-zinc-400" size={16} />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 selection:bg-[#B89B5E]/30">
          {filteredItems.map(item => {
            const isUrl = item.section_key.toLowerCase().includes('url') && !item.section_key.toLowerCase().includes('image');
            const isImage = item.section_key.toLowerCase().includes('image') || item.section_key.toLowerCase().includes('logo');
            
            return (
              <div key={item.id} className="group animate-in fade-in slide-in-from-left-2">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-[9px] uppercase tracking-[0.4em] font-black text-zinc-400 italic group-hover:text-[#B89B5E] transition-colors">
                    {item.section_key.replace(/_/g, ' ')}
                    </label>
                    {isImage && <ImageIcon size={12} className="text-zinc-300" />}
                    {isUrl && <LinkIcon size={12} className="text-zinc-300" />}
                </div>

                {isImage ? (
                  <div className="space-y-4">
                    {drafts[item.id] && (
                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 rounded-sm border border-zinc-200">
                            <img 
                                src={drafts[item.id]} 
                                alt="Preview" 
                                className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                            />
                            <div className="absolute inset-0 bg-black/10" />
                        </div>
                    )}
                    <div className="p-4 bg-zinc-50 border border-zinc-100 border-dashed rounded-sm hover:border-[#B89B5E]/50 transition-colors">
                      {/* 🔄 UPDATED: CldUpload handleRemove is already built-in via Step 2, ensuring temp uploads are cleaned if 'X' is clicked */}
                      <CldUpload onUploadSuccess={(url) => setDrafts(prev => ({ ...prev, [item.id]: url }))} />
                    </div>
                  </div>
                ) : isUrl ? (
                    <input 
                      type="text"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-sm text-xs font-mono outline-none focus:bg-white focus:border-[#B89B5E] transition-all"
                      value={drafts[item.id]}
                      placeholder="https://..."
                      onChange={(e) => setDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                    />
                ) : (
                  <textarea 
                    className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-sm text-sm font-light leading-relaxed outline-none focus:bg-white focus:border-[#B89B5E] focus:shadow-inner h-32 resize-none transition-all scrollbar-hide"
                    value={drafts[item.id]}
                    onChange={(e) => setDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ➡️ RIGHT: PREVIEW CANVAS */}
      <div className="flex-1 bg-[#F7F5F2] p-12 flex flex-col items-center">
        <div className="bg-white p-1 rounded-full shadow-2xl flex border border-zinc-100 mb-10">
          <button onClick={() => setViewMode('desktop')} className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest ${viewMode === 'desktop' ? 'bg-[#1C1C1C] text-white' : 'text-zinc-400 hover:text-zinc-900'}`}><Monitor size={14} /> Desktop</button>
          <button onClick={() => setViewMode('mobile')} className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest ${viewMode === 'mobile' ? 'bg-[#1C1C1C] text-white' : 'text-zinc-400 hover:text-zinc-900'}`}><Smartphone size={14} /> Mobile</button>
        </div>

        <div className={`transition-all duration-1000 bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden flex-1 ${
          viewMode === 'mobile' ? 'w-[375px] rounded-[3.5rem] border-[14px] border-zinc-900 ring-4 ring-zinc-800' : 'w-full max-w-6xl rounded-lg'
        }`}>
          <iframe 
            ref={iframeRef}
            src={
              activeTab === '/services/[slug]' ? '/services/interior-architecture' : 
              activeTab === '/projects/[slug]' ? '/projects/skyte' : 
              activeTab === '/blog/[slug]' ? '/blog/5-trends-in-modern-minimalist-design-for-2026' : 
              activeTab
            } 
            className="w-full h-full border-none"
            title="Visual Preview"
          />
          <div className="absolute inset-0 pointer-events-none" />
        </div>
      </div>

      {/* 🚨 NAVIGATION GUARD */}
      {showNavWarning && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1C1C1C]/40 backdrop-blur-sm p-6">
          <div className="bg-[#F7F5F2] max-w-sm w-full p-12 text-center shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white animate-in zoom-in-95 duration-500">
            <AlertTriangle className="mx-auto text-[#B89B5E] mb-8" size={32} />
            <h3 className="text-[11px] uppercase tracking-[0.5em] font-black text-zinc-900 mb-4 italic">Unsaved Evolution</h3>
            <p className="text-zinc-500 text-[11px] leading-loose tracking-widest mb-10 font-bold opacity-70">The current vision has not been chronicled. Discard these edits to transition?</p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={async () => { 
                  // 🔄 UPDATED: Identify draft images that were uploaded but now discarded
                  const discardedImages = content.filter(item => {
                    const isImage = item.section_key.toLowerCase().includes('image') || item.section_key.toLowerCase().includes('logo');
                    const isNewUpload = drafts[item.id] !== originalContent[item.id];
                    return isImage && isNewUpload && drafts[item.id];
                  });
                  // Clean up discarded Cloudinary uploads
                  await Promise.all(discardedImages.map(item => deleteFromCloudinary(drafts[item.id])));

                  setDrafts(originalContent); 
                  setActiveTab(pendingTab!); 
                  setShowNavWarning(false) 
                }} 
                className="w-full py-5 bg-[#1C1C1C] text-white text-[9px] uppercase font-black tracking-[0.4em] shadow-xl hover:bg-red-900 transition-colors"
              >
                Discard & Transition
              </button>
              <button onClick={() => setShowNavWarning(false)} className="w-full py-5 bg-white border border-zinc-200 text-zinc-400 text-[9px] uppercase font-black tracking-[0.4em] hover:text-zinc-900 transition-colors">Return to Editor</button>
            </div>
          </div>
        </div>
      )}

      {/* 🏛️ SUCCESS PUBLISH MODAL */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-[#1C1C1C]/40 backdrop-blur-sm p-6">
          <div className="bg-[#F7F5F2] max-w-sm w-full p-12 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white animate-in zoom-in-95 fade-in duration-500">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <CheckCircle2 className="text-[#B89B5E]" size={40} />
            </div>
            <h3 className="text-[11px] uppercase tracking-[0.5em] font-black text-zinc-900 mb-4 italic">Vision Chronicled</h3>
            <p className="text-zinc-500 text-[10px] leading-loose tracking-[0.2em] mb-10 font-bold opacity-70 uppercase">Your narrative has been successfully synchronized with the live environment.</p>
            <button 
              onClick={() => setShowSuccessPopup(false)} 
              className="w-full py-5 bg-[#B89B5E] text-white text-[9px] uppercase font-black tracking-[0.4em] shadow-xl hover:bg-[#1C1C1C] transition-all duration-500"
            >
              Continue Refinement
            </button>
          </div>
        </div>
      )}
    </div>
  )
}