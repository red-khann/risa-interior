'use client'
import "../../styles/global.css";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; 
import { createClient } from "@/utils/supabase/client";
import { 
  User, Menu, X, Folder, MessageSquare, 
  Settings, Briefcase, Newspaper, LayoutDashboard, LogOut 
} from "lucide-react"; 
import SessionGuard from "@/components/admin/SessionGuard"; 
import { logActivity } from "@/utils/supabase/logger"; // ✅ Added Logger
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter(); // ✅ Added Router for redirection
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobilePages = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { name: 'Projects', path: '/admin/projects', icon: Folder },
    { name: 'Services', path: '/admin/services', icon: Briefcase },
    { name: 'Journal', path: '/admin/blog', icon: Newspaper },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isMobileAllowedPage = mobilePages.some(page => pathname === page.path) || 
                               pathname === "/admin/login" || 
                               pathname?.startsWith('/admin/projects/edit') ||
                               pathname?.startsWith('/admin/blog/edit');

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    }
    getProfile();
    setIsMobileMenuOpen(false); 
  }, [pathname, supabase]);

  // ✅ UPDATED: Mobile Logout matches Desktop Sidebar logic
  const handleLogout = async () => {
    // 🛡️ SYNC TO DASHBOARD: Log logout BEFORE signing out while session is still valid
    await logActivity('LOGOUT', 'Admin session ended (Mobile)', 'AUTH');
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.refresh();
      window.location.href = "/"; // 🏠 Land on Home Page directly
    }
  };

  return (
    <SessionGuard> 
      <div className="min-h-screen bg-[#F7F5F2]">
        
        {/* 📱 MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[250] bg-[#1C1C1C] text-white p-8 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-10">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#B89B5E] font-bold">Studio Archive</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-zinc-800 rounded-full"><X size={24} /></button>
            </div>
            <nav className="space-y-5">
              {mobilePages.map((page) => (
                <Link 
                  key={page.path} 
                  href={page.path}
                  className={`flex items-center gap-5 text-xl font-bold uppercase tracking-tighter transition-all ${pathname === page.path ? 'text-[#B89B5E]' : 'text-zinc-400'}`}
                >
                  <page.icon size={20} />
                  {page.name}
                </Link>
              ))}
              <div className="pt-8 border-t border-zinc-800 mt-6">
                {/* ✅ Changed text to "Sign Out" for consistency */}
                <button onClick={handleLogout} className="flex items-center gap-5 text-xl font-bold uppercase tracking-tighter text-red-500 w-full text-left">
                  <LogOut size={20} /> Sign Out
                </button>
              </div>
            </nav>
          </div>
        )}

        <div className="flex min-h-screen"> 
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
          
          {/* 📱 MOBILE BLOCKER */}
          {!isMobileAllowedPage && (
            <div className="lg:hidden fixed inset-0 z-[200] bg-[#F7F5F2] text-[#1C1C1C] flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-10 w-16 h-[1px] bg-[#B89B5E]"></div>
              <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#B89B5E] font-bold mb-6">Desktop Precision Required</h2>
              <p className="text-2xl font-bold tracking-tighter leading-tight max-w-xs text-[#1C1C1C]">
                CMS Content Management requires a <span className="font-serif italic font-light text-[#B89B5E]">larger screen</span> for live previews.
              </p>
              <Link href="/admin/dashboard" className="mt-10 px-8 py-4 bg-[#1C1C1C] text-white text-[10px] uppercase tracking-widest font-bold">
                Return to Pulse
              </Link>
            </div>
          )}

          <main className={`flex-1 ${isMobileAllowedPage ? 'ml-0 lg:ml-64' : 'hidden lg:block ml-64'}`}>
            
            {/* 🛡️ STICKY HEADER */}
            <header className="sticky top-0 z-40 bg-[#F7F5F2]/80 backdrop-blur-md border-b border-zinc-200 px-5 lg:px-10 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-white border border-zinc-200 rounded-md shadow-sm">
                    <Menu size={20} />
                  </button>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold hidden sm:block">Command Center</p>
                    <h1 className="text-xl md:text-2xl font-bold text-[#1C1C1C] uppercase tracking-tighter">Studio Manager</h1>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-100 rounded-full border border-zinc-200 overflow-hidden shadow-sm">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400"><User size={18} /></div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <div className="p-5 lg:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}