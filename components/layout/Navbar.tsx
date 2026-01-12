"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useContent } from '../PreviewProvider'; 

export const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const content = useContent();

  const getVal = (key: string, fallback: string) => {
    return content[`global:${key}`] || content[key] || fallback;
  };

  const brandName = getVal('brand_name', "RISA");
  const brandTagline = getVal('brand_tagline', "Interior & Contractors");
  
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
    console.error("Navbar Navigation Parse Error");
    links = [{ label: 'Home', path: '/' }, { label: 'Contact', path: '/contact' }];
  }

  return (
    // 🎯 SEO: Using the <nav> element with an aria-label helps screen readers and bots understand the context
    <nav 
      aria-label="Main Navigation"
      className="fixed top-0 w-full z-[100] bg-[#F7F5F2] border-b border-zinc-200 py-4 lg:py-6 selection:bg-[#B89B5E]/30"
    >
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 flex items-center justify-between">
        
        {/* 🏛️ Dynamic Branding */}
        <Link href="/" className="group flex flex-col items-start" title={`${brandName} - ${brandTagline}`}>
          {/* 🎯 H1: Kept for branding, but added 'p' for tagline to maintain heading hierarchy */}
          <h1 className="text-3xl lg:text-4xl font-black tracking-[-0.02em] text-[#1C1C1C] leading-none uppercase">
            {brandName}
          </h1>
          <div className="w-full h-[2px] bg-[#1C1C1C] mt-1 mb-1 group-hover:bg-[#B89B5E] transition-colors duration-300" aria-hidden="true" />
          <p className="text-[7px] lg:text-[8px] uppercase tracking-[0.4em] font-bold text-zinc-500 leading-none">
            {brandTagline}
          </p>
        </Link>

        {/* Dynamic Desktop Navigation */}
        {/* 🎯 SEO: Using a list <ul> for navigation is a standard best practice for crawlers */}
        <ul className="hidden md:flex items-center gap-10 list-none">
          {links.map((link: any) => {
            const isActive = link.path === '/' ? pathname === '/' : pathname.startsWith(link.path);
            return (
              <li key={link.path}>
                <Link 
                  href={link.path} 
                  aria-current={isActive ? "page" : undefined}
                  className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:text-[#B89B5E] ${
                    isActive ? 'text-[#B89B5E]' : 'text-zinc-500'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-[#1C1C1C] z-[110]" 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={28} /> : (
            <div className="space-y-1.5" aria-hidden="true">
              <div className="w-6 h-[2px] bg-current"></div>
              <div className="w-4 h-[2px] bg-current ml-auto"></div>
            </div>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-[#F7F5F2] z-[105] flex flex-col items-center justify-center gap-8 transition-transform duration-500 ease-in-out ${
            isOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          aria-hidden={!isOpen}
        >
          {links.map((link: any) => {
            const isActive = link.path === '/' ? pathname === '/' : pathname.startsWith(link.path);
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`text-2xl uppercase tracking-[0.3em] font-bold ${isActive ? 'text-[#B89B5E]' : 'text-[#1C1C1C]'}`}
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