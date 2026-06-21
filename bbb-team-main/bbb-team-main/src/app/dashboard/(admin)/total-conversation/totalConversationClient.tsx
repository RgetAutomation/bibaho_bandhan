"use client";

import { getAllConversationsAuditLogs } from "@/actions/admin";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import { Input } from "@/components/ui/input";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import React, { useMemo, useState } from "react";
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
import ContentNotFound from "@/components/contentNotFound";
import {
  IAssignedAuditLogsModerator,
  IAssignedAuditLogsParticipants,
} from "@/components/interface/IConversationAuditLogs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

export default function TotalConversationClientComponent() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedDays, setSelectedDays] = useState("7");

  const {
    data,
    isLoading: conversationLoading,
    error: conversationError,
  } = useQuery({
    queryKey: ["getAllConversationsAuditLogs", page],
    queryFn: () => getAllConversationsAuditLogs(page, limit, selectedDays),
    placeholderData: keepPreviousData,
  });

  const conversationsAuditLogs = data?.data;

  const filtered = useMemo(() => {
    if (!query) return conversationsAuditLogs;
    return conversationsAuditLogs?.filter(
      (auditLog) =>
        auditLog.participants[0].lastName
          .toString()
          .includes(query.toLowerCase()) ||
        auditLog.participants[1].title
          .toString()
          .includes(query.toLowerCase()) ||
        auditLog.moderator.internalId.toString().includes(query.toLowerCase())
    );
  }, [query, conversationsAuditLogs]);

  if (conversationLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }
  if (conversationError) {
    const errorMessage = isAxiosError(conversationError)
      ? conversationError.response?.data?.message ||
        "Failed to get conversations"
      : "Something went wrong. Please try again.";

    return (
      <div>
        <ApiErrorPage title="Failed to load data" description={errorMessage} />
      </div>
    );
  }

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
          <Select onValueChange={setSelectedDays} defaultValue="7">
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

      {conversationsAuditLogs?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ContentNotFound
            title="No conversations found"
            description={"We couldn't find any conversations."}
          />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ContentNotFound
            title="No conversations found"
            description={
              "We couldn't find any conversations that match your search."
            }
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-2 sm:p-3 md:p-4"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 space-y-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((conv) => (
              <ConversationCard
                key={conv.id}
                id={conv.conversationId}
                convId={conv.convId}
                participants={conv.participants}
                moderator={conv.moderator}
              />
            ))}
          </div>
          {data && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (data.currentPage > 1) {
                        setPage((prev) => prev - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: data.totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={data.currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (data.currentPage < data.totalPages) {
                        setPage((prev) => prev + 1);
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
}: {
  id: string;
  convId: string;
  participants: IAssignedAuditLogsParticipants[];
  moderator: IAssignedAuditLogsModerator;
}) {
  return (
    <div className="group bg-card rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col items-center gap-4">
        {/* Participants avatars */}
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
                alt={p.lastName}
              />
              <AvatarFallback>{p.lastName?.[0]}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Names */}
        <div className="grid w-full grid-cols-7 items-center gap-1 text-center">
          <span className="col-span-3 flex justify-end text-base font-semibold">
            {participants[0].title} {participants[0].lastName}
          </span>

          <span className="flex w-full items-center justify-center">
            <Heart className="text-primary h-4 w-4" />
          </span>

          <span className="col-span-3 flex justify-start text-base font-semibold">
            {participants[1].title} {participants[1].lastName}
          </span>
        </div>

        {/* Meta block */}
        <div className="bg-muted/40 w-full space-y-2 rounded-xl border p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Conversation ID</span>
            <span className="text-foreground ml-1 font-medium">{convId}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Assigned to</span>
            <Badge
              variant={"outline"}
              className="flex items-center gap-2 rounded-full border"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={
                    moderator.gender === "MALE" ? "/groom.webp" : "/bride.webp"
                  }
                  alt={moderator.internalId}
                />
                <AvatarFallback>
                  {moderator.gender.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{moderator.internalId}</span>
            </Badge>
          </div>
        </div>

        {/* CTA */}
        <Button
          asChild
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground w-full rounded-full font-medium transition"
        >
          <Link href={`/dashboard/history/${id}/chat`}>View Conversation</Link>
        </Button>
      </div>
    </div>
  );
}
