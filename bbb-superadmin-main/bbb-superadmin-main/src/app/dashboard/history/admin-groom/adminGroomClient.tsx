"use client";

import { EpmptyList } from "@/components/emptyList";
import { ITeams } from "@/components/interface/ITeam";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mars, Venus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function AdminGroomClient({ admins }: { admins: ITeams[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return admins;
    return admins.filter(
      (admin) =>
        admin.firstName.toLowerCase().includes(query.toLowerCase()) ||
        admin.email?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, admins]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-3 md:flex-row md:p-5">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Team Managers
          </h1>
        </div>
        <Input
          placeholder="Search team manager..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
          {filtered.map((admin) => (
            <Link
              href={`/dashboard/history/admin-groom/${admin.id}`}
              key={admin.id}
            >
              <TeamCustomCardView {...admin} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <EpmptyList
            title="No Admin Found"
            subtitle="We could not find any admin that you are looking for."
          />
        </div>
      )}
    </div>
  );
}

function TeamCustomCardView({
  firstName,
  middleName,
  lastName,
  gender,
  avatar,
}: ITeams) {
  const fullName = `${firstName} ${middleName ?? ""} ${lastName}`.trim();

  return (
    <div className="bg-card rounded-2xl border shadow-md">
      <div className="p-4">
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
            <Badge
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
                  <Venus className="h-4 w-4" />
                  {gender}
                </span>
              )}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
