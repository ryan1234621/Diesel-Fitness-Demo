"use client";

import { useState } from "react";
import Link from "next/link";
import { Dumbbell, User, LogOut, Loader2, LayoutDashboard, Menu, X, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, signOut, loading, role } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    return role === "admin" ? "/admin" : "/dashboard";
  };

  const getInitials = () => {
    if (!user) return "";
    const name = user.user_metadata?.full_name || user.email || "";
    if (user.user_metadata?.full_name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const { avatarSignedUrl } = useAuth();

  return (
    <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
      <Link href="/" className="flex items-center gap-2">
        <Dumbbell className="w-8 h-8 text-[var(--primary)]" />
        <span className="text-2xl font-black tracking-tighter uppercase">Diesel Fitness</span>
      </Link>
      
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : user ? (
            <div className="relative">
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
                  <div className="p-2 border-b border-gray-50 flex flex-col">
                    <span className="text-sm font-bold text-black px-2 truncate">
                      {user.user_metadata?.full_name || "User"}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-medium px-2 py-1 truncate">
                      {user.email}
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
                    {(role === "user" || role === "client") && (
                      <Link 
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}
                    {role === "admin" && (
                      <Link 
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                    )}
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
          <>
            <Link href="/login" className="px-5 py-2 font-medium text-sm hover:opacity-70 transition-opacity">
              Log In
            </Link>
            <Link href="/signup" className="px-5 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-medium text-sm rounded-full hover:scale-105 active:scale-95 transition-all shadow-md">
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden flex items-center gap-4">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        ) : (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl md:hidden z-50 animate-in slide-in-from-top-4 duration-200">
          <div className="p-4 flex flex-col gap-2">
            {user ? (
              <>
                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-gray-200">
                    {avatarSignedUrl ? (
                      <img src={avatarSignedUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-black truncate">
                      {user.user_metadata?.full_name || "User"}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-medium truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                
                <Link 
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                {(role === "user" || role === "client") && (
                  <Link 
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                )}
                {role === "admin" && (
                  <Link 
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-5 py-3 font-bold text-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-5 py-3 bg-black text-white font-bold text-center rounded-xl hover:bg-gray-800 transition-colors shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
