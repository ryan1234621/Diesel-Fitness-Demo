"use client";

import { Calendar as CalendarIcon, Filter } from "lucide-react";

export default function ClientBookings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">My Bookings</h1>
          <p className="text-[var(--text-secondary)]">Manage your past and upcoming sessions.</p>
        </div>
        <button className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
          New Booking
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm border border-gray-100">Upcoming</button>
            <button className="px-4 py-2 text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg font-bold text-sm transition-colors">Past</button>
            <button className="px-4 py-2 text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg font-bold text-sm transition-colors">Cancelled</button>
          </div>
          <button className="p-2 text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 text-center py-20">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No bookings found</h3>
          <p className="text-[var(--text-secondary)]">You do not have any bookings in this category.</p>
        </div>
      </div>
    </div>
  );
}
