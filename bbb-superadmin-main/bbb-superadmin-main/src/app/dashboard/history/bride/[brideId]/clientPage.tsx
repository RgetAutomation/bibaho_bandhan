"use client";

import { EpmptyList } from "@/components/emptyList";
import { UserGender } from "@/components/enum/userGender";
import {
  IConversationOnly,
  IConversationUser,
} from "@/components/interface/IConversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function BrideChatHistoryClientPage({
  conversations,
}: {
  conversations: IConversationOnly[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return conversations;
    return conversations.filter(
      (conversation) =>
        conversation.participant.firstName
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        conversation.participant.lastName
          ?.toLowerCase()
          .includes(query.toLowerCase())
    );
  }, [query, conversations]);

  return (
    <div className="mx-auto flex w-full flex-1 flex-col">
      {/* Left: Title + Search */}
      <div className="bg-card flex w-full flex-col justify-between gap-4 border p-4 md:flex-row md:items-center md:p-6">
        <div className="flex items-center gap-4">
          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Select Participant
          </h1>
        </div>
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((conv) => {
            return (
              <Link key={conv.id} href={`/dashboard/history/chats/${conv.id}`}>
                <UserCardView
                  user={conv.participant}
                  assignedModerator={!!conv.assignedModerator}
                />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EpmptyList
            title="No User Found"
            subtitle="We could not find any user that matches your search."
          />
        </div>
      )}
    </div>
  );
}

function UserCardView({
  user,
  assignedModerator,
}: {
  user: IConversationUser;
  assignedModerator: boolean;
}) {
  if (!user) return null;

  return (
    <div className="bg-card flex w-full cursor-pointer items-center gap-4 rounded-xl p-4 shadow transition-shadow hover:border hover:shadow-lg">
      <Avatar className="ring-primary h-16 w-16 ring">
        <AvatarImage
          src={
            user.avatar
              ? user.avatar
              : user.gender === UserGender.MALE
                ? "/groom.webp"
                : "/bride.webp"
          }
          alt={user.firstName}
        />
        <AvatarFallback>
          {user.firstName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <h3 className="text-lg font-medium">
          {user.firstName} {user.middleName} {user.lastName}
        </h3>
        <p className="text-sm">Gender: {user.gender}</p>
        {assignedModerator && (
          <p className="text-sm font-semibold text-indigo-600">
            Moderator Assigned
          </p>
        )}
      </div>
    </div>
  );
}
