"use client";

import React, { Suspense } from "react";
import { CheckCircle2, Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-white flex flex-col pt-24">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col">
        {/* Success Header */}
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Welcome to the Transformation Plan. Your next step is to book your official onboarding and kickoff call below.
          </p>
          {sessionId && (
            <p className="text-sm text-gray-400 font-mono">
              Order ID: {sessionId.slice(0, 16)}...
            </p>
          )}
        </div>

        {/* Calendly Booking Section */}
        <div className="flex-1 bg-[#F4F3EF] rounded-[2rem] shadow-2xl overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 border border-gray-100">
          <div className="bg-black text-white p-6 sm:p-8 flex items-center gap-4">
            <Calendar className="w-8 h-8 text-[#54f4fc]" />
            <div>
              <h2 className="text-2xl font-bold">Book Your Kickoff Call</h2>
              <p className="text-gray-300 font-medium mt-1">Select a time that works best for you.</p>
            </div>
          </div>
          
          <div className="h-[700px] w-full">
            {/* Note: In a real scenario you would ideally use a webhook to save the user's email 
                linked to the sessionId in a database so you could pull it here. Since we are fully 
                bypassing a database, we render the embed without prefill, or they just type their email. */}
            <CalendlyEmbed />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
