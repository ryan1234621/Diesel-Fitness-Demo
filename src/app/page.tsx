"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Dumbbell, Calendar, Users, Activity, User, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { WeeklySchedule } from "@/components/landing/WeeklySchedule";
import { BookingOnboardingModal } from "@/components/booking/BookingOnboardingModal";

export default function Home() {
  const { user, signOut, loading, profile } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    return profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-20 pb-32">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
            TRAIN LIKE A <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-black">BEAST</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto font-medium">
            Exclusive personal training, streamlined booking, and uncompromising results. Welcome to the elite tier of fitness.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href={getDashboardLink()} className="group flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-lg font-bold rounded-full hover:shadow-xl hover:-translate-y-1 transition-all">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="group flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-lg font-bold rounded-full hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                Book Your Session
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        <BookingOnboardingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mt-32 text-left relative z-10">
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold mb-3">Seamless Booking</h3>
            <p className="text-[var(--text-secondary)]">Reserve your spot instantly with our streamlined scheduling system.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6">
              <Activity className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold mb-3">Elite Programming</h3>
            <p className="text-[var(--text-secondary)]">Custom-tailored sessions designed to push your limits and maximize results.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold mb-3">Expert Guidance</h3>
            <p className="text-[var(--text-secondary)]">Train under the supervision of top-tier professionals dedicated to your success.</p>
          </div>
        </div>
      </main>

      {/* Weekly Schedule Section */}
      <WeeklySchedule />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-[var(--text-secondary)]">
        &copy; {new Date().getFullYear()} Diesel Fitness. All rights reserved.
      </footer>
    </div>
  );
}
