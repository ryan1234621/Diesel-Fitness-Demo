"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Calendar, Users, Activity, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar({ role }: { role: "admin" | "client" }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const adminLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Sessions", href: "/admin/sessions", icon: Activity },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const clientLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Profile", href: "/profile", icon: Users },
  ];

  const links = role === "admin" ? adminLinks : clientLinks;

  return (
    <>
      {/* Mobile Drawer Trigger (Outside Sidebar) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 p-2.5 bg-white border border-gray-200/60 rounded-xl shadow-md text-black hover:bg-gray-50 active:scale-95 transition-all md:hidden ${
          isOpen ? "top-5 left-[272px]" : "top-5 left-5"
        }`}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm transition-transform duration-300 transform md:translate-x-0 md:static shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setIsOpen(false)}>
            <Dumbbell className="w-8 h-8 text-black" />
            <span className="text-xl font-black tracking-tighter uppercase">Diesel</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
