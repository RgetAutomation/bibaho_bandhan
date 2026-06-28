"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import {
  User,
  Heart,
  Send,
  HeartHandshake,
  MessageSquare,
  Crown,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Sun,
  Moon,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Eye
} from "lucide-react";

import { useAuthSession } from "@/hooks/useAuthSession";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import api from "@/lib/axiosInstance";
import { isPaidUser } from "@/lib/utils";
import { UserType } from "@/components/enum/userType";
import { AllUsers } from "@/components/interface/user";
import { IConversation } from "@/components/interface/IConversation";
import { IConnectionRequest } from "@/components/interface/IConnectionRequest";
import { PaginationResponse } from "@/components/interface/AxiosResponse";
import { sendConnectionRequest } from "@/actions/userConnections";
import { getConversations } from "@/actions/usersChats";
import { getAllInterestReceived, getAllInterestSent } from "@/actions/userConnections";
import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

// Circular Progress Wheel Component
const CircularProgress = ({
  percentage,
  size = 50,
  strokeWidth = 4
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-zinc-150 dark:stroke-zinc-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={percentage === 100 ? "stroke-[#E51E44] dark:stroke-rose-500" : "stroke-[#E51E44]"}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-extrabold text-gray-900 dark:text-white">
        {percentage}%
      </span>
    </div>
  );
};



