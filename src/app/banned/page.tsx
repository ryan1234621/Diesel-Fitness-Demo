"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function BannedPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter">Account Suspended</h1>
        
        <p className="text-[var(--text-secondary)] font-medium">
          Your account has been suspended by an administrator. You can no longer book sessions or access your dashboard.
        </p>

        <p className="text-sm text-[var(--text-secondary)]">
          If you believe this is an error, please contact support.
        </p>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => signOut()}
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Sign Out
          </button>
          <Link
            href="/"
            className="w-full py-3 text-black font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
