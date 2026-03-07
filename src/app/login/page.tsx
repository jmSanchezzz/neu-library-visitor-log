
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, GraduationCap, ShieldCheck, User as UserIcon, BookOpen } from "lucide-react";
import { ALLOWED_DOMAIN, ADMIN_EMAIL, UserRole } from "@/lib/constants";
import { mockStore, User } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative bg-sidebar overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover opacity-60 mix-blend-overlay"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/50 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-24 text-white">
          <div className="bg-accent/20 backdrop-blur-sm p-4 rounded-2xl w-fit mb-8 border border-accent/30">
            <GraduationCap className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-none">
            NEU LIBRARY <br />
            <span className="text-accent">CONNECT</span>
          </h1>
          <p className="text-xl text-white/80 max-w-lg font-medium leading-relaxed">
            Welcome to the digital gateway of New Era University Library. 
            Access world-class resources and manage your visits seamlessly.
          </p>
          
          <div className="mt-12 flex items-center space-x-6">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-sidebar bg-muted flex items-center justify-center text-xs font-bold text-sidebar overflow-hidden">
                  <Image src={`https://picsum.photos/seed/${i+10}/100/100`} alt="User" width={100} height={100} />
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-white/60">
              Joined by 2,000+ students & faculty
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="p-4 bg-sidebar rounded-full shadow-lg mb-4">
              <GraduationCap className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-sidebar">NEU Library Connect</h2>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-bold tracking-tight text-sidebar">Sign In</h3>
            <p className="text-muted-foreground">Please enter your institutional credentials to proceed.</p>
          </div>

          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sidebar font-bold">University Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@neu.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-muted/30 border-muted focus:ring-primary text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign in with Google
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground font-bold tracking-widest">Prototype Access</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-12 border-sidebar text-sidebar hover:bg-sidebar hover:text-white font-bold group"
                  onClick={() => handleLogin(ADMIN_EMAIL)}
                  disabled={isLoading}
                >
                  <ShieldCheck className="w-4 h-4 mr-2 text-accent group-hover:text-white" />
                  Admin
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 border-primary text-primary hover:bg-primary hover:text-white font-bold group"
                  onClick={() => handleLogin("student.demo@neu.edu.ph")}
                  disabled={isLoading}
                >
                  <UserIcon className="w-4 h-4 mr-2 text-sidebar group-hover:text-white" />
                  Student
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="pt-8 flex items-center justify-center space-x-2 text-muted-foreground/40">
             <BookOpen className="w-4 h-4" />
             <p className="text-[10px] font-bold uppercase tracking-widest">
               NEU Library Management System &copy; {new Date().getFullYear()}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
