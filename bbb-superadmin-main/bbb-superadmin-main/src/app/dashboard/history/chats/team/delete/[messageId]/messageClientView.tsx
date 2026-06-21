"use client";

import {
  deleteTeamUserMessageData,
  ITeamUserSingleMessage,
} from "@/action/conversation";
import ButtonLoading from "@/components/buttonLoading";
import {
  MessageDeliveredIcon,
  MessageReadIcon,
  MessageSendIcon,
} from "@/components/resource/image/icons/message-status";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

export default function MessageClientView({
  message,
}: {
  message: ITeamUserSingleMessage | null;
}) {
  const [deleteing, setDeleting] = React.useState(false);
  const router = useRouter();
  const onDelete = async (messageId: string) => {
    setDeleting(true);
    try {
      console.log(messageId);
      const response = await deleteTeamUserMessageData(messageId);
      if (response.success) {
        router.back();
        toast.success(response.message || "Message deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete message.");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "READ":
        return <MessageReadIcon className="ml-1 size-4 text-green-600" />;
      case "DELIVERED":
        return <MessageDeliveredIcon className="ml-1 size-4" />;
      case "SENT":
        return <MessageSendIcon className="ml-1 size-4" />;
      default:
        return <Clock className="ml-1 size-4" />;
    }
  };

  return (
    <div className="w-full max-w-xl p-2 md:p-4 lg:p-6">
      {/* Heading */}
      <div className={"mb-4 flex items-center gap-4"}>
        <Button
          variant={"outline"}
          className="rounded-full"
          size={"icon"}
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-foreground text-xl font-semibold">
          Message Details
        </h2>
      </div>

      {/* Card */}
      <div className="bg-card w-full rounded-xl border p-6 shadow-sm">
        {/* Content */}
        <div className="flex w-full flex-col space-y-2">
          <p className="text-muted-foreground text-sm font-medium">Message</p>
          <div className="bg-muted text-foreground w-full rounded-md p-4 text-sm leading-relaxed font-medium">
            {message?.content}
          </div>
          <div className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
            {message?.createdAt &&
              format(new Date(message.createdAt), "dd MMMM yyyy")}
            {message?.status && getStatusIcon(message.status)}
          </div>
        </div>

        {/* Delete Button */}
        {message?.id && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="destructive"
              disabled={deleteing}
              onClick={() => onDelete(message.id)}
            >
              {deleteing ? (
                <ButtonLoading text="Deleting" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Message</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
