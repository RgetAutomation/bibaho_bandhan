"use client";

import { IRejectedMessage } from "@/action/teams";
import { EpmptyList } from "@/components/emptyList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AlertTriangle, MessageCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RejectedMessageClient({
  data,
  total,
  page,
  totalPages,
}: {
  data: IRejectedMessage[];
  total: number;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();

  const goToPage = (p: number) => {
    router.push(`?page=${p}`);
  };

  const rejectedMessages = data;

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
          <EpmptyList
            title="No conversations found"
            subtitle={"We couldn't find any conversations."}
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-3 lg:p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 space-y-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedMessages?.map((message: IRejectedMessage) => (
              <RejectedMessageCard key={message.id} message={message} />
            ))}
          </div>

          {data && total > 9 && (
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) {
                        goToPage(page - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(pageNum);
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
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) {
                        goToPage(page + 1);
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
    <div className="bg-background relative space-y-1 rounded-3xl border p-3 transition-all">
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

      {message.moderator && (
        <div>
          <Link href={`/dashboard/profile/team/${message.moderator?.id}`}>
            <div className="gap-2 space-y-1 bg-neutral-200 p-3 transition-colors hover:bg-neutral-200/60 dark:bg-neutral-800 hover:dark:bg-neutral-800/60">
              <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <UserRound size={16} className="opacity-70" />
                <span>Moderator</span>
              </div>

              <div className="flex items-center gap-1">
                <Avatar>
                  <AvatarImage
                    src={
                      message.moderator?.avatar ? message.moderator?.avatar : ""
                    }
                    alt={message.moderator?.firstName}
                  />
                  <AvatarFallback>
                    {message.moderator?.firstName?.charAt(0)}
                    {message.moderator?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-base leading-relaxed font-semibold">
                  {message.moderator?.firstName} {message.moderator?.middleName}{" "}
                  {message.moderator?.lastName}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

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
          href={`/dashboard/history/chats/${message.conversationId}`}
          className="text-primary text-sm font-medium transition"
        >
          View Conversation →
        </Link>
      </Button>
    </div>
  );
}
