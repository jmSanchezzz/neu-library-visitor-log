"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { mockStore } from "@/lib/store";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      mockStore.setCurrentUser(null);
      router.push("/login");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 text-white text-center">
      <div className="space-y-6 animate-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="bg-white/20 p-6 rounded-full">
            <CheckCircle2 className="w-24 h-24 text-accent" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight">
          Welcome to NEU Library!
        </h1>
        <p className="text-xl opacity-90">
          Your visit has been logged successfully.
        </p>
        <div className="pt-8">
          <div className="h-1 w-48 bg-white/20 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-accent animate-[loading_4s_linear]" />
          </div>
          <p className="text-sm mt-4 opacity-70">Preparing for the next visitor...</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}