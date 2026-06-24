"use client";

import { unblockUser } from "@/actions/userConnections";
import { getBlockedUsers } from "@/actions/users";
import ApiErrorPage from "@/components/apiErrorPage";
import { PlansSection } from "@/components/dashboard/planSection";
import { UserType } from "@/components/enum/userType";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/useAuthSession";
import { isPaidUser, NotPaidUserReason } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { Info, Loader2, Ban, Users, Calendar, Clock, ShieldCheck, Briefcase, MapPin, Edit3, MoreVertical, CheckCircle2, LineChart, Shield, MessageCircle, EyeOff, Heart, SlidersHorizontal } from "lucide-react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BlockedUserPage() {
  const { user, isPending } = useAuthSession();
  const userType = user?.type as UserType;
  const isPaid = isPaidUser(userType, new Date(user?.planExpiryDate as string));

  const [loadingUnblocking, setLoadingUnblocking] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const selectTriggerRef = useRef<HTMLButtonElement>(null);

  const {
    data: blockedUsers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: () => getBlockedUsers(),
    enabled: !isPending && !!isPaid.paid,
  });

  if (isLoading || isPending) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh]">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load profile"
      : "Something went wrong";
    return (
      <ApiErrorPage
        title={"Failed to load blocked users"}
        description={errorMessage}
      />
    );
  }

  const handleUnblockUser = async (userId: string) => {
    setLoadingUnblocking(userId);
    const blockResponse = await unblockUser(userId);
    if (blockResponse.success) {
      toast.success(blockResponse.message);
      refetch();
    } else {
      toast.error(blockResponse.message);
    }
    setLoadingUnblocking(null);
  };

  const totalBlocked = blockedUsers?.length || 0;
  
  const thisMonthCount = blockedUsers?.filter(u => {
    const d = new Date(u.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length || 0;

  const todayCount = blockedUsers?.filter(u => {
    const d = new Date(u.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length || 0;

  const thisWeekCount = blockedUsers?.filter(u => {
    const d = new Date(u.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  }).length || 0;
  const sortedBlockedUsers = [...(blockedUsers || [])]
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    })
    .filter((u) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = `${u.title || ""} ${u.lastName || ""}`.toLowerCase();
      return name.includes(q);
    });

  return (
    <div className="flex flex-col min-h-full bg-gray-50/50 dark:bg-zinc-950">

      {/* Content */}
      {isPaid.paid ? (
        <div className="flex flex-col h-[calc(100vh-80px)] w-full">
          <div className="hidden md:block w-full max-w-7xl mx-auto px-4 md:px-6 xl:px-8 pt-8 pb-4 shrink-0 z-30 relative">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row items-center gap-4 relative justify-center w-full pb-2 pt-2">
              
              {/* Left: Heading */}
              <div className="w-full xl:w-auto xl:absolute xl:left-0 flex flex-col items-center xl:items-start text-center xl:text-left z-10">
                <div className="flex items-center gap-2">
                  <Ban className="w-6 h-6 text-rose-500" />
                  <h1 className="text-xl md:text-[22px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    Blocked Profiles <span className="text-gray-400">({blockedUsers?.length || 0})</span>
                  </h1>
                </div>
                <p className="text-sm font-bold text-gray-500 dark:text-zinc-400 mt-1">
                  People you have blocked from viewing or contacting you.
                </p>
              </div>

            </div>
          </div>

          <div className="flex-1 px-4 md:px-6 xl:px-8 pb-6 flex flex-col items-center relative z-0 min-h-0 h-full w-full">
            <div className="w-full max-w-7xl mx-auto h-full min-h-0 flex flex-col">
              {/* Main Layout Area */}
              <div className="block xl:flex xl:flex-row xl:gap-6 w-full h-full xl:min-h-0 relative xl:items-start">
            
            {/* Main List */}
            <div className="flex flex-col gap-4 md:gap-3 flex-1 min-w-0 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10 md:pr-2">
              
              <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur-xl pb-3 pt-1 -mx-4 px-4 w-[calc(100%+32px)] md:w-full md:mx-0 md:px-0 flex flex-col gap-3">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2 md:gap-4 w-full">
                  {/* Total Blocked */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 md:w-5 md:h-5 text-rose-500" />
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-base md:text-xl font-black text-gray-900 dark:text-white leading-none">{totalBlocked}</span>
                      <span className="text-[9px] md:text-[11px] font-bold text-gray-500 dark:text-zinc-400 mt-0.5 text-center md:text-left leading-tight">Total</span>
                    </div>
                  </div>

                  {/* This Month */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5 text-amber-500" />
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-base md:text-xl font-black text-gray-900 dark:text-white leading-none">{thisMonthCount}</span>
                      <span className="text-[9px] md:text-[11px] font-bold text-gray-500 dark:text-zinc-400 mt-0.5 text-center md:text-left leading-tight">Month</span>
                    </div>
                  </div>

                  {/* Today */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 md:w-5 md:h-5 text-purple-500" />
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-base md:text-xl font-black text-gray-900 dark:text-white leading-none">{todayCount}</span>
                      <span className="text-[9px] md:text-[11px] font-bold text-gray-500 dark:text-zinc-400 mt-0.5 text-center md:text-left leading-tight">Today</span>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-500" />
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-base md:text-xl font-black text-gray-900 dark:text-white leading-none">100%</span>
                      <span className="text-[9px] md:text-[11px] font-bold text-gray-500 dark:text-zinc-400 mt-0.5 text-center md:text-left leading-tight">Privacy</span>
                    </div>
                  </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="md:bg-white md:dark:bg-zinc-900 md:border md:border-gray-100 md:dark:border-zinc-800 md:rounded-2xl md:p-2.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 md:shadow-sm">
                  {/* Search + Filter icon row on mobile */}
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search blocked profiles..."
                        className="block w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-xl text-[13px] font-medium bg-gray-50/50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    {/* Filter icon button — mobile only */}
                    <button
                      onClick={() => selectTriggerRef.current?.click()}
                      className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors shrink-0"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort dropdown — always visible on desktop, hidden on mobile (opened via icon) */}
                  <div className="hidden md:flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-[140px] h-8 bg-white dark:bg-zinc-900 text-[12px] text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-lg font-bold shadow-sm focus:ring-0 px-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent" className="text-[12px] font-bold">Recently Blocked</SelectItem>
                          <SelectItem value="oldest" className="text-[12px] font-bold">Oldest Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Hidden Select for mobile — opened programmatically */}
                  <div className="sr-only md:hidden">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger ref={selectTriggerRef} className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent" className="text-[12px] font-bold">Recently Blocked</SelectItem>
                        <SelectItem value="oldest" className="text-[12px] font-bold">Oldest Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

            {sortedBlockedUsers?.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
              <Info className="w-12 h-12 text-gray-300 dark:text-zinc-600" />
              <h2 className="font-extrabold text-lg text-gray-800 dark:text-zinc-200">No Blocked Users</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                You have not blocked anyone yet.
              </p>
            </div>
          ) : (
            sortedBlockedUsers?.map((blockedUser) => {
              const age = blockedUser.profile?.dob ? (new Date().getFullYear() - new Date(blockedUser.profile.dob).getFullYear()) : null;
              const profession = blockedUser.profile?.profession || "Profession not specified";
              const locationParts = [blockedUser.profile?.dist, blockedUser.profile?.state].filter(Boolean);
              const location = locationParts.length > 0 ? locationParts.join(", ") : "Location not specified";
              const ageLocation = [age, location].filter(Boolean).join(", ");
              const reason = "Not Interested"; // Placeholder data (not implemented in backend)
              const note = "No note added"; // Placeholder data (not implemented in backend)
              
              const fallbackAvatar = blockedUser.gender === "FEMALE" ? "/bride.webp" : "/groom.webp";
              
              return (
              <div
                key={blockedUser.id}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-2.5 md:p-4 flex flex-row md:flex-col lg:flex-row gap-3 md:gap-5 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Left: Avatar with badge */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <Avatar className="w-12 h-12 md:w-[72px] md:h-[72px] rounded-xl border-2 border-white dark:border-zinc-900 shadow-sm">
                    <AvatarImage
                      src={blockedUser.avatar || fallbackAvatar}
                      alt={blockedUser.lastName}
                      className="object-cover object-top"
                    />
                    <AvatarFallback className="rounded-xl">{blockedUser.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  {/* Blocked Badge Overlay */}
                  <div className="absolute bottom-0 right-0 bg-white dark:bg-zinc-900 rounded-full p-[2px]">
                    <div className="bg-rose-500 text-white rounded-full p-0.5">
                      <Ban className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0 flex-1 justify-center">
                  <h3 className="text-[14px] md:text-[16px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2 truncate leading-tight">
                    {blockedUser.title || ""} {blockedUser.lastName}
                  </h3>
                  
                  {/* Mobile details */}
                  <div className="md:hidden flex flex-col mt-0.5 gap-0.5">
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 truncate leading-tight">
                      {ageLocation}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 truncate leading-tight">
                      Blocked on {format(new Date(blockedUser.createdAt), "dd MMM yyyy")}
                    </span>
                  </div>

                  {/* Desktop details */}
                  <div className="hidden md:flex items-center gap-2 text-gray-500 dark:text-zinc-400 mt-1">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[12px] font-bold truncate">{profession}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></span>
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[12px] font-bold truncate">{location}</span>
                  </div>
                </div>

                {/* Middle: Reason & Note — hidden on mobile */}
                <div className="hidden md:flex flex-col flex-1 gap-3 justify-center pl-4 border-t-0 pt-0">
                  <div className="flex">
                    <span className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center">
                      Reason: {reason}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-bold">Personal note: {note}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 md:gap-6 shrink-0 justify-end ml-auto">
                  {/* Desktop Date */}
                  <div className="hidden md:flex flex-col text-left mr-2">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400">Blocked on</span>
                    <span className="text-[12px] font-normal text-gray-700 dark:text-zinc-300">
                      {format(new Date(blockedUser.createdAt), "dd MMM yyyy, hh:mm a")}
                    </span>
                  </div>
                  
                  {/* Unblock Button */}
                  <Button
                    className="w-auto px-2.5 md:w-[140px] rounded-lg text-[10px] md:text-[12px] font-bold h-6 md:h-8 flex items-center justify-center gap-1 bg-transparent md:bg-white text-rose-600 md:text-emerald-600 border border-rose-200 md:border-emerald-200 hover:bg-rose-50 md:hover:bg-emerald-50 dark:border-rose-900/50 md:dark:border-emerald-800 dark:text-rose-400 md:dark:text-emerald-400 dark:hover:bg-rose-900/20 shadow-none md:shadow-xs transition-colors"
                    variant="outline"
                    disabled={loadingUnblocking === blockedUser.id}
                    onClick={() => handleUnblockUser(blockedUser.userId)}
                  >
                    {loadingUnblocking === blockedUser.id ? (
                      <Loader2 className="animate-spin w-3 h-3 mx-auto" />
                    ) : (
                      <><Ban className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> <span className="mt-0.5 md:mt-0">Unblock</span></>
                    )}
                  </Button>

                </div>

              </div>
              );
            })
          )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:block w-[260px] shrink-0 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10 pr-2">
               <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl p-5 flex flex-col items-center">
                 <h3 className="text-[12px] font-bold text-gray-500 dark:text-zinc-400 w-full text-left mb-4 uppercase tracking-wider">Blocked List Overview</h3>
                 
                 <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-3">
                    <Ban className="w-7 h-7 text-rose-500" />
                 </div>
                 <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">{totalBlocked}</span>
                 <span className="text-[12px] font-bold text-gray-500 dark:text-zinc-400 mt-1 mb-6">Total Blocked</span>

                 <div className="w-full flex flex-col gap-3 mb-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                          <span className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">Recently Blocked</span>
                       </div>
                       <span className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-extrabold px-2 py-0.5 rounded-md">{totalBlocked}</span>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          <span className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">This Month</span>
                       </div>
                       <span className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-extrabold px-2 py-0.5 rounded-md">{thisMonthCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                          <span className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">This Week</span>
                       </div>
                       <span className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-extrabold px-2 py-0.5 rounded-md">{thisWeekCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">Today</span>
                       </div>
                       <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold px-2 py-0.5 rounded-md">{todayCount}</span>
                    </div>
                 </div>
               </div>

               {/* Why Block Someone Card */}
               <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl p-4 flex flex-col items-center mt-6">
                 <h3 className="text-[12px] font-extrabold text-gray-900 dark:text-white w-full text-left mb-4">Why Block Someone?</h3>
                 
                 <div className="w-full flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                       <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                          <Shield className="w-3.5 h-3.5 text-blue-500" />
                       </div>
                       <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 mt-1 leading-snug">They won't be able to view your profile.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                       <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                       </div>
                       <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 mt-1 leading-snug">They can't send you messages or interests.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                       <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                          <EyeOff className="w-3.5 h-3.5 text-orange-500" />
                       </div>
                       <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 mt-1 leading-snug">They can't see your activities.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                       <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                       </div>
                       <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 mt-1 leading-snug">You'll stay safe and in control.</span>
                    </div>
                 </div>
               </div>

            </div>

            </div>

          </div>
        </div>
      </div>
      ) : (
        <div className="flex flex-1 flex-col p-4">
          <PlansSection
            showFreeSection={isPaid.reason === NotPaidUserReason.FREE_USER}
            showPlanExpiredSection={isPaid.reason === NotPaidUserReason.PLAN_EXPIRED}
            userType={userType}
            isPending={isPending}
          />
        </div>
      )}
    </div>
  );
}
