"use client";

import { useId } from "react";
import { Star } from "lucide-react";

export default function ReviewStats({ reviews }: { reviews: any[] }) {
  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;
  const uniqueId = useId().replace(/:/g, "");

  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percent = total > 0 ? (count / total) * 100 : 0;
    return { star, count, percent };
  });

  // Precise fractional star component
  const FractionalStar = ({ index, rating }: { index: number, rating: number }) => {
    const fillPercent = Math.max(0, Math.min(100, (rating - index) * 100));
    const gradientId = `grad-${uniqueId}-${index}`;

    return (
      <svg width="18" height="18" viewBox="0 0 24 24" className="drop-shadow-sm">
        <defs>
          <linearGradient id={gradientId}>
            <stop offset={`${fillPercent}%`} stopColor="var(--accent-light)" />
            <stop offset={`${fillPercent}%`} stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={`url(#${gradientId})`}
          stroke={fillPercent > 0 ? "var(--accent-light)" : "#e5e7eb"}
          strokeWidth="0.5"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 py-16 border-b border-zinc-200 mb-16 items-center bg-transparent">
      {/* Left Column: The Aggregate Score */}
      <div className="lg:col-span-4 text-center lg:text-left border-r-0 lg:border-r border-zinc-100 pr-0 lg:pr-12">
        <h4 className="text-[10px] uppercase tracking-[0.5em] text-[var(--accent-gold)] font-bold mb-6 italic">Aggregate Score</h4>
        <div className="text-8xl font-bold tracking-tighter text-zinc-900 mb-6 leading-none">{avg.toFixed(1)}</div>
        
        <div className="flex justify-center lg:justify-start gap-1.5 mb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <FractionalStar key={i} index={i} rating={avg} />
          ))}
        </div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-medium italic">Validated by {total} client journals</p>
      </div>

      {/* Right Column: Progress Indicators */}
      <div className="lg:col-span-8 space-y-5">
        {distribution.map(line => (
          <div key={line.star} className="flex items-center gap-6 group">
            <div className="flex items-center gap-2 min-w-[45px]">
              <span className="text-[10px] font-bold text-zinc-900">{line.star}</span>
              <Star size={10} fill="#d1d5db" color="#d1d5db" strokeWidth={0} />
            </div>
            
            <div className="flex-1 h-[2px] bg-zinc-100 relative overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-[var(--accent-gold)] transition-all duration-[1500ms] ease-in-out"
                style={{ width: `${line.percent}%` }}
              />
            </div>

            <div className="min-w-[35px] text-right">
              <span className="text-[10px] font-bold text-zinc-300 group-hover:text-zinc-900 transition-colors duration-500">
                {line.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}