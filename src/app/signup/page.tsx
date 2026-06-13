"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { error, success } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("No user returned");

      success("Account created successfully. Welcome to Diesel Fitness!");
      router.push("/dashboard");
    } catch (err: any) {
      error(err.message || "Failed to sign up");
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
            <h1 className="text-4xl font-black tracking-tight mb-2">Join the Elite</h1>
            <p className="text-[var(--text-secondary)]">Create an account to start booking your sessions.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

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
              <label className="text-sm font-bold uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[var(--text-secondary)] font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-black hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Graphic */}
      <div className="hidden md:block md:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black z-0"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="max-w-lg text-white">
            <Dumbbell className="w-16 h-16 mb-8 opacity-20" />
            <h2 className="text-5xl font-black tracking-tighter leading-[1.1] mb-6">
              COMMIT TO EXCELLENCE.
            </h2>
            <p className="text-xl text-gray-400 font-medium">
              Join the most exclusive personal training platform and take your fitness to the next level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
