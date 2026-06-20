"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Loader2 } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (profile?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (profile?.role === "banned") {
        router.push("/banned");
      }
    }
  }, [user, profile, loading, router]);

  if (loading || profile?.role === "banned" || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-bold text-[var(--text-secondary)] uppercase tracking-wide">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <Sidebar role="client" />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
