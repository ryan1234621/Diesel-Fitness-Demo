"use client";

import { Activity } from "lucide-react";

export default function AdminReporting() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Reports & Analytics</h1>
          <p className="text-[var(--text-secondary)]">Analyze revenue, attendance, and growth.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center py-20">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">Insufficient Data</h3>
          <p className="text-[var(--text-secondary)]">Analytics will populate as sessions are booked and completed.</p>
        </div>
      </div>
    </div>
  );
}
