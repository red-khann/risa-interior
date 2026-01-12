'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User, Settings, LogOut, ExternalLink } from "lucide-react";
import { logActivity } from "@/utils/supabase/logger"; // ✅ Added Logger

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
    { name: "Page Content", href: "/admin/content" },
    { name: "Settings", href: "/admin/settings" },
  ];

  useEffect(() => {
    async function getProfile() {
      // 🔄 Use getSession as a backup to ensure auth is ready
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
  }, []);

  const handleSignOut = async () => {
    // 🛡️ SYNC TO DASHBOARD: Log logout BEFORE signing out while session is still valid
    await logActivity('LOGOUT', 'Admin session ended', 'AUTH');
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.refresh();
      router.push("/");
    }
  };
  
  return (
    <aside className="w-64 bg-[#1C1C1C] text-white fixed h-full flex flex-col border-r border-zinc-800">
      <div className="p-8 border-b border-zinc-800">
        <h2 className="text-xl font-bold tracking-tighter">
          RISA<span className="text-[#B89B5E]"> Int & Cont</span>
        </h2>
        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-bold mt-1">Admin Console</p>
      </div>

      <nav className="flex-1 py-10 px-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.name === "Dashboard" 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href} 
              className={`group flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                isActive ? "text-white bg-zinc-800/80 border-l-2 border-[#B89B5E]" : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <span className={`w-1 h-1 rounded-full transition-colors ${
                isActive ? "bg-[#B89B5E]" : "bg-zinc-700 group-hover:bg-[#B89B5E]"
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-800 bg-zinc-900/30">
        <div className="p-6 flex items-center gap-4 border-b border-zinc-800/50">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Admin" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={18} /></div>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold truncate uppercase tracking-tighter">{profile?.full_name || "Authorized Admin"}</p>
            <p className="text-[8px] text-[#B89B5E] font-bold uppercase tracking-widest">Identity Verified</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Link href="/" className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-400 font-bold hover:text-[#B89B5E] transition-colors">
            <ExternalLink size={12} /> View Live Site
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 w-full text-left text-[9px] uppercase tracking-widest text-zinc-500 font-bold hover:text-red-400 transition-colors">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};