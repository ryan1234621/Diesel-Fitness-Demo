"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, ArrowLeft, Loader2, Upload, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

export default function ProfilePage() {
  const { user, profile, loading, avatarSignedUrl, refreshAvatar } = useAuth();
  const router = useRouter();
  const { error, success } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    role: "",
    status: "",
    createdAt: "",
    updatedAt: "",
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
        .select("full_name, email, role, status, created_at, updated_at")
        .eq("id", user.id)
        .single();
      
      if (data) {
        const parts = (data.full_name || "").split(" ");
        setProfileData({
          fullName: data.full_name || "Unknown User",
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          email: data.email || "",
          role: data.role || "",
          status: data.status || "",
          createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : "",
          updatedAt: data.updated_at ? new Date(data.updated_at).toLocaleDateString() : "",
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

  const getCroppedImg = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          // Set standard avatar size
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No 2d context'));
          
          // Center crop
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          
          ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
          }, 'image/jpeg', 0.9);
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      error("Image size must be less than 5MB");
      return;
    }
    
    setIsUploading(true);
    
    // File path: {user_id}/{timestamp}_{filename} to avoid cache issues
    // Always save as jpeg since we crop and convert it
    const fileExt = 'jpeg';
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    
    try {
      // Auto center-crop image to 1:1 ratio
      const croppedBlob = await getCroppedImg(file);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, { contentType: 'image/jpeg' });
        
      if (uploadError) throw uploadError;
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      await refreshAvatar();
      success("Profile picture updated successfully!");
    } catch (err: any) {
      console.error(err);
      error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const goBackUrl = profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";

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
          <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-gray-100">
            <div className="relative group">
              <div className="w-24 h-24 bg-[#F4F3EF] rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 border-gray-100 shadow-sm">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-black" />
                ) : avatarSignedUrl ? (
                  <img src={avatarSignedUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-black" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                <Camera className="w-6 h-6" />
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black">{profileData.fullName}</h2>
              <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-gray-100 text-black text-xs font-bold uppercase tracking-wide rounded-full">
                <Shield className="w-3 h-3" /> {profile?.role}
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
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">Email</label>
                <input
                  type="text"
                  disabled
                  value={profileData.email}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">Account Role</label>
                <input
                  type="text"
                  disabled
                  value={profileData.role}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">Account Status</label>
                <input
                  type="text"
                  disabled
                  value={profileData.status}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">Member Since</label>
                <input
                  type="text"
                  disabled
                  value={profileData.createdAt}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wide">Last Updated</label>
                <input
                  type="text"
                  disabled
                  value={profileData.updatedAt}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
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
