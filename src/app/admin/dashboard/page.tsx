"use client";

import { useState } from "react";
import { Users, Calendar, Activity, DollarSign, Plus, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [showDateFilter, setShowDateFilter] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Admin Overview</h1>
          <p className="text-[var(--text-secondary)]">High-level metrics and recent activity.</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="relative">
          <button 
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            {dateRange}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {showDateFilter && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-2">
              {["Today", "Last 7 Days", "Last 30 Days", "This Month", "Year to Date"].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setShowDateFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    dateRange === range ? "bg-gray-50 font-bold text-black" : "text-gray-600 hover:bg-gray-50 hover:text-black font-medium"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/sessions" className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Schedule Session
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-2 px-6 py-3 bg-[#F4F3EF] text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
            <Plus className="w-5 h-5" />
            Add Client
          </Link>
          <Link href="/admin/sessions" className="flex items-center gap-2 px-6 py-3 bg-[#F4F3EF] text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
            <Plus className="w-5 h-5" />
            Create Category
          </Link>
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
