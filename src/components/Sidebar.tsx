"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Calendar, Users, Activity, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar({ role }: { role: "admin" | "client" }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const adminLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Sessions", href: "/admin/sessions", icon: Activity },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const clientLinks = [
    { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { name: "My Bookings", href: "/client/bookings", icon: Calendar },
    { name: "Profile", href: "/client/profile", icon: Users },
  ];

  const links = role === "admin" ? adminLinks : clientLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full sticky top-0 shadow-sm">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
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
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-4 py-3 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
