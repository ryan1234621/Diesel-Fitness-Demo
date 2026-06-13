"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-black tracking-tight mb-4 uppercase">
            Access Denied
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            You do not have the required permissions to view this page. If you believe this is a mistake, please contact support.
          </p>
        </div>

        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
