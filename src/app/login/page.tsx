"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, GraduationCap, ShieldCheck, User as UserIcon } from "lucide-react";
import { ALLOWED_DOMAIN, ADMIN_EMAIL, UserRole } from "@/lib/constants";
import { mockStore, User } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const loginEmail = typeof e === 'string' ? e : email;
    
    setIsLoading(true);

    // Mock Domain Check
    if (!loginEmail.endsWith(ALLOWED_DOMAIN) && loginEmail !== ADMIN_EMAIL) {
      toast({
        title: "Invalid Email Domain",
        description: `Please use your institutional @neu.edu.ph account.`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Determine Role
    let role: UserRole = "Student";
    if (loginEmail === ADMIN_EMAIL) role = "Admin";
    else if (loginEmail.includes("faculty")) role = "Faculty";
    else if (loginEmail.includes("emp")) role = "Employee";

    // Check if user exists or block status
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-4 bg-sidebar rounded-full shadow-lg">
            <GraduationCap className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-sidebar">
            NEU Library Connect
          </h1>
          <p className="text-muted-foreground">Institutional Access Only</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access the library logs using your @neu.edu.ph account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="username@neu.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold transition-all duration-200 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in with Google
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-dashed">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Prototype Quick Access</p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 border-sidebar text-sidebar hover:bg-sidebar hover:text-white"
                  onClick={() => handleLogin(ADMIN_EMAIL)}
                  disabled={isLoading}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Admin
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => handleLogin("student.demo@neu.edu.ph")}
                  disabled={isLoading}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Student
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} New Era University Library System
        </p>
      </div>
    </div>
  );
}
