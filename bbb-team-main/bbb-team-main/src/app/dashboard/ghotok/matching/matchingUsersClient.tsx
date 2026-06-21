"use client";

import { getAllMatchingUserForGhotok } from "@/actions/ghotok";
import ApiErrorPage from "@/components/apiErrorPage";
import ButtonLoading from "@/components/buttonLoading";
import ContentNotFound from "@/components/contentNotFound";
import {
  IGhotokSaConversationsUser,
  IGhotokSaMessage,
} from "@/components/interface/ghotok/IGhotokSaChat";
import LoadingPage from "@/components/loader";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { useGhotokNotificationStore } from "@/hooks/ghotok/useGhotokNotificationStore";
import { GHOTOK_MENU_CHAT_MATCH_GROOM_TITLE } from "@/components/helper/constant";

export default function MatchingUsersClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const router = useRouter();
  const { matchingConversationIds, removeMatchingUserConversation } =
    useGhotokNotificationStore();
  const [loadingConversation, setLoadingConversation] = useState<
    string | null
  >();
  const [query, setQuery] = useState("");

  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getAllMatchingUserForGhotok"],
    queryFn: () => getAllMatchingUserForGhotok(),
  });

  const filtered = useMemo(() => {
    if (!query) return conversations;
    return conversations?.filter((conv) =>
      (
        conv.user.firstName +
        " " +
        conv.user.middleName +
        " " +
        conv.user.lastName
      )
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, conversations]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load reported grooms"
      : "Something went wrong. Please try again later.";
    return (
      <ApiErrorPage
        title="Failed to load matching users"
        description={errorMessage}
      />
    );
  }

  const handleGetConversationId = async (conversationId: string) => {
    if (!conversationId) {
      toast.error("No conversation found");
      return;
    }
    router.push(`/dashboard/ghotok/matching/${conversationId}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
          {GHOTOK_MENU_CHAT_MATCH_GROOM_TITLE}
        </h1>
        <Input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
          {filtered.map((conv) => (
            <div
              className={"cursor-pointer"}
              onClick={() => {
                removeMatchingUserConversation(conv.id);
                handleGetConversationId(conv.id);
              }}
              key={conv.id}
            >
              <UserCard
                addBadge={matchingConversationIds.includes(conv.id)}
                currentUserId={currentUserId}
                user={conv.user}
                message={conv.messages[0]}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <ContentNotFound
            title="No User Found"
            description="We could not find any user that you are looking for."
          />
        </div>
      )}
    </div>
  );
}

function UserCard({
  addBadge,
  currentUserId,
  user,
  message,
}: {
  addBadge: boolean;
  currentUserId: string;
  user: IGhotokSaConversationsUser;
  message: IGhotokSaMessage;
}) {
  return (
    <div
      className={`bg-card flex items-center gap-4 rounded-2xl border p-3 shadow-md`}
    >
      <Avatar className={"size-10"}>
        <AvatarImage
          src={
            user.avatar
              ? user.avatar
              : user.gender === "MALE"
                ? "/groom.webp"
                : "/bride.webp"
          }
        />
        <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={"flex w-full flex-col"}>
        <div className="flex w-full items-center justify-between">
          <h1 className={"text-lg font-semibold"}>
            {user.firstName} {user.middleName} {user.lastName}
          </h1>
          {addBadge && <Badge>New Message</Badge>}
        </div>
        <p className={"text-muted-foreground flex items-center gap-1 text-sm"}>
          <Hash className="size-4" /> {user.publicId}
        </p>
        {/* {message?.content ? (
          <div
            className={"text-muted-foreground flex items-center gap-1 text-sm"}
          >
            {message.senderId === currentUserId ? (
              <Check className="size-4" />
            ) : (
              <div className="bg-primary size-2 rounded-2xl" />
            )}
            {message?.type === "TEXT" && message?.content}
            {message?.type === "PROFILE" && (
              <Badge className="rounded-full" variant={"outline"}>
                Profile
              </Badge>
            )}
            {message?.type === "PAYMENT" && (
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
