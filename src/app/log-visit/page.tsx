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
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

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
    if (!reason) return;

    await mockStore.addVisitLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      collegeOrOffice: user.collegeOrOffice,
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
            WELCOME <br />
            <span className="text-[#C4A052]">BACK</span>
            <span className="text-[#C4A052] ml-4 font-light">→</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mt-6 font-light drop-shadow-md">
            Hello, {user.name}. We are glad to see you again. Please log your visit to continue to the library.
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

              <div className="space-y-1 w-full text-center">
                <h2 className="text-2xl font-semibold text-white tracking-wide drop-shadow-md">
                   {user.name}
                </h2>
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#C4A052]/20 border border-[#C4A052]/30 rounded-full mt-2">
                   <GraduationCap className="w-3.5 h-3.5 text-[#C4A052]" />
                   <span className="text-xs font-semibold text-[#DFBF78] uppercase tracking-wider">{user.collegeOrOffice}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-5 mt-2 text-left">
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-xs font-semibold uppercase tracking-wider text-white/70 ml-1">
                    Purpose of Visit
                  </Label>
                  <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger className="w-full h-14 bg-white/10 border border-white/30 text-white placeholder:text-white/60 px-5 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#C4A052] focus:border-transparent transition-all font-light shadow-inner data-[state=open]:bg-white/20">
                      <SelectValue placeholder="What brings you here today?" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a192f] border-white/10 text-white rounded-xl shadow-2xl">
                      {Object.entries(REASON_ICONS).map(([label, Icon]) => (
                        <SelectItem 
                          key={label} 
                          value={label} 
                          className="py-4 px-5 focus:bg-[#C4A052]/20 focus:text-white cursor-pointer font-medium"
                        >
                          <div className="flex items-center space-x-4">
                            <Icon className="w-5 h-5 text-[#C4A052]" />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <button 
                  type="submit" 
                  className="w-full h-14 mt-6 bg-[#0a1f3f] hover:bg-[#0c2650] text-white font-medium text-[15px] rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                  disabled={!reason}
                >
                  Check In Now
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
