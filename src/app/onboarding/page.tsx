"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  ChevronRight,
  UserCircle,
  Clock as ClockIcon,
  Building2,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COLLEGES, REASONS } from "@/lib/constants";
import { mockStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function OnboardingPage() {
  const [college, setCollege] = useState("");
  const [reason, setReason] = useState("");
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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
    if (!college || !reason) {
      toast({
        title: "Information Required",
        description: "Please select both your department and reason for visiting.",
        variant: "destructive"
      });
      return;
    }

    // Update user profile
    const updatedUser = { ...user, collegeOrOffice: college };
    mockStore.saveUser(updatedUser);
    mockStore.setCurrentUser(updatedUser);

    // Log the initial visit
    mockStore.addVisitLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      collegeOrOffice: college,
      reason: reason
    });

    router.push("/success");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a192f] text-white flex flex-col font-body select-none">
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

      {/* Header */}
      <header className="relative z-20 h-20 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white font-black text-2xl">N</span>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none">NEU Library</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mt-1">Institutional Portal</p>
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
                <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                   <UserCircle className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Welcome aboard!
                </h2>
                <p className="text-white/60 text-sm font-medium">
                  Please complete your profile for {user.email}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="college" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1 flex items-center">
                      <Building2 className="w-3 h-3 mr-2" />
                      Select Department
                    </Label>
                    <Select onValueChange={setCollege} value={college}>
                      <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-2xl focus:ring-accent">
                        <SelectValue placeholder="Which college or office?" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a192f] border-white/10 text-white rounded-2xl shadow-2xl max-h-[300px]">
                        {COLLEGES.map((c) => (
                          <SelectItem 
                            key={c} 
                            value={c} 
                            className="py-3 px-5 focus:bg-accent focus:text-white cursor-pointer font-bold"
                          >
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1 flex items-center">
                      <HelpCircle className="w-3 h-3 mr-2" />
                      Purpose of Visit
                    </Label>
                    <Select onValueChange={setReason} value={reason}>
                      <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-2xl focus:ring-accent">
                        <SelectValue placeholder="What brings you here today?" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a192f] border-white/10 text-white rounded-2xl shadow-2xl">
                        {REASONS.map((r) => (
                          <SelectItem 
                            key={r} 
                            value={r} 
                            className="py-3 px-5 focus:bg-accent focus:text-white cursor-pointer font-bold"
                          >
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-[0.98] group relative overflow-hidden"
                  disabled={!college || !reason}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Proceed to Library
                    <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-white/30 text-xs font-bold tracking-[0.4em] uppercase">
            New Era University &copy; 2024
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
