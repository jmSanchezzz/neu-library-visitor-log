"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Book, 
  Microscope, 
  Laptop, 
  BookText, 
  Gavel, 
  ChevronRight,
  GraduationCap,
  Clock as ClockIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { mockStore } from "@/lib/store";
import { format } from "date-fns";

const REASON_ICONS: Record<string, any> = {
  "Reading": Book,
  "Research": Microscope,
  "Use of Computer": Laptop,
  "Studying": BookText,
  "Meeting": Gavel
};

export default function LogVisitPage() {
  const [reason, setReason] = useState("");
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = mockStore.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
    } else {
      setUser(currentUser);
    }

    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    mockStore.addVisitLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      collegeOrOffice: user.collegeOrOffice,
      reason: reason
    });

    router.push("/success");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a192f] text-white flex flex-col font-body select-none">
      {/* Background Pattern Overlay (matching success page) */}
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

      {/* Header */}
      <header className="relative z-20 h-20 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white font-black text-2xl">N</span>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none">NEU Library</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mt-1">Check-In Portal</p>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-end space-y-0.5">
          {currentTime && (
            <>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/40">
                {format(currentTime, 'MMMM dd, yyyy')}
              </p>
              <p className="text-xl font-bold text-white/90">
                {format(currentTime, 'hh:mm:ss a')}
              </p>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className="bg-white/10 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            <CardContent className="p-10 space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Welcome, {user.name}!
                </h2>
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                   <GraduationCap className="w-4 h-4 text-accent" />
                   <span className="text-sm font-bold text-accent uppercase tracking-wider">{user.collegeOrOffice}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">
                    Select Your Purpose
                  </Label>
                  <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-2xl focus:ring-accent focus:border-accent">
                      <SelectValue placeholder="Reason for visiting today" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a192f] border-white/10 text-white rounded-2xl shadow-2xl">
                      {Object.entries(REASON_ICONS).map(([label, Icon]) => (
                        <SelectItem 
                          key={label} 
                          value={label} 
                          className="py-4 px-5 focus:bg-accent focus:text-white cursor-pointer group"
                        >
                          <div className="flex items-center space-x-4">
                            <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
                            <span className="font-bold text-lg">{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-[0.98] group relative overflow-hidden"
                  disabled={!reason}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Check In Now
                    <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-white/30 text-xs font-bold tracking-[0.4em] uppercase">
            New Era University Institutional Portal
          </p>
        </div>
      </main>

      {/* Decorative Clock for Mobile */}
      <footer className="md:hidden p-6 border-t border-white/5 bg-white/5 backdrop-blur-md flex justify-center">
         <div className="flex items-center space-x-2 text-white/50">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">{currentTime ? format(currentTime, 'hh:mm a') : ""}</span>
         </div>
      </footer>
    </div>
  );
}
