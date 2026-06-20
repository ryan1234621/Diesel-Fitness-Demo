"use client";

import React, { useEffect, useState } from "react";
import { InlineWidget } from "react-calendly";

interface CalendlyEmbedProps {
  url?: string;
  prefill?: {
    name?: string;
    email?: string;
  };
}

export function CalendlyEmbed({ url, prefill }: CalendlyEmbedProps) {
  const [mounted, setMounted] = useState(false);
  const calendlyUrl = url || process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/ryangunna071/dental-practice-appointment-setting";

  // Prevent SSR hydration errors by only rendering the widget after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!calendlyUrl) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
        <p className="text-gray-500 font-medium">Calendly integration is not configured.</p>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="w-full min-h-[650px] relative rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#54f4fc] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[750px] relative overflow-hidden bg-transparent">
      <InlineWidget
        url={calendlyUrl}
        prefill={prefill}
        styles={{
          height: "100%",
          width: "100%"
        }}
        pageSettings={{
          backgroundColor: "101010",
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: "54f4fc",
          textColor: "ffffff",
          hideGdprBanner: true
        }}
      />
    </div>
  );
}
