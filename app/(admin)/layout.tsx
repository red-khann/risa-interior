'use client'
import "../../styles/global.css";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "lucide-react";
import SessionGuard from "@/components/admin/SessionGuard"; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);

  useEffect(() => {
    // 1. Define the fetch function
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    }

    // 2. Run it immediately
    getProfile();

    // 3. 🛡️ THE FIX: Add a listener for Auth changes
    // This ensures that if the first fetch fails because the session was still 
    // initializing, it will try again as soon as the session is ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        getProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <SessionGuard> 
      <div className="min-h-screen bg-[#F7F5F2]">
        {/* Mobile Blocker - Static UI */}
        <div className="lg:hidden fixed inset-0 z-[200] bg-[#F7F5F2] text-[#1C1C1C] flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-10 w-16 h-[1px] bg-[#B89B5E]"></div>
          <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#B89B5E] font-bold mb-6">Desktop Access Only</h2>
          <p className="text-2xl font-bold tracking-tighter leading-tight max-w-xs text-[#1C1C1C]">
            The RISA Admin Console requires a <span className="font-serif italic font-light text-[#B89B5E]">larger screen</span> for precision management.
          </p>
          <p className="mt-10 text-zinc-400 text-[10px] uppercase tracking-[0.4em] font-medium">Please log in from a Laptop or PC.</p>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:flex min-h-screen"> 
          <AdminSidebar />
          <main className="flex-1 ml-64 p-10">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-200">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">Studio Manager</p>
                <h1 className="text-2xl font-bold text-[#1C1C1C]">Command Center</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wide">
                    {profile?.full_name || "Admin User"}
                  </p>
                  <p className="text-[10px] text-[#B89B5E] font-medium uppercase tracking-tighter">Identity Verified</p>
                </div>
                <div className="w-10 h-10 bg-zinc-100 rounded-full border border-zinc-200 overflow-hidden shadow-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Admin Identity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400"><User size={18} /></div>
                  )}
                </div>
              </div>
            </header>
            {children}
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}