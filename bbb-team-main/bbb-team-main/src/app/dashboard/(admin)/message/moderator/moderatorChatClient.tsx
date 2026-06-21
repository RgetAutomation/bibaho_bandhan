"use client";

import { getAllModerators } from "@/actions/admin";
import ButtonLoading from "@/components/buttonLoading";
import ContentNotFound from "@/components/contentNotFound";
import LoadingPage from "@/components/loader";
import { AdminModeratorCardView } from "@/components/moderatorCardView";
import { Input } from "@/components/ui/input";
import { useModeratorNotificationStore } from "@/hooks/moderator/useModeratorNotificationStore";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function ModeratorChatClientPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<string | null>();
  const { removeAdminModeratorConversation } = useModeratorNotificationStore();

  const {
    data: moderators,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getAllModerators"],
    queryFn: () => getAllModerators(),
  });

  const filtered = useMemo(() => {
    if (!query) return moderators;
    return moderators?.filter((moderator) =>
      moderator.internalId.toString().includes(query.toLowerCase())
    );
  }, [query, moderators]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load chats"
      : "Something went wrong";

    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center overflow-y-auto">
        <p>{errorMessage}</p>
      </div>
    );
  }

  const handleConversationID = async (
    teamId: string,
    conversationId: string
  ) => {
    if (
      conversationId &&
      conversationId !== null &&
      conversationId !== undefined
    ) {
      router.push(`/dashboard/message/moderator/${conversationId}`);
    } else {
      try {
        setLoading(teamId);
        const response = await api.get<AxiosResponse<string>>(
          `/conversations/admin/moderator/conversation/${teamId}`
        );
        router.push(`/dashboard/message/moderator/${response.data.data}`);
      } catch (error) {
        const errorMessage = isAxiosError(error)
          ? error.response?.data?.message || "Failed to get conversation"
          : "Something went wrong. Please try again.";
        toast.error(errorMessage);
        setLoading(null);
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Team Member
          </h1>
        </div>
        <Input
          placeholder="Search moderator..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
          {filtered.map((moderator) =>
            loading === moderator.id ? (
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
                onClick={() => {
                  removeAdminModeratorConversation(moderator.conversationId);
                  handleConversationID(moderator.id, moderator.conversationId);
                }}
                key={moderator.id}
                className="cursor-pointer"
              >
                <AdminModeratorCardView team={moderator} onlyLoad={true} />
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <ContentNotFound
            title="No Moderators Found"
            description="We could not find any moderators that you are looking for."
          />
        </div>
      )}
    </div>
  );
}
