"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut,
  GraduationCap,
  Shield
} from "lucide-react";
import { shouldLogAdminSignIn, shouldLogUnauthorizedAdminAccess } from "@/lib/audit";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { mockStore, User } from "@/lib/store";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Visit Reports", icon: FileText, href: "/admin/reports" },
  { label: "User Access", icon: Users, href: "/admin/users" },
  { label: "Audit Timeline", icon: Shield, href: "/admin/audit" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const hasLoggedAdminSignIn = useRef(false);
  const unauthorizedAttemptKeys = useRef(new Set<string>());

  useEffect(() => {
    const unsubscribe = mockStore.onCurrentUserChange((currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.isBlocked) {
        router.push("/denied");
        return;
      }

      if (shouldLogUnauthorizedAdminAccess(currentUser.role, pathname)) {
        const attemptKey = `${currentUser.id}:${pathname}`;
        if (!unauthorizedAttemptKeys.current.has(attemptKey)) {
          unauthorizedAttemptKeys.current.add(attemptKey);
          void mockStore.logAuditEvent({
            type: "security.non_admin_admin_access_attempt",
            actorEmail: currentUser.email,
            actorName: currentUser.name,
            targetEmail: currentUser.email,
            targetName: currentUser.name,
            details: `Non-admin user attempted to access ${pathname}`
          }).catch((error) => {
            console.error("Failed to log unauthorized admin access attempt:", error);
          });
        }
      }

      if (currentUser.role !== "Admin") {
        router.push("/log-visit");
        return;
      }

      if (shouldLogAdminSignIn(currentUser.role, pathname) && !hasLoggedAdminSignIn.current) {
        hasLoggedAdminSignIn.current = true;
        void mockStore.logAuditEvent({
          type: "admin.sign_in",
          actorEmail: currentUser.email,
          actorName: currentUser.name,
          targetEmail: currentUser.email,
          targetName: currentUser.name,
          details: `Admin accessed ${pathname}`
        }).catch((error) => {
          console.error("Failed to log admin sign-in audit event:", error);
        });
      }

      setAdminUser(currentUser);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    await mockStore.signOutCurrentUser();
    router.push("/login");
  };

  if (!adminUser) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground hidden md:flex flex-col border-r border-sidebar-border shadow-2xl">
        <div className="p-6 flex items-center space-x-3 mb-6">
          <div className="bg-accent p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">NEU Library</h2>
            <p className="text-[10px] uppercase tracking-wider opacity-60">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-accent text-white shadow-lg" 
                    : "hover:bg-white/10 opacity-70 hover:opacity-100"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-accent")} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-sidebar-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-white/10 hover:text-white group"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3 text-accent group-hover:scale-110 transition-transform" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="md:hidden flex items-center space-x-3">
             <GraduationCap className="w-8 h-8 text-primary" />
             <span className="font-bold text-sidebar">NEU Library</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-sidebar">
              {NAV_ITEMS.find(n => n.href === pathname)?.label || "Administration"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{adminUser.name}</p>
              <p className="text-xs text-muted-foreground">{adminUser.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-md">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </section>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
