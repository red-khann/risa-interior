'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowUpRight, Search, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { useContent } from '@/components/PreviewProvider'; 

export default function ServicesClient() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDept, setActiveDept] = useState("All Categories");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const liveContent = useContent();
  const supabase = createClient();

  const getUI = (key: string, fallback: string) => {
    return liveContent[`services_page:${key}`] || fallback;
  };

  const pageSubtitle = getUI('page_subtitle', "Studio Expertise");
  const pageTitle = getUI('page_title', "Execution [Perfected.]");

  const renderStylishTitle = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          // 🎯 Restored: Using original grey (text-zinc-400) for bracketed text as per previous pages
          <span key={i} className="font-serif italic font-light text-zinc-400">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const { data: serviceData } = await supabase
          .from('services')
          .select('*')
          .eq('status', 'Active');

        if (serviceData) setServices(serviceData);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [supabase]);

  const departments = useMemo(() => {
    const types = Array.from(new Set(services.map(s => s.service_type).filter(Boolean)));
    return ["All Categories", ...types];
  }, [services]);

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
    return services.filter((service) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (service.meta_description && service.meta_description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = activeDept === "All Categories" || service.service_type === activeDept;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, activeDept, services]);

  return (
    // 🎯 bg-[#F7F5F2] swapped for var(--bg-warm)
    <main className="pt-32 pb-20 bg-[var(--bg-warm)] min-h-screen selection:bg-[var(--accent-gold)]/20">
      <section className="max-w-[1440px] mx-auto px-8 md:px-16">
        
        {/* Header Section */}
        <header className="max-w-3xl mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* 🎯 Color swapped for var(--accent-gold) */}
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-bold mb-6 italic">
            {pageSubtitle}
          </p>
          <h1 className="text-[10vw] lg:text-[7vw] leading-[0.85] mb-12 text-zinc-900 font-bold tracking-tighter uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {renderStylishTitle(pageTitle)}
          </h1>
        </header>

        {/* Navigation/Filters Bar */}
        <nav className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-20 pb-8 border-b border-zinc-200 relative z-[60]" aria-label="Service Filters">
          <div className="relative w-full md:w-72" ref={dropdownRef}>
            {/* 🎯 hover text swapped for var(--accent-gold) */}
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex justify-between items-center py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-900 hover:text-[var(--accent-gold)] transition-all outline-none"
            >
              <span>{activeDept}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-zinc-100 shadow-2xl mt-2 z-[70] animate-in fade-in slide-in-from-top-2 duration-200" role="listbox">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => { setActiveDept(dept); setIsDropdownOpen(false); }}
                    // 🎯 active text swapped for var(--accent-gold)
                    className={`w-full text-left px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors border-b border-zinc-50 last:border-none ${
                      activeDept === dept ? "bg-zinc-50 text-[var(--accent-gold)]" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative w-full md:w-64 group">
            {/* 🎯 focus-within colors swapped for var(--accent-gold) */}
            <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--accent-gold)] transition-colors" aria-hidden="true" />
            <input
              type="text"
              placeholder="SEARCH EXPERTISE..."
              className="bg-transparent border-b border-zinc-200 py-2 pl-8 text-[10px] tracking-widest outline-none focus:border-[var(--accent-gold)] w-full uppercase font-black transition-all text-zinc-800"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </nav>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-0">
          {loading ? (
              <div className="col-span-full py-40 flex flex-col items-center justify-center gap-4 text-center text-zinc-400 uppercase tracking-widest text-[10px] font-black">
                <Loader2 className="animate-spin text-[var(--accent-gold)]" size={20} />
                Updating Studio Data...
              </div>
          ) : (
            filteredServices.map((service) => (
              <article key={service.id}>
                <Link href={`/services/${service.slug}`} title={`View details for ${service.name}`}>
                  <div className="group relative p-10 md:p-12 bg-white border border-zinc-100 h-full flex flex-col justify-between transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
                    {/* 🎯 Top border swapped for var(--accent-gold) */}
                    <div className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--accent-gold)] group-hover:w-full transition-all duration-700 ease-in-out" aria-hidden="true" />
                    <div className="space-y-8">
                      <div className="flex justify-between items-start">
                        {/* 🎯 Type label swapped for var(--accent-gold) */}
                        <span className="text-[9px] uppercase tracking-[0.4em] text-[var(--accent-gold)] font-black">{service.service_type}</span>
                        <ArrowUpRight className="w-5 h-5 text-zinc-200 group-hover:text-zinc-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                      <h3 className="text-3xl font-bold tracking-tighter text-zinc-900 uppercase leading-tight">{service.name}</h3>
                      <p className="text-zinc-500 text-base leading-loose font-light italic font-serif opacity-80">"{service.meta_description}"</p>
                    </div>
                    <div className="pt-10 mt-10 border-t border-zinc-50 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold group-hover:text-zinc-900 transition-colors">The Protocol →</span>
                      {/* 🎯 Price highlight swapped for var(--accent-gold) */}
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