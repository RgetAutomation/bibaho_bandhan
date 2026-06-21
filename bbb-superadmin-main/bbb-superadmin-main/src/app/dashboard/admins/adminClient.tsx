"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ITeams } from "@/components/interface/ITeam";
import { EpmptyList } from "@/components/emptyList";
import TeamCardView from "@/components/teamCardView";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";

export function AdminClientComponent({ admins }: { admins: ITeams[] }) {
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
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6 lg:p-8">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Admin Users ({admins.length})
          </h1>
          <Input
            placeholder="Search admin..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
        </div>

        {/* Right: Create button */}
        <Button asChild className="flex items-center gap-2">
          <Link
            href="/dashboard/profile/team/create?role=admin"
            className="flex items-center gap-2"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Create Admin</span>
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
            title="No Admin Found"
            subtitle="We could not find any admin that you are looking for."
          />
        </div>
      )}
    </div>
  );
}
