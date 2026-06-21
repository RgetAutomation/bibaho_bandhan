"use client";

import { getAllConversationByGroomForChat } from "@/actions/ghotok";
import ApiErrorPage from "@/components/apiErrorPage";
import ContentNotFound from "@/components/contentNotFound";
import { IGhotokUserConversationParticipant } from "@/components/interface/ghotok/IUsersForChat";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useGhotokNotificationStore } from "@/hooks/ghotok/useGhotokNotificationStore";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import React, { useState } from "react";

export default function GroomAllConversationClient({
  groomId,
}: {
  groomId: string;
}) {
  const { groomConversationIds, removeGroomConversation } =
    useGhotokNotificationStore();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllConversationByGroomForChat", groomId],
    queryFn: () => getAllConversationByGroomForChat(groomId, page, limit),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className={"flex w-full flex-1 items-center justify-center"}>
        <LoadingPage />
      </div>
    );
  }
  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load grooms"
      : "Something went wrong. Please try again later.";
    return (
      <div className={"flex w-full flex-1 items-center justify-center"}>
        <ApiErrorPage
          title={"Failed to load grooms"}
          description={errorMessage}
        />
      </div>
    );
  }

  const brides = data?.data;
  const pagination = data;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Select Bride
          </h1>
        </div>
      </div>

      {brides && brides.length > 0 ? (
        <div
          className={"flex w-full flex-1 flex-col items-center justify-between"}
        >
          <div className="grid w-full grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
            {brides.map((bride) => (
              <Link
                href={`/dashboard/ghotok/chats/${bride.id}`}
                key={bride.id}
                onClick={() => removeGroomConversation(bride.id)}
              >
                <UserCardView
                  key={bride.id}
                  user={bride.participants}
                  showBadge={groomConversationIds
                    .flatMap((item) => item.conversationId)
                    .includes(bride.id)}
                />
              </Link>
            ))}
          </div>

          {pagination && (
            <Pagination className="my-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage > 1) {
                        setPage((prev) => prev - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pagination.currentPage === i + 1}
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
                      if (pagination.currentPage < pagination.totalPages) {
                        setPage((prev) => prev + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <ContentNotFound
            title="No Groom Found"
            description="We could not find any groom that you are looking for."
          />
        </div>
      )}
    </div>
  );
}

function UserCardView({
  user,
  showBadge,
}: {
  user: IGhotokUserConversationParticipant;
  showBadge: boolean;
}) {
  const fullName = [user.title, user.lastName].filter(Boolean).join(" ");

  return (
    <div className="shandow-md bg-card flex flex-1 rounded-xl border p-4">
      <Avatar className="size-12">
        <AvatarImage
          src={
            user.avatar
              ? user.avatar
              : user.gender === "MALE"
                ? "/groom.webp"
                : "/bride.webp"
          }
          alt={user.id}
        />
        <AvatarFallback>{user.gender.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="ml-4 w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">{fullName}</h1>
          {showBadge && <Badge>New</Badge>}
        </div>
        <p className="text-muted-foreground text-sm">ID : {user.publicId}</p>
      </div>
    </div>
  );
}
