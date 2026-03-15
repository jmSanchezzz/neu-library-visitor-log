"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight,
  Building2,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COLLEGES, OFFICES, REASONS } from "@/lib/constants";
import { mockStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/constants";

// Static imports for institutional photos
import heroImg1 from '../login/pics/login_library.jpg';
import heroImg3 from '../login/pics/login_library3.jpg';
import heroImg4 from '../login/pics/logVisit_library1.jpg';
import heroImg5 from '../login/pics/logVisit_library2.jpg';
import heroImg6 from '../login/pics/logVisit_library3.jpg';

const SLIDES = [
  { img: heroImg1, alt: "NEU Library Main Entrance" },
  { img: heroImg3, alt: "NEU Library Research Area" },
  { img: heroImg4, alt: "NEU Library Study Area 1" },
  { img: heroImg5, alt: "NEU Library Study Area 2" },
  { img: heroImg6, alt: "NEU Library Study Area 3" }
];

export default function OnboardingPage() {
  const [college, setCollege] = useState("");
  const [reason, setReason] = useState("");
  const [selectedRole, setSelectedRole] = useState<"Faculty" | "Employee" | "">("");
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  // Staff emails have no dot in the local part (e.g. jcesperanza@neu.edu.ph)
  const isStaff = (email: string) => !email.split("@")[0].includes(".");

  useEffect(() => {
    setMounted(true);
    const unsubscribe = mockStore.onCurrentUserChange((currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.isBlocked) {
        router.push("/denied");
        return;
      }

      setUser(currentUser);
    });

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    
    return () => {
      unsubscribe();
      clearInterval(slideTimer);
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const staffEmail = user && isStaff(user.email);
    if (!college || !reason || (staffEmail && !selectedRole)) {
      toast({
        title: "Information Required",
        description: staffEmail
          ? "Please select your role, department, and reason for visiting."
          : "Please select both your department and reason for visiting.",
        variant: "destructive"
      });
      return;
    }

    // Determine final role:
    // - Staff emails: use selectedRole chosen in this form
    // - Student emails: always Student
    const isStaffEmail = isStaff(user.email);
    const updatedRole: UserRole = isStaffEmail ? selectedRole as "Faculty" | "Employee" : "Student";
    const updatedUser = { ...user, collegeOrOffice: college, role: updatedRole };
    await mockStore.saveUser(updatedUser);
    mockStore.setCurrentUser(updatedUser);

    // Log the initial visit
    await mockStore.addVisitLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: updatedRole,
      collegeOrOffice: college,
      reason: reason
    });

    router.push("/success");
  };

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen relative flex items-center bg-[#0B1221] overflow-hidden selection:bg-accent selection:text-white font-sans">
      {/* Background Slideshow */}
      {SLIDES.map((slide, index) => (
        <img
          key={index}
          src={slide.img.src}
          alt={slide.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 z-20 flex items-center">
        <div className="text-white text-3xl font-serif font-bold tracking-widest flex items-center">
          N
          <div className="w-1.5 h-7 bg-[#C4A052] ml-1"></div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row justify-between items-center w-full max-w-7xl h-full py-16 lg:py-0">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 text-white space-y-4 mb-16 lg:mb-0 lg:pr-10 flex flex-col justify-center translate-y-[-5%]">
          <div className="text-[#C4A052] text-sm md:text-base font-semibold tracking-wider uppercase mb-2">
            INSTITUTIONAL PORTAL
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-none uppercase tracking-tight drop-shadow-lg">
            COMPLETE YOUR <br />
            <span className="text-[#C4A052]">PROFILE</span>
            <span className="text-[#C4A052] ml-4 font-light">→</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mt-6 font-light drop-shadow-md">
            Welcome aboard, {user.name}. Please select your department and state the purpose of your visit.
          </p>
        </div>

        {/* Right Content - Glassmorphism Card */}
        <div className="w-full max-w-md lg:w-[480px]">
          <div className="bg-[#1a2b4b]/40 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Shine */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              
              {/* Graduation Cap Icon */}
              <div className="mb-2">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="url(#gold-gradient)" stroke="url(#gold-gradient-dark)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_4px_10px_rgba(196,160,82,0.4)]">
                  <defs>
                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DFBF78" />
                      <stop offset="50%" stopColor="#C4A052" />
                      <stop offset="100%" stopColor="#A28038" />
                    </linearGradient>
                    <linearGradient id="gold-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8A6F31" />
                      <stop offset="100%" stopColor="#5C471B" />
                    </linearGradient>
                  </defs>
                  <path d="M21.42 10.922a2 2 0 0 1-.019 3.838L12 18.5l-9.39-3.74a2 2 0 0 1-.019-3.838l9.36-3.78a2 2 0 0 1 1.518 0l9.36 3.78z" />
                  <path d="M22 10v6" />
                  <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                </svg>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-5 mt-2 text-left">
                <div className="space-y-5">
                  {/* Role selector — only shown for staff emails (no dot) */}
                  {isStaff(user.email) && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1 flex items-center">
                        <Building2 className="w-3 h-3 mr-2" />
                        I am a...
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["Faculty", "Employee"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => { setSelectedRole(r); setCollege(""); }}
                            className={`h-12 rounded-xl border text-sm font-medium tracking-wide transition-all ${
                              selectedRole === r
                                ? "bg-[#C4A052]/20 border-[#C4A052] text-[#DFBF78]"
                                : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1 flex items-center">
                      <Building2 className="w-3 h-3 mr-2" />
                      Select Department
                    </Label>
                    <Select onValueChange={setCollege} value={college}>
                      <SelectTrigger className="w-full h-14 bg-white/10 border border-white/30 text-white placeholder:text-white/60 px-5 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#C4A052] focus:border-transparent transition-all font-light shadow-inner data-[state=open]:bg-white/20">
                        <SelectValue placeholder="Select college or office" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a192f] border-white/10 text-white rounded-xl shadow-2xl max-h-[300px]">
                        {selectedRole === "Employee" ? (
                          OFFICES.map((o) => (
                            <SelectItem key={o} value={o} className="py-3 px-5 focus:bg-[#C4A052]/20 focus:text-white cursor-pointer font-medium">
                              {o}
                            </SelectItem>
                          ))
                        ) : (
                          COLLEGES.map((c) => (
                            <SelectItem key={c} value={c} className="py-3 px-5 focus:bg-[#C4A052]/20 focus:text-white cursor-pointer font-medium">
                              {c}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-xs font-semibold uppercase tracking-wider text-white/70 ml-1 flex items-center">
                      <HelpCircle className="w-3 h-3 mr-2 text-[#C4A052]" />
                      Purpose of Visit
                    </Label>
                    <Select onValueChange={setReason} value={reason}>
                      <SelectTrigger className="w-full h-14 bg-white/10 border border-white/30 text-white placeholder:text-white/60 px-5 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#C4A052] focus:border-transparent transition-all font-light shadow-inner data-[state=open]:bg-white/20">
                        <SelectValue placeholder="What brings you here?" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a192f] border-white/10 text-white rounded-xl shadow-2xl">
                        {REASONS.map((r) => (
                          <SelectItem 
                            key={r} 
                            value={r} 
                            className="py-3 px-5 focus:bg-[#C4A052]/20 focus:text-white cursor-pointer font-medium"
                          >
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full h-14 mt-6 bg-[#0a1f3f] hover:bg-[#0c2650] text-white font-medium text-[15px] rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                  disabled={!college || !reason || (isStaff(user.email) && !selectedRole)}
                >
                  Proceed to Library
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
