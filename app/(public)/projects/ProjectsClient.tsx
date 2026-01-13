'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { useContent } from '@/components/PreviewProvider';
import { ProjectCard } from "@/components/shared/ProjectCard";

export default function ProjectsClient() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const liveContent = useContent();
  const supabase = createClient();

  const pageSubtitle = liveContent['projects_page:page_subtitle'] || "Portfolio";
  const pageTitle = liveContent['projects_page:page_title'] || "Featured Works";

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .neq('status', 'Draft')
        .order('created_at', { ascending: sortOrder === 'oldest' });

      if (projectData) setProjects(projectData);
      setLoading(false);
    }
    fetchProjects();
  }, [sortOrder, supabase]);

  const CATEGORIES = useMemo(() => {
    const types = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    return ["All", ...types];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (project.location && project.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === "All" || project.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, projects]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen bg-[#F7F5F2] selection:bg-[#B89B5E]/20">
      
      {/* Header Section */}
      <header className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#B89B5E] font-black mb-4 italic">
          {pageSubtitle}
        </p>
        <h1 className="text-[10vw] lg:text-[7vw] leading-[0.85] mb-12 text-zinc-900 font-bold tracking-tighter uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {pageTitle}
          </h1>
      </header>

      {/* Filter Bar */}
      <nav className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 pb-10 border-b border-zinc-200 relative z-30" aria-label="Project Filters">
        <div className="flex items-center gap-8 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="relative w-full md:w-64" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              className="w-full flex justify-between items-center py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-900 outline-none hover:text-[#B89B5E] transition-all"
            >
              <span>{activeCategory === "All" ? "All Classifications" : activeCategory}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-zinc-100 shadow-2xl mt-2 z-40 overflow-hidden" role="listbox">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    role="option"
                    aria-selected={activeCategory === cat}
                    onClick={() => { setActiveCategory(cat); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-6 py-4 text-[9px] uppercase tracking-[0.2em] font-black transition-colors border-b border-zinc-50 last:border-none ${
                      activeCategory === cat ? "bg-zinc-50 text-[#B89B5E]" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Toggle */}
          <button 
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            aria-label={`Sort by ${sortOrder === "newest" ? "oldest" : "newest"}`}
            className="group flex items-center gap-3 py-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 hover:text-[#B89B5E] transition-colors"
          >
            <span className="hidden sm:inline">{sortOrder === "newest" ? "Newest Archival" : "Oldest Archival"}</span>
            <div className="flex flex-col items-center" aria-hidden="true">
              <ArrowUp size={12} className={sortOrder === "newest" ? "text-[#B89B5E]" : "text-zinc-200"} />
              <ArrowDown size={12} className={`-mt-1 ${sortOrder === "oldest" ? "text-[#B89B5E]" : "text-zinc-200"}`} />
            </div>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 group">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#B89B5E] transition-colors" aria-hidden="true" />
          <input
            type="text"
            aria-label="Search projects"
            placeholder="SEARCH PORTFOLIO..."
            className="bg-transparent border-b border-zinc-300 py-2 pl-8 text-[10px] tracking-widest outline-none focus:border-[#B89B5E] w-full uppercase font-black text-zinc-800 transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </nav>

      {/* Dynamic Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32" aria-label="Project Gallery">
        {loading ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center gap-4 text-center uppercase tracking-[0.5em] text-zinc-400 text-[10px]">
            <Loader2 className="animate-spin text-[#B89B5E]" size={20} />
            Retrieving Studio Archive...
          </div>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="block" title={`View project: ${project.title}`}>
              <ProjectCard project={project} />
            </Link>
          ))
        ) : (
          <p className="col-span-full py-40 text-center uppercase tracking-[0.4em] text-zinc-400 text-[10px]">
            No projects found matching your criteria.
          </p>
        )}
      </section>
    </main>
  );
}