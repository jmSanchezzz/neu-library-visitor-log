"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { mockStore } from "@/lib/store";

export default function DeniedPage() {
  const router = useRouter();

  const handleReturn = () => {
    mockStore.setCurrentUser(null);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <ShieldAlert className="w-20 h-20 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-sidebar">Access Denied</h1>
        <p className="text-lg text-muted-foreground">
          Your account has been restricted. Please contact the Library Administrator for assistance.
        </p>
        <Button 
          variant="outline" 
          onClick={handleReturn}
          className="mt-4"
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
}