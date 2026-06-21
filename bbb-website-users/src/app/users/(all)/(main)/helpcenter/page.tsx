"use client";

import { getHelpCenterTeam } from "@/actions/users";
import ApiErrorPage from "@/components/apiErrorPage";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import LoadingPage from "@/components/loader";
import { useAuthSession } from "@/hooks/useAuthSession";
import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Headset, ShieldAlert, Ticket, Lock, UserCheck, UserX,
  CreditCard, XCircle, MoreHorizontal, Loader2,
  User, Heart, MessageCircle, Shield, MonitorPlay, ShieldCheck, ArrowRight,
  MessageCircleIcon, PhoneIcon, MailIcon, ChevronRight, ChevronDown, Clock, Sparkles, Crown,
  CircleDollarSign, AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
import SubmitLoadingView from "@/components/submitLoadingView";
import { companyDetails } from "@/components/helper/constant";
import { RiWhatsappFill } from "@remixicon/react";

const popularSearches = ["How to send an interest", "Premium Membership", "Contact Details Access", "Hide My Profile", "Delete Account", "Payment Failed"];

const GmailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const quickActions = [
  { label: "Live Chat", desc: "Chat with our support team instantly", icon: MessageCircle, color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-100", type: "chat", cardBg: "bg-[#FEF2F5]/50 dark:bg-rose-950/10" },
];
const faqCategories = [
  {
    title: "Account & Profile",
    desc: "Profile settings, account management and verification",
    icon: User,
    questions: [
      { q: "How can I hide my profile from others?", a: "To hide your profile, go to 'Privacy Settings' in your account dashboard and toggle the 'Hide Profile' option. This will make your profile invisible to others until you unhide it." },
      { q: "How do I delete my account?", a: "Go to your account settings and select 'Delete Account'. Please note that this action is irreversible." },
    ]
  },
  {
    title: "Interests & Matches",
    desc: "Send interests, match requests and notifications",
    icon: Heart,
    questions: [
      { q: "How do I send an interest request?", a: "To send an interest request, go to the member's profile and click on the 'Send Interest' button. You can also add a personalized message if you are a premium member." },
      { q: "What happens after I send an interest?", a: "Once you send an interest, the other member will be notified. If they accept your interest, you will be able to start a conversation with them." },
    ]
  },
  {
    title: "Premium & Payments",
    desc: "Membership plans, payments, refunds and invoices",
    icon: Crown,
    questions: [
      { q: "How do I upgrade to Premium Membership?", a: "You can upgrade to Premium Membership by going to the 'Plans' or 'Upgrade' section in your account settings and choosing a subscription plan that fits your needs." },
    ]
  },
  {
    title: "Safety & Privacy",
    desc: "Privacy settings, reporting and blocking users",
    icon: Shield,
    questions: [
      { q: "How do I report a fake profile?", a: "If you come across a fake or suspicious profile, click the 'Report Profile' button on their profile page. Our trust and safety team will review the report immediately." },
    ]
  }
];

const helpCategories = [
  { label: "Profile & Account", desc: "Profile creation, verification, edit profile and account management.", articles: 24, icon: User, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
  { label: "Matches & Interests", desc: "Interest system, matches, compatibility and shortlisting.", articles: 18, icon: Heart, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/30" },
  { label: "Messages & Chat", desc: "Messaging, chat features, limits and conversation related help.", articles: 20, icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
  { label: "Privacy & Security", desc: "Privacy settings, blocking, hide profile and account security.", articles: 22, icon: Shield, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/30" },
  { label: "Subscription & Payments", desc: "Membership plans, billing, payments, invoices and refunds.", articles: 21, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
  { label: "Technical Support", desc: "Login issues, OTP problems, website errors and technical help.", articles: 16, icon: MonitorPlay, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/30" },
  { label: "Safety & Reporting", desc: "Report abuse, fake profiles, fraud, harassment and suspicious activity.", articles: 25, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/30" },
  { label: "Verification & Trust", desc: "Identity verification, required documents and verification status.", articles: 14, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
];

export default function HelpCenterChooseAdmin() {
  const { user, isPending } = useAuthSession();
  const userId = user?.id as string;
  const router = useRouter();
  const { teamConversationIds, resetTeamMessage } = useNotificationStore();
  const unreadCount = teamConversationIds.length;

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: helpCenterTeam, isLoading, error } = useQuery({
    queryKey: ["helpCenterTeam", userId],
    queryFn: () => getHelpCenterTeam(),
  });

  let errorMessage: string | undefined;
  if (error) {
    errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load team"
      : "Something went wrong";
  }

  const handleStartChatClick = async (topic?: string) => {
    if (!helpCenterTeam || helpCenterTeam.length === 0) {
      toast.error("Our support team is currently offline. Please try again later.");
      return;
    }
    const defaultTeam = helpCenterTeam[0];
    const teamId = defaultTeam.id;
    const conversationId = defaultTeam.conversationId;
    const queryParam = topic ? `?topic=${encodeURIComponent(topic)}` : "";
    setLoadingAction(topic || "general");

    if (conversationId) {
      resetTeamMessage();
      router.push(`/users/helpcenter/${conversationId}/chat${queryParam}`);
    } else {
      try {
        const response = await api.get<AxiosResponse<string>>(`/users/user/team/${teamId}/conversation`);
        if (response.data.success) {
          resetTeamMessage();
          router.push(`/users/helpcenter/${response.data.data}/chat${queryParam}`);
        } else {
          setLoadingAction(null);
          toast.error(response.data.message);
        }
      } catch (err) {
        const msg = isAxiosError(err) ? err.response?.data?.message || "Failed to start chat" : "Something went wrong";
        toast.error(msg);
        setLoadingAction(null);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) handleStartChatClick(searchQuery.trim());
  };

  const filteredCategories = helpCategories.filter(c =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1">
        <ApiErrorPage title="Failed to load" description={errorMessage} />
      </div>
    );
  }

  return (
    <div className="flex flex-row h-full w-full overflow-hidden bg-white dark:bg-zinc-950">
      
      {/* ─── LEFT: Main Content ─── */}
      <div className="flex-1 w-full px-4 md:px-8 py-6 pb-10 overflow-y-auto min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1a1b4b] dark:text-white">Help &amp; Support</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            We&apos;re here to help you. Find answers, get assistance, report issues, and stay safe.
          </p>
        </div>

        {/* ── Hero Search ── */}
        <div className="relative rounded-3xl border border-rose-100 dark:border-rose-900/30 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/10 p-4 md:p-5 mb-5">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/floral-motif.png')] rounded-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Left text + form */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold text-[#1a1b4b] dark:text-white mb-4">How can we help you today?</h2>

              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
                <div className="relative flex-1 min-w-0" ref={searchContainerRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 shrink-0" />
                  <Input
                    placeholder="Describe your issue in a few words..."
                    className="w-full pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />

                  {/* Search Suggestions Dropdown */}
                  {isSearchFocused && (
                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden z-50">
                      {searchQuery.trim() === "" ? (
                        <div className="py-2">
                          <p className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Popular Searches</p>
                          {popularSearches.map((term, i) => (
                            <div 
                              key={i} 
                              onClick={() => { setSearchQuery(term); setIsSearchFocused(false); handleStartChatClick(term); }}
                              className="px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer flex items-center gap-2"
                            >
                              <Search className="w-3 h-3 text-rose-300" /> {term}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2">
                          {filteredCategories.length > 0 ? (
                            <>
                              <p className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Suggested Categories</p>
                              {filteredCategories.slice(0, 4).map((cat) => {
                                const Icon = cat.icon;
                                return (
                                  <div 
                                    key={cat.label} 
                                    onClick={() => { setSearchQuery(cat.label); setIsSearchFocused(false); handleStartChatClick(cat.label); }}
                                    className="px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer flex items-center gap-3"
                                  >
                                    <div className={`w-6 h-6 rounded-md ${cat.bg} flex items-center justify-center shrink-0`}>
                                      <Icon className={`w-3 h-3 ${cat.color}`} />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-200">{cat.label}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          ) : (
                             <div 
                                onClick={() => { setIsSearchFocused(false); handleStartChatClick(searchQuery); }}
                                className="px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer flex items-center gap-2 text-sm text-rose-600 font-medium"
                              >
                               <MessageCircle className="w-4 h-4" /> Ask Support about "{searchQuery}"
                             </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-[#E51E44] hover:bg-[#C81A3C] text-white font-bold shrink-0"
                  disabled={loadingAction !== null}
                >
                  {loadingAction === "search" ? <SubmitLoadingView text="Wait" /> : "Search"}
                </Button>
              </form>

              {/* Static Popular Searches */}
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-[12px] font-extrabold text-[#1a1b4b] dark:text-zinc-200">Popular Searches:</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    "Send Interest",
                    "Premium Membership",
                    "Hide Profile",
                    "Payment Failed",
                    "Delete Account"
                  ].map((term, index) => (
                    <button 
                      key={index}
                      onClick={() => { setSearchQuery(term); handleStartChatClick(term); }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#E51E44]/20 bg-transparent hover:bg-[#E51E44]/5 transition-colors text-[#E51E44]"
                    >
                      <Search className="w-3 h-3 stroke-[2.5]" />
                      <span className="text-[11.5px] font-bold">{term}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-6">
          <div className="relative w-full overflow-hidden bg-[#FFF5F8] dark:bg-rose-950/20 rounded-[1.5rem] border border-rose-100 dark:border-rose-900/30 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
            
            {/* Left Content */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 z-10 w-full md:w-auto">
              


              {/* Text Info */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                <div className="space-y-0.5">
                  <h2 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">Chat With Support</h2>
                  <p className="text-[12px] text-slate-600 dark:text-slate-400 font-medium">Get instant help from our support team.</p>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Online Now
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Average Reply: Under 2 Minutes
                  </div>
                </div>

                <Button 
                  onClick={() => handleStartChatClick()} 
                  disabled={loadingAction !== null}
                  className="mt-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 py-4 font-bold text-sm flex items-center gap-1.5 w-full sm:w-auto shadow-md shadow-rose-500/20 relative"
                >
                  {loadingAction === "chat" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      Start Live Chat
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </>
                  )}
                  {unreadCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white dark:border-zinc-950">
                      {unreadCount}
                    </div>
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Frequently Asked Questions ── */}
        <div className="mb-8">
          <h3 className="text-[17px] font-extrabold text-[#1a1b4b] dark:text-white mb-4">Frequently Asked Questions</h3>
          <div className="flex flex-col w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {faqCategories.map((cat, index) => {
              const Icon = cat.icon;
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between py-2 px-3 text-left hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#E51E44]" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#1a1b4b] dark:text-zinc-200">{cat.title}</span>
                        <span className="text-[11px] text-gray-500 dark:text-zinc-400 leading-tight">{cat.desc}</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="pb-3 px-3 pl-[46px]">
                      <div className="flex flex-col gap-3 pt-1">
                        {cat.questions.map((q, qIndex) => (
                          <div key={qIndex} className="flex flex-col gap-0.5">
                            <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{q.q}</h4>
                            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed pr-2">{q.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Still Need Help Banner ── */}
        <div className="mb-8 mt-2">
          <div className="w-full bg-[#F8FAFC] dark:bg-slate-900/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between border border-slate-100 dark:border-slate-800/60 shadow-sm gap-3">
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-blue-100/60 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-1 md:mt-0">
                <MailIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[2]" /> 
              </div>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-[#1a1b4b] dark:text-white">Still Need Help?</h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Didn't get a reply through Live Chat?<br className="hidden md:block" />
                  Create a support ticket and our team will review your issue.
                </p>
              </div>
            </div>

            <button 
              onClick={() => { /* handle ticket creation */ }}
              className="px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 font-bold text-[13px] flex items-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Ticket className="w-3.5 h-3.5 stroke-[2]" />
              Create Support Ticket
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
            
          </div>
        </div>

      </div>

      {/* ─── RIGHT: Contact Support Sidebar ─── */}
      <div className="hidden xl:flex w-[300px] shrink-0 flex-col gap-4 border-l border-zinc-100 dark:border-zinc-800 p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-white dark:bg-zinc-950">

        {/* Safety Tips Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mt-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-[15px] font-extrabold text-[#1a1b4b] dark:text-white">Safety Tips</h2>
          </div>

          <div className="flex flex-col">
            <div className="flex gap-3 py-2 border-b border-gray-50 dark:border-zinc-800/50 last:border-0 items-start">
              <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
              </div>
              <p className="text-[12px] text-gray-600 dark:text-zinc-400 font-medium leading-relaxed mt-0.5">Never share your OTP<br/>or password.</p>
            </div>
            
            <div className="flex gap-3 py-2 border-b border-gray-50 dark:border-zinc-800/50 last:border-0 items-start">
              <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0 mt-0.5">
                <CircleDollarSign className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
              </div>
              <p className="text-[12px] text-gray-600 dark:text-zinc-400 font-medium leading-relaxed mt-0.5">Never send money to<br/>unknown members.</p>
            </div>

            <div className="flex gap-3 py-2 border-b border-gray-50 dark:border-zinc-800/50 last:border-0 items-start">
              <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
              </div>
              <p className="text-[12px] text-gray-600 dark:text-zinc-400 font-medium leading-relaxed mt-0.5">Verify profiles before sharing<br/>personal information.</p>
            </div>

            <div className="flex gap-3 py-2 border-b border-gray-50 dark:border-zinc-800/50 last:border-0 items-start">
              <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
              </div>
              <p className="text-[12px] text-gray-600 dark:text-zinc-400 font-medium leading-relaxed mt-0.5">Report suspicious activity<br/>immediately.</p>
            </div>
          </div>
        </div>

        {/* Support Status Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mt-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
            <h2 className="text-[15px] font-extrabold text-[#1a1b4b] dark:text-white">Support Status</h2>
          </div>

          <div className="flex flex-col gap-2">
            <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-green-500" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-slate-800 dark:text-zinc-200">Live Chat Available</span>
                <span className="text-[10.5px] text-gray-500 dark:text-zinc-400 mt-0.5 font-medium leading-tight">Our team is online and ready to help.</span>
              </div>
            </div>

            <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-green-500" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-slate-800 dark:text-zinc-200">Average Reply Time</span>
                <span className="text-[10.5px] text-gray-500 dark:text-zinc-400 mt-0.5 font-medium leading-tight">Under 2 Minutes</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
