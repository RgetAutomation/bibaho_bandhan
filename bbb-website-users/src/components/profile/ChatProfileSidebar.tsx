"use client";

import React from "react";
import Image from "next/image";
import { getProfileDetails } from "@/actions/getProfileDetails";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Globe2, Users2, Heart, Phone, Calendar, Loader2, X, Camera, Briefcase, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "@/components/enum/connectionStatus";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

interface ChatProfileSidebarProps {
  profileId: string;
  onClose?: () => void;
}

export function ChatProfileSidebar({ profileId, onClose }: ChatProfileSidebarProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["profileDetails", profileId],
    queryFn: () => getProfileDetails(profileId),
  });

  if (isLoading) {
    return (
      <div className="w-full md:w-[240px] lg:w-[260px] shrink-0 border-l border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#E51E44] animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const photoCount = (data.profileImages?.length || 0) + (data.avatar ? 1 : 0);

  return (
    <div className="w-full md:w-[240px] lg:w-[260px] shrink-0 border-l border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative">
      {onClose && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <div className="p-4 space-y-5 pb-20">
        {/* Top Image Section */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-900 shadow-sm">
          <Image
            src={data.avatar}
            alt={`${data.title} ${data.lastName}`}
            fill
            className="object-cover object-top"
          />

          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
            <Camera className="w-3 h-3" />
            View Photos ({photoCount})
          </div>
        </div>

        {/* Basic Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {data.title} {data.lastName}
            </h2>
            <div className="bg-green-500 rounded-full w-4 h-4 flex items-center justify-center p-0.5 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[13px] text-gray-700 dark:text-zinc-300 font-semibold">
            <span>{data.age} yrs</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700 shrink-0"></span>
            <span>{data.height}</span>
          </div>

          <div className="space-y-2 text-[11px] font-medium text-gray-600 dark:text-zinc-400">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
              <span className="truncate">{data.dist ? `${data.dist}, ` : ""}{data.state}, {data.country || "India"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe2 className="w-4 h-4 shrink-0 text-gray-400" />
              <span className="truncate">{data.motherTongue}{data.spokenLanguages ? ` • ${data.spokenLanguages}` : ""}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users2 className="w-4 h-4 shrink-0 text-gray-400" />
              <span className="truncate">{data.religion} • {data.caste}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm p-4 space-y-4">
          <h3 className="text-[13px] font-extrabold text-gray-900 dark:text-white">More Details</h3>
          
          <div className="space-y-3 text-[11px] font-medium text-gray-600 dark:text-zinc-400">
            {data.maritalStatus && (
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 shrink-0 text-gray-400" />
                <span className="truncate">{data.maritalStatus}</span>
              </div>
            )}
            {data.education && (
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 shrink-0 text-gray-400" />
                <span className="truncate">{data.education}</span>
              </div>
            )}
            {data.profession && (
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 shrink-0 text-gray-400" />
                <span className="truncate">{data.profession}</span>
              </div>
            )}
          </div>

          <Button asChild className="w-full bg-white dark:bg-zinc-950 text-[#E51E44] border-2 border-[#E51E44]/20 hover:border-[#E51E44]/40 hover:bg-rose-50/50 dark:hover:bg-[#E51E44]/10 rounded-xl h-10 font-extrabold text-[11px] shadow-none mt-2 transition-all">
            <Link href={`/users/profile/${profileId}`}>
              View Full Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
