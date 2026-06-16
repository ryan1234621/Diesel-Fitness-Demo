"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, LayoutGrid, Tags, Search, Filter } from "lucide-react";
import { CategoriesTab } from "@/components/admin/sessions/CategoriesTab";
import { TypesTab } from "@/components/admin/sessions/TypesTab";
import { ScheduleTab } from "@/components/admin/sessions/ScheduleTab";

type Tab = "schedule" | "types" | "categories";

export default function SessionsManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">Session Management</h2>
          <p className="text-[var(--text-secondary)]">Schedule sessions, define class types, and manage categories.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-full md:w-max">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === "schedule" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
          }`}
        >
          <Calendar className="w-4 h-4" /> Schedule
        </button>
        <button
          onClick={() => setActiveTab("types")}
          className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === "types" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Templates
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === "categories" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
          }`}
        >
          <Tags className="w-4 h-4" /> Categories
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
        {/* Search & Filter Bar (Generic across tabs) */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* Tab Content Components */}
        {activeTab === "schedule" && <ScheduleTab />}
        {activeTab === "types" && <TypesTab />}
        {activeTab === "categories" && <CategoriesTab />}
      </div>
    </div>
  );
}
