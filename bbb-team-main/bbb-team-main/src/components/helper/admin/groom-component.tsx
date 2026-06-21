"use client";

import ButtonLoading from "@/components/buttonLoading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Groom } from "@/types/groom";
import { isAxiosError } from "axios";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Clock,
  ShieldCheck,
  Ban,
  Crown,
  HeartHandshake,
  Mars,
  Venus,
  UserRound,
  MessageCircle,
  AlertCircle,
  Hash,
  Flag,
} from "lucide-react";
import { useState } from "react";
import { GroomBadgeType } from "@/components/enum/GroomBadgeType";
import { AxiosResponse } from "@/types/AxiosResponse";
import { useRouter } from "next/navigation";
import api from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import Link from "next/link";

export function GroomComponent({
  groom,
  groomBadge,
  canMessage = true,
  canReport = false,
}: {
  groom: Groom;
  groomBadge: GroomBadgeType;
  canMessage?: boolean;
  canReport?: boolean;
}) {
  const router = useRouter();

  const [loadingConversationId, setLoadingConversationId] = useState<
    string | null
  >(null);

  async function handleLoadConversation(userId: string) {
    setLoadingConversationId(userId);
    try {
      const response = await api.get<AxiosResponse<string>>(
        `/conversations/team/user/${userId}/conversation`
      );
      if (response.data.success) {
        router.push(`/dashboard/chat/${response.data.data}`);
      } else {
        toast.error(response.data.message);
        setLoadingConversationId(null);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to get conversation"
        : "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
    setLoadingConversationId(null);
  }

  function countDays(dateString: string): number {
    const today = new Date();
    const date = new Date(dateString);
    const diff = differenceInDays(today, date);
    return Math.abs(diff);
  }

  function getBadgeStyles(type: GroomBadgeType) {
    switch (type) {
      case GroomBadgeType.BLOCKED:
        return "bg-red-600";
      case GroomBadgeType.INACTIVE:
        return "bg-gray-400";
      case GroomBadgeType.PAID:
        return "bg-green-600";
      case GroomBadgeType.MATCHING:
        return "bg-pink-500";
      case GroomBadgeType.EXPIRED:
        return "bg-orange-500";
      default:
        return "bg-blue-600";
    }
  }

  function getBadgeIcon(type: GroomBadgeType) {
    switch (type) {
      case GroomBadgeType.BLOCKED:
        return <Ban className="mr-1 h-3 w-3" />;
      case GroomBadgeType.PAID:
        return <Crown className="mr-1 h-3 w-3" />;
      case GroomBadgeType.MATCHING:
        return <HeartHandshake className="mr-1 h-3 w-3" />;
      case GroomBadgeType.INACTIVE:
        return <Clock className="mr-1 h-3 w-3" />;
      case GroomBadgeType.EXPIRED:
        return <AlertCircle className="mr-1 h-3 w-3" />;
      default:
        return <ShieldCheck className="mr-1 h-3 w-3" />;
    }
  }

  return (
    <div className="bg-card flex w-full max-w-md flex-col rounded-2xl border p-6 shadow-lg transition hover:shadow-xl">
      <div className="flex gap-4">
        {/* Avatar */}
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={groom?.avatar || "/groom.webp"} />
          <AvatarFallback>{groom?.lastName?.charAt(0) ?? "U"}</AvatarFallback>
        </Avatar>

        {/* Name + Badge */}
        <div className="flex w-full flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800 md:text-xl dark:text-gray-100">
              {groom.title} {groom.lastName}
            </h1>
            <Badge
              className={cn(
                getBadgeStyles(groomBadge),
                "flex items-center rounded-full px-2 py-0.5 text-xs text-white"
              )}
            >
              {getBadgeIcon(groomBadge)}
              {groomBadge.charAt(0).toUpperCase() +
                groomBadge.slice(1).toLowerCase()}
            </Badge>
          </div>

          {/* Gender */}
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <UserRound className="mr-1 h-4 w-4 text-gray-500" />
            Gender:
            {groom.gender === "MALE" ? (
              <>
                <Mars className="mx-1 h-4 w-4 text-blue-500" />
                <span className="font-semibold text-blue-500">Male</span>
              </>
            ) : (
              <>
                <Venus className="mx-1 h-4 w-4 text-pink-500" />
                <span className="font-semibold text-pink-500">Female</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 w-full space-y-2 text-sm text-gray-700 dark:text-gray-300">
        {/* {groom.publicId && (
          <p className="flex items-center">
            <Hash className="mr-2 h-4 w-4 text-gray-500" />
            ID: {groom.publicId}
          </p>
        )} */}

        {groom.createdAt && (
          <p className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            Join: {format(new Date(groom.createdAt), "dd-MM-yyyy")}
          </p>
        )}

        {groom.planExpiryDate &&
          (new Date(groom.planExpiryDate) > new Date() ? (
            <p className="flex items-center">
              <Crown className="mr-2 h-4 w-4 text-yellow-500" />
              Plan Expiry:{" "}
              {format(new Date(groom.planExpiryDate), "dd-MM-yyyy")} (
              {countDays(groom.planExpiryDate)} days left)
            </p>
          ) : (
            <p className="flex items-center">
              <Crown className="mr-2 h-4 w-4 text-gray-400" />
              Plan:{" "}
              <span className="ml-1 font-semibold text-red-500">
                {format(groom.planExpiryDate, "dd-MM-yyyy")} (
                {formatDistanceToNow(groom.planExpiryDate)})
              </span>
            </p>
          ))}

        {groom.matchingExpiryDate &&
          (new Date(groom.matchingExpiryDate) > new Date() ? (
            <p className="flex items-center">
              <HeartHandshake className="mr-2 h-4 w-4 text-pink-500" />
              Matching:{" "}
              {format(new Date(groom.matchingExpiryDate), "dd-MM-yyyy")} (
              {countDays(groom.matchingExpiryDate)} days left)
            </p>
          ) : (
            <p className="flex items-center">
              <HeartHandshake className="mr-2 h-4 w-4 text-gray-400" />
              Matching:{" "}
              <span className="ml-1 font-semibold text-red-500">Expired</span>
            </p>
          ))}
      </div>
      <div className="mt-3 flex w-full items-center gap-2">
        {canMessage && (
          <Button
            className={canReport ? "w-[85%]" : "w-full"}
            variant={"secondary"}
            disabled={loadingConversationId === groom.id}
            onClick={async () => await handleLoadConversation(groom.id)}
          >
            {loadingConversationId === groom.id ? (
              <ButtonLoading text="Please wait..." />
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                Message
              </>
            )}
          </Button>
        )}

        {canReport && (
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/report/user/${groom?.id}`}>
              <Flag />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
