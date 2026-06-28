"use client";

import { useState } from "react";
import { IUsers } from "./interface/IUsers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, CheckCircle2, Hash, Info, Phone, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CardMarkButton from "./CardMarkButton";

export default function UserCardView({ user, showMarkButton = false }: { user: IUsers, showMarkButton?: boolean }) {
  const [isMarked, setIsMarked] = useState(false);

  const fullName = `${user.title} ${user.firstName} ${user.middleName || ""} ${
    user.lastName
  }`.trim();

  return (
    <Card className={cn("mb-0 w-full rounded-2xl shadow-lg relative transition-all duration-300", isMarked ? "ring-2 ring-primary shadow-primary/40" : "")}>
      {showMarkButton && <CardMarkButton isMarked={isMarked} onToggle={() => setIsMarked(!isMarked)} />}
      <CardHeader className="flex items-center gap-4 pt-6">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={
              user.avatar
                ? user.avatar
                : user.gender === "MALE"
                  ? "/groom.webp"
                  : "/bride.webp"
            }
            alt={fullName}
          />
          <AvatarFallback>
            {user.firstName[0]}
            {user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-semibold">{fullName}</CardTitle>
          <div className="flex flex-1 items-center gap-1">
            <span className="flex items-center gap-0.5 text-sm">
              <Hash size={14} />
              {user.publicId}
            </span>
            {user.isGhotokOwned ? (
              <Badge
                variant={"outline"}
                className={`border-primary text-primary rounded-2xl border`}
              >
                Ghotok
              </Badge>
            ) : user.planExpiryDate && user.planExpiryDate > new Date() ? (
              <Badge
                variant={"outline"}
                className={`rounded-2xl border ${user.type === "PAID" ? "border-green-600 text-green-600" : "border-orange-400 text-orange-400"}`}
              >
                {user.type}
              </Badge>
            ) : user.planExpiryDate &&
              user.planExpiryDate < new Date() &&
              user.type === "PAID" ? (
              <Badge
                variant={"outline"}
                className={`rounded-2xl border border-red-600 text-red-600`}
              >
                Expired
              </Badge>
            ) : (
              <Badge
                variant={"outline"}
                className={`rounded-2xl border border-blue-600 text-blue-600`}
              >
                Free
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Phone size={16} className="text-muted-foreground" />
          <span>+91-{user.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-muted-foreground" />
          <span>
            Plan Expires:{" "}
            {user.type === "PAID"
              ? format(new Date(user.planExpiryDate || ""), "dd MMM, yyyy")
              : "N/A"}
          </span>
        </div>

        <div className="flex gap-2">
          <Badge
            className={`rounded-2xl ${
              user.blocked ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {user.blocked ? "Blocked" : "Active"}
          </Badge>
          <Badge
            variant={"secondary"}
            className={cn(
              user.isProfileComplete ? "border-green-600" : "border-yellow-600",
              "rounded-2xl"
            )}
          >
            {user.isProfileComplete ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <Info className="h-6 w-6 text-yellow-600" />
            )}
            {user.isProfileComplete ? "Complete Profile" : "Incomplete Profile"}
          </Badge>
          {user.allowSocialPublish && (
            <Badge
              variant={"outline"}
              className="rounded-2xl border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Shared Profile
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
