"use client";

import { getAllMatchingConversations } from "@/actions/admin";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { isAxiosError } from "axios";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import ContentNotFound from "@/components/contentNotFound";
import {
  IMatchingModerator,
  IMatchingParticipants,
} from "@/components/interface/IMatchingConversation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function MatchingClientComponent() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data,
    isLoading: conversationLoading,
    error: conversationError,
  } = useQuery({
    queryKey: ["getAllMatchingConversations", page],
    queryFn: () => getAllMatchingConversations(page, limit),
    placeholderData: keepPreviousData,
  });

  const conversations = data?.data;
  const pagination = data;

  const filtered = useMemo(() => {
    if (!query) return conversations;
    return conversations?.filter(
      (conv) =>
        conv.participants[0].lastName
          .toString()
          .includes(query.toLowerCase()) ||
        conv.participants[1].title.toString().includes(query.toLowerCase()) ||
        conv.moderator.internalId.toString().includes(query.toLowerCase())
    );
  }, [query, conversations]);

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
      <div className="flex flex-1 flex-col items-center justify-center">
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
            Matching ({filtered?.length || 0})
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>

      {conversations?.length === 0 ? (
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
            "flex w-full flex-1 flex-col items-center justify-between p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 space-y-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((conv) => (
              <ConversationCard
                key={conv.id}
                id={conv.conversationId}
                convId={conv.convId}
                message={conv.message}
                participants={conv.participants}
                moderator={conv.moderator}
                status={conv.status}
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
  message,
  participants,
  moderator,
  status,
}: {
  id: string;
  convId: string;
  message: string;
  participants: IMatchingParticipants[];
  moderator: IMatchingModerator;
  status: string;
}) {
  const names = participants.map((p) => `${p.title} ${p.lastName}`).join(" & ");

  return (
    <div className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-zinc-900">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex -space-x-4">
          {participants.map((p) => (
            <Avatar
              key={p.id}
              className="border-background h-12 w-12 border-2 shadow-sm"
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
              <AvatarFallback>{p.lastName[0]}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* <h3 className="pt-2 text-center text-lg font-semibold tracking-tight">
          {names}
        </h3> */}
        <div className="flex flex-col items-center gap-1 pt-3">
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            Matched Conversation
          </p>

          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span>{`${participants[0]?.title} ${participants[0]?.lastName}`}</span>
            <span className="text-primary">&amp;</span>
            <span>{`${participants[1]?.title} ${participants[1]?.lastName}`}</span>
          </div>

          <div className="mt-1 h-px w-4/5 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
        </div>
      </div>

      {/* Meta Info */}
      <div className="mt-4 grid gap-2 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Conversation ID</span>
          <span className="font-medium">{convId}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Posted by</span>
          <span className="font-medium">{moderator.internalId}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-3 py-0.5 text-xs font-semibold",
              status === "PENDING" && "border-yellow-500 text-yellow-600",
              status === "APPROVED" && "border-green-600 text-green-600",
              status === "REJECTED" && "border-red-600 text-red-600"
            )}
          >
            {status}
          </Badge>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="border-primary mt-4 rounded-xl border-l-4 bg-zinc-100 p-3 dark:bg-zinc-800">
          <p className="text-muted-foreground mb-1 text-xs font-medium">
            Moderator Message
          </p>
          <p className="text-sm leading-relaxed font-medium">{message}</p>
        </div>
      )}

      {/* Footer Action */}
      <Button asChild className="mt-5 w-full rounded-full font-medium">
        <Link href={`/dashboard/history/${id}/chat`}>View Chat</Link>
      </Button>
    </div>
  );
}
