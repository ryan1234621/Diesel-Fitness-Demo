"use client";

import { Users, Calendar, Activity, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Admin Overview</h1>
        <p className="text-[var(--text-secondary)]">High-level metrics and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-black" />
            </div>
            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">+12%</span>
          </div>
          <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Revenue (MTD)</p>
          <p className="text-3xl font-black">$4,250</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-black" />
            </div>
            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">+5</span>
          </div>
          <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Active Clients</p>
          <p className="text-3xl font-black">42</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-black" />
            </div>
          </div>
          <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Bookings (This Week)</p>
          <p className="text-3xl font-black">18</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-black" />
            </div>
          </div>
          <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">Available Sessions</p>
          <p className="text-3xl font-black">6</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Bookings</h2>
          <div className="text-center py-12 text-[var(--text-secondary)]">No recent bookings.</div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6">Upcoming Sessions</h2>
          <div className="text-center py-12 text-[var(--text-secondary)]">No upcoming sessions.</div>
        </div>
      </div>
    </div>
  );
}
