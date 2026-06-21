"use client";

import {
  acceptConnectionRequest,
  deleteConnectionRequest,
  getAllInterestReceived,
  getAllInterestSent,
  rejectConnectionRequest,
} from "@/actions/userConnections";
import { ConnectionStatus } from "@/components/enum/connectionStatus";
import { UserType } from "@/components/enum/userType";
import { IConnectionRequest } from "@/components/interface/IConnectionRequest";
import LoadingPage from "@/components/loader";
import { formatDistanceToNow } from "date-fns";
import { Trash2, UserRound, UserX, XCircle, Heart, CheckCircle2, MapPin, Briefcase, GraduationCap, MoreVertical, Users, Clock, Eye, MessageCircle, ShieldCheck, Bookmark, Flag, Ban, Ruler, Crown, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoadingButton } from "@/components/loadingButton";
import toast from "react-hot-toast";
import ApiErrorPage from "@/components/apiErrorPage";
import { isAxiosError } from "axios";
import { isPaidUser, NotPaidUserReason } from "@/lib/utils";
import { PlansSection } from "@/components/dashboard/planSection";
import { useAuthSession } from "@/hooks/useAuthSession";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchParams, useRouter } from "next/navigation";

export default function ConnectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1">
          <LoadingPage />
        </div>
      }
    >
      <ConnectionPageClient />
    </Suspense>
  );
}

function ConnectionPageClient() {
  const params = useSearchParams();
  const { user } = useAuthSession();
  const userType = user?.type as UserType;
  const paramsType = params.get("type") as "sent" | "received" | "";

  const isPaid = isPaidUser(
    user?.type as UserType,
    new Date(user?.planExpiryDate ?? ""),
  );

  return (
    <div className="flex flex-col min-h-full bg-gray-50/50 dark:bg-zinc-950">

      {/* Content */}
      {isPaid.paid && isPaid.reason === NotPaidUserReason.PAID_USER ? (
        <LoadConnectionPage
          userType={userType}
          paramsType={paramsType as "sent" | "received"}
        />
      ) : isPaid.reason === NotPaidUserReason.FREE_USER ||
        isPaid.reason === NotPaidUserReason.PLAN_EXPIRED ? (
        <div className="flex flex-col flex-1 overflow-y-auto">
          <PlansSection
            showFreeSection={isPaid.reason === NotPaidUserReason.FREE_USER}
            showPlanExpiredSection={
              isPaid.reason === NotPaidUserReason.PLAN_EXPIRED
            }
            userType={userType}
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-1 items-center justify-center">
            Unauthorized
          </div>
        </div>
      )}
    </div>
  );
}

