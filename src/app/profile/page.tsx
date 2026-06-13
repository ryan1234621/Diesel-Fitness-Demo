"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

export default function ProfilePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const { error, success } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      
      if (data) {
        const parts = (data.full_name || "").split(" ");
        setProfileData({
          fullName: data.full_name || "Unknown User",
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
        });
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const newFullName = `${profileData.firstName} ${profileData.lastName}`.trim();
    
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: newFullName })
      .eq("id", user.id);
      
    if (updateError) {
      error("Failed to update profile");
    } else {
      setProfileData(prev => ({ ...prev, fullName: newFullName }));
      success("Profile updated successfully");
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const goBackUrl = role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in duration-500">
        
        <button 
          onClick={() => router.push(goBackUrl)}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-black font-bold transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

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
            <div className="w-24 h-24 bg-[#F4F3EF] rounded-full flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black">{profileData.fullName}</h2>
              <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-gray-100 text-black text-xs font-bold uppercase tracking-wide rounded-full">
                <Shield className="w-3 h-3" /> {role}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">First Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">Last Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
