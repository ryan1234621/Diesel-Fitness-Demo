"use client";

import { useState } from "react";
import { User, Mail, Shield } from "lucide-react";

export default function ClientProfile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Profile</h1>
          <p className="text-[var(--text-secondary)]">Manage your personal information and preferences.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-3 font-bold rounded-xl transition-colors ${
            isEditing ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
          <div className="w-24 h-24 bg-[#F4F3EF] rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black">John Doe</h2>
            <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" /> john.doe@example.com
            </p>
            <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide rounded-full">
              <Shield className="w-3 h-3" /> Active Client
            </span>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">First Name</label>
              <input
                type="text"
                disabled={!isEditing}
                defaultValue="John"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">Last Name</label>
              <input
                type="text"
                disabled={!isEditing}
                defaultValue="Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">Phone Number</label>
            <input
              type="tel"
              disabled={!isEditing}
              defaultValue=""
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>

          {isEditing && (
            <div className="pt-4">
              <button type="button" className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
