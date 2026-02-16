'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowUpRight, Search, ChevronDown } from "lucide-react"; 
import Link from "next/link";
import { useContent } from '@/components/PreviewProvider'; 
import { motion, AnimatePresence } from 'framer-motion';

interface ServicesClientProps {
  initialServices: any[];
}

export default function ServicesClient({ initialServices }: ServicesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDept, setActiveDept] = useState("All Categories");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const liveContent = useContent();

  const pageSubtitle = liveContent['services_page:page_subtitle'] || "Studio Expertise";
  const pageTitle = liveContent['services_page:page_title'] || "Execution Perfected";
  const pageDescription = liveContent['services_page:page_description'] || "A curated suite of architectural and design protocols tailored to elevate spatial experiences.";

  // 🎯 MICRO-PRECISION STAR COMPONENT
  const StarIcon = ({ fillPercentage }: { fillPercentage: number }) => {
    const gradientId = `grad-service-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId}>
            <stop offset={`${fillPercentage}%`} stopColor="var(--accent-light)" />
            <stop offset={`${fillPercentage}%`} stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path 
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill={`url(#${gradientId})`}
        />
      </svg>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((index) => {
            let fill = 0;
            if (rating >= index) fill = 100;
            else if (rating > index - 1) fill = (rating - (index - 1)) * 100;
            return <StarIcon key={index} fillPercentage={fill} />;
          })}
        </div>
        <span className="text-[10px] font-black text-[var(--accent-light)] tracking-widest">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const departments = useMemo(() => {
    const types = Array.from(new Set(initialServices.map(s => s.service_type).filter(Boolean)));
    return ["All Categories", ...types];
  }, [initialServices]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredServices = useMemo(() => {
    return initialServices.filter((service) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (service.meta_description && service.meta_description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = activeDept === "All Categories" || service.service_type === activeDept;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, activeDept, initialServices]);

  return (
    <main className="pt-32 pb-20 bg-[var(--bg-warm)] min-h-screen selection:bg-[var(--accent-gold)]/20 overflow-x-hidden">
      <section className="max-w-[1440px] mx-auto px-8 md:px-16">
        
        <header className="mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col space-y-8 text-left">
            <h2 className="sr-only">{pageDescription}</h2>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-bold italic">{pageSubtitle}</p>
            <h1 className="text-[10vw] lg:text-[5vw] leading-[0.95] text-zinc-900 font-bold tracking-tighter uppercase break-words">
              <span className="block sm:inline">{pageTitle.split(' ')[0]}</span>
              <span className="sm:ml-4 block sm:inline font-serif italic font-light text-zinc-400">{pageTitle.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="max-w-2xl text-zinc-500 text-sm md:text-base uppercase tracking-widest leading-relaxed font-medium">{pageDescription}</p>
          </motion.div>
        </header>

        <nav className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 pb-10 border-b border-zinc-200 relative z-[60]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 w-full md:w-auto">
            <div className="relative w-full sm:w-72" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex justify-between items-center py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-900 hover:text-[var(--accent-gold)] transition-all outline-none">
                <span>{activeDept}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 w-full bg-white border border-zinc-100 shadow-2xl mt-2 z-[70] overflow-hidden">
                    {departments.map((dept) => (
                      <button key={dept} onClick={() => { setActiveDept(dept); setIsDropdownOpen(false); }} className={`w-full text-left px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors border-b border-zinc-50 last:border-none ${activeDept === dept ? "bg-zinc-50 text-[var(--accent-gold)]" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>{dept}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="relative w-full md:w-64 group">
            <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--accent-gold)] transition-colors" />
            <input type="text" placeholder="SEARCH EXPERTISE..." className="bg-transparent border-b border-zinc-200 py-2 pl-8 text-[10px] tracking-widest outline-none focus:border-[var(--accent-gold)] w-full uppercase font-black transition-all text-zinc-800" onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-0">
          {filteredServices.length === 0 ? (
             <div className="col-span-full py-40 text-center text-zinc-400 uppercase tracking-widest text-[10px] font-black">
               No expertise matches your query.
             </div>
          ) : (
            filteredServices.map((service) => (
              <article key={service.id}>
                <Link href={`/services/${service.slug}`}>
                  <div className="group relative p-10 md:p-12 bg-white border border-zinc-100 h-full flex flex-col justify-between transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
                    <div className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--accent-gold)] group-hover:w-full transition-all duration-700 ease-in-out" />
                    <div className="space-y-8">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-[var(--accent-gold)] font-black">{service.service_type}</span>
                        <ArrowUpRight className="w-5 h-5 text-zinc-200 group-hover:text-zinc-900 transition-all" />
                      </div>

                      <div className="space-y-4">
                        {service.avgRating > 0 && renderStars(service.avgRating)}
                        <h3 className="text-3xl font-bold tracking-tighter text-zinc-900 uppercase leading-tight">{service.name}</h3>
                        
                        {service.meta_description?.trim() && (
                           <p className="text-zinc-500 text-base leading-loose font-light italic font-serif opacity-80">
                             "{service.meta_description}"
                           </p>
                        )}
                      </div>
                    </div>
                    <div className="pt-10 mt-10 border-t border-zinc-50 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold group-hover:text-zinc-900 transition-colors">The Protocol →</span>
                      <span className="text-[11px] font-bold text-zinc-300 group-hover:text-[var(--accent-gold)] transition-colors">{service.starting_price}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}