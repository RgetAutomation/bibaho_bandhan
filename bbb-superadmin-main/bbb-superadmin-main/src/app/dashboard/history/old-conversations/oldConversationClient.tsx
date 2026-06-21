"use client";

import {
  deleteConversationChatById,
  getAllOldConversation,
} from "@/action/conversation";
import ButtonLoading from "@/components/buttonLoading";
import { EpmptyList } from "@/components/emptyList";
import { IOldConversation } from "@/components/interface/IOldConversations";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isAxiosError } from "axios";
import { format, formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import Loading from "./loading";

export default function OldConversationClient({
  conversations: initialConversations,
}: {
  conversations: IOldConversation[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  //const [month, setMonth] = useState<1 | 2 | 3 | 6>(3);
  const [isPending, startTransition] = useTransition();

  const handleMonthChange = (value: string) => {
    const monthValue =
      value === "ONE_MONTH"
        ? 1
        : value === "TWO_MONTH"
          ? 2
          : value === "THREE_MONTH"
            ? 3
            : 6;
    //setMonth(monthValue);

    startTransition(async () => {
      const data = await getAllOldConversation(monthValue);
      setConversations(data);
    });
  };
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="bg-card flex w-full flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Old Conversations
          </h1>
          <Select defaultValue="THREE_MONTH" onValueChange={handleMonthChange}>
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ONE_MONTH">1 Month</SelectItem>
              <SelectItem value="TWO_MONTH">2 Month</SelectItem>
              <SelectItem value="THREE_MONTH">3 Months</SelectItem>
              <SelectItem value="SIX_MONTH">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isPending ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <Loading />
        </div>
      ) : conversations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-3">
          {conversations.map((conv) => (
            <ConversationCard key={conv.id} data={conv} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4">
          <EpmptyList
            title="No Old Conversation Found"
            subtitle="No old conversation found less than 3 months."
          />
        </div>
      )}
    </div>
  );
}

function ConversationCard({ data }: { data: IOldConversation }) {
  const [deletingConv, setDeletingConv] = useState(false);
  const router = useRouter();

  const handleDeleteConversation = async () => {
    setDeletingConv(true);
    try {
      const response = await deleteConversationChatById(data.id);
      if (response.success) {
        router.refresh();
        toast.success(response.message || "Conversation deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete conversation.");
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete conversation"
        : "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
    setDeletingConv(false);
  };

  const names = data.participants
    .map((p) => `${p.firstName} ${p.middleName || ""} ${p.lastName}`)
    .join(" & ");

  return (
    <div className="flex gap-4 rounded-xl border p-4 shadow-sm">
      <div className="flex flex-1 flex-col items-center gap-2">
        <div className="flex -space-x-4">
          {data.participants.map((p) => (
            <Avatar key={p.id} className="border-background h-12 w-12 border-2">
              <AvatarImage
                src={
                  p.avatar
                    ? p.avatar
                    : p.gender === "MALE"
                      ? "/groom.webp"
                      : "/bride.webp"
                }
                alt={p.lastName}
              />
              <AvatarFallback>{p.lastName[0]}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="py-3 text-lg font-semibold">{names}</span>
        <div className="flex w-full flex-col rounded-md border p-2 text-sm">
          <p className={"text-muted-foreground"}>Conv. ID :</p>
          <p className={"mb-1 font-semibold"}>{data.convId}</p>

          <p className={"text-muted-foreground"}>Last Message :</p>
          <p className={"mb-1 font-semibold"}>
            {format(data.lastMessage.createdAt, "dd MMM yyyy")} ({" "}
            {formatDistanceToNow(data.lastMessage.createdAt, {
              addSuffix: true,
            })}{" "}
            )
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild className="w-full" variant={"outline"}>
            <Link href={`/dashboard/history/chats/${data.id}`}>View Chats</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                variant={"destructive"}
                disabled={deletingConv}
              >
                {deletingConv ? (
                  <ButtonLoading text="" />
                ) : (
                  <>
                    <Trash2 className={"h-4 w-4"} />
                    Delete
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Do you really want to delete?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the conversation and remove data
                  from servers. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConversation}>
                  Yes, Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
