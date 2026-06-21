"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import ContentNotFound from "@/components/contentNotFound";
import { IMatchedUsers } from "@/components/interface/ghotok/IMatchedUsers";
import { useQuery } from "@tanstack/react-query";
import { getAllMatchedUserForGhotok } from "@/actions/ghotok";

export default function PaidMatchingGroomClientForGhotok() {
  const [sortBy, setSortBy] = useState("all");

  const {
    data: grooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getAllMatchedUserForGhotok"],
    queryFn: () => getAllMatchedUserForGhotok(),
  });

  // Filter + Sort combined
  const filteredAndSorted = useMemo(() => {
    const filtered = grooms ?? [];

    if (sortBy === "all") {
      return [...filtered];
    } else if (sortBy === "active") {
      return [
        ...filtered.filter(
          (user) => user.isGhotokOwned && user.isExipired === false
        ),
      ];
    } else if (sortBy === "expired") {
      return [
        ...filtered.filter(
          (user) => user.isGhotokOwned && user.isExipired === true
        ),
      ];
    }
  }, [grooms, sortBy]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:p-6">
        {/* Title + Avatar */}
        <div className="flex items-center gap-3">
          {/* <Avatar className="h-10 w-10">
            <AvatarImage src="/groom.webp" alt="Bride" />
            <AvatarFallback>G</AvatarFallback>
          </Avatar> */}
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl lg:text-3xl dark:text-gray-100">
            Matched Grooms ({filteredAndSorted?.length})
          </h1>
        </div>

        {/* Search + Sort */}
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Select onValueChange={setSortBy} defaultValue="all">
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matched</SelectItem>
              <SelectItem value="active">Active Matched</SelectItem>
              <SelectItem value="expired">Expired Matched</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        {filteredAndSorted && filteredAndSorted.length > 0 ? (
          <div className="grid flex-1 grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
            {filteredAndSorted.map((groom) => (
              <Link
                href={`/dashboard/ghotok/users/${groom.id}/view`}
                key={groom.id}
              >
                <MatchedUserCardView user={groom} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <ContentNotFound
              title="No Groom Found"
              description="We could not find any groom that matches your search."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MatchedUserCardView({ user }: { user: IMatchedUsers }) {
  const fullName = `${user.title} ${user.firstName} ${user.middleName || ""} ${
    user.lastName
  }`.trim();

  return (
    <Card className="w-full rounded-2xl shadow-lg">
      <CardHeader className="flex items-center gap-4">
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
          <p className="text-muted-foreground text-sm">{user.type} Plan</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-muted-foreground" />
          <span>
            Plan Start:{" "}
            {user.type === "PAID"
              ? format(new Date(user.matchingStartDate || ""), "dd MMM, yyyy")
              : "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-muted-foreground" />
          <span>
            Plan Expires:{" "}
            {user.type === "PAID"
              ? format(new Date(user.matchingExpiryDate || ""), "dd MMM, yyyy")
              : "N/A"}
          </span>
        </div>

        <div className="ictems-center flex gap-2">
          <Badge
            className={`rounded-2xl ${
              user.isExipired ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {user.isExipired ? "Expired" : "Active"}
          </Badge>

          {/* {user.isGhotokOwned && (
            <Badge className={`rounded-2xl`}>Ghotok User</Badge>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}
