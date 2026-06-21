"use client";

import { revokeSession } from "@/action/sessions";
import { ISession } from "@/components/interface/ISession";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  AppWindow,
  Calendar,
  Globe,
  Hourglass,
  Loader2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function LoginSessionClient({
  sessions,
  title = "Logged In Users",
}: {
  sessions: ISession[];
  title?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return sessions;
    return sessions.filter(
      (session) =>
        session.team.firstName.toLowerCase().includes(query.toLowerCase()) ||
        session.team.middleName?.toLowerCase().includes(query.toLowerCase()) ||
        session.team.lastName?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, sessions]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6 lg:p-8">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            {title}
          </h1>
          <Input
            placeholder="Search team..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="divide-border bg-card m-4 flex flex-col divide-y overflow-hidden rounded-xl border shadow-sm">
          {/* <SessionUsers /> */}
          {filtered.map((session) => (
            <SessionUserCard key={session.id} userSession={session} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center">No results found</p>
      )}
    </div>
  );
}

function SessionUserCard({ userSession }: { userSession: ISession }) {
  const router = useRouter();
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const handleDeleteSession = async () => {
    setIsRevoking(userSession.id);
    try {
      const res = await revokeSession(userSession.id);
      if (res) {
        toast.success("Session revoked successfully.");
        router.refresh();
      } else {
        toast.error("Failed to revoke session. Please try again.");
      }
    } catch (error) {
      console.log("Error revoking session:", error);
    } finally {
      setIsRevoking(null);
    }
  };

  return (
    <div className="hover:bg-muted/70 flex flex-col items-start justify-between gap-4 px-5 py-4 transition-colors md:flex-row md:items-center md:gap-0">
      {/* Left Section: Avatar + Name + Details */}
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:gap-8">
        {/* Avatar + Name */}
        <div className="flex w-full items-center gap-3 md:w-auto">
          <Avatar className="size-10">
            <AvatarImage src={userSession.team.avatar ?? ""} />
            <AvatarFallback>{userSession.team.firstName[0]}</AvatarFallback>
          </Avatar>
          <span className="truncate text-base font-medium">
            {userSession.team.firstName} {userSession.team.middleName}{" "}
            {userSession.team.lastName}
          </span>
        </div>

        {/* Login At */}
        <div className="flex w-full flex-col gap-0.5 md:w-auto">
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Calendar className="size-3" />
            Login At :
          </span>
          <span className="truncate text-sm">
            {format(new Date(userSession.createdAt), "dd-MM-yyyy, hh:mm a")}
          </span>
        </div>

        {/* Expires At */}
        <div className="flex w-full flex-col gap-0.5 md:w-auto">
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Hourglass className="size-3" />
            Expires At :
          </span>
          <span className="truncate text-sm">
            {format(new Date(userSession.expiresAt), "dd-MM-yyyy, hh:mm a")}
          </span>
        </div>

        {/* IP Address */}
        <div className="flex w-full flex-col gap-0.5 md:w-auto">
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Globe className="size-3" />
            IP Address :
          </span>
          <span className="truncate text-sm">{userSession.ipAddress}</span>
        </div>

        {/* Agent */}
        <div className="flex w-full flex-col gap-0.5 md:w-auto">
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <AppWindow className="size-3" />
            User Agent :
          </span>
          <span className="truncate text-sm">
            {shortenUserAgent(userSession.userAgent as string)}
          </span>
        </div>
      </div>

      {/* Delete Button */}
      <div className="mt-3 flex-shrink-0 md:mt-0">
        <Button
          size="icon"
          variant="destructive"
          onClick={handleDeleteSession}
          disabled={isRevoking === userSession.id}
        >
          {isRevoking === userSession.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}

function shortenUserAgent(ua: string) {
  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/([\d.]+)/);
  const osMatch = ua.match(/\(([^)]+)\)/);

  const browser = browserMatch
    ? `${browserMatch[1]} ${browserMatch[2].split(".")[0]}`
    : "Unknown Browser";
  const os = osMatch
    ? osMatch[1].split(";")[0].replace("Windows NT 10.0", "Windows 10")
    : "Unknown OS";

  return `${browser} / ${os}`;
}
