"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ITeams } from "@/components/interface/ITeam";
import Link from "next/link";
import { EpmptyList } from "@/components/emptyList";
import TeamCardView from "@/components/teamCardView";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TeamMemberClientComponent({ tms }: { tms: ITeams[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return tms;
    return tms.filter(
      (tm) =>
        tm.firstName.toLowerCase().includes(query.toLowerCase()) ||
        tm.email?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, tms]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6 lg:p-8">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-nowrap text-gray-800 md:text-2xl dark:text-gray-100">
            Moderators ({tms.length})
          </h1>
          <Input
            placeholder="Search moderator..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link
            href="/dashboard/profile/team/create?role=moderator"
            className="flex items-center gap-2"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Create Moderator</span>
          </Link>
        </Button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
          {filtered.map((admin) => (
            <Link href={`/dashboard/profile/team/${admin.id}`} key={admin.id}>
              <TeamCardView {...admin} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <EpmptyList
            title="No Moderators Found"
            subtitle="We could not find any moderator that you are looking for."
          />
        </div>
      )}
    </div>
  );
}
