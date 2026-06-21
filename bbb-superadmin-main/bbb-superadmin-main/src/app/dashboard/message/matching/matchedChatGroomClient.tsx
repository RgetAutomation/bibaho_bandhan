"use client";

import { getOrCreateUserSAConversationForSA } from "@/action/users";
import ButtonLoading from "@/components/buttonLoading";
import { EpmptyList } from "@/components/emptyList";
import { IGroomForChat } from "@/components/interface/IUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { isAxiosError } from "axios";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function MatchedChatGroomClient({
  currentUserId,
  grooms,
}: {
  currentUserId: string;
  grooms: IGroomForChat[];
}) {
  const router = useRouter();
  const { userSAConversationIds, removeUserSAConversation } =
    useNotificationStore();
  const [loadingConversation, setLoadingConversation] = useState<
    string | null
  >();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return grooms;
    return grooms.filter((groom) =>
      (groom.firstName + " " + groom.middleName + " " + groom.lastName)
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, grooms]);

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
      router.push(`/dashboard/message/matching/${conversationId}`);
    } else {
      try {
        setLoadingConversation(userId);
        const response = await getOrCreateUserSAConversationForSA(userId);

        if (response?.success) {
          router.push(
            `/dashboard/message/matching/${response?.conversationId}`
          );
        } else {
          toast.error(response?.message || "Failed to get conversation");
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
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
          Matched Grooms
        </h1>
        <Input
          placeholder="Search groom..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
          {filtered.map((groom) =>
            loadingConversation === groom.id ? (
              <div
                key={groom.id}
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
                  removeUserSAConversation(groom.conversationId);
                  handleGetConversationId(groom.id, groom.conversationId);
                }}
                key={groom.id}
              >
                <GroomCard
                  groom={groom}
                  addBadge={userSAConversationIds.includes(
                    groom.conversationId
                  )}
                  currentUserId={currentUserId}
                />
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <EpmptyList
            title="No Groom Found"
            subtitle="We could not find any groom that you are looking for."
          />
        </div>
      )}
    </div>
  );
}

function GroomCard({
  groom,
  addBadge,
  currentUserId,
}: {
  groom: IGroomForChat;
  addBadge: boolean;
  currentUserId: string;
}) {
  return (
    <div
      className={`${groom.isGhotokOwned ? "bg-primary/10 border-primary/30" : "bg-card border"} flex items-center gap-4 rounded-2xl border p-3 shadow-md`}
    >
      <Avatar className={"size-10"}>
        <AvatarImage
          src={
            groom.avatar
              ? groom.avatar
              : groom.gender === "MALE"
                ? "/groom.webp"
                : "/bride.webp"
          }
        />
        <AvatarFallback>{groom.firstName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={"flex w-full flex-col"}>
        <div className="flex w-full items-center justify-between">
          <h1 className={"text-lg font-semibold"}>
            {groom.firstName} {groom.middleName} {groom.lastName}
          </h1>
          {addBadge && <Badge>New Message</Badge>}
        </div>
        <p className={"text-muted-foreground flex items-center gap-1 text-sm"}>
          <Hash className="size-4" /> {groom.publicId}{" "}
          {groom.isGhotokOwned && (
            <Badge
              variant={"outline"}
              className="border-primary text-primary rounded-full"
            >
              Ghotok
            </Badge>
          )}
        </p>
        {/* {groom.lastMessage?.content ? (
          <div
            className={"text-muted-foreground flex items-center gap-1 text-sm"}
          >
            {groom.lastMessage?.senderId === currentUserId ? (
              <Check className="size-4" />
            ) : (
              <div className="bg-primary size-2 rounded-2xl" />
            )}
            {groom.lastMessage?.type === "TEXT" && groom.lastMessage?.content}
            {groom.lastMessage?.type === "PROFILE" && (
              <Badge className="rounded-full" variant={"outline"}>
                Profile
              </Badge>
            )}
            {groom.lastMessage?.type === "PAYMENT" && (
              <Badge className="rounded-full" variant={"outline"}>
                Payment
              </Badge>
            )}
          </div>
        ) : (
          <p className={"text-muted-foreground text-sm"}>No message yet</p>
        )} */}
      </div>
    </div>
  );
}
