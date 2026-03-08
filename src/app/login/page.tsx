
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, GraduationCap, ShieldCheck, User as UserIcon, BookOpen, Sparkles, MoveRight } from "lucide-react";
import { ALLOWED_DOMAIN, ADMIN_EMAIL, UserRole } from "@/lib/constants";
import { mockStore, User } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear());
  }, []);

  const heroImage = PlaceHolderImages.find(img => img.id === "neu-library-hero");

  const handleLogin = (e: React.FormEvent | string) => {
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

    let role: UserRole = "Student";
    if (loginEmail === ADMIN_EMAIL) role = "Admin";
    else if (loginEmail.includes("faculty")) role = "Faculty";
    else if (loginEmail.includes("emp")) role = "Employee";

    const existingUsers = mockStore.getUsers();
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
      mockStore.saveUser(newUser);
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
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background selection:bg-accent selection:text-white">
      {/* Visual Side (Hero) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden group">
        {/* Using standard img tag for maximum compatibility with local pics folder in this environment */}
        {heroImage && (
          <img
            src={heroImage.imageUrl}
            alt={heroImage.description}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        
        {/* Dynamic Overlays */}
        <div className="absolute inset-0 bg-sidebar/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/60 to-transparent" />
        
        {/* Vertical Light Bar Accents based on architectural design */}
        <div className="absolute left-0 top-1/4 w-2 h-32 bg-green-500/60 blur-[4px] rounded-r-full animate-pulse" />
        <div className="absolute left-0 top-1/2 w-2 h-40 bg-red-500/60 blur-[4px] rounded-r-full animate-pulse delay-700" />
        
        <div className="relative z-10 flex flex-col justify-end p-12 lg:p-24 text-white w-full">
          <div className="mb-6 flex items-center space-x-3">
             <div className="h-[2px] w-12 bg-accent/80" />
             <span className="text-sm font-black tracking-[0.5em] text-accent uppercase drop-shadow-lg">Institutional Portal</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl">
            NEW ERA <br />
            UNIVERSITY <br />
            <span className="text-accent inline-flex items-center">
              LIBRARY
              <MoveRight className="ml-6 w-12 h-12 lg:w-20 lg:h-20 text-white/30" />
            </span>
          </h1>
          
          <div className="max-w-lg space-y-6">
            <p className="text-xl text-white/95 font-medium leading-relaxed drop-shadow-md border-l-4 border-accent pl-6 py-2">
              Step into a world of boundless knowledge. Your gateway to academic excellence and research discovery starts here.
            </p>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-sidebar bg-muted overflow-hidden shadow-xl">
                    <img src={`https://picsum.photos/seed/user-${i}/100/100`} alt="Active User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Join 15,000+ Students</p>
                <p className="text-xs text-white/60">Modernizing the NEU experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-white relative">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#001F3F 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="w-full max-w-md space-y-10 relative z-10">
          <div className="flex flex-col items-center">
            <div className="p-5 bg-sidebar rounded-[2.5rem] shadow-2xl mb-8 transform -rotate-6 hover:rotate-0 transition-all duration-500 cursor-pointer group">
              <GraduationCap className="w-12 h-12 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-5xl font-black tracking-tighter text-sidebar uppercase">Sign In</h3>
              <p className="text-muted-foreground font-semibold text-lg">
                Please use your <span className="text-primary font-black underline decoration-accent/50 underline-offset-4">@neu.edu.ph</span> account
              </p>
            </div>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sidebar font-black text-sm uppercase tracking-[0.2em] ml-2 opacity-80">Email Address</Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. j.doe@neu.edu.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-16 bg-muted/20 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all text-xl px-6 rounded-3xl shadow-inner"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-16 bg-primary hover:bg-primary/95 text-white font-black text-xl transition-all rounded-3xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 group overflow-hidden relative"
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? "Authenticating..." : (
                      <>
                        <LogIn className="w-6 h-6 mr-4 group-hover:translate-x-2 transition-transform" />
                        Log in with institutional G-Suite
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                </Button>
              </form>

              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t-2 border-muted" />
                <span className="flex-shrink mx-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Prototype Quick Access</span>
                <div className="flex-grow border-t-2 border-muted" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Button 
                  variant="outline" 
                  className="h-14 border-2 border-sidebar text-sidebar hover:bg-sidebar hover:text-white font-black rounded-2xl group transition-all shadow-lg hover:shadow-sidebar/20"
                  onClick={() => handleLogin(ADMIN_EMAIL)}
                  disabled={isLoading}
                >
                  <ShieldCheck className="w-5 h-5 mr-3 text-accent group-hover:text-white" />
                  ADMIN
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 border-2 border-primary/20 text-primary hover:bg-primary hover:text-white font-black rounded-2xl group transition-all shadow-lg hover:shadow-primary/10"
                  onClick={() => handleLogin("student.demo@neu.edu.ph")}
                  disabled={isLoading}
                >
                  <UserIcon className="w-5 h-5 mr-3 text-sidebar group-hover:text-white" />
                  STUDENT
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="pt-10 flex flex-col items-center space-y-6">
             <div className="flex items-center space-x-6 opacity-30">
                <BookOpen className="w-6 h-6" />
                <div className="h-6 w-[2px] bg-current" />
                <Sparkles className="w-6 h-6" />
             </div>
             {year && (
               <p className="text-xs font-black uppercase tracking-[0.6em] text-muted-foreground text-center opacity-50">
                 New Era University &copy; {year}
               </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
