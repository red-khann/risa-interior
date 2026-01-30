'use client'
import "../../styles/global.css";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; 
import { createClient } from "@/utils/supabase/client";
import { 
  User, Menu, X, Folder, MessageSquare, 
  Settings, Briefcase, Newspaper, LayoutDashboard, LogOut, History
} from "lucide-react"; 
import SessionGuard from "@/components/admin/SessionGuard"; 
import { logActivity } from "@/utils/supabase/logger"; 
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter(); 
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobilePages = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { name: 'Projects', path: '/admin/projects', icon: Folder },
    { name: 'Services', path: '/admin/services', icon: Briefcase },
    { name: 'Journal', path: '/admin/blog', icon: Newspaper },
    // 🎯 NEW: Added Logs to mobile drawer
    { name: 'Archive', path: '/admin/logs', icon: History },
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

  const handleLogout = async () => {
    await logActivity('LOGOUT', 'Admin session ended (Mobile)', 'AUTH');
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.refresh();
      window.location.href = "/"; 
    }
  };

  return (
    <SessionGuard> 
      <div className="min-h-screen bg-[var(--bg-warm)]">
        
        {/* 📱 MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[250] bg-[var(--text-primary)] text-white p-8 animate-in slide-in-from-top duration-500">
            <div className="flex justify-between items-center mb-12">
              {/* 🎯 Branding: Champagne Gold accent */}
              <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--accent-light)] font-black opacity-80">Studio Protocol</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-zinc-800/50 rounded-full text-[var(--accent-light)]"><X size={24} /></button>
            </div>
            <nav className="space-y-6">
              {mobilePages.map((page) => (
                <Link 
                  key={page.path} 
                  href={page.path}
                  className={`flex items-center gap-6 text-2xl font-bold uppercase tracking-tighter transition-all ${pathname === page.path ? 'text-[var(--accent-gold)]' : 'text-zinc-500 hover:text-white'}`}
                >
                  <page.icon size={22} className={pathname === page.path ? 'text-[var(--accent-gold)]' : 'text-zinc-600'} />
                  {page.name}
                </Link>
              ))}
              <div className="pt-10 border-t border-zinc-800/50 mt-10">
                <button onClick={handleLogout} className="flex items-center gap-6 text-2xl font-bold uppercase tracking-tighter text-red-500/80 w-full text-left">
                  <LogOut size={22} /> Sign Out
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
            <div className="lg:hidden fixed inset-0 z-[200] bg-[var(--bg-warm)] text-[var(--text-primary)] flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-10 w-16 h-[2px] bg-[var(--accent-gold)]"></div>
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-black mb-6">Desktop Precision Required</h2>
              <p className="text-2xl font-bold tracking-tighter leading-tight max-w-xs text-[var(--text-primary)]">
                Complex management protocols require a <span className="font-serif italic font-light text-[var(--accent-gold)]">larger screen</span> for precision.
              </p>
              <Link href="/admin/dashboard" className="mt-12 px-10 py-5 bg-[var(--text-primary)] text-white text-[10px] uppercase tracking-widest font-black shadow-2xl hover:bg-[var(--accent-gold)] transition-all">
                Return to Pulse
              </Link>
            </div>
          )}

          <main className={`flex-1 ${isMobileAllowedPage ? 'ml-0 lg:ml-64' : 'hidden lg:block ml-64'}`}>
            
            {/* 🛡️ STICKY HEADER */}
            <header className="sticky top-0 z-40 bg-[var(--bg-warm)]/80 backdrop-blur-xl border-b border-zinc-200/60 px-6 lg:px-12 py-7">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-white border border-zinc-100 rounded-xl shadow-sm text-[var(--text-primary)] active:scale-95 transition-transform">
                    <Menu size={20} />
                  </button>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-black hidden sm:block">Command Protocol</p>
                    <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] uppercase tracking-tighter">Studio Manager</h1>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Profile Preview */}
                  <div className="flex flex-col items-end hidden md:flex">
                    <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-tight">{profile?.full_name || 'Admin'}</p>
                    <p className="text-[8px] text-[var(--accent-gold)] font-black uppercase tracking-widest">Verified</p>
                  </div>
                  <div className="w-11 h-11 bg-white rounded-full border border-zinc-200 overflow-hidden shadow-sm ring-4 ring-[var(--bg-warm)]">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><User size={20} /></div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <div className="p-6 lg:p-12 animate-in fade-in duration-1000">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}