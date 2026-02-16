'use client';
import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';

export const ProjectCard = ({ project, avgRating = 0 }: { project: any, avgRating?: number }) => {
  const seoAltText = project.hero_alt_text || project.alt_text || `${project.title} - ${project.category} in ${project.city || project.location}`;
  const TAG_COLOR = "#606060"; 

  // 🎯 MICRO-PRECISION STAR LOGIC: Restored with useMemo for performance
  const StarIcon = ({ fillPercentage }: { fillPercentage: number }) => {
    const gradientId = useMemo(() => `grad-${Math.random().toString(36).substr(2, 9)}`, []);
    
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
      <div className="flex items-center gap-3 mb-2">
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

  return (
    <article className="group cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-200 mb-8 shadow-sm transition-all duration-700 group-hover:shadow-2xl">
        <img 
          src={project.image_url} 
          alt={seoAltText} 
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[2s] ease-out group-hover:scale-105"
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors duration-700" />
        <div className="absolute inset-0 bg-[#0B0B0B]/40 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center backdrop-blur-[2px]">
          <div className="overflow-hidden">
            <p className="text-white text-[10px] uppercase tracking-[0.8em] font-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              View Project
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          {avgRating > 0 && renderStars(avgRating)}
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-[0.4em] font-black italic" style={{ color: TAG_COLOR }}>
              {project.category}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" aria-hidden="true"></span>
            <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-400 font-bold">
              {project.city || project.location || "Global"}
            </span>
          </div>
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