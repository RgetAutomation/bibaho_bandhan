import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { ILoggedInUser } from "@/components/helper/getSession";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Role } from "@/types/Role";
import { Hash, Mail, Phone, User } from "lucide-react";
import React from "react";
import LogoutButton from "./logoutButton";
import ProfileClientPage from "./profileClientPage";
import { addIdPrefix } from "@/lib/utils";
import { TeamRole } from "@/components/enum/TeamRole";

export default async function ProfilePage() {
  const user: ILoggedInUser | null = await checkRoleAndGetSession([
    Role.ADMIN,
    Role.MODERATOR,
    Role.GHOTOK,
  ]);
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:gap-5 md:p-5 lg:gap-6 lg:p-6">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl font-bold">Profile</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Your personal information at a glance
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <Avatar className="ring-primary ring-offset-background h-28 w-28 shadow-md ring-2 ring-offset-2">
            <AvatarImage src={user?.image || "/groom.webp"} />
            <AvatarFallback className="text-lg font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Full Name */}
          <h2 className="text-lg font-semibold">
            {`${user?.name} ${user?.middleName || ""} ${user?.lastName}`.trim()}
          </h2>

          {/* Details */}
          <div className="divide-border bg-card flex w-full flex-col divide-y overflow-hidden rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2">
              <Hash size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground font-medium">ID:</span>
              <span className="ml-auto">
                {addIdPrefix(
                  user?.internalId.toString(),
                  user?.role as TeamRole
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
              <User size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Name:</span>
              <span className="ml-auto">
                {`${user?.name} ${user?.middleName || ""} ${
                  user?.lastName
                }`.trim()}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
              <User size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground font-medium">
                Username:
              </span>
              <span className="ml-auto">
                {user.username ? user.username : "NO USERNAME"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
              <Phone size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Mobile:</span>
              <span className="ml-auto">+91 {user?.phone}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
              <Mail size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Email:</span>
              <span className="ml-auto">
                {user?.email ? user.email : "NO EMAIL"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <LogoutButton />
        </CardFooter>
      </Card>

      <ProfileClientPage mobile={user?.phone || ""} email={user?.email || ""} />
    </div>
  );
}
