'use client';
import { MessageSquare, PenTool, Home } from "lucide-react";
import { useContent } from '@/components/PreviewProvider';

export const WorkProcedure = () => {
  const content = useContent();

  const getVal = (key: string, fallback: string) => {
    return content[`home:${key}`] || fallback;
  };

  // 🎯 Unified Card Style synchronized with Reputation Metrics
  const cardStyle =
    "p-10 lg:p-14 bg-white/60 backdrop-blur-md border border-white " +
    "shadow-sm relative transition-all duration-500 ease-out " +
    "hover:scale-105 hover:shadow-2xl hover:z-30 cursor-default " +
    "hover:bg-[var(--text-primary)] hover:text-white group";

  const steps = [
    {
      icon: <MessageSquare className="w-10 h-10 transition-colors duration-500" />,
      title: getVal('step_1_title', "Consultation"),
      description: getVal('step_1_desc', "Initial discussion regarding vision and requirements.")
    },
    {
      icon: <PenTool className="w-10 h-10 transition-colors duration-500" />,
      title: getVal('step_2_title', "Design"),
      description: getVal('step_2_desc', "Conceptual drafting and architectural planning.")
    },
    {
      icon: <Home className="w-10 h-10 transition-colors duration-500" />,
      title: getVal('step_3_title', "Execution"),
      description: getVal('step_3_desc', "Final construction and interior finishing.")
    }
  ];

  return (
    <section className="bg-[var(--bg-warm)] py-32 border-t border-zinc-200/60">
      <header className="text-center mb-20">
        <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-bold mb-4 italic">
          {getVal('proc_subtitle', "Our Methodology")}
        </p>
        <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter text-[var(--text-primary)]">
          {getVal('proc_title', "Work Procedure")}
        </h2>
      </header>

      {/* 🎯 Grid updated to match Reputation section (gap-8 and max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={cardStyle}
          >
            {/* Step Number Badge */}
            <div className="absolute top-6 right-8 text-[10px] font-black text-zinc-200 group-hover:text-white/20 transition-colors tracking-widest">
                0{index + 1}
            </div>

            <div className="flex flex-col items-center text-center">
                {/* 🎯 Icon with gold color on hover */}
                <div className="text-zinc-400 group-hover:text-[var(--accent-gold)] mb-10 transition-colors duration-500" aria-hidden="true">
                  {step.icon}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold uppercase tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">
                    {step.description}
                  </p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};