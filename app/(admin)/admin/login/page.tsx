'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
// ✅ Added Eye and EyeOff icons
import { Lock, Loader2, ChevronRight, Eye, EyeOff } from 'lucide-react'; 
import { logActivity } from '@/utils/supabase/logger';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else if (data.user) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      const deviceLabel = isMobile ? ' (Mobile)' : ' (Desktop)';

      await logActivity('LOGIN', `Admin session started${deviceLabel}`, 'AUTH');

      window.location.href = '/admin/dashboard';
    }
  };

  return (
    // 🎯 Background updated to brand warm white
    <div className="min-h-screen bg-[var(--bg-warm)] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-12 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem]">
        <div className="text-center space-y-2">
          {/* 🎯 Icon container updated to Rich Black */}
          <div className="inline-flex p-4 bg-[var(--text-primary)] rounded-2xl mb-4 shadow-lg shadow-zinc-200">
            {/* 🎯 Icon updated to RISA Green */}
            <Lock className="text-[var(--accent-gold)]" size={24} />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-zinc-900">Command Center</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">Protocol Authentication Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="ADMIN IDENTITY" 
              required
              autoComplete="one-time-code"
              // 🎯 Focus border updated to RISA Green
              className="w-full bg-zinc-50 border border-zinc-100 p-5 text-[10px] font-bold tracking-widest outline-none focus:border-[var(--accent-gold)] transition-all uppercase text-zinc-800 placeholder:text-zinc-300"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="SECURITY KEY" 
                required
                autoComplete="new-password"
                // 🎯 Focus border updated to RISA Green
                className="w-full bg-zinc-50 border border-zinc-100 p-5 text-[10px] font-bold tracking-widest outline-none focus:border-[var(--accent-gold)] transition-all uppercase text-zinc-800 placeholder:text-zinc-300 pr-14"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                // 🎯 Hover color updated to RISA Green
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[var(--accent-gold)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
              <p className="text-red-500 text-[9px] uppercase font-bold text-center tracking-widest">{error}</p>
            </div>
          )}

          <button 
            disabled={loading}
            // 🎯 Button colors updated to Rich Black and RISA Green hover
            className="group w-full bg-[var(--text-primary)] text-white py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--accent-gold)] transition-all rounded-2xl shadow-xl shadow-zinc-200 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>Initialize Session <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}