"use client";

import { getAllBrideConversations } from "@/actions/teams";
import ContentNotFound from "@/components/contentNotFound";
import { useSocket } from "@/components/helper/system/SocketContext";
import {
  ITeamUserChatParticipant,
  ITeamUserConversations,
  ITeamUserMessage,
} from "@/components/interface/ITeamUserChat";
import { ITeamUserConversationUser } from "@/components/interface/IUserTeamConversation";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useModeratorNotificationStore } from "@/hooks/moderator/useModeratorNotificationStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Check } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function BrideMessageClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const { sockets, isConnected } = useSocket();
  const teamUserSocket = sockets["/teamuser"];

  const queryClient = useQueryClient();

  const { brideConversationIds, removeBrideConversation } =
    useModeratorNotificationStore();

  const [query, setQuery] = useState("");

  const {
    data: brides,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getAllBridesConversations"],
    queryFn: () => getAllBrideConversations(),
  });

  const filtered = useMemo(() => {
    if (!query) return brides;
    return brides?.filter((groom) =>
      groom.user.lastName.toString().includes(query.toLowerCase())
    );
  }, [query, brides]);

  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId || !teamUserSocket) return;

      teamUserSocket.emit("join-team-user-active-conversations", {
        conversationId,
      });
    },
    [teamUserSocket]
  );

  useEffect(() => {
    if (!teamUserSocket || !isConnected) return;
    console.log("Use effect pass");

    if (!brides || brides.length === 0) return;

    for (const bride of brides) {
      joinConversation(bride.id);
    }

    const handleNewMessage = (message: ITeamUserMessage) => {
      queryClient.setQueryData(
        ["getAllBridesConversations"],
        (oldData: ITeamUserConversations[] | undefined) => {
          if (!oldData) return [];

          // If message already exists, skip
          const exists = oldData.some((m) => m.lastMessage.id === message.id);
          if (exists) return oldData;

          // Map through conversations and update the one that matches
          const updatedData = oldData.map((conv) =>
            conv.id === message.conversationId
              ? { ...conv, lastMessage: message }
              : conv
          );

          return updatedData;
        }
      );
    };

    teamUserSocket.on("new-team-user-message", handleNewMessage);

    return () => {
      teamUserSocket.off("new-team-user-message", handleNewMessage);
    };
  }, [teamUserSocket, isConnected, queryClient, joinConversation, brides]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load grooms"
      : "Something went wrong";

    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center overflow-y-auto">
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Bride Chats
          </h1>
        </div>
        <Input
          placeholder="Search bride..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
          {filtered.map((bride) => (
            <Link
              href={`/dashboard/moderator/message/bride/${bride.id}`}
              key={bride.user.id}
              onClick={() => {
                removeBrideConversation(bride.id);
              }}
            >
              <UserCardView
                conversationId={bride.id}
                user={bride.user}
                currentUserId={currentUserId}
                lastMessage={bride.lastMessage}
                brideConversationIds={brideConversationIds}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <ContentNotFound
            title="No Brides Found"
            description="We could not find any brides that you are looking for."
          />
        </div>
      )}
    </div>
  );
}

function UserCardView({
  conversationId,
  user,
  lastMessage,
  currentUserId,
  brideConversationIds,
}: {
  conversationId: string;
  user: ITeamUserChatParticipant;
  lastMessage: ITeamUserMessage;
  currentUserId: string;
  brideConversationIds: string[];
}) {
  return (
    <div className="shandow-md bg-card flex w-full flex-1 rounded-xl border p-4">
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
          <h1 className="text-base font-semibold">
            {user.title} {user.lastName}
          </h1>
          {brideConversationIds.includes(conversationId) && <Badge>New</Badge>}
        </div>
        {lastMessage && (
          <div className={"flex items-center gap-2"}>
            {lastMessage.senderTeamId !== currentUserId ? (
              <div className={"bg-primary size-2 rounded-2xl"} />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <p className="text-muted-foreground text-sm">
              {lastMessage.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
