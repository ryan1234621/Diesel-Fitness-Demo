"use client";

import React, { useEffect, useState } from "react";
import { PopupButton } from "react-calendly";

interface CalendlyModalButtonProps {
  url?: string;
  text?: string;
  className?: string;
  prefill?: {
    name?: string;
    email?: string;
  };
}

export function CalendlyModalButton({ 
  url, 
  text = "Book a Call", 
  className = "", 
  prefill 
}: CalendlyModalButtonProps) {
  const [mounted, setMounted] = useState(false);
  const calendlyUrl = url || process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/ryangunna071/dental-practice-appointment-setting";

  // Prevent SSR hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!calendlyUrl) {
    return (
      <button 
        disabled
        className={`opacity-50 cursor-not-allowed ${className}`}
        title="Calendly URL not configured"
      >
        {text}
      </button>
    );
  }

  // A styled fallback button before the client-side script mounts
  if (!mounted) {
    return (
      <button className={className} disabled>
        {text}
      </button>
    );
  }

  return (
    <PopupButton
      url={calendlyUrl}
      rootElement={document.body}
      text={text}
      className={className}
      prefill={prefill}
      pageSettings={{
        backgroundColor: "101010",
        hideEventTypeDetails: false,
        hideLandingPageDetails: false,
        primaryColor: "54f4fc",
        textColor: "ffffff",
        hideGdprBanner: true
      }}
    />
  );
}
