import React from "react";
import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Book a Call | Diesel Fitness",
  description: "Schedule a consultation or book a demo session with our team.",
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="py-6 px-6 lg:px-12 flex items-center justify-between bg-white border-b border-gray-100">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="text-xl font-black tracking-tight">DIESEL FITNESS</div>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Book a Call</h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
            Choose a time that works best for you. Our team is ready to discuss your fitness goals and how we can help you achieve them.
          </p>
        </div>

        <CalendlyEmbed />
      </main>
    </div>
  );
}
