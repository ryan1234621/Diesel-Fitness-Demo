"use client";

import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Settings</h1>
          <p className="text-[var(--text-secondary)]">Configure platform preferences and defaults.</p>
        </div>
        <button className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center py-20">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">General Settings</h3>
          <p className="text-[var(--text-secondary)]">Configuration options will appear here.</p>
        </div>
      </div>
    </div>
  );
}
