'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User, Settings, LogOut, ExternalLink, Activity } from "lucide-react";
import { logActivity } from "@/utils/supabase/logger"; 

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard" }, 
    { name: "Projects", href: "/admin/projects" },   
    { name: "Services", href: "/admin/services" },
    { name: "Journal", href: "/admin/blog" },
    { name: "Enquiries", href: "/admin/enquiries" },
    // 🎯 NEW: Added Protocol Logs entry
    { name: "Protocol Logs", href: "/admin/logs" },
    { name: "Page Content", href: "/admin/content" },
    { name: "Settings", href: "/admin/settings" },
  ];

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    getProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await logActivity('LOGOUT', 'Admin session ended', 'AUTH');
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.refresh();
      router.push("/");
    }
  };
  
  return (
    <aside className="w-64 bg-[var(--text-primary)] text-white fixed h-full flex flex-col border-r border-zinc-800 z-[100]">
      {/* BRANDING SECTION */}
      <div className="p-8 border-b border-zinc-800">
        <h2 className="text-xl font-bold tracking-tighter uppercase">
          RISA<span className="text-[var(--accent-gold)]"> Int & Cont</span>
        </h2>
        {/* 🎯 Branding: Using Champagne Gold for subtler contrast on black */}
        <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--accent-light)] font-bold mt-1 opacity-80">Studio Protocol</p>
      </div>

      {/* NAVIGATION SECTION */}
      <nav className="flex-1 py-10 px-6 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = item.name === "Dashboard" 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href} 
              // 🎯 Branding: Active state uses RISA Green border and Champagne hover text
              className={`group flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                isActive 
                  ? "text-white bg-zinc-800/80 border-l-2 border-[var(--accent-gold)]" 
                  : "text-zinc-500 hover:text-[var(--accent-light)] hover:bg-zinc-800/50"
              }`}
            >
              <span className={`w-1 h-1 rounded-full transition-colors ${
                isActive ? "bg-[var(--accent-gold)]" : "bg-zinc-700 group-hover:bg-[var(--accent-light)]"
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER / IDENTITY SECTION */}
      <div className="mt-auto border-t border-zinc-800 bg-black/20">
        <div className="p-6 flex items-center gap-4 border-b border-zinc-800/50">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0 shadow-lg">
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Admin" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-900"><User size={18} /></div>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold truncate uppercase tracking-tighter text-white">{profile?.full_name || "Authorized Admin"}</p>
            {/* 🎯 Branding: Verified status in RISA Green */}
            <p className="text-[8px] text-[var(--accent-light)] font-black uppercase tracking-widest">Architect Verified</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Link 
            href="/" 
            // 🎯 Branding: Live site link using Champagne Gold for elegance
            className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[var(--accent-light)] font-black hover:text-white transition-all duration-300"
          >
            <ExternalLink size={12} /> View Live Studio
          </Link>
          
          <button 
            onClick={handleSignOut} 
            className="flex items-center gap-2 w-full text-left text-[9px] uppercase tracking-widest text-zinc-500 font-bold hover:text-red-400 transition-colors"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};