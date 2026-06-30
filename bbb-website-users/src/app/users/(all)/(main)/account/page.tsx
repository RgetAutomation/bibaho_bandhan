"use client";

import { fetchProfileCompletionStatus } from "@/actions/getProfileCompletedStatus";
import { fetchProfileImages, fetchSelfProfileDetails } from "@/actions/users";
import DashboardHeader from "@/components/dashboard/header";
import { UserGender } from "@/components/enum/userGender";
import { UserType } from "@/components/enum/userType";
import {
  BLOCKED_USER_LINK,
  HELP_CENTER_LINK,
  MATCHING_LINK,
  PAYMENTS_LIST_LINK,
  PREMIUM_PLAN_LINK,
  PROFILE_CHANGE_AVATAR_LINK,
  PROFILE_EDIT_CHANGE_PASSWORD_LINK,
  PROFILE_EDIT_CONTACT_DETAILS_LINK,
  PROFILE_EDIT_PAGE_LINK,
  PROFILE_EDIT_PROFILE_DETAILS_LINK,
  REPORTED_USER_LINK,
  SUBSCRIPTION_PAGE_LINK,
} from "@/components/helper/constant";
import { IProfileImage } from "@/components/interface/IProfileImages";
import LoadingPage from "@/components/loader";
import { LoadingButton } from "@/components/loadingButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { authClient } from "@/lib/auth-client";
import { isPaidUser, NotPaidUserReason } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistance } from "date-fns";
import {
  Ban,
  Calendar,
  Camera,
  ChevronRight,
  Copy,
  CreditCard, CheckCircle,
  Crown,
  Hash,
  HelpCircle,
  ImageIcon,
  KeyRound,
  LogOut,
  MessageCircleHeart,
  MessageCircleWarning,
  Moon,
  Phone,
  Settings,
  UserRound,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { user, isPending } = useAuthSession();
  const { teamConversationIds, userSAConversationIds, resetUserSAMessage } =
    useNotificationStore();
  const router = useRouter();

  const paidUser = isPaidUser(
    user?.type as UserType,
    new Date(user?.planExpiryDate as string),
  );

  
  const { data: selfProfile } = useQuery({
    queryKey: ["selfProfileDetails"],
    queryFn: () => fetchSelfProfileDetails(),
    enabled: !!user
  });

  const calculateCompletion = (profile: any) => {
    if (!profile) return 0;
    const fields = [
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["accountDetils"],
    queryFn: fetchProfileCompletionStatus,
    enabled: true,
  });

  const completionPercentage = selfProfile 
    ? calculateCompletion(selfProfile) 
    : (data?.isProfileComplete ? 100 : 75);

  const { data: imagesData, isLoading: isImagesLoading } = useQuery({
    queryKey: ["fetchProfileImages"],
    queryFn: fetchProfileImages,
    enabled: true,
  });

  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    // if (error) {
    //   toast.error(error.message);
    // }
  }, [error]);

  if (isLoading || isPending) {
    return <LoadingPage />;
  }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[50vh]">
  //       <p>Failed to load profile status</p>
  //     </div>
  //   );
  // }

  const handleCopy = async (copyText: string) => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50/50 dark:bg-zinc-950">

      <div className="flex flex-col gap-3 overflow-y-auto pb-24 sm:pb-6">
        {/* Profile Card View */}
        <div className="flex flex-col gap-5 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 w-full">
          <div className="w-full flex flex-row items-stretch justify-start gap-4 sm:gap-6 md:gap-10 pb-6 border-b">
            {/* Avatar with gradient ring */}
            <div className="relative shrink-0 group md:w-40 lg:w-48">
              <Image
                alt="Avatar"
                src={
                  user?.image
                    ? user.image
                    : user?.gender === "MALE"
                      ? "/groom.webp"
                      : "/bride.webp"
                }
                width={256}
                height={320}
                priority
                className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto aspect-[4/5] object-cover rounded-2xl shadow-lg border-2"
              />
              {/* Pending Badge */}
              {!error && data?.verificationStatus !== "APPROVED" && (
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-amber-500/90 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg border border-amber-400 backdrop-blur-sm text-[8px] sm:text-[10px] font-bold flex items-center gap-1 sm:gap-1.5 z-10 pointer-events-none">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-pulse"></span>
                  Pending
                </div>
              )}
                {!error && data?.verificationStatus === "APPROVED" && (
                  <Link
                    href={PROFILE_CHANGE_AVATAR_LINK}
                    className="absolute bottom-3 right-3 bg-rose-600 text-white p-1.5 sm:p-3 rounded-full shadow-xl hover:bg-rose-700 hover:scale-110 transition-all border-2 border-white dark:border-zinc-950"
                    title="Change Profile Image"
                  >
                    <Camera className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </Link>
                )}
            </div>

            {/* User Info */}
            <div className="flex-1 flex flex-col items-start gap-1 sm:gap-2 pt-1 sm:pt-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight">
                  {user?.name} {user?.middleName} {user?.lastName}
                </h1>
                {paidUser.paid && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-md gap-1 px-1.5 py-0 sm:px-2.5 sm:py-0.5 text-[9px] sm:text-xs">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> VIP
                  </Badge>
                )}
              </div>

              <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-muted-foreground">
                <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                {user?.publicId}
                <Button
                  onClick={() => handleCopy(user?.publicId as string)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-9 sm:w-9 ml-[-4px]"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </p>

              <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-muted-foreground">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" /> +91 {user?.phone}
              </p>

              {user?.type === UserType.PAID_USER && (
                <div className="flex gap-1.5 sm:gap-2 items-start text-xs sm:text-sm md:text-base text-muted-foreground">
                  <div className={"flex gap-1 items-center"}>
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Plan Expires:</span>
                  </div>
                  <div
                    className={
                      "flex flex-col sm:flex-row sm:gap-1 sm:items-center"
                    }
                  >
                    <span className="font-semibold">
                      {format(
                        new Date(user?.planExpiryDate ?? new Date()),
                        "dd MMM yyyy",
                      )}
                    </span>
                    <span className="text-[10px] sm:text-xs hidden sm:block">
                      (
                      {formatDistance(
                        new Date(user?.planExpiryDate ?? new Date()),
                        new Date(),
                        { addSuffix: true },
                      )}
                      )
                    </span>
                  </div>
                </div>
              )}

              {/* Profile Update Actions (Desktop Only) */}
              {!error && data?.isProfileComplete !== true && (
                <div className="mt-4 w-full hidden sm:flex justify-start">
                  <div className="bg-muted p-4 rounded-2xl shadow-lg text-center flex flex-col justify-between space-y-3 border border-primary/20 w-full max-w-sm">
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-1">
                        Complete your profile
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Just one step away! Complete your profile to make it visible to everyone.
                      </p>
                    </div>
                    <Button
                      asChild
                      className="rounded-full w-full font-medium shadow mt-2"
                    >
                      <Link href={PROFILE_EDIT_PAGE_LINK}>
                        Update Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Plan Details Simplified */}
              <div className="mt-1 sm:mt-2 w-full flex justify-start">
                <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-muted-foreground">
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" /> 
                  Plan: <span className="font-semibold text-primary">{paidUser.paid ? "Premium Plan" : "Free Plan"}</span>
                  {paidUser.paid === false && paidUser.reason === NotPaidUserReason.PLAN_EXPIRED && (
                    <span className="text-destructive font-semibold">(Expired)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Membership Card (Desktop Only) */}
            <div className="hidden lg:flex flex-col h-full justify-between min-w-[280px]">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 mb-4">Membership</h3>
                
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0 relative">
                    <Shield className="w-8 h-8 text-rose-600 fill-rose-600" />
                    <Crown className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-[-2px]" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px] text-gray-900 dark:text-white">
                      {paidUser.paid ? "Premium Plan" : "Free Plan"}
                    </span>
                    {user?.planExpiryDate ? (
                      <span className="text-[13px] font-semibold text-rose-600 mt-0.5">
                        Valid till {format(new Date(user.planExpiryDate), "dd MMM yyyy")}
                      </span>
                    ) : (
                      <span className="text-[13px] font-semibold text-rose-600 mt-0.5">
                        Basic Access
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mb-4">
                  {paidUser.paid ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">Unlimited Messaging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">View Contact Details</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">Priority Matchmaking Support</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">Search & View Profiles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">Send Interest Requests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">Upgrade to chat directly</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 font-bold bg-white dark:bg-zinc-900"
                asChild
              >
                <Link href={SUBSCRIPTION_PAGE_LINK}>
                  Manage Membership
                </Link>
              </Button>
            </div>

          </div>

          {/* Profile Update Actions (Mobile Only) */}
          {!error && data?.isProfileComplete !== true && (
            <div className="w-full flex sm:hidden justify-center pb-6">
              <div className="bg-muted p-3 rounded-xl shadow-md text-center flex flex-col justify-between space-y-2 border border-primary/20 w-full max-w-[90%] mx-auto">
                <div>
                  <p className="text-base font-bold text-foreground mb-0.5">
                    Complete your profile
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Just one step away! Complete your profile to make it visible to everyone.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full w-full font-medium shadow-sm h-8 text-xs mt-1"
                >
                  <Link href={PROFILE_EDIT_PAGE_LINK}>
                    Update Profile
                  </Link>
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Settings Section */}
        <div className="mx-4 md:mx-6 lg:mx-8 mb-6 flex flex-col flex-1 space-y-8">
          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences and security
            </p>
          </div>

          {/* Settings Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            {/* Edit Contact Details */}
            <Link href={PROFILE_EDIT_CONTACT_DETAILS_LINK} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                <UserRound className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-base font-bold text-foreground">Contact Details</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Manage your email address and phone number.</p>
                <span className="text-xs font-semibold text-rose-500 mt-2">Manage Contact</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
            </Link>

            {/* Edit Profile Details */}
            {!error && data?.isProfileComplete === true && (
              <Link href={PROFILE_EDIT_PROFILE_DETAILS_LINK} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                  <Settings className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-foreground">Profile Details</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Update your personal information and preferences.</p>
                  <span className="text-xs font-semibold text-rose-500 mt-2">Manage Profile</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
              </Link>
            )}

            {/* Photo Gallery */}
            {!error && data?.isProfileComplete === true && (
              <Link href={PROFILE_CHANGE_AVATAR_LINK} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-foreground">Photo Gallery</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Manage your profile pictures and photo gallery.</p>
                  <span className="text-xs font-semibold text-rose-500 mt-2">Manage Photos</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
              </Link>
            )}

            {/* Change Password */}
            <Link href={PROFILE_EDIT_CHANGE_PASSWORD_LINK} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-base font-bold text-foreground">Security Settings</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Secure your account by updating your password.</p>
                <span className="text-xs font-semibold text-rose-500 mt-2">Manage Security</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
            </Link>

            {/* Payment History */}
            {user?.gender === UserGender.MALE && (
              <Link href={PAYMENTS_LIST_LINK} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-foreground">Payment History</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">View your previous transactions and subscriptions.</p>
                  <span className="text-xs font-semibold text-rose-500 mt-2">Manage Payments</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
              </Link>
            )}

            {/* Blocked Users */}
            {!error && data?.isProfileComplete === true && (
              <Link href={BLOCKED_USER_LINK} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                  <Ban className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-foreground">Blocked Users</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Manage the members you have blocked from contacting you.</p>
                  <span className="text-xs font-semibold text-rose-500 mt-2">Manage Blocked List</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
              </Link>
            )}

            {/* Reported Profiles */}
            <Link href={REPORTED_USER_LINK} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                <MessageCircleWarning className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-base font-bold text-foreground">Reported Profiles</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">View the history of members you have reported.</p>
                <span className="text-xs font-semibold text-rose-500 mt-2">Manage Reports</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
            </Link>

            {/* Matching */}
            {user?.gender === UserGender.MALE && user?.type === UserType.PAID_USER && (
              <Link href={MATCHING_LINK} onClick={() => resetUserSAMessage()} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                  <MessageCircleHeart className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">My Matches</h3>
                    {userSAConversationIds.length > 0 && (
                      <Badge className="rounded-full bg-rose-600 text-white">New Message</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Connect with your dedicated matchmaker.</p>
                  <span className="text-xs font-semibold text-rose-500 mt-2">Manage My Matches</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
              </Link>
            )}

            {/* Help Center */}
            <Link href={HELP_CENTER_LINK} className="flex items-center p-5 rounded-2xl border border-border bg-card hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer gap-4 group">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Help Centre</h3>
                  {teamConversationIds.length > 0 && (
                    <Badge className="rounded-full bg-rose-600 text-white">New Message</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Get support and view our frequently asked questions.</p>
                <span className="text-xs font-semibold text-rose-500 mt-2">Get Help</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
            </Link>

          </div>

          {/* Mobile Logout Button */}
          <div className="md:hidden mt-2 pb-2 flex justify-center">
            <Button
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-destructive hover:bg-transparent font-medium py-2.5 px-4"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onRequest: () => setLoggingOut(true),
                    onSuccess: () => router.push("/auth/login"),
                    onError: () => setLoggingOut(false),
                  },
                })
              }
              disabled={loggingOut}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              {loggingOut ? "Logging out..." : "Log out"}
            </Button>
          </div>


        </div>
      </div>
    </div>
  );
}
