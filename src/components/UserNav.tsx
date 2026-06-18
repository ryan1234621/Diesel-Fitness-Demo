"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserNav() {
  const { user, profile, avatarSignedUrl, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    router.push("/login");
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin text-gray-400" />;
  }

  if (!user) {
    return null;
  }

  const role = profile?.role;
  const fullName = profile?.full_name || user.user_metadata?.full_name || "User";
  const email = user.email || "";

  const getInitials = () => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getDashboardLink = () => {
    return role === "admin" ? "/admin/dashboard" : "/dashboard";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold shadow-sm overflow-hidden text-sm border-2 border-white">
          {avatarSignedUrl ? (
            <img src={avatarSignedUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            getInitials()
          )}
        </div>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-gray-50 flex flex-col">
            <span className="text-sm font-bold text-black truncate">
              {fullName}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium truncate">
              {email}
            </span>
          </div>
          <div className="p-2 space-y-1">
            <Link
              href="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            {role === "admin" ? (
              <Link
                href="/admin/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
