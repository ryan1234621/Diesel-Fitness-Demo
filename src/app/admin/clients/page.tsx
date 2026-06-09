"use client";

import { Users } from "lucide-react";

export default function AdminClients() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Client Directory</h1>
          <p className="text-[var(--text-secondary)]">Manage your clients and their statuses.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center py-20">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No clients found</h3>
          <p className="text-[var(--text-secondary)]">Registered clients will be listed here.</p>
        </div>
      </div>
    </div>
  );
}
