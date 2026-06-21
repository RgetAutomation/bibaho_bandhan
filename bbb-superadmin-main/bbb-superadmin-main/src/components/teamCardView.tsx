import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Ban,
  CheckCircle2,
  ClipboardClock,
  Hash,
  Info,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getIdPrefix } from "@/lib/utils";
import { ITeams } from "./interface/ITeam";

export default function TeamCardView({
  internalId,
  firstName,
  middleName,
  lastName,
  phone,
  email,
  blocked,
  avatar,
  isProfileComplete,
  role,
}: ITeams) {
  const fullName = `${firstName} ${middleName ?? ""} ${lastName}`.trim();

  console.log("role", role);

  return (
    <div className="bg-card rounded-2xl border shadow-md">
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 border">
            <AvatarImage src={avatar || ""} alt={fullName} />
            <AvatarFallback className="text-base font-semibold">
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h2 className="truncate text-lg font-semibold">{fullName}</h2>
            {/* <Badge
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                gender === "MALE" ? "bg-blue-400/10" : "bg-rose-400/10"
              }`}
            >
              {gender === "MALE" ? (
                <span className="flex items-center gap-1 text-blue-600">
                  <Mars className="h-4 w-4" />
                  {gender}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-pink-600">
                  <Venus className="h-4 w-4 " />
                  {gender}
                </span>
              )}
            </Badge> */}
            <div className="text-muted-foreground flex items-center gap-1">
              <Hash className="h-4 w-4" />
              <span>{getIdPrefix(internalId, role)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="min-w-0 flex-1 space-y-3">
          {/*  Phone */}
          <span className="text-foreground flex items-center justify-between gap-2 font-medium">
            <span className="text-muted-foreground flex items-center gap-2">
              <Phone className="text-muted-foreground h-4 w-4" /> Mobile
            </span>
            <span>
              +91-
              {phone}
            </span>
          </span>

          {/* Email */}
          {email && (
            <span className="text-foreground flex items-center justify-between gap-2 font-medium">
              <span className="text-muted-foreground flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" /> Email
              </span>
              <span>{email}</span>
            </span>
          )}

          {/* Status */}
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-2">
              <ClipboardClock className="h-4 w-4" />
              Status
            </span>
            <Badge
              variant={blocked ? "destructive" : "default"}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                !blocked && "bg-green-600 text-white"
              )}
            >
              {blocked ? (
                <>
                  <Ban className="h-3 w-3" /> Blocked
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3 w-3" /> Active
                </>
              )}
            </Badge>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-2">
              <ClipboardClock className="h-4 w-4" />
              Profile Status
            </span>
            <Badge
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                isProfileComplete
                  ? "bg-green-700 text-white"
                  : "bg-orange-600 text-white"
              )}
            >
              {isProfileComplete ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </>
              ) : (
                <>
                  <Info className="h-3 w-3" /> Incomplete
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
