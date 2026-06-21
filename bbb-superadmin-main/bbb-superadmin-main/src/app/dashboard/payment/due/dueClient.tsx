"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EpmptyList } from "@/components/emptyList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, CreditCard, Mail } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IPaymentFullUser } from "@/components/interface/IPayments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DueClientComponent({
  users,
}: {
  users: IPaymentFullUser[];
}) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Filter + Sort combined
  const filteredAndSorted = useMemo(() => {
    let filtered = users;

    // 1️⃣ Filter by search query
    if (query) {
      filtered = filtered.filter(
        (b) =>
          b.firstName.toLowerCase().includes(query.toLowerCase()) ||
          (b.phone?.toLowerCase().includes(query.toLowerCase()) ?? false)
      );
    }

    // 2️⃣ Sort filtered results
    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.firstName.localeCompare(b.firstName);
      if (sortBy === "name-desc") return b.firstName.localeCompare(a.firstName);
      if (sortBy === "expiry")
        return (
          new Date(a.planExpiryDate || "").getTime() -
          new Date(b.planExpiryDate || "").getTime()
        );
      if (sortBy === "status-active")
        return Number(a.blocked) - Number(b.blocked);
      if (sortBy === "status-blocked")
        return Number(b.blocked) - Number(a.blocked);
      return 0;
    });
  }, [users, query, sortBy]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:p-6 lg:p-8">
        {/* Title + Avatar */}
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl lg:text-3xl dark:text-gray-100">
          Plan Expire Room ({filteredAndSorted.length})
        </h1>

        {/* Search + Sort */}
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full md:w-72"
          />
          <Select onValueChange={setSortBy} defaultValue="name-asc">
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A–Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z–A)</SelectItem>
              <SelectItem value="expiry">Plan Expiry (Soonest)</SelectItem>
              <SelectItem value="status-active">
                Status (Active first)
              </SelectItem>
              <SelectItem value="status-blocked">
                Status (Blocked first)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
            {filteredAndSorted.map((user) => (
              <UserCard user={user} key={user.id} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <EpmptyList
              title="No Bride Found"
              subtitle="Please add some bride user to get started."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user }: { user: IPaymentFullUser }) {
  const fullName = `${user.title} ${user.firstName} ${user.middleName || ""} ${
    user.lastName
  }`.trim();

  return (
    <Card className="w-full rounded-2xl pt-0 shadow-lg">
      <Link href={`/dashboard/profile/user/${user.id}`} key={user.id}>
        <CardHeader className="hover:bg-primary/10 flex items-center gap-4 border-b pt-6 transition-all duration-200 ease-in-out hover:rounded-t-2xl">
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
            <p className="text-muted-foreground text-sm">+91 {user.phone}</p>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Mail size={16} className="text-muted-foreground" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-muted-foreground" />
          <span>
            Plan Expires:{" "}
            {format(new Date(user.planExpiryDate || ""), "dd MMM, yyyy")}
          </span>
        </div>
        <Button className="mt-2 w-full" variant={"secondary"} asChild>
          <Link href={`/dashboard/payment/due/${user.id}`}>
            <CreditCard size={16} />
            <span>View Payments</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
