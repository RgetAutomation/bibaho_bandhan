"use client";

import { getAllRejectedMessages, IRejectedMessage } from "@/actions/teams";
import ApiErrorPage from "@/components/apiErrorPage";
import ContentNotFound from "@/components/contentNotFound";
import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { AlertTriangle, Clock, Hash, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function RejectedMessageClient() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllRejectedMessages", page],
    queryFn: () =>
      getAllRejectedMessages({
        page,
        limit: 9,
      }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load rejected messages"
      : "Something went wrong. Please try again later.";
    return (
      <ApiErrorPage
        title={"Failed to load rejected messages"}
        description={errorMessage}
      />
    );
  }

  console.log(data);

  const rejectedMessages = data?.data;

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="bg-card flex w-full flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Rejected Approval Chats
          </h1>
        </div>
      </div>

      {rejectedMessages?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ContentNotFound
            title="No conversations found"
            description={"We couldn't find any conversations."}
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-3 lg:p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 space-y-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedMessages?.map((message) => (
              <RejectedMessageCard key={message.id} message={message} />
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

function RejectedMessageCard({ message }: { message: IRejectedMessage }) {
  return (
    <div className="bg-background relative space-y-2 rounded-3xl border p-3 transition-all">
      {/* Message Section */}
      <div className="gap-2 space-y-1 rounded-t-2xl bg-neutral-200 p-3 dark:bg-neutral-800">
        <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
          <MessageCircle size={16} className="opacity-70" />
          <span>Message</span>
        </div>

        <p className="text-base leading-relaxed font-semibold">
          {message.content}
        </p>
      </div>

      <div className="gap-2 space-y-1 rounded-t-2xl bg-neutral-200 p-3 dark:bg-neutral-800">
        <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
          <Hash size={16} className="opacity-70" />
          <span>Conversation ID</span>
        </div>

        <p className="text-base leading-relaxed font-semibold">
          {message.convId}
        </p>
      </div>

      <div className="gap-2 space-y-1 rounded-t-2xl bg-neutral-200 p-3 dark:bg-neutral-800">
        <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
          <Clock size={16} className="opacity-70" />
          <span>Rejected At : </span>
        </div>

        <p className="text-base leading-relaxed font-semibold">
          {format(new Date(message.createdAt), "dd/MM/yyyy hh:mm:ss a")}
        </p>
      </div>

      {/* Reason Section */}
      <div className="space-y-1 rounded-b-2xl bg-neutral-200 p-3 dark:bg-neutral-800">
        <div className="text-destructive flex items-center gap-2 text-sm font-medium">
          <AlertTriangle size={16} />
          <span>Reason</span>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {message.reason}
        </p>
      </div>

      {/* Bottom Action */}
      <Button className="mt-3 flex rounded-full" asChild>
        <Link
          href={`/dashboard/history/${message.conversationId}/chat`}
          className="text-primary text-sm font-medium transition"
        >
          View Conversation →
        </Link>
      </Button>
    </div>
  );
}
