"use client";

import { getAllConversations, getAllModerators } from "@/actions/admin";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { IUserParticipant } from "@/components/interface/IUserConversation";
import { Input } from "@/components/ui/input";
import { isAxiosError } from "axios";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import ContentNotFound from "@/components/contentNotFound";
import { Checkbox } from "@/components/ui/checkbox";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ConversationClientComponents() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedModerator, setSelectedModerator] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);

  const {
    data,
    isLoading: conversationLoading,
    error: conversationError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["getAllGroomsConversations", page],
    queryFn: () => getAllConversations(page, limit),
    placeholderData: keepPreviousData,
  });

  const {
    data: moderator,
    isLoading: moderatorLoading,
    error: moderatorError,
  } = useQuery({
    queryKey: ["getAllModerators"],
    queryFn: () => getAllModerators(),
    placeholderData: keepPreviousData,
  });

  const conversations = data?.data;
  const pagination = data;

  const filtered = useMemo(() => {
    if (!query) return conversations;
    return conversations?.filter(
      (conv) =>
        conv.participants[0].lastName
          .toString()
          .includes(query.toLowerCase()) ||
        conv.participants[1].title.toString().includes(query.toLowerCase())
    );
  }, [query, conversations]);

  // Checkbox toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select / Deselect helpers
  const selectAll = () => setSelectedIds(filtered!.map((c) => c.id));
  const deselectAll = () => setSelectedIds([]);
  const selectFirstN = (n: number) =>
    setSelectedIds(filtered!.slice(0, n).map((c) => c.id));

  // Assign action
  const handleAssign = async () => {
    if (selectedIds === undefined || selectedIds.length === 0) {
      toast.error("Please select at least one conversation to assign.");
      return;
    }

    if (selectedModerator === "") {
      toast.error("Please select a moderator to assign.");
      return;
    }

    setAssignLoading(true);

    const data = {
      conversationIds: selectedIds,
      moderatorId: selectedModerator,
    };
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/app/admin/users/conversation/assign",
        data
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedIds([]);
        refetchConversations();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to assign moderator"
        : "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setAssignLoading(false);
    }
  };

  if (conversationLoading || moderatorLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (conversationError || moderatorError) {
    const errorMessage = isAxiosError(conversationError)
      ? conversationError.response?.data?.message ||
        "Failed to get conversations"
      : "Something went wrong. Please try again.";

    const errorMessageModerator = isAxiosError(moderatorError)
      ? moderatorError.response?.data?.message || "Failed to get conversations"
      : "Something went wrong. Please try again.";

    return (
      <div>
        <ApiErrorPage
          title="Failed to load data"
          description={errorMessage || errorMessageModerator}
        />
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-1 flex-col">
      <div className="bg-card flex w-full flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Conversations ({filtered?.length || 0})
          </h1>
        </div>
        <Input
          placeholder="Search conversations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {conversations?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ContentNotFound
            title="No conversations found"
            description={"We couldn't find any conversations."}
          />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ContentNotFound
            title="No conversations found"
            description={
              "We couldn't find any conversations that match your search."
            }
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 space-y-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((conv) => (
              <ConversationCard
                key={conv.id}
                id={conv.id}
                convId={conv.convId}
                participants={conv.participants}
                isChecked={selectedIds.includes(conv.id)}
                onCheck={toggleSelect}
              />
            ))}
          </div>

          {pagination && selectedIds.length === 0 && (
            <Pagination>
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

          {/* Bottom Action Menu */}
          {selectedIds.length > 0 && (
            <div className="bg-card bottom-4 mt-5 flex w-full max-w-2xl flex-col items-center justify-between gap-2 rounded-xl border p-4 shadow-lg md:gap-4 lg:flex-row">
              <div className="flex gap-2">
                <ButtonGroup>
                  <Button variant={"outline"} onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant={"outline"} onClick={deselectAll}>
                    Deselect All
                  </Button>
                  <Button variant={"outline"} onClick={() => selectFirstN(5)}>
                    Select First 5
                  </Button>
                </ButtonGroup>
              </div>
              <div className="flex w-full items-center gap-2 lg:w-fit">
                <Select
                  value={selectedModerator}
                  onValueChange={setSelectedModerator}
                >
                  <SelectTrigger className="w-full rounded-md border p-2 lg:w-fit">
                    <SelectValue placeholder="Select Moderator" />
                  </SelectTrigger>
                  <SelectContent>
                    {moderator?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.internalId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssign} disabled={assignLoading}>
                  {assignLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Assign"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConversationCard({
  id,
  convId,
  participants,
  isChecked,
  onCheck,
}: {
  id: string;
  convId: string;
  participants: IUserParticipant[];
  isChecked: boolean;
  onCheck: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group bg-card relative rounded-2xl border p-5 shadow-sm transition-all",
        "hover:shadow-md",
        isChecked && "border-primary ring-primary/30 ring-1"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isChecked}
        onCheckedChange={() => onCheck(id)}
        className="absolute top-4 right-4"
      />

      <div className="flex flex-col items-center gap-4">
        {/* Avatars */}
        <div className="flex -space-x-5">
          {participants.map((p) => (
            <Avatar
              key={p.id}
              className="border-background h-14 w-14 border-2 shadow-sm"
            >
              <AvatarImage
                src={
                  p.avatar
                    ? p.avatar
                    : p.gender === "MALE"
                      ? "/groom.webp"
                      : "/bride.webp"
                }
                alt={p.lastName ?? ""}
              />
              <AvatarFallback>{p.lastName?.[0] ?? ""}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Names */}
        <div className="grid w-full grid-cols-7 items-center gap-1 text-center">
          <span className="col-span-3 flex justify-end text-base font-semibold">
            {participants[0].title} {participants[0].lastName}
          </span>

          <span className="flex w-full items-center justify-center">
            <Heart className="text-primary h-4 w-4" />
          </span>

          <span className="col-span-3 flex justify-start text-base font-semibold">
            {participants[1].title} {participants[1].lastName}
          </span>
        </div>

        {/* Meta */}
        <span className="bg-muted text-muted-foreground rounded-md px-3 py-1 text-xs">
          Conversation ID: <span className="font-medium">{convId}</span>
        </span>

        {/* Actions */}
        <div className="grid w-full grid-cols-2 gap-3 pt-2">
          <Button
            asChild
            variant="outline"
            className="rounded-full font-medium"
          >
            <Link href={`/dashboard/history/${id}/chat`}>View Chats</Link>
          </Button>

          <Button
            onClick={() => onCheck(id)}
            className="rounded-full font-medium"
            variant={isChecked ? "secondary" : "default"}
          >
            {isChecked ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
}
