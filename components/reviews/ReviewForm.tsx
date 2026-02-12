"use client";

import { useState, useRef } from "react";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

export default function ReviewForm({ pageType, pageSlug }: { pageType: string, pageSlug: string }) {
  const supabase = createClient();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingLabels: Record<number, string> = {
    1: "Inadequate", 2: "Standard", 3: "Superior", 4: "Exquisite", 5: "Masterpiece"
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating protocol.");

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from('reviews').insert([{
        name: formData.get('name'),
        email: (formData.get('email') as string).toLowerCase().trim(),
        rating,
        review_text: formData.get('review_text'),
        page_type: pageType,
        page_slug: pageSlug,
        status: 'pending'
      }]);

      if (error) throw error;

      // Notify Admin
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          rating,
          review_text: formData.get('review_text'),
          page_slug: pageSlug
        }),
      }).catch(() => null);

      // Reset Logic
      setSubmitted(true);
      setRating(0);
      
      // ✅ Safety check fixed: Prevents "reading reset of null"
      if (formRef.current) {
        formRef.current.reset();
      }
      
      setTimeout(() => setSubmitted(false), 8000);

    } catch (err: any) {
      alert(err.code === '23505' ? "This email has already submitted a review." : "System error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 md:p-16 border border-zinc-100 shadow-sm relative overflow-hidden">
      
      {/* 🎯 SUCCESS OVERLAY: Exactly like Contact Form */}
      {submitted && (
        <div role="alert" className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
          <p className="text-[var(--accent-gold)] text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Protocol Chronicled</p>
          <p className="text-zinc-500 font-serif italic text-2xl mb-8">Thank you. Your insight is being reviewed by our curators.</p>
          <button 
            onClick={() => setSubmitted(false)} 
            className="text-[9px] uppercase tracking-widest border-b border-zinc-200 pb-1 hover:text-[var(--accent-gold)] transition-colors"
          >
            SEND ANOTHER
          </button>
        </div>
      )}

      <header className="mb-16">
        <h3 className="text-[10px] uppercase tracking-[0.6em] font-bold text-zinc-900 mb-3 italic">Leave a Review</h3>
        <div className="h-[1px] w-12 bg-[var(--accent-gold)] mb-6" />
        <p className="text-xs text-zinc-400 font-light italic">Your feedback refines our architectural standard.</p>
      </header>
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  type="button" 
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
                  className="relative transition-all duration-300 hover:scale-125 active:scale-95"
                >
                  <Star 
                    size={22} 
                    fill={(hover || rating) >= s ? "var(--accent-light)" : "none"} 
                    color={(hover || rating) >= s ? "var(--accent-light)" : "#e5e7eb"} 
                    strokeWidth={1.2}
                  />
                  {(hover || rating) >= s && (
                    <div className="absolute inset-0 blur-md bg-[var(--accent-light)]/20 rounded-full -z-10 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="h-4 flex items-center overflow-hidden">
               <span 
                key={hover || rating}
                className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--accent-light)] animate-in slide-in-from-left-2 fade-in duration-300"
               >
                {ratingLabels[hover || rating] || ""}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="group relative">
            <label className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-400 group-focus-within:text-[var(--accent-gold)] transition-colors duration-300">Client Identity</label>
            <input name="name" required placeholder="Full Name" className="w-full bg-transparent border-b border-zinc-100 py-4 text-sm outline-none focus:border-zinc-900 transition-all duration-300 font-light placeholder:text-zinc-200" />
          </div>
          <div className="group relative">
            <label className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-400 group-focus-within:text-[var(--accent-gold)] transition-colors duration-300">Access Logic (Email)</label>
            <input name="email" required type="email" placeholder="email@address.com" className="w-full bg-transparent border-b border-zinc-100 py-4 text-sm outline-none focus:border-zinc-900 transition-all duration-300 font-light placeholder:text-zinc-200" />
          </div>
        </div>

        <div className="group relative">
          <label className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-400 group-focus-within:text-[var(--accent-gold)] transition-colors duration-300">Observations</label>
          <textarea name="review_text" required rows={3} placeholder="Describe the spatial experience..." className="w-full bg-transparent border-b border-zinc-100 py-4 text-sm outline-none focus:border-zinc-900 transition-all duration-300 font-light resize-none placeholder:text-zinc-200" />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-7 bg-zinc-900 text-white text-[10px] uppercase tracking-[0.6em] font-bold hover:bg-[var(--accent-gold)] transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4 group"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <>
              Submit Review 
              <Star 
                size={12} 
                className="transition-transform duration-500 group-hover:rotate-[144deg] group-hover:scale-125" 
              />
            </>
          )}
        </button>
      </form>
    </div>
  );
}