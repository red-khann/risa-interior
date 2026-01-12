'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, ChevronRight } from 'lucide-react';
import { logActivity } from '@/utils/supabase/logger';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else if (data.user) {
      // 🛡️ Record the login event
      await logActivity('LOGIN', 'Admin session started', 'AUTH');

      // ✅ FIX: Use window.location.href instead of router.push
      // This forces a full page reload which guarantees the Layout and Sidebar 
      // fetch the profile data correctly on the first load.
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-12 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem]">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-[#1C1C1C] rounded-2xl mb-4 shadow-lg shadow-zinc-200">
            <Lock className="text-[#B89B5E]" size={24} />
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
              className="w-full bg-zinc-50 border border-zinc-100 p-5 text-[10px] font-bold tracking-widest outline-none focus:border-[#B89B5E] transition-all uppercase text-zinc-800 placeholder:text-zinc-300"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input 
              type="password" 
              placeholder="SECURITY KEY" 
              required
              autoComplete="new-password"
              className="w-full bg-zinc-50 border border-zinc-100 p-5 text-[10px] font-bold tracking-widest outline-none focus:border-[#B89B5E] transition-all uppercase text-zinc-800 placeholder:text-zinc-300"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
              <p className="text-red-500 text-[9px] uppercase font-bold text-center tracking-widest">{error}</p>
            </div>
          )}

          <button 
            disabled={loading}
            className="group w-full bg-[#1C1C1C] text-white py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-[#B89B5E] transition-all rounded-2xl shadow-xl shadow-zinc-200 flex justify-center items-center gap-2"
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