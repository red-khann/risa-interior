"use client";
import Link from 'next/link';
import Image from 'next/image'; 
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useContent } from '../PreviewProvider'; 

export const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const content = useContent();

  const getVal = (key: string, fallback: string) => {
    return content[`global:${key}`] || content[key] || fallback;
  };

  const brandName = getVal('brand_name', "RISA Interior");
  
  let links = [];
  try {
    const rawLinks = getVal('nav_menu', "");
    links = rawLinks ? JSON.parse(rawLinks) : [
      { label: 'Home', path: '/' },
      { label: 'About', path: '/about' },
      { label: 'Services', path: '/services' },
      { label: 'Projects', path: '/projects' },
      { label: 'Journal', path: '/blog' },
      { label: 'Contact', path: '/contact' }
    ];
  } catch (e) {
    links = [{ label: 'Home', path: '/' }, { label: 'Contact', path: '/contact' }];
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed top-0 w-full z-[100] bg-[var(--bg-warm)] border-b border-zinc-200 py-2 lg:py-3 selection:bg-[var(--accent-gold)]/30"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12 flex items-center justify-between">
        
        {/* 🏛️ BOLD LOGO: Locked Scale */}
        <Link href="/" className="shrink-0 relative z-[110]" title={brandName}>
          {/* 🎯 scale-[1.3] (Mobile) and scale-[1.5] (Desktop) preserved as requested */}
          <div className="relative w-48 h-16 lg:w-[280px] lg:h-20 transform scale-[1.3] lg:scale-[1.5] origin-left transition-transform duration-500">
            <Image 
              src="/logo.svg" 
              alt="RISA Interior & Contractors"
              fill
              className="object-contain object-left"
              priority
              unoptimized
            />
          </div>
        </Link>

        {/* 🧭 DESKTOP NAVIGATION: Adaptive Spacing */}
        <div className="hidden md:flex items-center justify-end flex-1 ml-8">
          <ul className="flex items-center list-none m-0 p-0 
            /* 🎯 Gap narrows as screen gets smaller to prevent overflow */
            gap-3 lg:gap-8 xl:gap-12">
            {links.map((link: any) => {
              const isActive = link.path === '/' ? pathname === '/' : pathname.startsWith(link.path);
              return (
                <li key={link.path} className="shrink-0">
                  <Link 
                    href={link.path} 
                    className={`
                      /* 🎯 Text stays at 10px-11px to maintain weight */
                      text-[10px] lg:text-[11px] 
                      uppercase tracking-[0.15em] lg:tracking-[0.3em] font-black 
                      transition-all duration-300 hover:text-[var(--accent-gold)] 
                      ${isActive ? 'text-[var(--accent-gold)]' : 'text-zinc-900'}
                    `}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-zinc-900 z-[110] p-2" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : (
            <div className="space-y-1.5" aria-hidden="true">
              <div className="w-7 h-[2px] bg-zinc-900"></div>
              <div className="w-5 h-[2px] bg-zinc-900 ml-auto"></div>
            </div>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-[var(--bg-warm)] z-[105] flex flex-col items-center justify-center gap-10 transition-transform duration-700 ease-in-out ${
            isOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {links.map((link: any) => {
            const isActive = link.path === '/' ? pathname === '/' : pathname.startsWith(link.path);
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={() => setIsOpen(false)}
                className={`text-2xl uppercase tracking-[0.4em] font-black ${isActive ? 'text-[var(--accent-gold)]' : 'text-zinc-900'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};