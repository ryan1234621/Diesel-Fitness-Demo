"use client";

import { Calendar } from "lucide-react";

export default function AdminBookings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">All Bookings</h1>
          <p className="text-[var(--text-secondary)]">View and manage all client reservations.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center py-20">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No bookings yet</h3>
          <p className="text-[var(--text-secondary)]">Client bookings will appear here once they are made.</p>
        </div>
      </div>
    </div>
  );
}
