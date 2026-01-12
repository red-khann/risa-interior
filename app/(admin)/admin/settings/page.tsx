'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  User, Camera, Save, Loader2, 
  CheckCircle, AlertTriangle, RefreshCcw 
} from 'lucide-react'

export default function AccountSettings() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '' })
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null)

  // 1. 📡 INITIAL LOAD: Fetch existing identity
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile({ 
            full_name: data.full_name || '', 
            avatar_url: data.avatar_url || '' 
          })
        }
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  // 2. 🖼️ MEDIA HANDLER: Cloudinary Sync
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUpdating(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, 
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      
      if (data.secure_url) {
        setProfile(prev => ({ ...prev, avatar_url: data.secure_url }))
        setStatus({ type: 'success', msg: 'Media stage updated.' })
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Cloudinary protocol failed.' })
    } finally { 
      setUpdating(false) 
    }
  }

  // 3. 💾 IDENTITY HANDLER: The "Force-Save" Logic
  const updateProfile = async () => {
    setUpdating(true)
    setStatus(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No active session found.")

      // 🛡️ STEP 1: Attempt Upsert (Update or Insert)
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // THE CRITICAL KEY
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id' // Explicitly handle the ID conflict
        })

      // 🛡️ STEP 2: Fallback to manual Update if Upsert is blocked by RLS
      if (upsertError) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) throw updateError
      }

      setStatus({ type: 'success', msg: 'Identity Deployed Successfully' })
      
      // Refresh the page data to ensure sidebar/header update
      window.location.reload() 
      
    } catch (err: any) {
      console.error("Sync Error:", err)
      setStatus({ 
        type: 'error', 
        msg: 'Sync Error: ' + (err.message || 'Check Database Policies') 
      })
    } finally { 
      setUpdating(false) 
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
       <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
       <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">Synchronizing Identity</span>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto p-12 bg-white mt-10 border border-zinc-100 shadow-sm animate-in fade-in duration-500">
      <header className="mb-12 border-b border-zinc-100 pb-8">
        <h1 className="text-[10px] uppercase tracking-[0.5em] text-[#B89B5E] font-bold mb-2">Protocol 01</h1>
        <p className="text-2xl font-bold tracking-tighter text-zinc-900">Admin Identity</p>
      </header>

      <div className="space-y-10">
        {/* AVATAR UPLOAD */}
        <div className="flex items-center gap-8">
          <div className="relative group w-24 h-24">
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-50 border border-zinc-200 ring-4 ring-zinc-50">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-zinc-200"/></div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full backdrop-blur-[2px]">
              <Camera size={20} className="text-white" />
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
            </label>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 mb-1">Architectural Avatar</p>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">Personalize your signature across the <br/> studio management logs.</p>
          </div>
        </div>

        {/* IDENTITY INPUT */}
        <div className="space-y-2 text-left">
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Official Profile Name</label>
          <input 
            type="text" 
            value={profile.full_name}
            onChange={(e) => setProfile({...profile, full_name: e.target.value})}
            className="w-full border-b border-zinc-100 py-4 outline-none focus:border-[#B89B5E] text-base font-bold text-zinc-900 transition-all placeholder:text-zinc-200"
            placeholder="e.g., Mohd Rizwan"
          />
        </div>

        {/* FEEDBACK HUD */}
        {status && (
          <div className={`p-4 text-[10px] uppercase font-bold tracking-[0.2em] flex items-center gap-3 animate-in slide-in-from-bottom-2 ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-100' 
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            {status.msg}
          </div>
        )}

        {/* ACTION TRIGGER */}
        <button 
          onClick={updateProfile}
          disabled={updating}
          className="w-full py-5 bg-[#1C1C1C] text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#B89B5E] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
        >
          {updating ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
          {updating ? "Deploying..." : "Update Identity"}
        </button>
      </div>
    </div>
  )
}