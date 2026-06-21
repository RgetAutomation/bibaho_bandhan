"use client";

import { EpmptyList } from "@/components/emptyList";
import { ITeams } from "@/components/interface/ITeam";
import TeamCardView from "@/components/teamCardView";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function GhotokReviewClient({ ghotoks }: { ghotoks: ITeams[] }) {
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
    <div className="flex flex-col flex-1">
      {/* Left: Title + Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-between p-4 md:p-6 lg:p-8 bg-card border">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Ghotok Reviews
        </h1>
        <Input
          placeholder="Search ghotok..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      <div className="flex flex-col flex-1">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-2 lg:p-4">
            {filtered.map((ghotok) => (
              <Link
                href={`/dashboard/ghotok-reviews/${ghotok.id}`}
                key={ghotok.id}
              >
                <TeamCardView {...ghotok} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center p-4">
            <EpmptyList
              title="No Ghotok User Found"
              subtitle="Please add some admin user to get started."
            />
          </div>
        )}
      </div>
    </div>
  );
}
