"use client";

import { EpmptyList } from "@/components/emptyList";
import {
  IConversationAssignAdmin,
  IConversationAssignModerator,
  IConversationParticipants,
  ITotalConversationsAssaigned,
} from "@/components/interface/IConversationAssign";
import { IPaginatedResult } from "@/components/interface/IPagenation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

export default function TotalAssignedConvClient({
  saUserId,
  saUserAvatar,
  data,
  currentPage,
}: {
  saUserId: string;
  saUserAvatar: string;

  data: IPaginatedResult<ITotalConversationsAssaigned[]> | null;
  currentPage: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedDays, setSelectedDays] = useState("7");

  const pagination = data;
  const conversations = data?.data;

  const filtered = useMemo(() => {
    if (!query) return conversations;
    return conversations?.filter(
      (auditLog: ITotalConversationsAssaigned | null) =>
        auditLog?.conversation?.participants?.[0]?.firstName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.conversation?.participants?.[0]?.middleName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.conversation?.participants?.[0]?.lastName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.conversation?.participants[1].firstName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.conversation?.participants[1].middleName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.conversation?.participants[1].lastName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.moderator.firstName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.moderator.middleName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.moderator.lastName
          ?.toString()
          ?.includes(query.toLowerCase()) ||
        auditLog?.admin.firstName?.toString()?.includes(query.toLowerCase()) ||
        auditLog?.admin.middleName?.toString()?.includes(query.toLowerCase()) ||
        auditLog?.admin.lastName?.toString()?.includes(query.toLowerCase())
    );
  }, [query, conversations]);

  const goToPage = (page: number, days: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    params.set("days", String(days));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="bg-card flex w-full flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Conversations ({filtered?.length || 0})
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
          <Select
            onValueChange={(value) => {
              setSelectedDays(value);
              goToPage(1, Number(value));
            }}
            defaultValue="7"
          >
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {conversations?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <EpmptyList
            title="No conversations found"
            subtitle={"We couldn't find any conversations."}
          />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <EpmptyList
            title="No conversations found"
            subtitle={
              "We couldn't find any conversations that match your search."
            }
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 space-y-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((conv) => (
              <ConversationCard
                key={conv.conversation.id}
                id={conv.conversation.id}
                convId={conv.conversation.convId}
                participants={conv.conversation.participants}
                moderator={conv.moderator}
                admin={conv.admin}
                saUserId={saUserId}
                saUserAvatar={saUserAvatar}
              />
            ))}
          </div>

          {pagination && (
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        goToPage(currentPage - 1, Number(selectedDays));
                      }
                    }}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(pageNum, Number(selectedDays));
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      if (currentPage < pagination.totalPages) {
                        goToPage(currentPage + 1, Number(selectedDays));
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}

function ConversationCard({
  id,
  convId,
  participants,
  moderator,
  admin,
  saUserId,
  saUserAvatar,
}: {
  id: string;
  convId: string;
  participants: IConversationParticipants[];
  moderator: IConversationAssignModerator;
  admin: IConversationAssignAdmin;
  saUserId: string;
  saUserAvatar: string;
}) {
  return (
    <div className="group bg-card rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-5">
        {/* Avatars */}
        <div className="flex justify-center">
          <div className="flex -space-x-5">
            {participants.map((p) => (
              <Avatar
                key={p.id}
                className="border-background h-14 w-14 border-2 shadow-sm"
              >
                <AvatarImage
                  src={
                    p.avatar
                      ? p.avatar
                      : p.gender === "MALE"
                        ? "/groom.webp"
                        : "/bride.webp"
                  }
                  alt={p.lastName || ""}
                />
                <AvatarFallback>{p.lastName?.[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        {/* Names */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-base font-semibold">
            {participants[0].title} {participants[0].firstName}{" "}
            {participants[0].middleName && `${participants[0].middleName} `}
            {participants[0].lastName}
          </span>

          <Heart className="text-primary h-4 w-4" />

          <span className="text-base font-semibold">
            {participants[1].title} {participants[1].firstName}{" "}
            {participants[1].middleName && `${participants[1].middleName} `}
            {participants[1].lastName}
          </span>
        </div>

        {/* Meta info */}
        <div className="bg-muted/40 rounded-xl border p-3 text-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Conversation ID:</span>
              <span className="text-foreground ml-1 font-medium">{convId}</span>
            </div>

            {/* Assigned to */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned to</span>
              <Link href={`/dashboard/profile/team/${moderator.id}`}>
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 rounded-full"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={moderator.avatar || "/bride.webp"}
                      alt={moderator.id}
                    />
                    <AvatarFallback>
                      {moderator.firstName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {moderator.firstName}{" "}
                    {moderator.middleName && `${moderator.middleName} `}
                    {moderator.lastName}
                  </span>
                </Badge>
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned by</span>
              {admin.id === saUserId ? (
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 rounded-full"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={saUserAvatar || "/groom.webp"}
                      alt={saUserId}
                    />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">You</span>
                </Badge>
              ) : (
                <Link href={`/dashboard/profile/team/${admin.id}`}>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 rounded-full"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={admin.avatar || "/bride.webp"}
                        alt={admin.id}
                      />
                      <AvatarFallback>
                        {admin.firstName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {admin.firstName}{" "}
                      {admin.middleName && `${admin.middleName} `}
                      {admin.lastName}
                    </span>
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          asChild
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground w-full rounded-full font-medium transition"
        >
          <Link href={`/dashboard/history/chats/${id}`}>View Conversation</Link>
        </Button>
      </div>
    </div>
  );
}
