"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useCreateAccountStore } from "@/lib/createAccountStore";
import { Heart, UserCircle, Briefcase, GraduationCap, MapPin, Scale, Home, ShieldCheck, MessageCircle, Phone, Users } from "lucide-react";

// Import all the new step components
import Step1Basic from "./_steps/Step1Basic";
import Step2Career from "./_steps/Step2Career";
import Step3Religion from "./_steps/Step3Religion";
import Step4Physical from "./_steps/Step4Physical";
import Step5Family from "./_steps/Step5Family";
import Step6PartnerBasic from "./_steps/Step6PartnerBasic";
import Step7PartnerAdvanced from "./_steps/Step7PartnerAdvanced";
import Step8FaceVerify from "./_steps/Step8FaceVerify";

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Basic Info", icon: UserCircle },
  { id: 2, title: "Career", icon: Briefcase },
  { id: 3, title: "Religion", icon: MapPin },
  { id: 4, title: "Lifestyle", icon: Heart },
  { id: 5, title: "Family", icon: Home },
  { id: 6, title: "Partner 1", icon: Scale },
  { id: 7, title: "Partner 2", icon: Scale },
  { id: 8, title: "Verify", icon: ShieldCheck },
];

// ─── Step Indicator Component ──────────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2 custom-scrollbar">
      {STEPS.map((step, idx) => {
        const isCurrent = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        return (
          <div key={step.id} className="flex items-center shrink-0">
            <div
              className={`flex items-center justify-center h-8 px-3 md:px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                  : isCompleted
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <step.icon className={`w-4 h-4 md:mr-2 ${isCurrent || isCompleted ? "opacity-100" : "opacity-50"}`} />
              <span className="hidden md:inline">{step.title}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-4 md:w-8 h-[2px] mx-1 md:mx-2 rounded-full transition-colors duration-300 ${isCompleted ? "bg-primary/30" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CompleteProfilePage() {
  const firstName = useCreateAccountStore((state) => state.firstName);
  const hydrated = useCreateAccountStore((state) => state.hydrated);
  const [currentStep, setCurrentStep] = useState(1);

  // Redirect to account if user is not logged in / missing initial data
  useEffect(() => {
    if (hydrated && !firstName) {
      redirect("/account");
    }
  }, [hydrated, firstName]);

  // Disable outer body scroll strictly on this page to prevent the white gap issue
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100dvh-5rem)] bg-background">
      {/* Left side: Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
        {/* Step Progress Bar */}
        <StepIndicator currentStep={currentStep} />

        {/* Step Content */}
        <div className="mt-6 max-w-4xl">
          {currentStep === 1 && <Step1Basic onComplete={() => setCurrentStep(2)} />}
          {currentStep === 2 && <Step2Career onComplete={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
          {currentStep === 3 && <Step3Religion onComplete={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />}
          {currentStep === 4 && <Step4Physical onComplete={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} />}
          {currentStep === 5 && <Step5Family onComplete={() => setCurrentStep(6)} onBack={() => setCurrentStep(4)} />}
          {currentStep === 6 && <Step6PartnerBasic onComplete={() => setCurrentStep(7)} onBack={() => setCurrentStep(5)} />}
          {currentStep === 7 && <Step7PartnerAdvanced onComplete={() => setCurrentStep(8)} onBack={() => setCurrentStep(6)} />}
          {currentStep === 8 && <Step8FaceVerify onBack={() => setCurrentStep(7)} />}
        </div>
      </div>

      {/* Right side: Summary / Sidebar */}
      <div className="hidden xl:flex w-[350px] 2xl:w-[400px] border-l border-border bg-card p-6 flex-col gap-6 overflow-y-auto custom-scrollbar">
        
        {/* Card 1: Need Help? */}
        <div className="border border-primary/10 bg-card rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-lg text-foreground">Need Help?</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Our support team is here to help you</p>
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors">
              <MessageCircle className="w-4 h-4" /> Live Chat
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors">
              <Phone className="w-4 h-4" /> Contact Support
            </button>
          </div>
        </div>

        {/* Card 2: Privacy */}
        <div className="border border-primary/10 bg-card rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center">
          <div className="w-2/3 relative z-10">
            <h3 className="font-semibold text-lg text-foreground">Your Privacy Matters</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">We respect your privacy and keep your information safe.</p>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-90 translate-x-4">
            <div className="bg-primary/10 p-5 rounded-full relative">
               <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
               <ShieldCheck className="w-16 h-16 text-primary drop-shadow-md relative z-10 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Card 3: Trusted */}
        <div className="border border-primary/10 bg-card rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-3.5 rounded-full shrink-0">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">Trusted by Millions</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Join thousands of happy members</p>
          </div>
        </div>

      </div>
    </div>
  );
}
