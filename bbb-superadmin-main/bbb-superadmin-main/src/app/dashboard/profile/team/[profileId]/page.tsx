export const dynamic = "force-dynamic";

import { getTeamById } from "@/action/teams";
import { EpmptyList } from "@/components/emptyList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Ban,
  Calendar,
  CheckCircle2,
  Hash,
  IdCard,
  Info,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import TeamClientComponent from "./teamClient";
import BackHeaderComponent from "@/components/backHeaderComponent";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import Link from "next/link";
import { getIdPrefix } from "@/lib/utils";

export default async function UserProfileId({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { profileId } = await params;
  const teamDetails = await getTeamById(profileId);

  if (!teamDetails)
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EpmptyList
          title="No User Found"
          subtitle="We could not find the user you are looking for. Please try again."
        />
      </div>
    );

  const fullName = [
    teamDetails.firstName,
    teamDetails.middleName,
    teamDetails.lastName,
  ]
    .filter(Boolean)
    .join(" ");
  const avatarInitials =
    (teamDetails.firstName?.[0] || "A") + (teamDetails.lastName?.[0] || "U");

  return (
    <div className="flex flex-1 flex-col">
      <BackHeaderComponent title="Team Details" />
      <div className="max-w-3xl p-4">
        <Card className="overflow-visible">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={teamDetails.avatar ? teamDetails.avatar : "#"}
                  target="_blank"
                >
                  <Avatar className="h-20 w-20 shadow-md">
                    {teamDetails?.avatar ? (
                      <AvatarImage src={teamDetails.avatar} alt={fullName} />
                    ) : (
                      <AvatarFallback className="text-xl font-semibold">
                        {avatarInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{fullName}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className="rounded-2xl uppercase">
                      {teamDetails.role}
                    </Badge>
                    {teamDetails.blocked && (
                      <Badge className="rounded-2xl bg-red-600 text-white">
                        <Ban />
                        Blocked
                      </Badge>
                    )}
                    <Badge
                      variant={"outline"}
                      className={`${
                        teamDetails.isProfileComplete
                          ? "border-green-600 text-green-600"
                          : "border-yellow-400 text-yellow-400"
                      } rounded-2xl`}
                    >
                      {teamDetails.isProfileComplete ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Profile Complete</span>
                        </>
                      ) : (
                        <>
                          <Info className="h-4 w-4" />
                          <span>Profile Incomplete</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className={"mt-2 flex items-center gap-1"}>
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                      <Hash className="h-4 w-4" />
                      <span>
                        {getIdPrefix(teamDetails.internalId, teamDetails.role)}
                      </span>
                    </div>
                    <span> • </span>
                    <p className="text-muted-foreground text-sm">
                      Joined on {format(teamDetails.createdAt, "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <section className="space-y-3">
              <h3 className="text-lg font-medium">Contact</h3>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+91 {teamDetails.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>{teamDetails.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  DOB:{" "}
                  {teamDetails.profile?.dob
                    ? format(new Date(teamDetails.profile.dob), "dd MMM yyyy")
                    : "-"}
                </span>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-medium">Address</h3>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-1 h-4 w-4" />
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-light">Village/City: </span>
                    <span className={"font-bold"}>
                      {teamDetails?.profile?.addressLine1 || "-"}
                    </span>
                  </div>

                  {teamDetails?.profile?.addressLine2 && (
                    <div>
                      <span className="font-light">Street/Road/Para: </span>
                      <span className={"font-bold"}>
                        {teamDetails?.profile?.addressLine2}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-light">Post Office: </span>
                    <span className={"font-bold"}>
                      {teamDetails.profile?.postOffice}
                    </span>
                  </div>
                  <div>
                    <span className="font-light">Police Station: </span>
                    <span className={"font-bold"}>
                      {teamDetails.profile?.policeStation}
                    </span>
                  </div>
                  <div>
                    <span className="font-light">District: </span>
                    <span className={"font-bold"}>
                      {teamDetails.profile?.dist}
                    </span>
                  </div>

                  <div>
                    <span className="font-light">State & PIN: </span>
                    <span className={"font-bold"}>
                      {teamDetails?.profile?.state || "-"}{" "}
                      {teamDetails?.profile?.pinCode
                        ? `- ${teamDetails.profile.pinCode}`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={teamDetails?.profile?.identificationProof || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm underline"
                >
                  <IdCard className="h-4 w-4" />
                  View Identification Proof
                </a>
              </div>
            </section>
            <section className="border-t pt-4 md:col-span-2">
              <h3 className="text-lg font-medium">Meta</h3>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <div className="bg-muted/60 rounded-md px-3 py-1">
                  Role: <span className="font-medium">{teamDetails.role}</span>
                </div>
                <div className="bg-muted/60 rounded-md px-3 py-1">
                  Gender:{" "}
                  <span className="font-medium">{teamDetails.gender}</span>
                </div>
                <div className="bg-muted/60 rounded-md px-3 py-1">
                  Profile ID:{" "}
                  <span className="font-medium">{teamDetails.profile?.id}</span>
                </div>
                <div className="bg-muted/60 rounded-md px-3 py-1">
                  User ID: <span className="font-medium">{teamDetails.id}</span>
                </div>
              </div>
            </section>
            <section className="rounded-2xl border-t border-red-400 bg-red-300/20 p-3 pt-4 md:col-span-2">
              <h3 className="pb-2 text-lg font-medium text-red-400">
                Danger Zone
              </h3>
              <div className="mt-2 flex w-full flex-wrap gap-3 text-sm">
                <TeamClientComponent
                  userId={teamDetails.id}
                  userName={teamDetails.firstName}
                  blockStatus={teamDetails.blocked}
                />
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