export default function UsersPage() {
  const { session, user, isPending } = useAuthSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [interestTab, setInterestTab] = useState<"received" | "sent">("received");
  const [messageFilter, setMessageFilter] = useState<"all" | "unread" | "online" | "verified">("all");
  const [showAllStats, setShowAllStats] = useState(false);

  const { userConversationIds } = useNotificationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recommended matches
  const { data: recommendedMatches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["recommendedMatches"],
    queryFn: async () => {
      const res = await api.get<PaginationResponse<AllUsers>>("/users/profiles?page=1&limit=50");
      let fetchedData = res.data.data.data;
      // Shuffle array to show random profiles
      return fetchedData.sort(() => Math.random() - 0.5);
    },
    enabled: !!user
  });

  // Fetch recent conversations
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    enabled: !!user && user.type === UserType.PAID_USER
  });

  // Fetch received interests
  const { data: receivedInterests } = useQuery({
    queryKey: ["receivedInterests"],
    queryFn: () => getAllInterestReceived(),
    enabled: !!user && user.type === UserType.PAID_USER
  });

  // Fetch sent interests
  const { data: sentInterests } = useQuery({
    queryKey: ["sentInterests"],
    queryFn: () => getAllInterestSent(),
    enabled: !!user && user.type === UserType.PAID_USER
  });

  if (isPending || !mounted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen">
        <LoadingPage />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPaid = isPaidUser(
    user.type as UserType,
    new Date(user.planExpiryDate ?? "")
  );

  const unreadMessagesCount = userConversationIds.length;

  const isMobileVerified = !!user.phone;
  const isEmailVerified = !!(user as any).emailVerified;
  const isPhotoVerified = !!(user as any).avatar || !!user.image;
  const isIdVerified = user.isProfileComplete;

  // Approximate profile completion percentage
  const completionPercentage = user.isProfileComplete 
    ? 100 
    : Math.min(90, 40 + (isMobileVerified ? 10 : 0) + (isEmailVerified ? 10 : 0) + (isPhotoVerified ? 15 : 0));

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const receivedThisWeek = receivedInterests?.filter(req => new Date(req.createdAt) > oneWeekAgo).length || 0;
  const sentThisWeek = sentInterests?.filter(req => new Date(req.createdAt) > oneWeekAgo).length || 0;

  const handleSendInterest = async (targetId: string) => {
    if (!isPaid.paid) {
      router.push("/users/membership");
      return;
    }
    const response = await sendConnectionRequest(targetId);
    if (response.success) {
      toast.success("Interest sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["recommendedMatches"] });
      queryClient.invalidateQueries({ queryKey: ["sentInterests"] });
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 px-4 pb-2 md:px-6 md:pb-6 md:pt-3 xl:px-8 xl:pt-4 bg-gray-50/50 dark:bg-zinc-950 h-full min-h-0">
      <div className="flex-1 space-y-4 md:space-y-5 min-w-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-24 md:pb-10">

        {/* Mobile Header Bar */}
        <div className="hidden items-center justify-between bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center">
            <Image
              src="/logo/logo_light.svg"
              alt="Bangali Bibaho"
              width={140}
              height={32}
              className="h-8 w-auto dark:hidden"
              priority
            />
            <Image
              src="/logo/logo_dark.svg"
              alt="Bangali Bibaho"
              width={140}
              height={32}
              className="h-8 w-auto hidden dark:block"
              priority
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/60 text-gray-500 dark:text-zinc-400 hover:text-[#9B1C31] dark:hover:text-zinc-200 transition-colors"
              aria-label="Toggle Theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <Link
              href="/users/membership"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isPaid.paid
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-[#9B1C31] border-transparent text-white hover:bg-[#801626]"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{isPaid.paid ? "Premium" : "Upgrade"}</span>
            </Link>
          </div>
        </div>
        {/* Welcome & Completeness Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 bg-gradient-to-r from-rose-50/50 to-rose-100/50 dark:from-zinc-900 dark:to-zinc-800/80 border border-rose-100 dark:border-zinc-800/80 p-3 xl:p-4 rounded-xl shadow-xs">
          
          {/* Left: Avatar + User Details */}
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20 md:w-28 md:h-28 shrink-0">
              <div className="w-full h-full rounded-xl overflow-hidden border-2 border-white shadow-sm bg-white relative">
                <Image 
                  src={(user as any).avatar || user.image || (user.gender === "MALE" ? "/groom.webp" : "/bride.webp")} 
                  alt="User" 
                  fill 
                  className="object-cover object-top" 
                />
              </div>
              {isPaid.paid && (
                <div className="absolute -bottom-1 -right-1 z-10 bg-amber-400 rounded-full p-1 border-2 border-white shadow-sm">
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                Welcome back, {user.name?.split(" ")[0] || "User"}! 👋
              </h1>
              
              {isPaid.paid ? (
                <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[9px] md:text-[11px] font-bold px-2 py-0.5 rounded mt-1 w-fit flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Gold Verified Member
                </div>
              ) : (
                <div className="bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-[9px] md:text-[11px] font-bold px-2 py-0.5 rounded mt-1 w-fit flex items-center gap-1">
                  Standard Member
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[9px] md:text-[11px] text-gray-700 dark:text-zinc-300 mt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div> 
                  Online Now
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 dark:text-zinc-500">|</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 
                  Member Since: {format(new Date(user.createdAt || new Date()), "dd MMM yyyy")}
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 dark:text-zinc-500">|</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> 
                  {(user as any).location || "Location Not Set"}
                </span>
              </div>
            </div>
          </div>



          {/* Right: Checklist (Desktop) */}
          <div className="hidden md:flex bg-white/80 dark:bg-zinc-800/80 p-3 rounded-xl shadow-sm flex-col justify-center min-w-[220px] border border-white dark:border-zinc-700/50">
            <p className="text-[10px] text-gray-600 dark:text-zinc-400 font-medium mb-2">Complete these to get better matches</p>
            <div className="space-y-2">
              <Link href="/users/account" className="flex items-center justify-between text-[11px] font-semibold text-gray-800 dark:text-zinc-200 hover:text-[#C81A3C] transition-colors group">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#C81A3C]" /> 
                  Add Family Details
                </span>
                <ChevronRight className="w-3 h-3 text-[#C81A3C] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/users/account" className="flex items-center justify-between text-[11px] font-semibold text-gray-800 dark:text-zinc-200 hover:text-[#C81A3C] transition-colors group">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#C81A3C]" /> 
                  Add Partner Preference
                </span>
                <ChevronRight className="w-3 h-3 text-[#C81A3C] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/users/account" className="flex items-center justify-between text-[11px] font-semibold text-gray-800 dark:text-zinc-200 hover:text-[#C81A3C] transition-colors group">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#C81A3C]" /> 
                  Upload 2 More Photos
                </span>
                <ChevronRight className="w-3 h-3 text-[#C81A3C] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Profile Completeness */}
        <div className="md:hidden text-card-foreground flex flex-col p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Profile Completeness</span>
              <span className="text-[10px] text-gray-500">Complete your profile to get better matches</span>
            </div>
            <CircularProgress percentage={completionPercentage} size={45} strokeWidth={4} />
          </div>
          
          {completionPercentage < 100 && (
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <Link href="/users/account" className="flex items-center justify-between text-[11px] font-semibold text-gray-800 dark:text-zinc-200 hover:text-[#C81A3C]">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#C81A3C]" /> Add Family Details</span>
                <ChevronRight className="w-3 h-3 text-[#C81A3C]" />
              </Link>
              <Link href="/users/account" className="flex items-center justify-between text-[11px] font-semibold text-gray-800 dark:text-zinc-200 hover:text-[#C81A3C]">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#C81A3C]" /> Add Partner Preference</span>
                <ChevronRight className="w-3 h-3 text-[#C81A3C]" />
              </Link>
            </div>
          )}
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
          {[
            {
              label: "Shortlisted Profiles",
              val: 0, 
              icon: Star,
              col: "text-orange-500 bg-orange-50 dark:bg-orange-950/30",
              href: "/users/home",
              trend: "View Shortlist",
              trendCol: "text-orange-500 hover:underline"
            },
            {
              label: "Received Interests",
              val: receivedInterests?.length || 0,
              icon: Heart,
              col: "text-rose-500 bg-rose-50 dark:bg-rose-950/30",
              href: "/users/interests?type=received",
              trend: receivedThisWeek > 0 ? `↑ ${receivedThisWeek} this week` : "No new this week",
              trendCol: receivedThisWeek > 0 ? "text-green-500" : "text-gray-400 dark:text-zinc-500"
            },
            {
              label: "Sent Interests",
              val: sentInterests?.length || 0,
              icon: Send,
              col: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
              href: "/users/interests?type=sent",
              trend: sentThisWeek > 0 ? `↑ ${sentThisWeek} this week` : "No new this week",
              trendCol: sentThisWeek > 0 ? "text-green-500" : "text-gray-400 dark:text-zinc-500"
            },
            {
              label: "Unread Messages",
              val: unreadMessagesCount,
              icon: MessageSquare,
              col: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
              href: "/users/chat",
              trend: "View Messages",
              trendCol: "text-blue-500 hover:underline"
            },
            {
              label: "Profile Views",
              val: 456,
              icon: Eye,
              col: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
              href: "#",
              trend: "↑ 18 this week",
              trendCol: "text-green-500"
            }
          ].map((stat, i) => {
            const SIcon = stat.icon;
            const isHiddenMobile = !showAllStats && stat.label === "Profile Views";
            
            return (
              <Link
                key={i}
                href={stat.href}
                className={`p-2.5 md:p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-xl shadow-xs flex items-center gap-2.5 md:gap-3 hover:border-[#9B1C31]/30 transition-all cursor-pointer hover:shadow-sm ${isHiddenMobile ? 'hidden md:flex' : 'flex'}`}
              >
                <div className={`p-2 md:p-2.5 rounded-full shrink-0 ${stat.col}`}>
                  <SIcon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white leading-none mb-1">
                    {stat.val}
                  </h3>
                  <span className="text-[9px] md:text-[10px] font-semibold text-gray-700 dark:text-zinc-300 leading-tight truncate">
                    {stat.label}
                  </span>
                  <span className={`text-[9px] font-bold mt-1 ${stat.trendCol} truncate`}>
                    {stat.trend}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Mobile View All / Show Less Toggle */}
        <div className="flex justify-center md:hidden mt-2">
          <button
            onClick={() => setShowAllStats(!showAllStats)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors"
          >
            {showAllStats ? "Show Less" : "View All Stats"}
          </button>
        </div>

        {/* Recommended Matches Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">Recommended Matches for You</h2>
            </div>
            <Link href="/users/matching" className="text-xs font-bold text-[#9B1C31] hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoadingMatches ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 dark:bg-zinc-900 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : !recommendedMatches || recommendedMatches.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
              No recommended matches found at the moment.
            </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-2 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 sm:overflow-visible">
              {recommendedMatches
                .filter(match => !sentInterests?.some(i => i.receiver?.id === match.id) && !receivedInterests?.some(i => i.sender?.id === match.id))
                .slice(0, 4)
                .map((match) => {
                const age = match.profile.age || 27;
                const education = match.profile.education || "B.Sc";
                const profession = match.profile.profession || "Profession Not Set";
                const location = match.profile.dist && match.profile.state 
                  ? `${match.profile.dist}, ${match.profile.state}` 
                  : "Location Not Set";

                return (
                  <Card 
                    key={match.id} 
                    onClick={() => router.push(`/users/profile/${match.id}`)}
                    className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs group hover:shadow-md transition-shadow shrink-0 w-[260px] sm:w-auto snap-start p-0 gap-0 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative aspect-square w-full bg-gray-100 dark:bg-zinc-800 shrink-0">
                      <Image
                        src={match.avatar || (match.gender === "MALE" ? "/groom.webp" : "/bride.webp")}
                        alt={match.lastName}
                        fill
                        className="object-cover object-top"
                      />
                      
                      {match.status === "Online" && (
                        <span className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                          Online
                        </span>
                      )}


                      {/* Matchmaker Banner */}
                      {match.isGhotokOwned && (
                        <div className="absolute bottom-1.5 left-0 right-0 bg-gradient-to-r from-emerald-600 via-emerald-600/80 to-transparent backdrop-blur-[2px] text-white text-[10px] font-bold py-1.5 px-2 leading-none flex items-center">
                          Managed by a Matchmaker
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-3 flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {match.title} {match.lastName}, {age}
                        </h4>
                        {match.isGhotokOwned && <CheckCircle2 className="w-4 h-4 text-white fill-green-500 shrink-0" />}
                      </div>

                      <div className="space-y-1 text-xs text-gray-600 dark:text-zinc-400 font-medium">
                        <p className="flex items-center gap-2 truncate">
                          <Briefcase className="w-3.5 h-3.5 shrink-0" /> {profession}
                        </p>
                        <p className="flex items-center gap-2 truncate">
                          <GraduationCap className="w-3.5 h-3.5 shrink-0" /> {education}
                        </p>
                        <p className="flex items-center gap-2 truncate text-gray-600 dark:text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#9B1C31]" /> {location}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendInterest(match.id!);
                          }}
                          disabled={match.isInterestSent}
                          className="rounded-xl text-xs py-1.5 text-[#E51E44] hover:text-[#C81A3C] border-[#E51E44]/30 hover:bg-rose-50 h-auto font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          {match.isInterestSent ? "Sent" : "Interest"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/users/profile/${match.id}`);
                          }}
                          className="rounded-xl text-xs py-1.5 bg-[#E51E44] hover:bg-[#C81A3C] text-white h-auto border-none shadow-sm font-bold"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Messages & Interests Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Messages */}
          <Card className="p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col h-full gap-0">
            <div className="pb-3 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Recent Messages</h3>
            </div>

            {/* Pill Filters */}
            <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none pb-1">
              <button 
                onClick={() => setMessageFilter("all")}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap ${messageFilter === "all" ? "bg-rose-50 text-[#C81A3C] border-rose-200 dark:bg-[#C81A3C]/10 dark:border-[#C81A3C]/30" : "bg-white text-gray-600 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"}`}
              >
                All Chats
              </button>
              <button 
                onClick={() => setMessageFilter("unread")}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap ${messageFilter === "unread" ? "bg-rose-50 text-[#C81A3C] border-rose-200 dark:bg-[#C81A3C]/10 dark:border-[#C81A3C]/30" : "bg-white text-gray-600 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"}`}
              >
                Unread
              </button>
              <button 
                onClick={() => setMessageFilter("online")}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap ${messageFilter === "online" ? "bg-rose-50 text-[#C81A3C] border-rose-200 dark:bg-[#C81A3C]/10 dark:border-[#C81A3C]/30" : "bg-white text-gray-600 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"}`}
              >
                Online
              </button>
              <button 
                onClick={() => setMessageFilter("verified")}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap ${messageFilter === "verified" ? "bg-rose-50 text-[#C81A3C] border-rose-200 dark:bg-[#C81A3C]/10 dark:border-[#C81A3C]/30" : "bg-white text-gray-600 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"}`}
              >
                Verified
              </button>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-zinc-800 shrink-0 overflow-y-auto h-56 max-h-56 pr-1 scrollbar-hide">
              {!conversations || conversations.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 dark:text-zinc-500 h-full flex flex-col items-center justify-center">
                  No recent messages found.
                </div>
              ) : (
                (() => {
                  const filtered = conversations.filter(conv => {
                    if (messageFilter === "unread") return conv.unreadCount > 0;
                    if (messageFilter === "online") return conv.participant.isOnline;
                    if (messageFilter === "verified") return true; 
                    return true;
                  });
                  if (filtered.length === 0) {
                    return (
                      <div className="py-6 text-center text-xs text-gray-400 dark:text-zinc-500 h-full flex flex-col items-center justify-center">
                        No {messageFilter} messages found.
                      </div>
                    );
                  }
                  return filtered.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 px-2 rounded-xl transition-colors cursor-pointer" onClick={() => router.push("/users/chat")}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0 w-10 h-10">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border relative">
                          <Image
                            src={conv.participant.avatar || "/groom.webp"}
                            alt={conv.participant.lastName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {conv.participant.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900 z-10" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {conv.participant.title} {conv.participant.lastName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                          {conv.lastMessage?.content || "No message content"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-semibold whitespace-nowrap">
                        {conv.lastMessage?.createdAt ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true }).replace('about ', '').replace('less than a minute ago', 'now') : ""}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#C81A3C] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  ));
                })()
              )}
            </div>

            <div className="pt-3 flex justify-center border-t border-gray-50 dark:border-zinc-800 mt-auto">
              <Link href="/users/chat" className="text-xs font-bold text-[#C81A3C] hover:underline flex items-center gap-1 py-1">
                Go to Messages &rarr;
              </Link>
            </div>
          </Card>

          {/* Recent Interests */}
          <Card className="p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col h-full gap-0">
            <div className="pb-3 border-b border-gray-50 dark:border-zinc-800 mb-3">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Recent Interests</h3>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-100 dark:border-zinc-800/80 mb-3 px-2">
              <button 
                onClick={() => setInterestTab("received")}
                className={`pb-2 text-sm font-bold transition-colors relative ${interestTab === "received" ? "text-[#C81A3C]" : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300"}`}
              >
                Received ({receivedInterests?.length || 0})
                {interestTab === "received" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C81A3C] rounded-t-full" />
                )}
              </button>
              <button 
                onClick={() => setInterestTab("sent")}
                className={`pb-2 text-sm font-bold transition-colors relative ${interestTab === "sent" ? "text-[#C81A3C]" : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300"}`}
              >
                Sent ({sentInterests?.length || 0})
                {interestTab === "sent" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C81A3C] rounded-t-full" />
                )}
              </button>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-zinc-800 shrink-0 overflow-y-auto h-56 max-h-56 pr-1 scrollbar-hide">
              {interestTab === "received" ? (
                !receivedInterests || receivedInterests.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400 dark:text-zinc-500 h-full flex flex-col items-center justify-center">
                    No received interests.
                  </div>
                ) : (
                  receivedInterests.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 py-3 first:pt-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border">
                          <Image
                            src={item.sender.avatar || "/groom.webp"}
                            alt={item.sender.lastName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {item.sender.title} {item.sender.lastName}
                          </h4>
                          <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium mt-0.5">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }).replace('less than a minute ago', 'now')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/users/profile/${item.sender.id}`)}
                        className="rounded-lg text-xs py-1 px-4 text-[#C81A3C] border-[#C81A3C]/30 hover:bg-rose-50 hover:border-[#C81A3C] h-auto font-bold bg-white dark:bg-transparent transition-all shadow-sm shrink-0"
                      >
                        View
                      </Button>
                    </div>
                  ))
                )
              ) : (
                !sentInterests || sentInterests.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400 dark:text-zinc-500 h-full flex flex-col items-center justify-center">
                    No sent interests.
                  </div>
                ) : (
                  sentInterests.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 py-3 first:pt-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border">
                          <Image
                            src={item.receiver?.avatar || "/groom.webp"}
                            alt={item.receiver?.lastName || "User"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {item.receiver?.title || ""} {item.receiver?.lastName || "Unknown"}
                          </h4>
                          <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium mt-0.5">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }).replace('less than a minute ago', 'now')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => item.receiver?.id && router.push(`/users/profile/${item.receiver.id}`)}
                        className="rounded-lg text-xs py-1 px-4 text-[#C81A3C] border-[#C81A3C]/30 hover:bg-rose-50 hover:border-[#C81A3C] h-auto font-bold bg-white dark:bg-transparent transition-all shadow-sm shrink-0"
                      >
                        View
                      </Button>
                    </div>
                  ))
                )
              )}
            </div>
            
            <div className="pt-3 flex justify-center border-t border-gray-50 dark:border-zinc-800 mt-auto">
              <Link href="/users/interests" className="text-xs font-bold text-[#C81A3C] hover:underline flex items-center gap-1 py-1">
                View All Interests &rarr;
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Right Column Content (Integrated into Main Page) */}
      <div className="hidden xl:block w-[250px] shrink-0 space-y-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10 pr-2">
        
        {/* Profile Strength */}
        <Card className="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-amber-600" />
            <h3 className="font-extrabold text-[13px] text-gray-900 dark:text-white">Profile Strength</h3>
          </div>
          <div className="flex items-center gap-2">
            <CircularProgress percentage={user.isProfileComplete ? 100 : 92} size={80} strokeWidth={6} />
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-[#E51E44] dark:text-rose-400">Excellent!</span>
              <p className="text-[10px] text-gray-600 dark:text-zinc-400 mt-0.5 leading-snug font-medium">
                You&apos;re almost there! Complete your profile to get more matches.
              </p>
            </div>
          </div>
          <Button onClick={() => router.push("/users/account")} className="w-full bg-[#E51E44] hover:bg-[#C81A3C] text-white font-bold rounded-lg text-[10px] py-1.5 h-auto shadow-sm">
            Improve Now
          </Button>
        </Card>

        {/* Verification Status */}
        <Card className="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <h3 className="font-extrabold text-[13px] text-gray-900 dark:text-white">Verification Status</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${isMobileVerified ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-50 dark:bg-zinc-800"}`}>
                  <svg className={`w-3 h-3 ${isMobileVerified ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <span className={`text-[10px] font-bold ${isMobileVerified ? "text-gray-700 dark:text-zinc-300" : "text-gray-400 dark:text-zinc-500"}`}>Mobile Verified</span>
              </div>
              {isMobileVerified ? (
                <CheckCircle className="w-3 h-3 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-gray-200 dark:border-zinc-700" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${isEmailVerified ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-50 dark:bg-zinc-800"}`}>
                  <svg className={`w-3 h-3 ${isEmailVerified ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className={`text-[10px] font-bold ${isEmailVerified ? "text-gray-700 dark:text-zinc-300" : "text-gray-400 dark:text-zinc-500"}`}>Email Verified</span>
              </div>
              {isEmailVerified ? (
                <CheckCircle className="w-3 h-3 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-gray-200 dark:border-zinc-700" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${isPhotoVerified ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-50 dark:bg-zinc-800"}`}>
                  <svg className={`w-3 h-3 ${isPhotoVerified ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span className={`text-[10px] font-bold ${isPhotoVerified ? "text-gray-700 dark:text-zinc-300" : "text-gray-400 dark:text-zinc-500"}`}>Photo Verified</span>
              </div>
              {isPhotoVerified ? (
                <CheckCircle className="w-3 h-3 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-gray-200 dark:border-zinc-700" />
              )}
            </div>
            

          </div>
        </Card>

        {/* Go Premium Widget */}
        {!isPaid.paid && (
          <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-100/60 dark:from-amber-900/20 dark:to-orange-900/30 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-3">
            <div className="absolute -right-4 -bottom-4 opacity-40">
              <Crown className="w-20 h-20 text-amber-300 dark:text-amber-700/30" />
            </div>
            
            <div className="relative z-10 flex items-center gap-1.5 border-b border-amber-200/50 pb-2">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">Go Premium, Get More!</h3>
            </div>
            
            <div className="relative z-10 space-y-2 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="bg-amber-100 p-0.5 rounded-full"><CheckCircle className="w-2 h-2 text-amber-600" strokeWidth={3} /></div>
                <span className="text-[9px] font-bold text-gray-800 dark:text-zinc-200">Unlock Contact Details</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-amber-100 p-0.5 rounded-full"><CheckCircle className="w-2 h-2 text-amber-600" strokeWidth={3} /></div>
                <span className="text-[9px] font-bold text-gray-800 dark:text-zinc-200">See Who Viewed You</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-amber-100 p-0.5 rounded-full"><CheckCircle className="w-2 h-2 text-amber-600" strokeWidth={3} /></div>
                <span className="text-[9px] font-bold text-gray-800 dark:text-zinc-200">Unlimited Interests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-amber-100 p-0.5 rounded-full"><CheckCircle className="w-2 h-2 text-amber-600" strokeWidth={3} /></div>
                <span className="text-[9px] font-bold text-gray-800 dark:text-zinc-200">Priority Customer Support</span>
              </div>
            </div>
            
            <div className="relative z-10 pt-1.5">
              <Button onClick={() => router.push("/users/membership")} className="w-full bg-[#E51E44] hover:bg-[#C81A3C] text-white font-bold rounded-lg text-[10px] py-1 h-auto shadow-sm">
                Upgrade to Premium
              </Button>
            </div>
          </div>
        )}
        
        {isPaid.paid && (
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-2">
            <div className="absolute -right-3 -bottom-3 opacity-50">
              <Crown className="w-16 h-16 text-amber-200 dark:text-amber-700/30" />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 text-center py-2.5">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500 mb-1" />
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">You are a Premium Member!</h3>
              <p className="text-[10px] font-medium text-amber-700 dark:text-amber-500">Enjoy all exclusive benefits.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
