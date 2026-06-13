"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Calendar, Clock } from "lucide-react";

export default function ClientDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">Welcome back. Here is your upcoming schedule.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-[#F4F3EF] rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Upcoming</p>
            <p className="text-2xl font-black">0 Sessions</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-[#F4F3EF] rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Next Session</p>
            <p className="text-2xl font-black">None</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-[#F4F3EF] rounded-full flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-black">0 Sessions</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold mb-6">Upcoming Bookings</h2>
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No upcoming sessions</h3>
          <p className="text-[var(--text-secondary)] mb-6">You haven't booked any sessions yet.</p>
          <button className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
            Book a Session
          </button>
        </div>
      </div>
    </div>
  );
}
