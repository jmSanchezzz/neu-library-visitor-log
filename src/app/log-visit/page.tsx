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
  GraduationCap
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
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
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
    <div className="min-h-screen flex flex-col bg-[#4a5568] relative overflow-hidden font-body">
      {/* Institutional Watermark Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
        <div className="absolute top-10 right-10 rotate-12">
          <Book className="w-64 h-64" />
        </div>
        <div className="absolute bottom-20 left-10 -rotate-12">
          <Book className="w-80 h-80" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
          <GraduationCap className="w-[500px] h-[500px]" />
        </div>
      </div>

      {/* Header */}
      <header className="h-16 bg-white/95 backdrop-blur-sm border-b flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-sidebar flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-accent/20">
            N
          </div>
          <span className="font-bold text-sidebar text-xl tracking-tight">NEU Library</span>
        </div>
        <div className="text-sidebar/70 text-sm font-medium">
          {currentTime ? format(currentTime, "MMM dd, yyyy, hh:mm a") : ""}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden rounded-xl">
          <div className="h-2 bg-primary" />
          <CardContent className="p-8 pt-10 space-y-8 bg-white">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-sidebar tracking-tight">
                Welcome Back, {user.name.toLowerCase()}!
              </h2>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                   <img 
                    src="https://picsum.photos/seed/neu/32/32" 
                    alt="logo" 
                    className="w-full h-full object-cover grayscale opacity-70"
                    data-ai-hint="university logo"
                   />
                </div>
                <span className="text-sm font-medium">{user.collegeOrOffice}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="reason" className="text-sidebar font-bold text-sm block ml-1">
                  Reason for Visiting Today
                </Label>
                <Select onValueChange={setReason} value={reason}>
                  <SelectTrigger className="h-12 text-sidebar/80 bg-muted/30 border-muted rounded-lg focus:ring-accent">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-muted">
                    {Object.entries(REASON_ICONS).map(([label, Icon]) => (
                      <SelectItem 
                        key={label} 
                        value={label} 
                        className="py-3 px-4 focus:bg-primary/10 focus:text-primary cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-sidebar group-hover:text-primary transition-colors" />
                          <span className="font-medium text-sidebar/90">{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
                disabled={!reason}
              >
                Check In
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
