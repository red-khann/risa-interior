'use client'
import { useState, useEffect } from 'react'
import {
  Plus, ArrowRight, Activity, Search,
  Loader2, X, FolderKanban, Briefcase, PenTool, ChevronDown, User
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const supabase = createClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState('All Time')
  
  const [mounted, setMounted] = useState(false)
  
  const [data, setData] = useState({
    stats: [],
    recentActivity: [],
    health: [],
    isLoading: true
  })

  const fetchData = async () => {
    setData(prev => ({ ...prev, isLoading: true }))

    let dateLimit = new Date()
    let isFiltering = timeFilter !== 'All Time'
    if (timeFilter === 'Last 7 Days') dateLimit.setDate(dateLimit.getDate() - 7)
    else if (timeFilter === 'Last Month') dateLimit.setMonth(dateLimit.getMonth() - 1)
    else if (timeFilter === 'Last Year') dateLimit.setFullYear(dateLimit.getFullYear() - 1)

    const isoDate = dateLimit.toISOString()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let pQuery = supabase.from('projects').select('*')
    let sQuery = supabase.from('services').select('*')
    let bQuery = supabase.from('blog').select('*')
    let eQuery = supabase.from('enquiries').select('*')

    if (isFiltering) {
      pQuery = pQuery.gte('created_at', isoDate)
      sQuery = sQuery.gte('created_at', isoDate)
      bQuery = bQuery.gte('created_at', isoDate)
      eQuery = eQuery.gte('created_at', isoDate)
    }

    const [projects, services, blogs, leads, logs] = await Promise.all([
      pQuery,
      sQuery,
      bQuery,
      eQuery,
      supabase
        .from('admin_logs')
        .select(`
          *,
          profiles!admin_logs_admin_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20) 
    ])

    const projData = projects.data || []
    const projectsWithDesc = projData.filter(p => (p.description || p.desc || p.content)?.length > 20).length
    const metaScore = projData.length ? Math.round((projectsWithDesc / projData.length) * 100) : 100
    
    const blogData = blogs.data || []
    const recentPosts = blogData.filter(b => new Date(b.created_at) > thirtyDaysAgo).length
    const seoScore = recentPosts > 0 ? 100 : 45
    const activeProjs = projData.filter(p => p.status === 'Active').length
    const visibilityScore = projData.length ? Math.round((activeProjs / projData.length) * 100) : 0

    const leadData = leads.data || []
    const newCount = leadData.filter(l => l.protocol_status === 'New Lead').length
    const readCount = leadData.filter(l => l.protocol_status === 'Read').length

    setData({
      stats: [
        { label: 'Live Projects', value: projData.length.toString().padStart(2, '0'), detail: 'View Portfolio', link: '/admin/projects' },
        { label: 'Active Services', value: (services.data?.length || 0).toString().padStart(2, '0'), detail: 'Manage Offerings', link: '/admin/services' },
        { label: 'Total Enquiries', value: leadData.length.toString().padStart(2, '0'), detail: `New: ${newCount} | Read: ${readCount}`, link: '/admin/enquiries' },
        { label: 'Total Journal', value: blogData.length.toString().padStart(2, '0'), detail: 'View Journal', link: '/admin/blog' }
      ],
      recentActivity: logs.data || [],
      health: [
        { label: 'Content SEO', status: seoScore > 70 ? 'Optimal' : 'Stagnant', value: seoScore },
        { label: 'Metadata Depth', status: metaScore > 70 ? 'Healthy' : 'Incomplete', value: metaScore },
        { label: 'Public Visibility', status: visibilityScore > 50 ? 'High' : 'Low Impact', value: visibilityScore }
      ],
      isLoading: false
    })
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [timeFilter])

  if (!mounted) return null

  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative text-zinc-800 pb-10">

      {/* 🏆 FIXED HEADER SECTION - Matches Enquiry/Project Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 md:px-0 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-2">
            Studio Overview
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-[#1C1C1C]">
            Dashboard
          </h2>
        </div>
        
        {/* TIME FILTER: Styled to match the premium dropdowns in Enquiries */}
        <div className="relative w-full md:w-auto">
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            className="appearance-none w-full md:w-auto bg-white border border-zinc-100 px-6 py-3 pr-12 text-[10px] uppercase font-bold tracking-widest text-[#B89B5E] outline-none cursor-pointer hover:border-[#B89B5E] transition-all shadow-sm"
          >
            <option>Last 7 Days</option>
            <option>Last Month</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B89B5E] pointer-events-none" />
        </div>
      </div>

      {/* STAT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat: any) => (
          <div key={stat.label} className="bg-white border border-zinc-100 p-8 hover:shadow-xl transition-all duration-500 group relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-[#B89B5E] translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-6">{stat.label}</p>
            <p className="text-5xl font-bold text-[#1C1C1C] mb-6 tracking-tighter">{stat.value}</p>
            <Link href={stat.link} className="flex items-center gap-2 text-[9px] uppercase font-bold text-[#B89B5E] tracking-widest hover:text-black">
              {stat.detail} <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white border border-zinc-100 p-10 shadow-sm min-h-[500px]">
          <div className="flex justify-between items-center border-b border-zinc-50 pb-6 mb-8">
            <div className="flex items-center gap-3">
               <Activity size={16} className="text-[#B89B5E]" />
               <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold">Protocol Logs</h3>
            </div>
            {/* ✅ FIXED: Added hidden md:flex to hide on mobile */}
            <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center gap-2 px-6 py-2 bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-[0.2em] hover:bg-[#B89B5E] transition-all shadow-lg rounded-sm">
              <Plus size={14} /> New Composition
            </button>
          </div>
          
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((log: any) => (
                <div key={log.id} className="flex justify-between items-center p-5 bg-zinc-50 border-l-2 border-[#B89B5E] hover:bg-white transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 overflow-hidden flex-shrink-0 shadow-sm">
                      {log.profiles?.avatar_url ? (
                        <img src={log.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300"><User size={16} /></div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">{log.action_type}</p>
                      <p className="text-[9px] text-zinc-400 uppercase italic mt-1 font-medium">Item: {log.item_name}</p>
                      <p className="text-[8px] text-zinc-300 uppercase tracking-widest mt-1">
                        by {log.profiles?.full_name ?? log.admin_email ?? "System"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-zinc-300 uppercase mb-1">{new Date(log.created_at).toLocaleDateString()}</p>
                    <p className="text-[7px] text-zinc-400 font-bold uppercase">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-zinc-50">
                <Search size={20} className="text-zinc-100" />
                <p className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] italic">Database Clean.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-50 text-center">
             <button className="text-[9px] uppercase font-bold tracking-[0.3em] text-zinc-400 hover:text-[#B89B5E] transition-colors">
               Access Complete Archive
             </button>
          </div>
        </div>

        {/* HEALTH SECTION */}
        <div className="lg:col-span-4 bg-[#1C1C1C] p-8 text-white shadow-2xl border-t-4 border-[#B89B5E]">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B89B5E] mb-8">Live Site Health</h3>
          <ul className="space-y-8">
            {data.health.map((item: any) => (
              <li key={item.label} className="space-y-3 border-b border-zinc-800/50 pb-6 last:border-0">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">{item.label}</span>
                  <span className="text-[8px] font-bold uppercase tracking-tighter">{item.status}</span>
                </div>
                <div className="w-full bg-zinc-900 h-[2px] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B89B5E] transition-all duration-1000" style={{ width: `${item.value}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* COMPOSITION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-zinc-100 animate-in slide-in-from-bottom-12 duration-500">
            <header className="bg-[#1C1C1C] p-10 text-white flex justify-between items-center border-b border-[#B89B5E]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#B89B5E] font-bold">Studio Protocol</span>
                <h2 className="text-2xl font-bold tracking-tighter uppercase">Select New Vessel</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[#B89B5E] transition-all duration-500">
                <X size={18} className="text-white" />
              </button>
            </header>
            <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Project', icon: FolderKanban, link: '/admin/projects/new' },
                { name: 'Service', icon: Briefcase, link: '/admin/services/new' },
                { name: 'Journal', icon: PenTool, link: '/admin/blog/new' }
              ].map((vessel) => (
                <Link key={vessel.name} href={vessel.link} onClick={() => setIsModalOpen(false)} className="group flex flex-col items-center text-center gap-5 p-6 rounded-[2rem] hover:bg-zinc-50 transition-all duration-300">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-[#1C1C1C] group-hover:border-[#B89B5E] transition-all shadow-sm">
                    <vessel.icon size={24} className="text-zinc-400 group-hover:text-[#B89B5E]" />
                  </div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800">{vessel.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}