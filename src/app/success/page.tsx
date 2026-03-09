
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { mockStore, VisitLog } from "@/lib/store";
import { format } from "date-fns";

export default function SuccessPage() {
  const router = useRouter();
  const [lastLog, setLastLog] = useState<VisitLog | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial data
    const logs = mockStore.getVisitLogs();
    if (logs.length > 0) {
      setLastLog(logs[logs.length - 1]);
    }
    setCurrentTime(new Date());

    // Update clock
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Progress bar animation (0 to 100 over 5 seconds)
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    // Final redirection
    const redirectTimer = setTimeout(() => {
      mockStore.setCurrentUser(null);
      router.push("/login");
    }, duration + 500);

    return () => {
      clearInterval(clockInterval);
      clearInterval(progressTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  const handleReturn = () => {
    mockStore.setCurrentUser(null);
    router.push("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a192f] text-white flex flex-col items-center justify-center p-6 select-none font-body">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
                              linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
                              linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
                              linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
                              linear-gradient(60deg, #fff 25%, transparent 25.5%, transparent 75%, #fff 75%, #fff),
                              linear-gradient(60deg, #fff 25%, transparent 25.5%, transparent 75%, #fff 75%, #fff)`,
             backgroundSize: '80px 140px' 
           }} 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a192f]/50 to-[#0a192f]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center space-y-10 animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
            Welcome to NEU Library!
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-medium">
            Your visit has been logged successfully.
          </p>
        </div>

        {/* Glowing Checkmark Icon */}
        <div className="relative group">
          <div className="absolute inset-0 bg-accent/20 blur-[40px] rounded-full animate-pulse" />
          <div className="relative w-32 h-32 rounded-full border-[6px] border-accent/30 bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)]">
            <div className="absolute inset-0 rounded-full border-2 border-accent/50 scale-110" />
            <div className="w-24 h-24 rounded-full border-4 border-accent bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center">
              <Check className="w-12 h-12 text-accent stroke-[4]" />
            </div>
          </div>
        </div>

        {/* User Identity Card */}
        {lastLog && (
          <div className="w-full max-w-xs bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center space-y-1 transform transition-transform hover:scale-105">
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {lastLog.userName}
            </h2>
            <p className="text-white/60 text-sm font-medium tracking-wider uppercase">
              Visit: {lastLog.reason}
            </p>
          </div>
        )}

        {/* Progress & Status */}
        <div className="w-full max-w-md space-y-4">
          <p className="text-center text-white/60 text-sm font-medium animate-pulse">
            Preparing for the next visitor...
          </p>
          
          <div className="space-y-3">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-accent/50 via-accent to-accent/50 shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs font-bold text-accent tracking-[0.2em] uppercase">
              {Math.round(progress)}% Complete
            </p>
          </div>
        </div>

        {/* Return Button */}
        <button 
          onClick={handleReturn}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-sm font-bold tracking-widest text-white/80 hover:text-white transition-all shadow-xl active:scale-95"
        >
          Tap to Return to Main Menu
        </button>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
        <div className="flex items-center space-x-3 opacity-80">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-accent to-accent/60 rounded-lg shadow-lg">
             <span className="text-white font-black text-2xl drop-shadow-sm">N</span>
             <div className="absolute inset-0 border border-white/20 rounded-lg" />
          </div>
        </div>
        
        <div className="text-right space-y-0.5 opacity-60">
          {currentTime && (
            <>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase">
                {format(currentTime, 'MMM dd, yyyy')}
              </p>
              <p className="text-xl font-bold">
                {format(currentTime, 'hh:mm a')}
              </p>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