function LoadConnectionPage({
  userType,
  paramsType,
}: {
  userType: UserType;
  paramsType: "sent" | "received";
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  return (
    /* this area will flow below the sticky header and take the remaining height */
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="w-full max-w-6xl mx-auto px-4 pt-4 pb-2 shrink-0 z-30 relative">
        <div className="flex flex-col md:flex-row items-center gap-4 relative justify-center w-full">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white text-center md:absolute md:left-0 z-0">
            {paramsType === "sent" ? "Interests Sent" : "Interests Received"}
          </h2>
          
          <div className="flex bg-gray-100/80 dark:bg-zinc-800/80 p-1 rounded-xl w-full md:w-auto shrink-0 shadow-inner z-10 relative">
            <Link 
              href="/users/interests?type=received" 
              className={`flex-1 md:flex-none text-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${paramsType !== "sent" ? "bg-white dark:bg-zinc-900 text-[#E51E44] shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Received
            </Link>
            <Link 
              href="/users/interests?type=sent" 
              className={`flex-1 md:flex-none text-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${paramsType === "sent" ? "bg-white dark:bg-zinc-900 text-[#E51E44] shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Sent
            </Link>
          </div>

          <div className="w-full md:w-auto md:absolute md:right-0 z-10">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full lg:w-[260px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E51E44]/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col items-center relative z-0">
        <div className="w-full max-w-6xl">
          {paramsType === "sent" ? (
            <InterestsSentComponent userType={userType} searchQuery={debouncedSearchQuery} />
          ) : (
            <InterestsReveivedComponent userType={userType} searchQuery={debouncedSearchQuery} />
          )}
        </div>
      </div>
    </div>
  );
}

function InterestsReveivedComponent({ userType, searchQuery }: { userType: UserType, searchQuery: string }) {
  const [filterType, setFilterType] = useState("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["interestsReceived"],
    queryFn: () => getAllInterestReceived(),
    enabled: userType !== UserType.FREE_USER,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
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
        title={"Failed to load connection requests"}
        description={errorMessage}
      />
    );
  }

  // if (data?.length === 0) {
  //   return <EmptyConnectionComponent />;
  // }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const fillteredData = data?.filter((request) => {
    const isNew = new Date(request.createdAt) > threeDaysAgo;
    const match = {
      all: true,
      new: isNew,
      pending: request.status === ConnectionStatus.SENT,
      accepted: request.status === ConnectionStatus.ACCEPTED,
      declined: request.status === ConnectionStatus.REJECTED,
    } as const;

    if (!match[filterType as "all" | "new" | "pending" | "accepted" | "declined"]) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const senderName = `${request.sender?.title || ""} ${request.sender?.lastName || ""}`.toLowerCase();
      if (!senderName.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
      <div className="flex-1 w-full space-y-4">
        <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur-md pb-3 pt-1 -mx-4 px-4 md:-mx-0 md:px-0 flex items-center justify-center md:justify-start w-full">
          <FilterTabs data={data} filterType={filterType} setFilterType={setFilterType} />
        </div>
      <div className="space-y-2 flex flex-col flex-1">
        <AnimatePresence mode="popLayout">
          {fillteredData && fillteredData?.length > 0 ? (
            fillteredData?.map((request) => (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProfileCard
                  request={request}
                  interestType="received"
                  userType={userType}
                  refetch={refetch}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1"
            >
              <EmptyConnectionComponent isSearch={searchQuery.length > 0} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      <div className="hidden lg:block w-[260px] shrink-0 sticky top-4 space-y-4">
        <InterestSummarySidebar data={data} title="Received Summary" />
        <InterestDonutChart data={data} subtext="Total Received" />
        <PremiumWidget />
      </div>
    </div>
  );
}

function InterestsSentComponent({ userType, searchQuery }: { userType: UserType, searchQuery: string }) {
  const [filterType, setFilterType] = useState("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["interestsSent"],
    queryFn: () => getAllInterestSent(),
    enabled: userType !== UserType.FREE_USER,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
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
        title={"Failed to load connection requests"}
        description={errorMessage}
      />
    );
  }

  // if (data?.length === 0) {
  //   return <EmptyConnectionComponent />;
  // }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const fillteredData = data?.filter((request) => {
    const isNew = new Date(request.createdAt) > threeDaysAgo;
    const match = {
      all: true,
      new: isNew,
      pending: request.status === ConnectionStatus.SENT,
      accepted: request.status === ConnectionStatus.ACCEPTED,
      declined: request.status === ConnectionStatus.REJECTED,
    } as const;

    if (!match[filterType as "all" | "new" | "pending" | "accepted" | "declined"]) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const receiverName = `${request.receiver?.title || ""} ${request.receiver?.lastName || ""}`.toLowerCase();
      if (!receiverName.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
      <div className="flex-1 w-full space-y-4">
        <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur-md pb-3 pt-1 -mx-4 px-4 md:-mx-0 md:px-0 flex items-center justify-center md:justify-start w-full">
          <FilterTabs data={data} filterType={filterType} setFilterType={setFilterType} />
        </div>
      <div className="space-y-2 flex flex-col flex-1">
        <AnimatePresence mode="popLayout">
          {fillteredData && fillteredData?.length > 0 ? (
            fillteredData?.map((request) => (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProfileCard
                  request={request}
                  interestType="sent"
                  userType={userType}
                  refetch={refetch}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1"
            >
              <EmptyConnectionComponent isSearch={searchQuery.length > 0} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      <div className="hidden lg:block w-[260px] shrink-0 sticky top-4 space-y-4">
        <InterestSummarySidebar data={data} title="Sent Summary" />
        <InterestDonutChart data={data} subtext="Total Sent" />
        <PremiumWidget />
      </div>
    </div>
  );
}

function EmptyConnectionComponent({ isSearch = false }: { isSearch?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
      <div className="rounded-full bg-rose-50 dark:bg-zinc-800 p-6 mb-4">
        {isSearch ? <Search className="h-10 w-10 text-rose-500" /> : <UserX className="h-10 w-10 text-rose-500" />}
      </div>
      <h2 className="text-lg font-semibold">{isSearch ? "No matching profiles" : "No Connection Requests"}</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs">
        {isSearch 
          ? "We couldn't find anyone matching your search criteria. Try a different name." 
          : "You don’t have any pending connection requests right now. Start exploring profiles to connect with someone!"}
      </p>
    </div>
  );
}

function ProfileCard({
  request,
  interestType,
  userType,
  refetch,
}: {
  request: IConnectionRequest;
  interestType: "sent" | "received";
  userType: UserType;
  refetch: () => void;
}) {
  const { user } = useAuthSession();
  const [accepting, setAccepting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const profileUser = interestType === "received" ? request.sender : request.receiver;

  async function handleAcceptConnection(receivedRequest: string) {
    setAccepting(true);
    const requestResponse = await acceptConnectionRequest(receivedRequest);
    if (requestResponse.success) {
      toast.success(requestResponse.message);
      refetch();
    } else {
      toast.error(requestResponse.message);
    }
    setAccepting(false);
  }

  async function handleRejectConnection(receivedRequest: string) {
    setRejecting(true);
    const requestResponse = await rejectConnectionRequest(receivedRequest);
    if (requestResponse.success) {
      toast.success(requestResponse.message);
      refetch();
    } else {
      toast.error(requestResponse.message);
    }
    setRejecting(false);
  }

  async function handleDeleteConnection(sendRequest: string) {
    setDeleting(true);
    const requestResponse = await deleteConnectionRequest(sendRequest);
    if (requestResponse.success) {
      toast.success(requestResponse.message);
      refetch!();
    } else {
      toast.error(requestResponse.message);
    }
    setDeleting(false);
  }

  const canViewProfileFromCard = interestType === "received";

  // status texts
  let statusBadgeColor = "bg-orange-100 text-orange-600";
  let statusBadgeText = "Pending";
  if (request.status === ConnectionStatus.ACCEPTED) {
    statusBadgeColor = "bg-green-100 text-green-700";
    statusBadgeText = "Accepted";
  } else if (request.status === ConnectionStatus.REJECTED) {
    statusBadgeColor = "bg-red-100 text-red-600";
    statusBadgeText = "Declined";
  }

  const statusSubtext = interestType === "received" 
    ? (request.status === ConnectionStatus.SENT ? "Interest received" : request.status === ConnectionStatus.ACCEPTED ? "Interest accepted" : "Interest declined")
    : (request.status === ConnectionStatus.SENT ? "Interest sent" : request.status === ConnectionStatus.ACCEPTED ? "Interest accepted" : "Interest declined");

  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

  // Real-time Dynamic Match Score Calculation comparing both users
  let matchScore = 0;
  if ((user as any)?.profile && (profileUser as any)?.profile) {
    let score = 55; // Base compatibility score
    const u1 = (user as any).profile as any;
    const u2 = (profileUser as any).profile as any;

    // Direct comparisons for common preferences
    if (u1.religion && u1.religion === u2.religion) score += 15;
    if (u1.maritalStatus && u1.maritalStatus === u2.maritalStatus) score += 10;
    if (u1.state && u1.state === u2.state) score += 8;
    if (u1.motherTongue && u1.motherTongue === u2.motherTongue) score += 7;
    if (u1.diet && u1.diet === u2.diet) score += 5;
    
    matchScore = Math.min(99, Math.max(55, score));
  } else {
    // Fallback deterministic score if full profile data isn't loaded yet
    const idStr = profileUser?.id || "";
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    matchScore = 80 + (Math.abs(hash) % 20); // 80 to 99
  }

  const ageText = profileUser?.profile?.age ? `${profileUser.profile.age} Years` : "";
  const locationText = profileUser?.profile?.dist && profileUser?.profile?.state 
    ? `${profileUser.profile.dist}, ${profileUser.profile.state}` 
    : "";

  return (
    <div className="flex flex-col md:flex-row items-start p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-zinc-800/80 gap-6 w-full relative">
      
      {/* Left: Avatar & Online Status */}
      <ProfileLinkWrapper enabled={canViewProfileFromCard} userId={profileUser?.id || ""}>
        <div className="shrink-0 w-[110px] md:w-[130px]">
          <div className="relative w-full h-[140px] md:h-[165px] rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100 dark:border-zinc-800">
            <Image
              src={profileUser?.avatar ? profileUser.avatar : (profileUser?.gender === "MALE" ? "/groom.webp" : "/bride.webp")}
              alt="avatar"
              fill
              className="object-cover object-top"
            />
            
            {/* Top Left Online Badge */}
            {request.onlineStatus === "Online" && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm backdrop-blur-sm bg-[#1B7339]">
                Online
              </div>
            )}


            {profileUser?.isGhotokOwned && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-600 via-emerald-600/80 to-transparent backdrop-blur-[2px] text-white text-[7px] md:text-[8px] font-bold py-0.5 px-1.5 rounded-sm">
                Matchmaker
              </div>
            )}
          </div>
        </div>
      </ProfileLinkWrapper>

      {/* Middle Left: Details */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0 py-2">
        <ProfileLinkWrapper enabled={canViewProfileFromCard} userId={profileUser?.id || ""}>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white truncate">
              {profileUser?.title} {profileUser?.lastName}{profileUser?.profile?.age ? `, ${profileUser.profile.age}` : ""}
            </h1>
            {profileUser?.isGhotokOwned && (
              <CheckCircle2 className="w-5 h-5 text-white fill-green-500 shrink-0 shadow-sm rounded-full" />
            )}
          </div>
        </ProfileLinkWrapper>
        
        {locationText && (
          <div className="text-xs md:text-[13px] font-bold text-gray-800 dark:text-zinc-200">
            {locationText}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] md:text-xs font-semibold text-gray-600 dark:text-zinc-400 mt-1">
          {profileUser?.profile?.education && (
            <div className="flex items-center gap-1.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 shrink-0" /> {profileUser.profile.education}
            </div>
          )}
          {profileUser?.profile?.profession && (
            <div className="flex items-center gap-1.5 truncate">
              <Briefcase className="w-3.5 h-3.5 shrink-0" /> {profileUser.profile.profession}
            </div>
          )}
        </div>

        {profileUser?.profile?.height && (
          <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-gray-600 dark:text-zinc-400 mt-1.5">
            <Ruler className="w-3.5 h-3.5 shrink-0" /> {profileUser.profile.height}
          </div>
        )}

        {((profileUser?.profile as any)?.religion || (profileUser?.profile as any)?.maritalStatus) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs font-bold text-gray-500 dark:text-zinc-500 mt-1.5">
            <span className="text-gray-300 mx-1">|</span>
            {(profileUser?.profile as any)?.religion && (
              <>
                <span className="truncate">{(profileUser?.profile as any)?.religion}</span>
                <span className="text-gray-300 mx-1">|</span>
              </>
            )}
            {(profileUser?.profile as any)?.maritalStatus && (
              <span className="truncate">{(profileUser?.profile as any)?.maritalStatus}</span>
            )}
          </div>
        )}
      </div>

      {/* Middle Right: Match Score */}
      <div className="hidden lg:flex flex-col items-center justify-center min-w-[110px] shrink-0">
        <div className="relative flex items-center justify-center w-[88px] h-[88px]">
          {/* Background Circle */}
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`gradient-${request.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E51E44" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke="#FCE4EC"
              strokeWidth="5"
            />
            {/* Progress */}
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke={`url(#gradient-${request.id})`}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={(2 * Math.PI * 40) * (1 - matchScore / 100)}
            />
          </svg>
          
          <div className="flex flex-col items-center justify-center absolute mt-0.5">
            <span className="text-xl font-extrabold text-[#E51E44] leading-none mb-0.5">{matchScore}%</span>
            <span className="text-[10px] font-bold text-gray-800 dark:text-zinc-300 leading-none">Match</span>
          </div>
        </div>
      </div>

      {/* Right: Status & Actions */}
      {interestType === "received" && request.status === ConnectionStatus.SENT ? (
        <div className="flex flex-col items-end shrink-0 w-full md:w-[200px] mt-2 md:mt-0">
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 text-[#E51E44]">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">Interested in you</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors outline-none" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem className="gap-2 cursor-pointer text-gray-700">
                  <Ban className="w-4 h-4" /> Block
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                  <Flag className="w-4 h-4" /> Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full text-left text-xs font-bold text-gray-500 mb-3">
            {timeAgo}
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <Button
              size="sm"
              onClick={() => handleAcceptConnection(request.id as string)}
              disabled={accepting || rejecting}
              className="rounded-xl w-full text-[11px] font-bold bg-[#1B7339] hover:bg-[#145a2b] text-white h-8 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {accepting ? "..." : "Accept Interest"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl w-full text-[11px] font-bold text-[#E51E44] border-rose-200 hover:bg-rose-50 h-8 flex items-center justify-center gap-1.5"
            >
              <Link href={`/users/profile/${profileUser?.id}`}>
                <Eye className="w-3.5 h-3.5" />
                View Profile
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRejectConnection(request.id as string)}
              disabled={accepting || rejecting}
              className="rounded-xl w-full text-[11px] font-bold text-[#E51E44] border-rose-200 hover:bg-rose-50 h-8 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              {rejecting ? "..." : "Decline"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-end shrink-0 w-full md:w-[200px] mt-2 md:mt-0">
          <div className={`flex items-center ${interestType === "sent" && request.status === ConnectionStatus.SENT ? "justify-between" : "justify-end"} w-full`}>
            {interestType === "sent" && request.status === ConnectionStatus.SENT && (
              <div className="flex items-center gap-1.5 text-orange-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">Pending Request</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors outline-none" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem className="gap-2 cursor-pointer text-gray-700">
                  <Ban className="w-4 h-4" /> Block
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                  <Flag className="w-4 h-4" /> Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full text-left text-xs font-bold text-gray-600 dark:text-zinc-400">
            {statusSubtext}
          </div>
          <div className="w-full text-left text-[10px] font-bold text-gray-400 dark:text-zinc-500 mb-3 mt-0.5">
            {timeAgo}
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            {interestType === "sent" && request.status === ConnectionStatus.SENT && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl w-full text-[11px] font-bold text-gray-700 border-gray-200 hover:bg-gray-50 h-8 flex items-center justify-center gap-1.5"
                  onClick={() => handleDeleteConnection(request.id as string)}
                  disabled={deleting}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {deleting ? "..." : "Cancel Request"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl w-full text-[11px] font-bold text-[#E51E44] border-rose-200 hover:bg-rose-50 h-8 flex items-center justify-center gap-1.5"
                >
                  <Link href={`/users/profile/${profileUser?.id}`}>
                    <Eye className="w-3.5 h-3.5" />
                    View Profile
                  </Link>
                </Button>
              </>
            )}

            {request.status !== ConnectionStatus.SENT && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl w-full text-[11px] font-bold text-[#E51E44] border-rose-200 hover:bg-rose-50 h-8 flex items-center justify-center gap-1.5"
                  asChild
                >
                  <Link href={`/chat?userId=${profileUser?.id}`}>
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl w-full text-[11px] font-bold text-[#E51E44] border-rose-200 hover:bg-rose-50 h-8 flex items-center justify-center gap-1.5"
                >
                  <Link href={`/users/profile/${profileUser?.id}`}>
                    <Eye className="w-3.5 h-3.5" />
                    View Profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl w-full text-[11px] font-bold text-[#E51E44] border-rose-200 hover:bg-rose-50 h-8 flex items-center justify-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Shortlist
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileLinkWrapper({
  enabled,
  userId,
  children,
}: {
  enabled: boolean;
  userId: string;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;

  return (
    <Link
      href={`/users/profile/${userId}`}
      className="cursor-pointer hover:opacity-90 transition"
    >
      {children}
    </Link>
  );
}

const ViewProfileButton = ({ userId }: { userId: string }) => (
  <Button className="w-full rounded-full" variant="outline" asChild>
    <Link href={`/users/profile/${userId}`}>
      <UserRound />
      <span>View Profile</span>
    </Link>
  </Button>
);

const RejectButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => (
  <Button
    onClick={onClick}
    disabled={loading}
    variant={"outline"}
    className="rounded-full border border-red-500 hover:border-red-600 text-red-500 hover:text-red-600 px-5 flex items-center gap-1"
  >
    {loading ? (
      <LoadingButton title="Rejecting" />
    ) : (
      <>
        <XCircle className="h-4 w-4" />
        Reject
      </>
    )}
  </Button>
);

const AcceptButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => (
  <Button
    onClick={onClick}
    disabled={loading}
    className="rounded-full text-white px-5 flex items-center gap-1"
  >
    {loading ? (
      <LoadingButton title="Accepting" />
    ) : (
      <>
        <Heart className="h-4 w-4" />
        Connect
      </>
    )}
  </Button>
);

const DeleteButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => (
  <Button
    onClick={onClick}
    disabled={loading}
    className="rounded-full bg-red-600 hover:bg-red-700 text-white px-5 flex items-center gap-1"
  >
    {loading ? (
      <LoadingButton title="Deleting" />
    ) : (
      <>
        <Trash2 className="h-4 w-4" />
        Delete Interest
      </>
    )}
  </Button>
);

function InterestSummarySidebar({ data, title }: { data: IConnectionRequest[] | undefined, title: string }) {
  if (!data) return null;

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const newCount = data.filter(r => new Date(r.createdAt) > threeDaysAgo).length;
  const pendingCount = data.filter(r => r.status === ConnectionStatus.SENT).length;
  const acceptedCount = data.filter(r => r.status === ConnectionStatus.ACCEPTED).length;
  const declinedCount = data.filter(r => r.status === ConnectionStatus.REJECTED).length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-pink-600" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* New */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-pink-50 dark:bg-pink-900/20 p-2 rounded-lg">
              <Users className="w-4 h-4 text-pink-600 dark:text-pink-500" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">{newCount}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">New</span>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-500" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">{pendingCount}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Pending</span>
        </div>

        {/* Accepted */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">{acceptedCount}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Accepted</span>
        </div>

        {/* Declined */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-500" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">{declinedCount}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Declined</span>
        </div>
      </div>
    </div>
  );
}

function FilterTabs({ data, filterType, setFilterType }: { data: IConnectionRequest[] | undefined, filterType: string, setFilterType: (val: string) => void }) {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  
  const allCount = data?.length || 0;
  const newCount = data?.filter(r => new Date(r.createdAt) > threeDaysAgo).length || 0;
  const pendingCount = data?.filter(r => r.status === ConnectionStatus.SENT).length || 0;
  const acceptedCount = data?.filter(r => r.status === ConnectionStatus.ACCEPTED).length || 0;
  const declinedCount = data?.filter(r => r.status === ConnectionStatus.REJECTED).length || 0;

  const tabs = [
    { id: "all", label: "All", count: allCount },
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "accepted", label: "Accepted", count: acceptedCount },
    { id: "declined", label: "Declined", count: declinedCount },
  ];

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-1.5 md:gap-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-1 rounded-xl shadow-sm w-full">
      {tabs.map(tab => {
        const isActive = filterType === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`flex-1 flex justify-center items-center gap-1.5 md:gap-2 px-2 py-1 md:px-4 md:py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all ${
              isActive 
                ? "bg-[#E51E44] text-white shadow-sm" 
                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] md:text-xs font-black ${
              isActive 
                ? "bg-white/20 text-white" 
                : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500"
            }`}>
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  );
}

function InterestDonutChart({ data, subtext }: { data: IConnectionRequest[] | undefined, subtext: string }) {
  if (!data) return null;

  const total = data.length;
  const pendingCount = data.filter(r => r.status === ConnectionStatus.SENT).length;
  const acceptedCount = data.filter(r => r.status === ConnectionStatus.ACCEPTED).length;
  const declinedCount = data.filter(r => r.status === ConnectionStatus.REJECTED).length;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentages (handle 0 total case to avoid NaN)
  const pendingPct = total > 0 ? pendingCount / total : 0;
  const acceptedPct = total > 0 ? acceptedCount / total : 0;
  const declinedPct = total > 0 ? declinedCount / total : 0;

  const pendingDash = pendingPct * circumference;
  const acceptedDash = acceptedPct * circumference;
  const declinedDash = declinedPct * circumference;

  const pendingOffset = 0;
  const acceptedOffset = -(pendingDash);
  const declinedOffset = -(pendingDash + acceptedDash);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 md:p-5 shadow-sm w-full">
      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-5">Interest Summary</h3>
      
      <div className="flex items-center gap-4">
        {/* Chart */}
        <div className="relative w-[100px] h-[100px] shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle if empty */}
            {total === 0 && (
              <circle
                cx="50" cy="50" r={radius}
                fill="transparent"
                stroke="#f3f4f6"
                strokeWidth="8"
                className="dark:stroke-zinc-800"
              />
            )}
            {/* Pending */}
            {pendingCount > 0 && (
              <circle
                cx="50" cy="50" r={radius}
                fill="transparent"
                stroke="#f97316"
                strokeWidth="8"
                strokeDasharray={`${pendingDash} ${circumference}`}
                strokeDashoffset={pendingOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-sm"
              />
            )}
            {/* Accepted */}
            {acceptedCount > 0 && (
              <circle
                cx="50" cy="50" r={radius}
                fill="transparent"
                stroke="#22c55e"
                strokeWidth="8"
                strokeDasharray={`${acceptedDash} ${circumference}`}
                strokeDashoffset={acceptedOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-sm"
              />
            )}
            {/* Declined */}
            {declinedCount > 0 && (
              <circle
                cx="50" cy="50" r={radius}
                fill="transparent"
                stroke="#e51e44"
                strokeWidth="8"
                strokeDasharray={`${declinedDash} ${circumference}`}
                strokeDashoffset={declinedOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-sm"
              />
            )}
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
            <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">{total}</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase mt-1">{subtext}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-bold text-gray-600 dark:text-zinc-400">Pending</span>
            </div>
            <span className="font-black text-gray-900 dark:text-white">{pendingCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="font-bold text-gray-600 dark:text-zinc-400">Accepted</span>
            </div>
            <span className="font-black text-gray-900 dark:text-white">{acceptedCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold text-gray-600 dark:text-zinc-400">Declined</span>
            </div>
            <span className="font-black text-gray-900 dark:text-white">{declinedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumWidget() {
  const { user } = useAuthSession();
  const router = useRouter();
  
  if (!user) return null;
  
  const isPaid = isPaidUser(
    user.type as UserType,
    new Date(user.planExpiryDate ?? "")
  );

  return (
    <div className="space-y-4">
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
  );
}
