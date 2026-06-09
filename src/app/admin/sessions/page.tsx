"use client";

import { Activity } from "lucide-react";

export default function AdminSessions() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Sessions Setup</h1>
          <p className="text-[var(--text-secondary)]">Manage your available sessions and slots.</p>
        </div>
        <button className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
          Create Session
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center py-20">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No sessions created</h3>
          <p className="text-[var(--text-secondary)]">Get started by creating your first session type.</p>
        </div>
      </div>
    </div>
  );
}
