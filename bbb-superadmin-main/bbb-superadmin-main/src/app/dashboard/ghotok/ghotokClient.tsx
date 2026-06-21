"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ITeams } from "@/components/interface/ITeam";
import { EpmptyList } from "@/components/emptyList";
import TeamCardView from "@/components/teamCardView";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";

export function GhotokClientComponent({ ghotoks }: { ghotoks: ITeams[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return ghotoks;
    return ghotoks.filter(
      (ghotok) =>
        ghotok.firstName.toLowerCase().includes(query.toLowerCase()) ||
        ghotok.phone?.toLowerCase().includes(query.toLowerCase()) ||
        ghotok.email?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, ghotoks]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6 lg:p-8">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Ghotoks ({ghotoks.length})
          </h1>
          <Input
            placeholder="Search ghotok..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link
            href="/dashboard/profile/team/create?role=ghotok"
            className="flex items-center gap-2"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Create Ghotok</span>
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
            title="No Ghotok Found"
            subtitle="We could not find any ghotok that you are looking for."
          />
        </div>
      )}
    </div>
  );
}
