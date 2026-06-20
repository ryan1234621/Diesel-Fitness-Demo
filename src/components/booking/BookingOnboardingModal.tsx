"use client";

import React, { useState } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { CalendlyEmbed } from "./CalendlyEmbed";

interface BookingOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingOnboardingModal({ isOpen, onClose }: BookingOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goal: "",
    experience: "",
    commitment: "",
    limitations: "",
    firstName: "",
    lastName: "",
    email: ""
  });

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => Math.min(prev + 1, 6));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black tracking-tight">What is your primary fitness goal?</h2>
            <div className="space-y-3">
              {["Weight Loss", "Muscle Gain", "Endurance & Stamina", "General Health & Mobility"].map(option => (
                <button
                  key={option}
                  onClick={() => { updateForm("goal", option); handleNext(); }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    formData.goal === option ? "border-black bg-black text-white" : "border-gray-100 hover:border-black/20 bg-white"
                  }`}
                >
                  <span className="font-bold text-lg">{option}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black tracking-tight">What is your current fitness level?</h2>
            <div className="space-y-3">
              {[
                { title: "Beginner", desc: "Just starting out or returning after a long break." },
                { title: "Intermediate", desc: "I work out occasionally, but need more consistency/direction." },
                { title: "Advanced", desc: "I train regularly and am looking to push my limits." }
              ].map(option => (
                <button
                  key={option.title}
                  onClick={() => { updateForm("experience", option.title); handleNext(); }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    formData.experience === option.title ? "border-black bg-black text-white" : "border-gray-100 hover:border-black/20 bg-white"
                  }`}
                >
                  <span className="font-bold text-lg block">{option.title}</span>
                  <span className={`text-sm mt-1 block ${formData.experience === option.title ? "text-gray-300" : "text-gray-500"}`}>{option.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black tracking-tight">How many days a week can you commit?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["1-2 Days", "3-4 Days", "5+ Days"].map(option => (
                <button
                  key={option}
                  onClick={() => { updateForm("commitment", option); handleNext(); }}
                  className={`p-6 rounded-2xl border-2 text-center transition-all ${
                    formData.commitment === option ? "border-black bg-black text-white" : "border-gray-100 hover:border-black/20 bg-white"
                  }`}
                >
                  <span className="font-bold text-lg">{option}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black tracking-tight">Any previous injuries or limitations?</h2>
            <p className="text-gray-500 font-medium">This helps us tailor your session for maximum safety.</p>
            <textarea
              value={formData.limitations}
              onChange={(e) => updateForm("limitations", e.target.value)}
              placeholder="E.g., Bad lower back, recovering from shoulder surgery, etc. (Leave blank if none)"
              className="w-full min-h-[150px] p-4 rounded-2xl border-2 border-gray-100 focus:border-black focus:ring-0 transition-all outline-none resize-none font-medium text-lg"
            />
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );
      case 5:
        const isFormValid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim();
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black tracking-tight">Let's get you scheduled!</h2>
            <p className="text-gray-500 font-medium">Enter your details so we can pre-fill your booking.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <button 
              onClick={handleNext}
              disabled={!isFormValid}
              className="w-full py-4 bg-[#54f4fc] text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-black text-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#54f4fc]/20"
            >
              Pick a Time <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );
      case 6:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full w-full">
            <CalendlyEmbed 
              prefill={{
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full ${step === 6 ? 'max-w-5xl h-[90vh] sm:h-[85vh]' : 'max-w-xl'} bg-[#F4F3EF] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 max-h-[95vh]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-[#F4F3EF] z-10 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && step < 6 && (
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex space-x-1.5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-black' : 
                    i < step ? 'w-2 bg-black' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className={`overflow-y-auto flex-1 ${step === 6 ? 'p-0' : 'p-6 sm:p-10'}`}>
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
