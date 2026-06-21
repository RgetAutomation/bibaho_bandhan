"use client";

import { Crown } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

export default function VIPProfiles() {
  const { data: vipProfiles, isLoading } = useQuery({
    queryKey: ["vip-profiles"],
    queryFn: async () => {
      const res = await api.get("/users/vip-profiles");
      return res.data.data;
    },
  });

  return (
    <div className="flex flex-col gap-4 p-4 border-l h-full bg-card/50">
      <div className="flex items-center gap-2 pb-4 border-b">
        <Crown className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold">VIP Profiles</h2>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        {isLoading ? (
          <>
            <div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[100px]" /><Skeleton className="h-4 w-[60px]" /></div></div>
            <div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[100px]" /><Skeleton className="h-4 w-[60px]" /></div></div>
            <div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[100px]" /><Skeleton className="h-4 w-[60px]" /></div></div>
          </>
        ) : (
          vipProfiles?.map((vip: any) => (
            <div key={vip.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-yellow-500/30 hover:bg-muted transition-colors">
              <Image 
                src={vip.avatar ? vip.avatar : (vip.gender === "MALE" ? "/groom.webp" : "/bride.webp")} 
                alt="VIP" 
                width={50} height={50} 
                className="rounded-full w-12 h-12 object-cover border-2 border-yellow-500" 
              />
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold text-sm truncate">{vip.title} {vip.lastName}</h3>
                <p className="text-xs text-muted-foreground truncate">{vip.profile?.profession || "Not specified"}</p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full px-2 py-0 h-7 text-xs" asChild>
                <Link href={`/users/profile/${vip.id}`}>View</Link>
              </Button>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-auto pt-4 border-t text-center">
        <p className="text-xs text-muted-foreground mb-2">Want to be featured here?</p>
        <Button variant="default" className="w-full rounded-full text-xs h-8 bg-yellow-500 hover:bg-yellow-600 text-white" asChild>
          <Link href="/users/membership">Upgrade to VIP</Link>
        </Button>
      </div>
    </div>
  );
}
