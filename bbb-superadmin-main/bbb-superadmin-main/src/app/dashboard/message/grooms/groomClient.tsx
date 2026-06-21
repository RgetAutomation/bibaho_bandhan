"use client";

import { getAllGroomsConversations } from "@/action/conversation";
import ContentNotFound from "@/components/contentNotFound";
import { useSocket } from "@/components/helper/SocketContext";
import {
  ITeamUserChatParticipant,
  ITeamUserConversations,
  ITeamUserMessage,
} from "@/components/interface/ITeamUserChat";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNotificationStore } from "@/hooks/useNotificationStore";

import { isAxiosError } from "axios";
import { Check } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function GroomClientComponent({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const { sockets, isConnected } = useSocket();
  const teamUserSocket = sockets["/teamuser"];

  const { userSAConversationIds: groomConversationIds, removeUserSAConversation: removeGroomConversation } =
    useNotificationStore();

  const [query, setQuery] = useState("");

  const [grooms, setGrooms] = useState<ITeamUserConversations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchGrooms = async () => {
      try {
        const data = await getAllGroomsConversations();
        setGrooms(data as ITeamUserConversations[]);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrooms();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return grooms;
    return grooms?.filter((groom: ITeamUserConversations) =>
      groom.user.lastName.toString().includes(query.toLowerCase())
    );
  }, [query, grooms]);

  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId || !teamUserSocket) return;

      teamUserSocket.emit("join-team-user-conversations", {
        conversationId,
      });
    },
    [teamUserSocket]
  );

  useEffect(() => {
    if (!teamUserSocket || !isConnected) return;

    if (!grooms || grooms.length === 0) return;

    for (const groom of grooms) {
      joinConversation(groom.id);
    }

    const handleNewMessage = (message: ITeamUserMessage) => {
      setGrooms((oldData) => {
        if (!oldData) return [];
        const exists = oldData.some((m) => m.lastMessage.id === message.id);
        if (exists) return oldData;
        
        return oldData.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message }
            : conv
        );
      });
    };

    teamUserSocket.on("new-team-user-message", handleNewMessage);

    return () => {
      teamUserSocket.off("new-team-user-message", handleNewMessage);
    };
  }, [teamUserSocket, isConnected, joinConversation, grooms]);

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
            Grooms Chats
          </h1>
        </div>
        <Input
          placeholder="Search groom chats..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
          {filtered.map((groom: ITeamUserConversations) => (
            <Link
              href={`/dashboard/chat/${groom.id}`}
              key={groom.id}
              onClick={() => {
                removeGroomConversation(groom.id);
              }}
            >
              <UserCardView
                user={groom.user}
                lastMessage={groom.lastMessage}
                currentUserId={currentUserId}
                showBadge={groomConversationIds.includes(groom.id)}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <ContentNotFound
            title="No Grooms Found"
            description="We could not find any grooms that you are looking for."
          />
        </div>
      )}
    </div>
  );
}

function UserCardView({
  user,
  lastMessage,
  currentUserId,
  showBadge,
}: {
  user: ITeamUserChatParticipant;
  lastMessage: ITeamUserMessage;
  currentUserId: string;
  showBadge: boolean;
}) {
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
          <h1 className="text-base font-semibold">
            {user.title} {user.lastName}
          </h1>
          {showBadge && <Badge>New</Badge>}
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
