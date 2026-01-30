'use client';
import { MessageSquare, PenTool, Home } from "lucide-react";
import { useContent } from '@/components/PreviewProvider';

export const WorkProcedure = () => {
  const content = useContent();

  const getVal = (key: string, fallback: string) => {
    return content[`home:${key}`] || fallback;
  };

  const steps = [
    {
      // 🎯 Icon hover updated to --accent-gold (RISA Green)
      icon: <MessageSquare className="w-8 h-8 group-hover:text-[var(--accent-gold)] transition-colors" />,
      title: getVal('step_1_title', "Consultation"),
      description: getVal('step_1_desc', "Initial discussion regarding vision and requirements.")
    },
    {
      // 🎯 Icon hover updated to --accent-gold (RISA Green)
      icon: <PenTool className="w-8 h-8 group-hover:text-[var(--accent-gold)] transition-colors" />,
      title: getVal('step_2_title', "Design"),
      description: getVal('step_2_desc', "Conceptual drafting and architectural planning.")
    },
    {
      // 🎯 Icon hover updated to --accent-gold (RISA Green)
      icon: <Home className="w-8 h-8 group-hover:text-[var(--accent-gold)] transition-colors" />,
      title: getVal('step_3_title', "Execution"),
      description: getVal('step_3_desc', "Final construction and interior finishing.")
    }
  ];

  return (
    // 🎯 Section background updated to --bg-warm
    <section className="section-container bg-[var(--bg-warm)] py-32 border-t border-zinc-200">
      <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <p className="text-[12px] uppercase tracking-[0.4em] text-zinc-400 font-bold mb-4 italic">
          {getVal('proc_subtitle', "Our Methodology")}
        </p>
        {/* 🎯 Header text updated to --text-primary (Rich Black) */}
        <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-[var(--text-primary)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ">
          {getVal('proc_title', "Work Procedure")}
        </h2>
      </header>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-100 max-w-7xl mx-auto shadow-sm list-none">
        {steps.map((step, index) => (
          <li 
            key={index} 
            // 🎯 Hover background updated to --text-primary (Rich Black)
            className="group p-12 text-center flex flex-col items-center gap-8 bg-white border-r border-zinc-100 last:border-r-0 hover:bg-[var(--text-primary)] hover:text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:z-30"
          >
            {/* 🎯 Icon color fetching brand green on hover */}
            <div className="text-zinc-400 group-hover:text-[var(--accent-gold)] transition-colors" aria-hidden="true">
              {step.icon}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-wide leading-tight">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};