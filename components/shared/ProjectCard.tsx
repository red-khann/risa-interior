'use client';
import { ArrowUpRight } from 'lucide-react';

export const ProjectCard = ({ project }: { project: any }) => {
  const seoAltText = project.hero_alt_text || project.alt_text || `${project.title} - ${project.category} in ${project.city || project.location}`;

  // 🎯 Custom color for the category tag (Light Green from your palette)
  const TAG_COLOR = "#606060"; 

  return (
    <article className="group cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-200 mb-8 shadow-sm transition-all duration-700 group-hover:shadow-2xl">
        <img 
          src={project.image_url} 
          alt={seoAltText} 
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[2s] ease-out group-hover:scale-105"
          loading="lazy" 
        />
        
        {/* Subtle Brand Overlay */}
        <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors duration-700" />

        {/* 🎯 FIXED OVERLAY: Using the hex code directly with opacity so Tailwind can render it correctly */}
        <div className="absolute inset-0 bg-[#0B0B0B]/40 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center backdrop-blur-[2px]">
          <div className="overflow-hidden">
            <p className="text-white text-[10px] uppercase tracking-[0.8em] font-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              View Project
            </p>
          </div>
        </div>
      </div>
      
      {/* Project Metadata */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span 
            className="text-[9px] uppercase tracking-[0.4em] font-black italic"
            style={{ color: TAG_COLOR }}
          >
            {project.category}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-300" aria-hidden="true"></span>
          <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-400 font-bold">
            {project.city || project.location || "Global"}
          </span>
        </div>
        
        <h3 className="text-3xl font-bold tracking-tighter text-[var(--text-primary)] uppercase leading-none group-hover:text-[var(--accent-gold)] transition-colors duration-500">
          {project.title}
        </h3>
        
        <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-black text-zinc-900 group-hover:text-[var(--accent-gold)] transition-all">
                Explore Case Study 
                <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div className="w-8 h-[1px] bg-zinc-200 group-hover:w-20 group-hover:bg-[var(--accent-gold)] transition-all duration-700" />
        </div>
      </div>
    </article>
  );
};