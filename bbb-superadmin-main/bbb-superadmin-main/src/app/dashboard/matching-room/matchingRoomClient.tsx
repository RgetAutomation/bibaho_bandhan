"use client";

import { getIdPrefix } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getOrCreateUserSAConversationForSA } from "@/action/users";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { UserGender } from "@/components/enum/userGender";
import { IMatchingRoom } from "@/components/interface/IMatchingRoom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { Hash, Heart, MessageCircle, MessageCircleMore } from "lucide-react";
import Link from "next/link";
import ButtonLoading from "@/components/buttonLoading";

export default function ConversationCard({ data }: { data: IMatchingRoom }) {
  const router = useRouter();
  const [loadingConversation, setLoadingConversation] = useState<
    string | null
  >();
  const maleUser = data.conversation.participants.find(
    (user) => user.gender === UserGender.MALE
  );
  const femaleUser = data.conversation.participants.find(
    (user) => user.gender === UserGender.FEMALE
  );

  const handleGetConversationId = async (
    userId: string,
    femaleUserId: string
  ) => {
    //await navigator.clipboard.writeText(femaleUserId);

    try {
      setLoadingConversation(userId);
      const response = await getOrCreateUserSAConversationForSA(userId);

      if (response?.success) {
        router.push(
          `/dashboard/message/matching/${response?.conversationId}?bid=${femaleUserId}&rid=${data.id}`
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
  };

  return (
    <Card className="w-full max-w-md rounded-2xl pt-0 shadow-md transition hover:shadow-lg">
      <Link href={`/dashboard/profile/team/${data.moderator.id}`}>
        <CardHeader className="hover:bg-primary/10 border-b pt-6 transition-all duration-200 ease-in-out hover:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={data.moderator.avatar ?? ""} />
              <AvatarFallback>
                {data.moderator.firstName[0]}
                {data.moderator.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex w-full items-start justify-between gap-4">
              <div>
                <p className="text-lg leading-tight font-semibold">
                  {data.moderator.firstName} {data.moderator.middleName}{" "}
                  {data.moderator.lastName}
                </p>

                <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
                  <Hash size={14} />
                  {getIdPrefix(data.moderator.internalId ?? 0, "MODERATOR")}
                </p>
              </div>

              <Badge
                className={`self-start rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  data.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : data.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                } `}
              >
                {data.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="flex flex-col">
        {/* Conversation Users */}
        <div className="relative flex flex-col items-center justify-between space-y-4 p-1">
          {/* A User */}
          <Link
            href={`/dashboard/profile/user/${femaleUser?.id}`}
            className="w-full"
          >
            <div className="bg-card hover:bg-primary/10 flex w-full items-center gap-3 rounded-2xl border p-3 shadow-md transition-all duration-200 ease-in-out hover:rounded-2xl">
              <Avatar className={"h-10 w-10 ring-2 ring-rose-500"}>
                <AvatarImage src={femaleUser?.avatar ?? ""} />
                <AvatarFallback>
                  {femaleUser?.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium">
                    {femaleUser?.firstName} {femaleUser?.middleName}{" "}
                    {femaleUser?.lastName}
                  </p>
                  {femaleUser?.isGhotokOwned && (
                    <Badge className={"rounded-full"}>Ghotok</Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-0.5 truncate text-sm">
                  <Hash size={14} /> {femaleUser?.publicId}
                </p>
              </div>
            </div>
          </Link>

          <span className="text-muted-foreground absolute top-1/2 left-1/2 -translate-1/2">
            <Heart className="h-6 w-6 rounded-full bg-red-500 p-1 text-white" />
          </span>

          {/* B User */}
          <Link
            href={`/dashboard/profile/user/${maleUser?.id}`}
            className="w-full"
          >
            <div className="bg-card hover:bg-primary/10 flex w-full items-center gap-3 rounded-2xl border p-3 shadow-md transition-all duration-200 ease-in-out hover:rounded-2xl">
              <Avatar className={"h-10 w-10 ring-2 ring-blue-500"}>
                <AvatarImage src={maleUser?.avatar ?? ""} />
                <AvatarFallback>
                  {maleUser?.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium">
                    {maleUser?.firstName} {maleUser?.middleName}{" "}
                    {maleUser?.lastName}
                  </p>
                  {maleUser?.isGhotokOwned && (
                    <Badge className={"rounded-full"}>Ghotok</Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-0.5 truncate text-sm">
                  <Hash size={14} /> {maleUser?.publicId}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Message Preview */}
        <div className="bg-muted/60 mt-5 space-y-2 rounded-2xl border p-5">
          <p className="text-muted-foreground text-sm leading-relaxed italic">
            {data.message ?? (
              <>
                No message added by{" "}
                <span className="text-foreground font-medium not-italic">
                  {data.moderator.firstName} {data.moderator.lastName}
                </span>
              </>
            )}
          </p>

          <div className="flex justify-start">
            <p className="text-muted-foreground text-xs">
              {format(new Date(data?.createdAt), "dd/MM/yyyy")} (
              {formatDistanceToNow(new Date(data.createdAt), {
                addSuffix: true,
              })}
              )
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1">
          <Button className="rounded-full" variant={"outline"} asChild>
            <Link href={`/dashboard/history/chats/${data.conversation.id}`}>
              <MessageCircleMore className="h-5 w-5" />
              <span>View Chats</span>
            </Link>
          </Button>
          <Button
            className="rounded-full"
            onClick={() =>
              handleGetConversationId(maleUser?.id ?? "", femaleUser?.id ?? "")
            }
            disabled={loadingConversation === maleUser?.id}
          >
            {loadingConversation ? (
              <ButtonLoading text="Loading" />
            ) : (
              <>
                <MessageCircle size={20} />
                <span>Chat Groom</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
