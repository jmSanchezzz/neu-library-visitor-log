"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, GraduationCap, ShieldCheck, User as UserIcon, BookOpen, Sparkles, MoveRight } from "lucide-react";
import { ALLOWED_DOMAIN, ADMIN_EMAIL, UserRole } from "@/lib/constants";
import { mockStore, User } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

// Static imports for institutional photos
import heroImg1 from './pics/login_library.jpg';
import heroImg3 from './pics/login_library3.jpg';
import heroImg4 from './pics/logVisit_library1.jpg';
import heroImg5 from './pics/logVisit_library2.jpg';
import heroImg6 from './pics/logVisit_library3.jpg';

const SLIDES = [
  { img: heroImg1, alt: "NEU Library Main Entrance" },
  { img: heroImg3, alt: "NEU Library Research Area" },
  { img: heroImg4, alt: "NEU Library Study Area 1" },
  { img: heroImg5, alt: "NEU Library Study Area 2" },
  { img: heroImg6, alt: "NEU Library Study Area 3" }
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [year, setYear] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear());
    
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    
    return () => clearInterval(slideTimer);
  }, []);

  const handleLogin = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const loginEmail = typeof e === 'string' ? e : email;
    
    setIsLoading(true);

    if (!loginEmail.endsWith(ALLOWED_DOMAIN) && loginEmail !== ADMIN_EMAIL) {
      toast({
        title: "Invalid Email Domain",
        description: `Please use your institutional @neu.edu.ph account.`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Dot in local part → Student format (firstname.lastname)
    // No dot → Staff format (initialssurname), role resolved during onboarding
    const localPart = loginEmail.split("@")[0];
    let role: UserRole = "Student";
    if (loginEmail === ADMIN_EMAIL) role = "Admin";
    else if (!localPart.includes(".")) role = "Faculty"; // placeholder, corrected in onboarding

    try {
      const existingUsers = await mockStore.getUsers();
      const user = existingUsers.find(u => u.email === loginEmail);

      if (user?.isBlocked) {
        router.push("/denied");
        return;
      }

      const newUser: User = user || {
        id: Math.random().toString(36).substring(7),
        email: loginEmail,
        name: loginEmail.split("@")[0].replace(".", " "),
        role,
        isBlocked: false
      };

      if (!user) {
        await mockStore.saveUser(newUser);
      }

      mockStore.setCurrentUser(newUser);

      setTimeout(() => {
        if (newUser.role === "Admin") {
          router.push("/admin/dashboard");
        } else if (!newUser.collegeOrOffice) {
          router.push("/onboarding");
        } else {
          router.push("/log-visit");
        }
      }, 800);
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: "Could not connect to the database. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

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
            NEW ERA UNIVERSITY <br />
            <span className="text-[#C4A052]">LIBRARY</span>
            <span className="text-[#C4A052] ml-4 font-light">→</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mt-6 font-light drop-shadow-md">
            Step into a world of boundless knowledge. Your gateway to academic excellence and research discovery starts here.
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
              
              <div className="space-y-2 w-full">
                <h2 className="text-3xl font-semibold text-white tracking-widest drop-shadow-md">SIGN IN</h2>
                <p className="text-white/90 text-sm drop-shadow">
                  Please use your <span className="font-semibold text-[#8eb2ef]">neu.edu.ph</span> account
                </p>
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-5 mt-2">
                <div>
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g., j.doe@neu.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-14 bg-white/10 border border-white/30 text-white placeholder:text-white/60 px-5 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#C4A052] focus:border-transparent transition-all font-light shadow-inner"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full h-14 bg-[#0a1f3f] hover:bg-[#0c2650] text-white font-medium text-[15px] rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl border border-white/10"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : (
                    <>
                      <MoveRight className="w-5 h-5 mr-3" />
                      Log in with G-Suite
                    </>
                  )}
                </button>
              </form>

              {/* Decorative Divider */}
              <div className="w-full flex items-center justify-center space-x-2 my-2 opacity-50">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent to-white" />
                <div className="w-1 h-1 rounded-full bg-white flex-shrink-0" />
                <div className="w-[2px] h-3 bg-white flex-shrink-0" />
                <div className="w-1 h-1 rounded-full bg-white flex-shrink-0" />
                <div className="h-[1px] w-full bg-gradient-to-l from-transparent to-white" />
              </div>

              <p className="text-white/80 text-sm font-light leading-relaxed my-4">
                Step into a world of boundless knowledge. Your gateway to academic excellence and research discovery starts here.
              </p>

              <div className="w-full relative flex items-center py-2 text-white/60">
                <div className="flex-grow border-t border-white/20" />
                <span className="flex-shrink mx-4 text-xs font-light uppercase tracking-widest">QUICK ACCESS</span>
                <div className="flex-grow border-t border-white/20" />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  type="button"
                  className="h-12 border border-white/30 bg-white/5 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all text-sm font-medium tracking-wide shadow-sm hover:shadow-md"
                  onClick={() => handleLogin(ADMIN_EMAIL)}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l8 4v6c0 5.5-3.6 10.1-8 12-4.4-1.9-8-6.5-8-12V6l8-4z"></path>
                    <path d="M12 22a9.97 9.97 0 0 1-5.1-4m10.2 0A9.97 9.97 0 0 1 12 22"></path>
                  </svg>
                  ADMIN
                </button>
                <button 
                  type="button"
                  className="h-12 border border-white/30 bg-white/5 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all text-sm font-medium tracking-wide shadow-sm hover:shadow-md"
                  onClick={() => handleLogin("student.demo@neu.edu.ph")}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  STUDENT
                </button>
              </div>
              
              <div className="w-full flex items-center justify-between text-white/60 text-xs mt-6 pt-5 border-t border-white/20">
                <BookOpen className="w-5 h-5 opacity-80" />
                <span className="tracking-widest uppercase text-[10px] md:text-xs">NEW ERA UNIVERSITY &copy; {year}</span>
                <div className="font-serif font-bold text-xl flex items-center opacity-80">
                  N<div className="w-0.5 h-3.5 bg-[#C4A052] ml-0.5"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
