'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { logActivity } from '@/utils/supabase/logger'
import { Clock, ShieldCheck, Loader2 } from 'lucide-react'

// 🛡️ PRODUCTION SETTINGS: 25 Minutes idle + 5 Minutes countdown (Total 30m)
const WARNING_TIME = 25 * 60 * 1000; 
const COUNTDOWN_DURATION = 300;      
const RE_ENTRY_LIMIT = 30 * 60 * 1000; // 30 Minutes hard limit for closed browser

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_DURATION)
  
  const supabase = createClient()
  const warningTimer = useRef<NodeJS.Timeout | null>(null)
  const countdownInterval = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = useCallback(async (type: 'TIMEOUT' | 'LOGOUT') => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    
    // 🛡️ Log the event while session is still valid
    await logActivity(
      type, 
      type === 'TIMEOUT' ? 'Session expired due to inactivity' : 'Manual logout', 
      'AUTH'
    );
    
    // Clear the timestamp upon manual or timeout logout
    localStorage.removeItem('risa_admin_last_active');
    
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }, [isLoggingOut, supabase.auth]);

  const resetTimers = useCallback(() => {
    if (showWarning) return; 

    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    // ✅ Update the persistent timestamp whenever the user interacts
    localStorage.setItem('risa_admin_last_active', Date.now().toString());

    warningTimer.current = setTimeout(() => {
      setSecondsLeft(COUNTDOWN_DURATION);
      setShowWarning(true);
    }, WARNING_TIME);
  }, [showWarning]);

  // 🚨 RE-ENTRY CHECK: Handles cases where browser was closed
  useEffect(() => {
    const checkSessionValidity = async () => {
      const lastActive = localStorage.getItem('risa_admin_last_active');
      const now = Date.now();

      if (lastActive) {
        const elapsed = now - parseInt(lastActive);
        
        // If more than 30 mins passed while the browser was closed, kick them out
        if (elapsed > RE_ENTRY_LIMIT) {
          await handleLogout('TIMEOUT');
          return;
        }
      }
      
      // If valid, initialize the timers
      resetTimers();
    };

    checkSessionValidity();
  }, [handleLogout, resetTimers]);

  // 🚨 AUTO-LOGOUT LOGIC (Active tab countdown)
  useEffect(() => {
    if (showWarning) {
      countdownInterval.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current!);
            handleLogout('TIMEOUT'); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [showWarning, handleLogout]);

  const extendSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setShowWarning(false);
      resetTimers(); 
    } else {
      handleLogout('TIMEOUT');
    }
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimers));
    
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimers));
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [resetTimers]);

  return (
    <>
      {children}
      {showWarning && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white max-w-md w-full p-12 border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100">
               <div 
                 className="h-full bg-[#B89B5E] transition-all duration-1000 ease-linear" 
                 style={{ width: `${(secondsLeft / COUNTDOWN_DURATION) * 100}%` }}
               />
            </div>

            <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-8 border border-zinc-100">
              <Clock className="text-[#B89B5E] animate-pulse" size={32} />
            </div>

            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-900 mb-4">Security Protocol</h2>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold mb-2">Session terminates in:</p>
            <p className="text-3xl font-bold text-[#B89B5E] mb-10 tabular-nums">
              {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:{(secondsLeft % 60).toString().padStart(2, '0')}
            </p>

            <div className="flex flex-col gap-4">
              <button onClick={extendSession} className="w-full py-4 bg-[#1C1C1C] text-white text-[9px] uppercase font-bold tracking-widest hover:bg-[#B89B5E] transition-all flex items-center justify-center gap-3">
                <ShieldCheck size={14} /> Extend Session
              </button>
              <button onClick={() => handleLogout('LOGOUT')} disabled={isLoggingOut} className="w-full py-4 border border-zinc-200 text-zinc-400 text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-50 transition-all">
                {isLoggingOut ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Terminate Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}