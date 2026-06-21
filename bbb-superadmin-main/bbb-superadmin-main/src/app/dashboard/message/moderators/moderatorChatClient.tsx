"use client";

import ButtonLoading from "@/components/buttonLoading";
import { EpmptyList } from "@/components/emptyList";
import { ITeamsForChat } from "@/components/interface/ITeam";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AxiosResponse } from "@/components/utils/AxiosResponse";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function ModeratorChatClient({
  moderators,
}: {
  moderators: ITeamsForChat[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loadingConversation, setLoadingConversation] = useState<
    string | null
  >();
  const { moderatorConversationIds, removeModeratorConversation } =
    useNotificationStore();

  const filtered = useMemo(() => {
    if (!query) return moderators;
    return moderators.filter((moderator) =>
      (
        moderator.firstName +
        " " +
        moderator.middleName +
        " " +
        moderator.lastName
      )
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, moderators]);

  const handleGetConversationId = async (
    userId: string,
    conversationId: string
  ) => {
    if (
      conversationId &&
      conversationId !== null &&
      conversationId !== "" &&
      conversationId !== undefined
    ) {
      router.push(`/dashboard/message/chat/${conversationId}`);
    } else {
      try {
        setLoadingConversation(userId);
        const response = await axios.get<AxiosResponse<string>>(
          `/api/conversation/${userId}`
        );

        if (response.data.success) {
          router.push(`/dashboard/message/chat/${response.data.data}`);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const errorMessage = isAxiosError(error)
          ? error.response?.data?.message || "Failed to get conversation"
          : "Something went wrong. Please try again.";
        toast.error(errorMessage);
        setLoadingConversation(null);
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6 lg:p-8">
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
          Moderator Users
        </h1>
        <Input
          placeholder="Search moderator..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
          {filtered.map((moderator) =>
            loadingConversation === moderator.id ? (
              <div
                key={moderator.id}
                className={
                  "bg-card flex w-full flex-1 flex-col items-center justify-center rounded-2xl border p-6 shadow-md"
                }
              >
                <ButtonLoading text="Please wait" />
              </div>
            ) : (
              <div
                className={"cursor-pointer"}
                onClick={() => {
                  removeModeratorConversation(moderator.conversationId);
                  handleGetConversationId(
                    moderator.id,
                    moderator.conversationId
                  );
                }}
                key={moderator.id}
              >
                <TeamCard
                  moderator={moderator}
                  addBadge={moderatorConversationIds.includes(
                    moderator.conversationId
                  )}
                />
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <EpmptyList
            title="No Moderator Found"
            subtitle="We could not find any moderator that you are looking for."
          />
        </div>
      )}
    </div>
  );
}

function TeamCard({
  moderator,
  addBadge,
}: {
  moderator: ITeamsForChat;
  addBadge: boolean;
}) {
  return (
    <div
      className={
        "bg-card flex items-center gap-4 rounded-2xl border p-3 shadow-md"
      }
    >
      <Avatar className={"size-10"}>
        <AvatarImage
          src={
            moderator.avatar
              ? moderator.avatar
              : moderator.gender === "MALE"
                ? "/groom.webp"
                : "/bride.webp"
          }
        />
        <AvatarFallback>{moderator.firstName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={"flex w-full flex-col"}>
        <div className="flex w-full items-center justify-between">
          <h1 className={"text-lg font-semibold"}>
            {moderator.firstName} {moderator.middleName} {moderator.lastName}
          </h1>
          {addBadge && <Badge>New Message</Badge>}
        </div>
        <p className={"text-muted-foreground text-sm"}>
          Gender: {moderator.gender}
        </p>
        {/* <div
                className={"text-muted-foreground flex items-center gap-1 text-sm"}
              >
                {admin.lastMessage?.senderTeamId === currentUserId ? (
                  <Check className="size-4" />
                ) : (
                  <div className="bg-primary size-2 rounded-2xl" />
                )}
                {admin.lastMessage?.content}
              </div> */}
      </div>
    </div>
  );
}
