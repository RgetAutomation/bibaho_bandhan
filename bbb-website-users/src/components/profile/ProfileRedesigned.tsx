"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserType } from "@/components/enum/userType";
import { ConnectionStatus } from "@/components/enum/connectionStatus";
import { NotPaidUserReason } from "@/lib/utils";
import { IProfileImage } from "@/components/interface/IProfileImages";
import { ProfileProps } from "@/actions/getProfileDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoadingButton } from "@/components/loadingButton";
import { PlansSection } from "@/components/dashboard/planSection";
import { useAuthSession } from "@/hooks/useAuthSession";
import toast from "react-hot-toast";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Building,
  DollarSign,
  Ruler,
  User,
  MessageCircle,
  Utensils,
  Cigarette,
  Wine,
  Info,
  CheckCircle2,
  Mail,
  Phone,
  Image as ImageIcon,
  Heart,
  MessageCircleHeart,
  Lock,
  MoreVertical,
  MoreHorizontal,
  Star,
  Calendar,
  Scale,
  Sparkles,
  Activity,
  Home,
  Globe,
  Eye,
  Users,
  Clock,
  CircleX,
  ShieldCheck,
  Copy,
  ArrowUpDown,
  PenSquare,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
interface ProfileRedesignedProps {
  data: ProfileProps;
  isPaidOrConnected: boolean;
  isFreeOrAbove: boolean;
  isConnected: boolean;
  isPaid: { paid: boolean; reason: NotPaidUserReason };
  userType: UserType;
  skinToneColor: string;
  requestSending: boolean;
  accepting: boolean;
  declining: boolean;
  unblocking: boolean;
  handleConnectRequest: () => void;
  handleAcceptConnection: (id: string) => void;
  handleRejectConnection: (id: string) => void;
  handleBlockUser: (id: string) => void;
  handleUnblockUser: (id: string) => void;
  profileImages: IProfileImage[];
}

// Circular Progress Wheel Component
const CircularProgress = ({
  percentage,
  size = 110,
  strokeWidth = 8
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
          className="stroke-gray-100 dark:stroke-zinc-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-[#1E5631] dark:stroke-green-600 transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-[#1E5631] dark:text-green-500 leading-none">
          {percentage}%
        </span>
        <span className="text-[10px] font-bold text-[#1E5631]/80 dark:text-green-500/80 mt-1">
          Complete
        </span>
      </div>
    </div>
  );
};

