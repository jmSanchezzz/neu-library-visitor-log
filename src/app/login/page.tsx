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
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative bg-sidebar overflow-hidden group">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover transition-transform duration-10000 group-hover:scale-105"
            priority
            unoptimized
            data-ai-hint={heroImage.imageHint}
          />
        )}
        
        <div className="absolute inset-0 bg-sidebar/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/40 via-transparent to-transparent" />
        
        <div className="absolute left-0 top-1/4 w-1.5 h-32 bg-green-500/60 blur-[2px] rounded-r-full animate-pulse" />
        <div className="absolute left-0 top-1/2 w-1.5 h-40 bg-red-500/60 blur-[2px] rounded-r-full animate-pulse opacity-70" />
        
        <div className="relative z-10 flex flex-col justify-end p-12 lg:p-24 text-white w-full">
          <div className="mb-6 flex items-center space-x-3">
             <div className="h-px w-12 bg-accent/50" />
             <span className="text-xs font-bold tracking-[0.4em] text-accent uppercase">Institutional Portal</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl">
            NEW ERA <br />
            UNIVERSITY <br />
            <span className="text-accent inline-flex items-center">
              LIBRARY
              <MoveRight className="ml-4 w-12 h-12 lg:w-16 lg:h-16 text-white/20" />
            </span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-lg font-medium leading-relaxed drop-shadow-md border-l-2 border-accent/30 pl-6">
            Step into a world of boundless knowledge. Your gateway to academic excellence and research discovery starts here.
          </p>
          
          <div className="mt-12 pt-12 border-t border-white/10 flex items-center space-x-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-sidebar bg-muted overflow-hidden">
                  <Image src={`https://picsum.photos/seed/user-${i}/100/100`} alt="Active User" width={40} height={40} unoptimized />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Join 15,000+ Students</p>
              <p className="text-[10px] text-white/50">Modernizing the NEU experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-white relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#001F3F 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-sidebar rounded-2xl shadow-2xl mb-6 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer group">
              <GraduationCap className="w-10 h-10 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-4xl font-black tracking-tight text-sidebar uppercase">Sign In</h3>
              <p className="text-muted-foreground font-medium">Please use your <span className="text-primary font-bold">@neu.edu.ph</span> account</p>
            </div>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sidebar font-bold text-xs uppercase tracking-widest ml-1 opacity-70">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. j.doe@neu.edu.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-14 bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all text-lg px-4 rounded-2xl shadow-inner"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-all rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 group overflow-hidden relative"
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? "Authenticating..." : (
                      <>
                        <LogIn className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                        Log in with institutional G-Suite
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                </Button>
              </form>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-muted" />
                <span className="flex-shrink mx-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Prototype Quick Access</span>
                <div className="flex-grow border-t border-muted" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-12 border-2 border-sidebar text-sidebar hover:bg-sidebar hover:text-white font-black rounded-xl group transition-all"
                  onClick={() => handleLogin(ADMIN_EMAIL)}
                  disabled={isLoading}
                >
                  <ShieldCheck className="w-4 h-4 mr-2 text-accent group-hover:text-white" />
                  ADMIN
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 border-2 border-primary/20 text-primary hover:bg-primary hover:text-white font-black rounded-xl group transition-all"
                  onClick={() => handleLogin("student.demo@neu.edu.ph")}
                  disabled={isLoading}
                >
                  <UserIcon className="w-4 h-4 mr-2 text-sidebar group-hover:text-white" />
                  STUDENT
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="pt-8 flex flex-col items-center space-y-4">
             <div className="flex items-center space-x-4 opacity-20">
                <BookOpen className="w-5 h-5" />
                <div className="h-4 w-px bg-current" />
                <Sparkles className="w-5 h-5" />
             </div>
             {year && (
               <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground text-center">
                 New Era University &copy; {year}
               </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}