"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { error, success } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Check role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      success("Welcome back to Diesel Fitness");

      if (profileData.role === "admin") {
        router.push("/admin/dashboard");
      } else if (profileData.role === "banned") {
        router.push("/banned");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      error(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity">
            <Dumbbell className="w-8 h-8 text-[var(--primary)]" />
            <span className="text-xl font-black tracking-tighter uppercase">Diesel</span>
          </Link>

          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
            <p className="text-[var(--text-secondary)]">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold uppercase tracking-wide">Password</label>
                <Link href="#" className="text-xs text-[var(--text-secondary)] hover:text-black font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[var(--text-secondary)] font-medium">
            Don't have an account?{" "}
            <Link href="/signup" className="text-black hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Graphic */}
      <div className="hidden md:block md:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-black z-0"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="max-w-lg text-white">
            <Dumbbell className="w-16 h-16 mb-8 opacity-20" />
            <h2 className="text-5xl font-black tracking-tighter leading-[1.1] mb-6">
              PUSH PAST YOUR LIMITS.
            </h2>
            <p className="text-xl text-gray-400 font-medium">
              Log in to manage your schedule, track your progress, and continue your fitness journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
