'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-center">
      {/* Visual Identity */}
      <div className="mb-12 w-16 h-[1px] bg-[#B89B5E]"></div>
      
      <div className="space-y-4 mb-12">
        <h1 className="text-8xl font-bold tracking-tighter text-zinc-200">404</h1>
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#B89B5E] font-bold">
          Page Not Found
        </h2>
        <p className="text-2xl font-bold tracking-tighter leading-tight max-w-xs mx-auto text-[#1C1C1C]">
          This section of the <span className="font-serif italic font-light text-[#B89B5E]">RISA Portfolio</span> is currently unavailable.
        </p>
      </div>

      {/* Navigation Action */}
      <Link 
        href="/" 
        className="group flex items-center gap-4 px-8 py-4 bg-[#1C1C1C] text-white text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-[#B89B5E] transition-all rounded-full shadow-xl"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Return to Home
      </Link>

      <div className="mt-12 w-16 h-[1px] bg-zinc-200"></div>
    </div>
  )
}