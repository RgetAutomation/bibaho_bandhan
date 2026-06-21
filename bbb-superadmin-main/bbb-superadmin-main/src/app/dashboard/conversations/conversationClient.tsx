"use client";

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
import { Input } from "@/components/ui/input";
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
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { EpmptyList } from "@/components/emptyList";
import { useRouter } from "next/navigation";
import { IPaginatedResult } from "@/components/interface/IPagenation";
import {
  IConversationAssignModerator,
  IConversationListItem,
  IConversationParticipants,
} from "@/components/interface/IConversationAssign";
import { cn, getIdPrefix } from "@/lib/utils";
import { assignConversationToModerator } from "@/action/conversation";

export default function ConversationClientComponents({
  currentUserId,
  conversations: convPagination,
  moderators,
  currentPage,
}: {
  currentUserId: string;
  conversations: IPaginatedResult<IConversationListItem[]>;
  moderators: IConversationAssignModerator[];
  currentPage: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedModerator, setSelectedModerator] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);

  const pagination = convPagination;
  const conversations = convPagination?.data;

  const filtered = useMemo(() => {
    if (!query) return conversations;

    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return conversations?.filter((conv) =>
      conv.participants.some((p) =>
        words.every(
          (word) =>
            p.lastName?.toLowerCase().includes(word) ||
            p.title?.toLowerCase().includes(word)
        )
      )
    );
  }, [query, conversations]);

  // Checkbox toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select / Deselect helpers
  const selectAll = () => setSelectedIds(filtered?.map((c) => c.id) ?? []);
  const deselectAll = () => setSelectedIds([]);
  const selectFirstN = (n: number) =>
    setSelectedIds(filtered?.slice(0, n).map((c) => c.id) ?? []);

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
    try {
      const response = await assignConversationToModerator(
        currentUserId,
        selectedIds,
        selectedModerator
      );
      if (response.success) {
        toast.success(response.message);
        setSelectedIds([]);
        goToPage(1); // refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to assign conversations");
    } finally {
      setAssignLoading(false);
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

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
          <EpmptyList
            title="No conversations found"
            subtitle={"We couldn't find any conversations."}
          />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <EpmptyList
            title="No conversations found"
            subtitle={
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
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        goToPage(currentPage - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.totalPages) {
                        goToPage(currentPage + 1);
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
                    {moderators?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex cursor-pointer items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={team.avatar ? team.avatar : "/bride.webp"}
                              alt={team.firstName}
                            />
                            <AvatarFallback>{team.firstName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {team.firstName} {team.middleName} {team.lastName}
                            </span>
                            <span className="text-xs font-light">
                              {getIdPrefix(team.internalId, "MODERATOR")}
                            </span>
                          </div>
                        </div>
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
  participants: IConversationParticipants[];
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
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-base font-semibold">
            {participants[0].title} {participants[0].firstName}{" "}
            {participants[0].middleName && `${participants[0].middleName} `}
            {participants[0].lastName}
          </span>

          <Heart className="text-primary h-4 w-4" />

          <span className="text-base font-semibold">
            {participants[1].title} {participants[1].firstName}{" "}
            {participants[1].middleName && `${participants[1].middleName} `}
            {participants[1].lastName}
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
            <Link href={`/dashboard/history/chats/${id}`}>View Chats</Link>
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
