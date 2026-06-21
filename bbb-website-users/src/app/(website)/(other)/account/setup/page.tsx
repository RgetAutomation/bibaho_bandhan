"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useCreateAccountStore } from "@/lib/createAccountStore";
import { Heart, UserCircle, Briefcase, GraduationCap, MapPin, Scale, Home, ShieldCheck } from "lucide-react";

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
      <div className="hidden xl:flex w-[350px] 2xl:w-[400px] border-l border-border bg-card p-6 flex-col overflow-y-auto custom-scrollbar">
        <h3 className="font-semibold text-lg mb-4 text-slate-800 dark:text-foreground">Why complete your profile?</h3>
        
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-foreground">Get Verified Matches</h4>
              <p className="text-xs text-muted-foreground mt-1">Complete profiles get up to 5x more responses and verified badges.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-foreground">Better Compatibility</h4>
              <p className="text-xs text-muted-foreground mt-1">Our AI algorithm uses these details to find your perfect partner.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
              <UserCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-foreground">Trust & Safety</h4>
              <p className="text-xs text-muted-foreground mt-1">Face verification ensures you only connect with real, genuine people.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="bg-secondary/50 rounded-xl p-4 border border-secondary">
            <h4 className="font-medium text-sm text-foreground">Need Help?</h4>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Our support team is available 24/7.</p>
            <button className="text-xs font-medium text-primary hover:underline">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
