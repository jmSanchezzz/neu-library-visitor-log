"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COLLEGES, REASONS } from "@/lib/constants";
import { mockStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const [college, setCollege] = useState("");
  const [reason, setReason] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = mockStore.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !reason) {
      toast({
        title: "Required Fields",
        description: "Please complete all fields to continue.",
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-accent">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-sidebar">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us track library usage by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="college">College or Office</Label>
              <Select onValueChange={setCollege} value={college}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {COLLEGES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visiting</Label>
              <Select onValueChange={setReason} value={reason}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="What is your purpose today?" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold"
            >
              Log Visit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}