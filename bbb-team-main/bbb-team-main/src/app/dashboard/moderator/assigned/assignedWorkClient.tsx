"use client";

import { getAllAssignedWork } from "@/actions/teams";
import ApiErrorPage from "@/components/apiErrorPage";
import ContentNotFound from "@/components/contentNotFound";
import { IAssignedWorkParticipant } from "@/components/interface/moderator/IAssignedWork";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import toast from "react-hot-toast";

export default function AssignedWorkClient() {
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllAssignedWork"],
    queryFn: () => getAllAssignedWork(),
  });

  const filtered = useMemo(() => {
    if (!query) return data;
    return data?.filter((report) =>
      report.convId.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, data]);

  if (isLoading) {
    return (
      <div className={"flex flex-1 flex-col"}>
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load assigned work"
      : "Something went wrong. Please try again.";
    return (
      <div className={"flex flex-1 flex-col"}>
        <ApiErrorPage
          title={"Faiild to load works"}
          description={errorMessage}
        />
      </div>
    );
  }

  return (
    <div className={"flex flex-1 flex-col"}>
      <div className="bg-card flex w-full flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col gap-4 md:flex-row">
          <h1 className="w-full text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Assigned Work ({data?.length || 0})
          </h1>
          <Input
            placeholder="Search by Conversation ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-72"
          />
        </div>
      </div>
      {filtered && filtered?.length > 0 ? (
        <div
          className={
            "grid grid-cols-1 gap-2 p-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-4"
          }
        >
          {filtered?.map((work) => (
            <ConversationCard
              key={work.id}
              id={work.id}
              convId={work.convId}
              participants={work.participants}
            />
          ))}
        </div>
      ) : (
        <div className={"flex flex-1 flex-col items-center justify-center"}>
          <ContentNotFound
            title={"No assigned work"}
            description={"You don't have any assigned work"}
          />
        </div>
      )}
    </div>
  );
}

function ConversationCard({
  id,
  convId,
  participants,
}: {
  id: string;
  convId: string;
  participants: IAssignedWorkParticipant[];
}) {
  const handleMarkAsMatch = async () => {
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/app/moderator/users/conversation/matching",
        {
          conversationId: id,
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to get conversation"
        : "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="group flex rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900">
      <div className="flex flex-1 flex-col items-center gap-4">
        {/* Avatars */}
        <div className="flex -space-x-4 pt-1">
          {participants.map((p) => (
            <Avatar
              key={p.id}
              className="border-background h-12 w-12 border-2 shadow-sm"
            >
              <AvatarImage
                src={p.gender === "MALE" ? "/groom.webp" : "/bride.webp"}
                alt={p.lastName}
              />
              <AvatarFallback>{p.lastName[0]}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Names */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            Conversation Between
          </p>
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span>{`${participants[0]?.title} ${participants[0]?.lastName}`}</span>
            <span className="text-primary">&amp;</span>
            <span>{`${participants[1]?.title} ${participants[1]?.lastName}`}</span>
          </div>

          <div className="mt-1 h-px w-4/5 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
        </div>

        {/* Conversation ID */}
        <p className="text-sm">
          <span className="text-muted-foreground">Conversation ID:</span>{" "}
          <span className="font-medium">{convId}</span>
        </p>

        {/* Actions */}
        <div className="mt-2 grid w-full grid-cols-2 gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="rounded-full font-medium">
                Mark as Match
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Match</AlertDialogTitle>
                <AlertDialogDescription>
                  This will officially mark this conversation as a match. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMarkAsMatch}>
                  Yes, Mark Match
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            asChild
            variant="outline"
            className="rounded-full font-medium"
          >
            <Link href={`/dashboard/history/${id}/chat`}>View Chats</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