export function ProfileRedesigned({
  data,
  isPaidOrConnected,
  isFreeOrAbove,
  isConnected,
  isPaid,
  userType,
  skinToneColor,
  requestSending,
  accepting,
  declining,
  unblocking,
  handleConnectRequest,
  handleAcceptConnection,
  handleRejectConnection,
  handleBlockUser,
  handleUnblockUser,
  profileImages,
}: ProfileRedesignedProps) {
  const { user } = useAuthSession();
  const isOwnProfile = user?.id === data.id;
  const hasValue = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed !== "" && trimmed !== "-";
    }
    return true;
  };

  const formatHeight = (height: string | null | undefined): string => {
    if (!height) return "";
    const h = height.trim();
    if (h.toLowerCase().includes("ft") || h.toLowerCase().includes("in") || h.toLowerCase().includes("cm")) {
      return h;
    }
    return `${h} cm`;
  };

  const [activeTab, setActiveTab] = useState("about");
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Dynamic Tab Visibilities based on database records
  const hasFamilyData = !!(
    hasValue(data.fatherProfession) ||
    hasValue(data.mothersOccupation) ||
    hasValue(data.noOfBrothers) ||
    hasValue(data.noOfSisters) ||
    hasValue(data.familyStatus) ||
    hasValue(data.familyType) ||
    hasValue(data.familyValues) ||
    hasValue(data.familyBackground)
  );

  const hasLifestyleData = !!(
    hasValue(data.eatingHabits) ||
    hasValue(data.drinkingHabits) ||
    hasValue(data.smokingHabits) ||
    hasValue(data.hobbies)
  );

  const hasPartnerData = !!(
    hasValue(data.partnerAgeRange) ||
    hasValue(data.partnerHeightRange) ||
    hasValue(data.partnerMaritalStatus) ||
    hasValue(data.partnerReligion) ||
    hasValue(data.partnerMotherTongue) ||
    hasValue(data.partnerAnnualIncome) ||
    hasValue(data.partnerDescription)
  );

  const hasHoroscopeData = !!(
    hasValue(data.rashi) ||
    hasValue(data.nakshatra) ||
    (data.manglikDosh !== null && data.manglikDosh !== undefined) ||
    hasValue(data.birthTime) ||
    hasValue(data.cityOfBirth) ||
    hasValue(data.countryOfBirth)
  );


  const primaryPhoto =
    profileImages.length > 0 ? profileImages[0].url : "/placeholder-user.jpg";

  // Formatted dynamic display values
  const displayName = (data.firstName || data.lastName)
    ? `${data.firstName || ""} ${data.lastName || ""}`.trim()
    : "User";

  const formattedDob = data.dob
    ? new Date(data.dob).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  // Dynamic Profile Completion calculation based on non-null fields
  const calculateCompletion = (profile: ProfileProps) => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.gender,
      profile.age,
      profile.maritalStatus,
      profile.religion,
      profile.caste,
      profile.height,
      profile.weight,
      profile.education,
      profile.profession,
      profile.state,
      profile.townVillage,
      profile.aboutMyself,
      profile.fatherProfession,
      profile.mothersOccupation,
      profile.noOfBrothers,
      profile.noOfSisters,
      profile.familyStatus,
      profile.familyType,
      profile.familyValues,
      profile.eatingHabits,
    ];
    const filled = fields.filter((f) => f !== null && f !== undefined && f !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercentage = data ? calculateCompletion(data) : 100;

  // Helper for masking text
  const MaskedText = ({
    value,
    visible,
    tooltip = "Visible for Paid + Connected Members",
    fallback = "Upgrade to view",
  }: {
    value: React.ReactNode;
    visible: boolean;
    tooltip?: string;
    fallback?: string;
  }) => {
    if (visible) return <>{value}</>;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-red-700 dark:text-red-400 bg-red-50/80 dark:bg-red-950/20 px-2 py-0.5 rounded-md border border-red-100 dark:border-red-900/30 font-normal select-none">
        <Lock className="w-3 h-3 text-[#9B1C31] dark:text-red-400" />
        <span className="cursor-help" title={tooltip}>
          {fallback}
        </span>
      </span>
    );
  };


  return (
    <div className="w-full h-full bg-[#FCFAF8] dark:bg-zinc-950 font-sans text-gray-800 dark:text-zinc-100 flex flex-col antialiased">

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 w-full px-4 lg:px-8 py-4 md:py-6 flex flex-col min-w-0 min-h-0">
        
        <main className="flex-1 flex flex-col xl:flex-row gap-6 md:gap-8 min-w-0 min-h-0">
          {/* Middle column: Profile summary and Tabs */}
          <div className="flex-1 space-y-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-2 pb-10">
            {/* Top Profile Summary Card */}
            <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-zinc-950 dark:to-zinc-950 rounded-[2rem] overflow-hidden p-0 gap-0 flex flex-col relative">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-full h-full opacity-40 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/floral-motif.png')] mix-blend-overlay" />
              
              <div className="flex flex-col lg:flex-row p-4 md:p-5 gap-4 md:gap-6 relative z-10">
                {/* Photo Column */}
                <div className="w-full lg:w-[180px] relative aspect-square lg:aspect-[4/5] bg-gray-100 dark:bg-zinc-900 flex-shrink-0 rounded-[1.5rem] overflow-hidden shadow-md border-4 border-white dark:border-zinc-800 group">
                  <Image
                    src={activePhoto || primaryPhoto || "/placeholder-user.jpg"}
                    alt={displayName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    priority
                    onClick={() => setIsPhotoModalOpen(true)}
                  />
                  {/* Camera icon floating */}
                  <div 
                    className="absolute bottom-3 right-3 bg-white dark:bg-zinc-800 rounded-xl p-2.5 shadow-lg border border-gray-100 dark:border-zinc-700 cursor-pointer hover:scale-110 transition-transform" 
                    onClick={() => setIsPhotoModalOpen(true)}
                    title="View Photos"
                  >
                    <ImageIcon className="w-5 h-5 text-pink-500" />
                  </div>
                </div>

                {/* Info Details Column */}
                <div className="w-full lg:flex-1 flex flex-col min-w-0 justify-center">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    
                    <div className="flex flex-col">
                      {/* Name and Verified */}
                      <h2 className="text-xl md:text-[22px] font-extrabold text-[#1a1b4b] dark:text-zinc-100 flex items-center gap-2">
                        {displayName}
                        {data.status === "ACTIVE" && (
                          <div className="bg-amber-500 rounded-full p-0.5 shadow-sm">
                             <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </h2>

                      {/* Gold Verified Badge */}
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] font-extrabold w-fit border border-amber-200 dark:border-amber-800/50 shadow-sm">
                        <ShieldCheck className="w-4 h-4" /> Gold Verified
                      </div>

                      {/* Profile ID */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#1a1b4b] dark:text-zinc-300">
                          Profile ID: {data.publicId || data.id}
                        </span>
                        <button 
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors bg-white/50 dark:bg-zinc-800/50 p-1 rounded-md"
                          onClick={() => {
                            navigator.clipboard.writeText(data.publicId || data.id || "");
                            toast.success("Profile ID copied!");
                          }}
                          title="Copy Profile ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Info Row (Age, Height, Location) */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                        {data.age && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-pink-500" />
                            <span className="text-[13px] font-bold text-[#1a1b4b] dark:text-zinc-300">{data.age} Years</span>
                          </div>
                        )}
                        {data.height && (
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-pink-500" />
                            <span className="text-[13px] font-bold text-[#1a1b4b] dark:text-zinc-300">{formatHeight(data.height)}</span>
                          </div>
                        )}
                        {(data.townVillage || data.state) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-pink-500" />
                            <span className="text-[13px] font-bold text-[#1a1b4b] dark:text-zinc-300">
                              {data.townVillage ? `${data.townVillage}, ` : ""}{data.state || ""}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status and Member Since */}
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/40" />
                          <span className="text-[13px] font-bold text-green-600">Active Now</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-bold">
                            Member Since: Jan 2025
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side buttons for Own Profile */}
                    {isOwnProfile && (
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 mt-2 md:mt-0">
                        <Link href="/users/account">
                          <Button variant="outline" size="sm" className="flex items-center justify-center gap-1.5 rounded-lg border-pink-500 text-pink-600 hover:bg-pink-50 hover:text-pink-700 bg-white/90 dark:bg-zinc-900 font-bold text-[11px] px-3 py-2 h-auto shadow-sm">
                            <PenSquare className="w-3 h-3" /> Edit Profile
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="flex items-center justify-center gap-1.5 rounded-lg border-gray-200 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 bg-white/90 dark:bg-zinc-900 font-bold text-[11px] px-3 py-2 h-auto shadow-sm">
                          <Eye className="w-3 h-3" /> Preview
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions row spanning full width (Only for other users) */}
              {!isOwnProfile && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 border-t border-[#F0E8E8] dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md mt-auto relative z-10">
                {data?.alreadyFriend === true ? (
                  <Link href="/users/chat" className="w-full">
                    <Button className="w-full rounded-xl bg-[#9B1C31] hover:bg-[#801426] text-white flex items-center justify-center gap-2 font-bold py-2 text-xs shadow-sm h-auto">
                      <MessageCircle className="w-3.5 h-3.5" /> Start Chat
                    </Button>
                  </Link>
                ) : data?.alreadySentRequest === true ? (
                  <Button variant="outline" className="w-full rounded-xl border-[#9B1C31] text-[#9B1C31] font-bold py-2 text-xs cursor-not-allowed h-auto" disabled>
                    Interest Sent
                  </Button>
                ) : data?.receivedRequestId && data?.receivedRequestStatus === ConnectionStatus.SENT ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      className="w-1/2 rounded-xl bg-[#9B1C31] hover:bg-[#801426] text-white font-bold py-2 text-xs h-auto"
                      onClick={() => handleAcceptConnection(data.receivedRequestId)}
                      disabled={accepting}
                    >
                      {accepting ? <LoadingButton title="Accepting" /> : <><Heart className="w-3.5 h-3.5 mr-1.5" /> Accept</>}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-1/2 rounded-xl border-gray-300 text-gray-700 font-bold py-2 text-xs h-auto"
                      onClick={() => handleRejectConnection(data.receivedRequestId)}
                      disabled={declining}
                    >
                      {declining ? <LoadingButton title="Rejecting" /> : <><CircleX className="w-3.5 h-3.5 mr-1.5" /> Reject</>}
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full rounded-xl bg-[#9B1C31] hover:bg-[#801426] text-white flex items-center justify-center gap-2 font-bold py-2 text-xs shadow-sm h-auto"
                    onClick={handleConnectRequest}
                    disabled={requestSending}
                  >
                    {requestSending ? (
                      <LoadingButton title="Sending" />
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5" /> Send Interest
                      </>
                    )}
                  </Button>
                )}

                <Link href="/users/chat" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-[#9B1C31] text-[#9B1C31] hover:bg-[#9B1C31]/5 flex items-center justify-center gap-2 font-bold py-2 text-xs h-auto"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Start Chat
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full rounded-xl border-[#9B1C31] text-[#9B1C31] hover:bg-[#9B1C31]/5 flex items-center justify-center gap-2 font-bold py-2 text-xs h-auto"
                >
                  <Star className="w-3.5 h-3.5" /> Shortlist
                </Button>

                <div className="relative w-full">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-[#9B1C31] text-[#9B1C31] hover:bg-[#9B1C31]/5 flex items-center justify-center gap-2 font-bold py-2 text-xs h-auto"
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" /> More
                  </Button>
                  {moreMenuOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-[#F0E8E8] dark:border-zinc-800 ring-1 ring-black/5 z-10 overflow-hidden py-1">
                      {data.alreadyBlocked ? (
                        <button
                          onClick={() => {
                            handleUnblockUser(data.id);
                            setMoreMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-bold border-b border-gray-100 dark:border-zinc-800/50"
                        >
                          Unblock User
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleBlockUser(data.id);
                            setMoreMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold border-b border-gray-100 dark:border-zinc-800/50"
                        >
                          Block User
                        </button>
                      )}
                      
                      {isPaid.paid ? (
                        <Link
                          href={`/users/profile/${data.id}/report`}
                          onClick={() => setMoreMenuOpen(false)}
                          className="block w-full text-left px-4 py-2.5 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 font-bold"
                        >
                          Report User
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            import("react-hot-toast").then((m) => m.default.error("Reporting is a premium feature. Please upgrade your plan."));
                            setMoreMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-xs text-gray-400 dark:text-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800 font-bold flex items-center justify-between"
                        >
                          Report User <Lock className="w-3 h-3 ml-2" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            </Card>

            {/* ─── ABOUT ME ─────────────────────────────────────── */}
            {hasValue(data.aboutMyself) && (
              <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-0">
                <SectionHeader icon={User} title="About Me" editHref={isOwnProfile ? "/users/account/edit/profile?scrollTo=about-me" : undefined} />
                <div className="p-5 pt-0">
                  <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-medium">
                    <MaskedText
                      value={data.aboutMyself}
                      visible={isFreeOrAbove}
                      fallback="Description hidden. Upgrade to premium to view."
                    />
                  </p>
                  {/* Personality trait tags */}
                  {hasValue(data.personalityTraits) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {String(data.personalityTraits).split(',').map((trait, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-[#FCE4EC] dark:bg-rose-950/20 text-[#9B1C31] dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-900/30">
                          {trait.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* ─── BASIC INFORMATION ────────────────────────────── */}
            {(() => {
              const basicItems = [
                { label: "Date of Birth", value: formattedDob, show: hasValue(data.dob) },
                { label: "Age", value: data.age ? `${data.age} Years` : null, show: !!data.age },
                { label: "Height", value: data.height ? formatHeight(data.height) : null, show: hasValue(data.height) },
                { label: "Marital Status", value: data.maritalStatus, show: hasValue(data.maritalStatus) },
                { label: "Community", value: data.caste, show: hasValue(data.caste), masked: <MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.caste} /> },
                { label: "Mother Tongue", value: data.motherTongue, show: hasValue(data.motherTongue) },
                { label: "Blood Group", value: data.bloodGroup, show: hasValue(data.bloodGroup), masked: <MaskedText visible={isPaidOrConnected} fallback="Upgrade to view" value={data.bloodGroup} /> },
                { label: "Religion", value: data.religion, show: hasValue(data.religion) },
              ].filter(i => i.show);
              return basicItems.length > 0 ? (
                <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-0">
                  <SectionHeader icon={Info} title="Basic Information" editHref={isOwnProfile ? "/users/account/edit/profile?scrollTo=basic-info" : undefined} />
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
                      {basicItems.map(item => (
                        <InfoCell key={item.label} label={item.label} value={item.masked ?? item.value} />
                      ))}
                    </div>
                  </div>
                </Card>
              ) : null;
            })()}

            {/* ─── EDUCATION & CAREER ───────────────────────────── */}
            {(hasValue(data.education) || hasValue(data.profession)) && (
              <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-0">
                <SectionHeader icon={GraduationCap} title="Education & Career" editHref={isOwnProfile ? "/users/account/edit/profile?scrollTo=education" : undefined} />
                <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
                  {hasValue(data.education) && <InfoCell label="Highest Qualification" value={data.education} />}
                  {hasValue(data.profession) && <InfoCell label="Profession" value={data.profession} />}
                  {hasValue(data.organizationName) && (
                    <InfoCell label="Company" value={<MaskedText visible={isPaidOrConnected} fallback="Upgrade to view" value={data.organizationName} />} />
                  )}
                  {hasValue(data.monthlyIncome) && (
                    <InfoCell label="Annual Income" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.monthlyIncome} />} />
                  )}
                  {hasValue(data.workExperience) && <InfoCell label="Work Experience" value={data.workExperience} />}
                  {hasValue(data.collegeInstitution) && <InfoCell label="College / Institution" value={data.collegeInstitution} />}
                  {hasValue(data.fieldOfStudy) && <InfoCell label="Field of Study" value={data.fieldOfStudy} />}
                  {hasValue(data.passingYear) && <InfoCell label="Passing Year" value={data.passingYear} />}
                </div>
              </Card>
            )}

            {/* ─── FAMILY DETAILS ───────────────────────────────── */}
            {hasFamilyData && (
              <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-0">
                <SectionHeader icon={Home} title="Family Details" editHref={isOwnProfile ? "/users/account/edit/profile?scrollTo=family" : undefined} />
                <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
                  {hasValue(data.familyType) && <InfoCell label="Family Type" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.familyType} />} />}
                  {hasValue(data.fatherProfession) && <InfoCell label="Father" value={<MaskedText visible={isPaidOrConnected} fallback="Upgrade to view" value={data.fatherProfession} />} />}
                  {hasValue(data.mothersOccupation) && <InfoCell label="Mother" value={<MaskedText visible={isPaidOrConnected} fallback="Upgrade to view" value={data.mothersOccupation} />} />}
                  {(hasValue(data.noOfBrothers) || hasValue(data.noOfSisters)) && (
                    <InfoCell label="Siblings" value={
                      <MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={
                        [data.noOfBrothers ? `${data.noOfBrothers} Brother(s)` : null, data.noOfSisters ? `${data.noOfSisters} Sister(s)` : null].filter(Boolean).join(', ')
                      } />
                    } />
                  )}
                  {hasValue(data.familyValues) && <InfoCell label="Family Values" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.familyValues} />} />}
                  {hasValue(data.familyStatus) && <InfoCell label="Family Status" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.familyStatus} />} />}
                </div>
                {hasValue(data.familyBackground) && (
                  <div className="mx-5 mb-5 pt-4 border-t border-[#F5EBEB] dark:border-zinc-800">
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-bold mb-1.5">Family Background</p>
                    <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-medium">
                      <MaskedText visible={isFreeOrAbove} fallback="Family background hidden. Upgrade to view." value={data.familyBackground} />
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* ─── LIFESTYLE & INTERESTS ────────────────────────── */}
            {hasLifestyleData && (
              <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-0">
                <SectionHeader icon={Sparkles} title="Lifestyle & Interests" editHref={isOwnProfile ? "/users/account/edit/profile" : undefined} />
                <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
                  {hasValue(data.eatingHabits) && <InfoCell label="Diet" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.eatingHabits} />} />}
                  {hasValue(data.smokingHabits) && <InfoCell label="Smoking" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.smokingHabits} />} />}
                  {hasValue(data.drinkingHabits) && <InfoCell label="Drinking" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.drinkingHabits} />} />}
                  {hasValue(data.motherTongue) && <InfoCell label="Languages" value={data.motherTongue} />}
                </div>
                {hasValue(data.hobbies) && (
                  <div className="mx-5 mb-5 pt-4 border-t border-[#F5EBEB] dark:border-zinc-800">
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-bold mb-2.5">Hobbies</p>
                    <div className="flex flex-wrap gap-2">
                      {String(data.hobbies).split(',').map((h, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 text-xs font-bold border border-pink-100 dark:border-pink-900/30">
                          {h.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* ─── PARTNER PREFERENCES ──────────────────────────── */}
            {hasPartnerData && (
              <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-0">
                <SectionHeader icon={Heart} title="Partner Preferences" editHref={isOwnProfile ? "/users/account/edit/profile?scrollTo=partner-preferences" : undefined} />
                <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
                  {hasValue(data.partnerAgeRange) && <InfoCell label="Age Range" value={data.partnerAgeRange} />}
                  {hasValue(data.partnerHeightRange) && <InfoCell label="Height Range" value={data.partnerHeightRange} />}
                  {hasValue(data.partnerReligion) && <InfoCell label="Religion" value={data.partnerReligion} />}
                  {hasValue(data.partnerMinimumQualification) && (
                    <InfoCell label="Education" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade to view" value={data.partnerMinimumQualification} />} />
                  )}
                  {hasValue(data.partnerPreferredState) && <InfoCell label="Location" value={data.partnerPreferredState} />}
                  {hasValue(data.partnerMaritalStatus) && <InfoCell label="Marital Status" value={data.partnerMaritalStatus} />}
                  {hasValue(data.partnerPersonalityExpectation) && <InfoCell label="Expectation" value={data.partnerPersonalityExpectation} />}
                </div>
                {hasValue(data.partnerDescription) && (
                  <div className="mx-5 mb-5 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-xl flex items-start gap-2.5">
                    <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-pink-600 dark:text-pink-400 font-bold leading-relaxed">
                      <MaskedText visible={isFreeOrAbove} fallback="Partner description is hidden. Upgrade to premium to view." value={data.partnerDescription} />
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* ─── ASTROLOGY ────────────────────────────────────── */}
            {hasHoroscopeData && (
              <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-0">
                <SectionHeader icon={Sparkles} title="Astrology Details" editHref={isOwnProfile ? "/users/account/edit/profile?scrollTo=astrology" : undefined} />
                <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
                  {hasValue(data.rashi) && <InfoCell label="Rashi / Moon Sign" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade" value={data.rashi} />} />}
                  {hasValue(data.nakshatra) && <InfoCell label="Nakshatra / Star" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade" value={data.nakshatra} />} />}
                  {data.manglikDosh !== null && data.manglikDosh !== undefined && <InfoCell label="Manglik Dosh" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade" value={data.manglikDosh ? "Yes" : "No"} />} />}
                  {hasValue(data.birthTime) && <InfoCell label="Time of Birth" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade" value={data.birthTime} />} />}
                  {hasValue(data.cityOfBirth) && <InfoCell label="City of Birth" value={<MaskedText visible={isPaidOrConnected} fallback="Upgrade" value={data.cityOfBirth} />} />}
                  {hasValue(data.countryOfBirth) && <InfoCell label="Country of Birth" value={<MaskedText visible={isFreeOrAbove} fallback="Upgrade" value={data.countryOfBirth} />} />}
                </div>
              </Card>
            )}

            {/* ─── PHOTOS ───────────────────────────────────────── */}
            {profileImages.length > 0 && (
              <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-0">
                <SectionHeader icon={ImageIcon} title="Photos" editHref={isOwnProfile ? "/users/account/update-images" : undefined} editLabel={isOwnProfile ? "Edit" : undefined} />
                <div className="px-5 pb-5">
                  <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {profileImages.map((img, idx) => {
                      const isActive = (activePhoto === img.url) || (!activePhoto && idx === 0);
                      return (
                        <button
                          key={img.id || idx}
                          onClick={() => setActivePhoto(img.url)}
                          className={`relative aspect-square w-24 md:w-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-zinc-900 border-2 transition-all ${
                            isActive
                              ? "border-[#9B1C31] dark:border-[#E35269] shadow-sm"
                              : "border-transparent hover:border-gray-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          <Image src={img.url || "/placeholder-user.jpg"} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                          {idx === 0 && (
                            <div className="absolute bottom-1 left-1 bg-[#9B1C31] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Main
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {isOwnProfile && (
                      <Link href="/users/account/update-images" className="relative aspect-square w-24 md:w-28 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-950/10 border-2 border-dashed border-rose-200 dark:border-rose-900/40 text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/20 transition-colors gap-1">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Add Photos</span>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* ─── PLANS/UPGRADE ────────────────────────────────── */}
            {!isPaid.paid && isPaid.reason === NotPaidUserReason.PLAN_EXPIRED && (
              <Card className="border border-red-100 dark:border-red-950 shadow-xs bg-red-50/20 dark:bg-red-950/10 rounded-2xl p-6 text-center flex flex-col items-center">
                <Info className="w-12 h-12 text-[#9B1C31] dark:text-[#E35269] mb-4" />
                <h3 className="text-base font-extrabold text-gray-800 dark:text-zinc-200 mb-2">Your Plan Has Expired</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 w-4/5 mb-6 leading-relaxed font-semibold">
                  Please Upgrade Your Plan To Continue Using Our Services and view contact details.
                </p>
                <Link href="/users/plan">
                  <Button className="rounded-full bg-[#9B1C31] hover:bg-[#801426] text-white px-6 font-bold py-5 border-none shadow-sm shadow-[#9B1C31]/20">
                    Explore Plans
                  </Button>
                </Link>
              </Card>
            )}

            {!isPaid.paid && isPaid.reason === NotPaidUserReason.FREE_USER && (
              <div className="mt-8">
                <PlansSection showFreeSection={false} userType={userType} />
              </div>
            )}
          </div>

          {/* ──── RIGHT COLUMN: Contact + Completion + Gallery ──── */}
          <div className="w-full xl:w-[280px] shrink-0 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2 pb-10">

            {/* Profile Completeness Checklist */}
            {(() => {
              const isBasicInfoComplete = hasValue(data.firstName) && hasValue(data.lastName) && hasValue(data.gender) && hasValue(data.age) && hasValue(data.maritalStatus) && hasValue(data.religion) && hasValue(data.caste) && hasValue(data.height) && hasValue(data.weight) && hasValue(data.state) && hasValue(data.townVillage);
              const isAboutMeComplete = hasValue(data.aboutMyself);
              const isEducationComplete = hasValue(data.education) && hasValue(data.profession);
              const isFamilyComplete = hasValue(data.fatherProfession) && hasValue(data.mothersOccupation) && hasValue(data.noOfBrothers) && hasValue(data.noOfSisters) && hasValue(data.familyStatus) && hasValue(data.familyType) && hasValue(data.familyValues) && hasValue(data.eatingHabits);
              const isPhotosComplete = Boolean(profileImages && profileImages.length > 0);
              const isIdVerified = isOwnProfile ? Boolean(user?.isProfileComplete) : data.status === "VERIFIED";

              return (
                <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1E5631] dark:text-green-500" />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#1a1b4b] dark:text-white">Profile Completeness</h3>
                  </div>
                  
                  <div className="flex justify-center mb-5">
                    <CircularProgress percentage={completionPercentage} size={90} strokeWidth={6} />
                  </div>

                  <div className="flex flex-col gap-2.5 mb-4">
                    <div className="flex items-center gap-2.5">
                      {isBasicInfoComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-white fill-[#1E5631] dark:fill-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-zinc-700 shrink-0" />
                      )}
                      <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">Basic Information</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      {isAboutMeComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-white fill-[#1E5631] dark:fill-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-zinc-700 shrink-0" />
                      )}
                      <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">About Me</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      {isEducationComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-white fill-[#1E5631] dark:fill-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-zinc-700 shrink-0" />
                      )}
                      <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">Education</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      {isFamilyComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-white fill-[#1E5631] dark:fill-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-zinc-700 shrink-0" />
                      )}
                      <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">Family Details</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      {isPhotosComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-white fill-[#1E5631] dark:fill-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-zinc-700 shrink-0" />
                      )}
                      <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">Photos</span>
                    </div>


                  </div>

                  {completionPercentage < 100 && isOwnProfile && (
                    <Link href="/users/account/edit/profile" className="mt-2 block">
                      <Button size="sm" className="w-full rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-[#E51E44] dark:text-rose-400 text-[11px] font-extrabold h-auto py-2.5 border border-pink-100 dark:border-rose-900/30 shadow-none flex items-center justify-between px-4">
                        Complete Profile <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                      </Button>
                    </Link>
                  )}
                </Card>
              );
            })()}

            {/* Contact Information */}
            <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-5 gap-4">
              <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 mb-3">
                <CardTitle className="text-sm font-bold text-gray-800 dark:text-zinc-200">Contact Information</CardTitle>
                <Lock className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {!isConnected ? (
                  <>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 leading-normal font-semibold">
                      Unlock contact details by sending interest.
                    </p>
                    <Button
                      className="w-full bg-[#9B1C31] hover:bg-[#801426] text-white rounded-xl text-xs font-bold py-4.5 border-none shadow-sm shadow-[#9B1C31]/20"
                      onClick={handleConnectRequest}
                      disabled={requestSending || data?.alreadySentRequest}
                    >
                      {data?.alreadySentRequest ? "Interest Sent" : "Send Interest to View"}
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-green-700 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 px-3 py-2 rounded-lg font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    You can now view contact details!
                  </p>
                )}
                <div className="space-y-4 pt-4 border-t border-[#F5EBEB] dark:border-zinc-800 mt-4">
                  <ContactRow icon={Phone} label="Phone Number" value={isConnected ? ((data as any).phone || "-") : "Send interest to view"} />
                  <ContactRow icon={Mail} label="Email Address" value={isConnected ? ((data as any).email || "-") : "Send interest to view"} />
                  <ContactRow icon={MapPin} label="Address" value={isConnected ? (data.townVillage ? `${data.townVillage}, ${data.state}` : "-") : "Send interest to view"} />
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery (compact) */}
            {profileImages.length > 1 && (
              <Card className="border border-[#F0E8E8] dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden p-5 gap-4">
                <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 mb-3">
                  <CardTitle className="text-sm font-bold text-gray-800 dark:text-zinc-200">Gallery</CardTitle>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">{profileImages.length} Photos</span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-3 gap-2">
                    {profileImages.slice(0, 6).map((img, idx) => {
                      const isActive = (activePhoto === img.url) || (!activePhoto && idx === 0);
                      return (
                        <button
                          key={img.id || idx}
                          onClick={() => setActivePhoto(img.url)}
                          className={`relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-900 border-2 transition-all ${
                            isActive ? "border-[#9B1C31] dark:border-[#E35269] shadow-xs" : "border-transparent hover:border-gray-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          <Image src={img.url || "/placeholder-user.jpg"} alt={`Gallery photo ${idx + 1}`} fill className="object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      {/* ─── IMAGE MODAL ──────────────────────────────────── */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8" onClick={() => setIsPhotoModalOpen(false)}>
          <div 
            className="relative inline-flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={activePhoto || primaryPhoto || "/placeholder-user.jpg"} 
              alt="Full size photo" 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            <button 
              className="absolute top-3 right-3 z-50 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors shadow-sm backdrop-blur-sm"
              onClick={() => setIsPhotoModalOpen(false)}
            >
              <CircleX className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// Helper: Contact information item row
function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="p-2 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className="text-xs font-bold text-gray-700 dark:text-zinc-300 truncate">{value}</p>
      </div>
    </div>
  );
}

// Helper: Section header with icon, title and optional edit button
function SectionHeader({
  icon: Icon,
  title,
  editHref,
  editLabel = "Edit",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  editHref?: string;
  editLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5EBEB] dark:border-zinc-800 mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#FCE4EC] dark:bg-rose-950/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#9B1C31] dark:text-rose-400" />
        </div>
        <h3 className="text-sm font-extrabold text-gray-800 dark:text-zinc-200">{title}</h3>
      </div>
      {editHref && (
        <a href={editHref} className="flex items-center gap-1.5 text-[11px] font-bold text-[#9B1C31] dark:text-rose-400 hover:text-[#7a1527] dark:hover:text-rose-300 transition-colors bg-[#FCE4EC] dark:bg-rose-950/20 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          {editLabel}
        </a>
      )}
    </div>
  );
}

// Helper: Simple label + value data cell
function InfoCell({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-w-0">
      <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider leading-none mb-1.5">{label}</p>
      <div className="text-sm font-semibold text-gray-800 dark:text-zinc-200 leading-snug">{value || "-"}</div>
    </div>
  );
}

