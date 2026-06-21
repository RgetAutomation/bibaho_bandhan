"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ITeams } from "@/components/interface/ITeam";
import { EpmptyList } from "@/components/emptyList";
import TeamCardView from "@/components/teamCardView";

export function ProfileClientComponent({ teams }: { teams: ITeams[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return teams;
    return teams.filter(
      (team) =>
        team.firstName.toLowerCase().includes(query.toLowerCase()) ||
        team.phone?.toLowerCase().includes(query.toLowerCase()) ||
        team.email?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, teams]);

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 lg:p-8 bg-card border">
        {/* Left: Title + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full ">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Profile Requests
          </h1>
          <Input
            placeholder="Search ghotok..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-2 lg:p-4">
          {filtered.map((admin) => (
            <Link
              href={`/dashboard/request/profile/${admin.id}`}
              key={admin.id}
            >
              <TeamCardView {...admin} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col flex-1 items-center justify-center p-4">
          <EpmptyList
            title="No User Found"
            subtitle="We could not find any user that you are looking for."
          />
        </div>
      )}
    </div>
  );
}
