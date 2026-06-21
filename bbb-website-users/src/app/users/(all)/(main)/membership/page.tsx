"use client";

import DashboardHeader from "@/components/dashboard/header";
import { PlansSection } from "@/components/dashboard/planSection";
import { UserType } from "@/components/enum/userType";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ShieldCheck, Lock, ShieldAlert, CheckCircle2, MessageSquare, MessageCircle, Mail, ChevronRight, Crown } from "lucide-react";
import { companyDetails, HELP_CENTER_LINK } from "@/components/helper/constant";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MembershipPage() {
  const { user, isPending } = useAuthSession();
  const router = useRouter();

  if (user?.gender === "FEMALE") {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50/50 dark:bg-zinc-950 px-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-[#E51E44]" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Complimentary Premium Membership</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-6">
            As a female direct member, you automatically receive a complimentary 5-year Premium Membership. You have full access to all features and do not need to purchase a plan.
          </p>
          <Button onClick={() => router.push("/users/home")} className="bg-[#E51E44] hover:bg-[#C81A3C] text-white font-bold rounded-xl px-6 py-2">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-gray-50/50 dark:bg-zinc-950">
      <div className="flex-1 h-full min-h-0 w-full px-4 md:px-6 xl:px-8 py-6 relative z-0 flex flex-col">
        <div className="w-full max-w-[1560px] h-full min-h-0 mx-auto flex flex-col xl:flex-row items-start gap-6 relative">
          
          {/* Main Plans Section */}
          <div className="flex flex-col flex-1 gap-3 w-full min-w-0 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-2">
            <PlansSection
              isPending={isPending}
              showFreeSection={user?.type === UserType.FREE_USER}
              showPlanExpiredSection={
                user?.planExpiryDate !== null &&
                user?.type === UserType.PAID_USER &&
                new Date(user?.planExpiryDate as string) < new Date()
              }
              planExpiryDate={user?.planExpiryDate}
              userType={user?.type as UserType}
              totalLimit={user?.totalLimit}
              hasUsedFreePlan={(user as any)?.hasUsedFreePlan}
              activePlanId={(user as any)?.activePlanId}
              gridClassName="grid-cols-1 md:grid-cols-2 2xl:grid-cols-3"
            />
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block w-[260px] shrink-0 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10 space-y-4 pr-2">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl p-5 flex flex-col items-center">
              <h3 className="text-[13px] font-extrabold text-gray-900 dark:text-white w-full text-left mb-4 tracking-wide">Secure & Trusted</h3>
              
              <div className="w-full flex flex-col gap-4">
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="text-[11px] font-extrabold text-gray-900 dark:text-white leading-none">100% Secure Payment</span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 leading-snug">Your payment information is safe.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="text-[11px] font-extrabold text-gray-900 dark:text-white leading-none">SSL Encrypted</span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 leading-snug">256-bit SSL encryption for protection.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="text-[11px] font-extrabold text-gray-900 dark:text-white leading-none">Privacy Protection</span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 leading-snug">Your data and privacy are top priority.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="text-[11px] font-extrabold text-gray-900 dark:text-white leading-none">Verified Profiles Only</span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 leading-snug">We ensure real and genuine profiles.</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Need Help Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl p-5 flex flex-col">
              <h3 className="text-[13px] font-extrabold text-gray-900 dark:text-white w-full text-left mb-4 tracking-wide">Need Help?</h3>
              
              <div className="w-full flex flex-col gap-4 mb-5">
                
                <Link href="/users/chat" className="flex items-center justify-between text-[11px] font-semibold text-gray-800 dark:text-zinc-200 hover:text-[#C81A3C] transition-colors group">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#C81A3C]" /> 
                      Live Chat
                    </span>
                    <span className="text-[9px] text-gray-500 dark:text-zinc-400 font-medium pl-5 mt-0.5 group-hover:text-rose-400 transition-colors">Chat with our support team</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#C81A3C] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </Link>

                <a href={`https://wa.me/91${companyDetails.contactNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-[11px] font-semibold text-gray-800 dark:text-zinc-200 hover:text-[#C81A3C] transition-colors group">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-[#C81A3C]" /> 
                      WhatsApp Support
                    </span>
                    <span className="text-[9px] text-gray-500 dark:text-zinc-400 font-medium pl-5 mt-0.5 group-hover:text-rose-400 transition-colors">+91 {companyDetails.contactNumber}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#C81A3C] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </a>

                <a href={`mailto:${companyDetails.email}`} className="flex items-center justify-between text-[11px] font-semibold text-gray-800 dark:text-zinc-200 hover:text-[#C81A3C] transition-colors group">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#C81A3C]" /> 
                      Email Support
                    </span>
                    <span className="text-[9px] text-gray-500 dark:text-zinc-400 font-medium pl-5 mt-0.5 group-hover:text-rose-400 transition-colors">{companyDetails.email}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#C81A3C] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </a>

              </div>

              <Link href={HELP_CENTER_LINK} className="w-full py-1.5 rounded-md border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-1.5 group hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-500">Visit Help Center</span>
                <ChevronRight className="w-3 h-3 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
