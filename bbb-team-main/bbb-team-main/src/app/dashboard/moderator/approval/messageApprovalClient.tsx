"use client";

import {
  getAllModerationMessages,
  getAllRejectedMessagesTeamplates,
  IRejectedMessageTemplate,
} from "@/actions/teams";
import ApiErrorPage from "@/components/apiErrorPage";
import ContentNotFound from "@/components/contentNotFound";
import {
  IModerationMessage,
  IModerationMessageUser,
} from "@/components/interface/moderator/IModerationMessage";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCallback, useEffect, useState } from "react";
import { Ban, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { useSocket } from "@/components/helper/system/SocketContext";
import ButtonLoading from "@/components/buttonLoading";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMessageApprovalNotificationStore } from "@/hooks/moderator/useMessageApprovalNotificationStore";

export default function MessageApprovalClient() {
  const queryClient = useQueryClient();
  const { sockets, isConnected } = useSocket();
  const teamUserSocket = sockets["/teamuser"];

  const [selectedConv, setSelectedConv] = useState<{
    convId: string;
    star: boolean;
  }>({ convId: "", star: false });
  const [showDialog, setShowDialog] = useState(false);
  const { resetMessageApprovalCount } = useMessageApprovalNotificationStore();

  const results = useQueries({
    queries: [
      {
        queryKey: ["getAllModerationMessages"],
        queryFn: getAllModerationMessages,
      },
      {
        queryKey: ["getAllRejectedMessagesTeamplates"],
        queryFn: getAllRejectedMessagesTeamplates,
      },
    ],
  });

  const moderationQuery = results[0];
  const templatesQuery = results[1];

  const data = moderationQuery.data;
  const templates = templatesQuery.data;

  const isLoading = moderationQuery.isLoading || templatesQuery.isLoading;
  const error = moderationQuery.error || templatesQuery.error;
  const refetch = moderationQuery.refetch;

  const updateModerationMessage = useCallback(
    async (
      messageId: string,
      moderateStatus: "APPROVED" | "REJECTED",
      isSenderGhotokUser: boolean,
      reason?: string
    ) => {
      if (!teamUserSocket || !messageId) return;
      const messageData = {
        messageId,
        moderateStatus,
        isSenderGhotokUser,
        reason: reason ?? "",
      };

      teamUserSocket.emit("modaration-message-update", messageData);
    },
    [teamUserSocket]
  );

  useEffect(() => {
    if (!teamUserSocket || !isConnected) return;
    resetMessageApprovalCount();
    //joinConversation(conversationId);

    const handleNewMessage = (message: IModerationMessage) => {
      //Logger.info("need-moderation-message", message);
      queryClient.setQueryData(
        ["getAllModerationMessages"],
        (oldData: IModerationMessage[]) => {
          if (!oldData) return [message];
          // Prevent duplicate if the same message ID already exists
          const exists = oldData.some(
            (m: IModerationMessage) => m.id === message.id
          );
          if (exists) return oldData;
          return [...oldData, message]; // prepend new one
        }
      );

      resetMessageApprovalCount();
    };

    const handleMessageUpdate = (message: IModerationMessage) => {
      //Logger.info("moderation-message-updated", message);
      queryClient.setQueryData(
        ["getAllModerationMessages"],
        (oldData: IModerationMessage[]) => {
          if (!oldData || oldData.length < 4) refetch();
          return oldData.filter(
            (msg: IModerationMessage) => msg.id !== message.id
          );
        }
      );
    };

    teamUserSocket.on("need-moderation-message", handleNewMessage);
    teamUserSocket.on("moderation-message-updated", handleMessageUpdate);
    //socket.on("message-status-update", handleMessageStatusUpdate);

    return () => {
      teamUserSocket.off("need-moderation-message", handleNewMessage);
      teamUserSocket.off("moderation-message-updated", handleMessageUpdate);
      //socket.off("message-status-update", handleMessageStatusUpdate);
    };
  }, [
    teamUserSocket,
    isConnected,
    refetch,
    queryClient,
    resetMessageApprovalCount,
  ]);

  if (isLoading) {
    return (
      <div className={"flex flex-1 flex-col items-center justify-center"}>
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to get conversations"
      : "Something went wrong. Please try again.";
    return (
      <div className={"flex flex-1 flex-col items-center justify-center"}>
        <ApiErrorPage
          title={"Failed to get conversations"}
          description={errorMessage}
        />
      </div>
    );
  }

  const handleStarConversation = async (
    conversationId: string,
    starConversation: boolean
  ) => {
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/app/moderator/conversations/star",
        {
          convId: conversationId,
          star: starConversation,
        }
      );
      if (response.data.success) {
        refetch();
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
    <div className="flex w-full flex-1 flex-col">
      <div className="bg-card flex w-full flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Message Approval
          </h1>
        </div>
      </div>

      {data?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ContentNotFound
            title="No Message found"
            description={"We couldn't find any messages."}
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 space-y-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.map((conv) => (
              <ModerationCard
                key={conv.id}
                messageId={conv.id}
                conversationId={conv.conversation.id}
                convId={conv.conversation.convId}
                starConversation={conv.conversation.starConversation}
                content={conv.content}
                sender={conv.sender}
                receiver={conv.receiver}
                rejectTemplate={templates ?? []}
                onStarClick={(conversationId, starConversation) => {
                  if (starConversation) {
                    handleStarConversation(conversationId, starConversation);
                  } else {
                    setSelectedConv({
                      convId: conversationId,
                      star: starConversation,
                    });
                    setShowDialog(true);
                  }
                }}
                onApproveClick={(messageId, isGhotokOwned) =>
                  updateModerationMessage(messageId, "APPROVED", isGhotokOwned)
                }
                onRejectClick={(messageId, isGhotokOwned, reason) =>
                  updateModerationMessage(
                    messageId,
                    "REJECTED",
                    isGhotokOwned,
                    reason
                  )
                }
                refetch={refetch}
              />
            ))}
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Want to Remove Star?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove star for the conversation?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      handleStarConversation(
                        selectedConv.convId,
                        selectedConv.star
                      );
                      setShowDialog(false);
                    }}
                  >
                    Yes, Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}

function ModerationCard({
  messageId,
  conversationId,
  convId,
  starConversation,
  content,
  sender,
  receiver,
  rejectTemplate,
  onStarClick,
  onApproveClick,
  onRejectClick,
}: {
  messageId: string;
  conversationId: string;
  convId: string;
  starConversation: boolean;
  content: string;
  sender: IModerationMessageUser;
  receiver: IModerationMessageUser;
  rejectTemplate: IRejectedMessageTemplate[];
  onStarClick: (conversationId: string, starConversation: boolean) => void;
  onApproveClick: (messageId: string, isGhotokOwned: boolean) => void;
  onRejectClick: (
    messageId: string,
    isGhotokOwned: boolean,
    reason: string
  ) => void;
  refetch: () => void;
}) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [reason, setReason] = useState<IRejectedMessageTemplate | null>(null);
  const [showReasonField, setShowReasonField] = useState(false);
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);

  return (
    <div
      className={`flex gap-4 rounded-xl border p-4 shadow-sm ${sender.gender === "MALE" ? "bg-blue-200/90 dark:bg-blue-500/10" : "bg-pink-200/90 dark:bg-pink-500/10"}`}
    >
      <div className="flex flex-1 flex-col items-center gap-2">
        <div className={"flex w-full items-center justify-between"}>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-4">
              <Avatar className="border-background size-10 border-2">
                <AvatarImage
                  src={sender.gender === "MALE" ? "/groom.webp" : "/bride.webp"}
                  alt={sender.lastName}
                />
                <AvatarFallback>{sender.lastName[0]}</AvatarFallback>
              </Avatar>
              <Avatar className="border-background size-10 border-2">
                <AvatarImage
                  src={
                    receiver.gender === "MALE" ? "/groom.webp" : "/bride.webp"
                  }
                  alt={receiver.lastName}
                />
                <AvatarFallback>{receiver.lastName[0]}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-sm font-semibold">
              {sender.title} {sender.lastName} to {receiver.title}{" "}
              {receiver.lastName}
            </span>
          </div>
          <Button
            className="size-8 rounded-full"
            variant={"outline"}
            onClick={() => onStarClick(conversationId, !starConversation)}
          >
            {starConversation ? (
              <IconStarFilled className="size-5 text-yellow-500" />
            ) : (
              <IconStar stroke={2} className={"size-5"} />
            )}
          </Button>
        </div>
        <p className="flex w-full gap-2 text-sm">
          Conversation ID :{" "}
          <span className="flex items-center gap-2 font-semibold">
            {convId}
          </span>
        </p>
        <div className="flex w-full flex-col rounded-md border bg-white p-2 dark:bg-zinc-800">
          <p className="text-sm font-light">Message :</p>
          <p className="text-sm font-semibold">{content}</p>
        </div>
        <div className={"grid w-full grid-cols-2 items-end gap-2 pt-2"}>
          <Button
            onClick={() => setShowReasonField(!showReasonField)}
            className="rounded-full bg-red-600 hover:bg-red-700 dark:bg-red-700/80 hover:dark:bg-red-700/70"
          >
            <Ban className={"size-4"} />
            <span>Reject</span>
          </Button>
          <Button
            onClick={() => {
              onApproveClick(messageId, sender.isGhotokOwned);
              setApproveLoading(messageId);
            }}
            disabled={approveLoading === messageId}
            className="rounded-full bg-green-600 hover:bg-green-700 dark:bg-green-700/80 hover:dark:bg-green-700/70"
          >
            {approveLoading === messageId ? (
              <ButtonLoading text={""} />
            ) : (
              <>
                <ThumbsUp className={"size-4"} />
                <span>Approve</span>
              </>
            )}
          </Button>
        </div>
        {showReasonField && (
          <div className={"flex w-full flex-col"}>
            <Field>
              <FieldLabel htmlFor="reason">Reason</FieldLabel>
              {/* <Textarea
                value={reason?.content}
                id="reason"
                placeholder="Write the reason for rejection"
                className="bg-white"
              /> */}
              <Textarea
                value={reason?.content}
                id="reason"
                placeholder="Select the reason for rejection"
                className="cursor-pointer bg-white"
                readOnly
                onClick={() => setOpenDrawer(true)}
              />
            </Field>
            <div className={"mt-2 flex w-full items-center justify-end"}>
              <Button
                onClick={() => {
                  if (reason?.content) {
                    setRejectLoading(messageId);
                    onRejectClick(
                      messageId,
                      sender.isGhotokOwned,
                      reason.content
                    );
                  } else {
                    toast.error("Please enter a reason for rejection.");
                  }
                }}
                className="rounded-full bg-red-600 hover:bg-red-700 dark:bg-red-700/80 hover:dark:bg-red-700/70"
                disabled={rejectLoading === messageId}
              >
                {rejectLoading === messageId ? (
                  <ButtonLoading text={""} />
                ) : (
                  <>
                    <ThumbsDown className={"size-4"} />
                    <span>Reject</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Reason</DrawerTitle>
            <DrawerDescription>
              Select the reason for rejection
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex w-full justify-center">
            <div className="flex max-h-[70vh] w-full flex-col gap-2 overflow-y-auto pb-6 sm:max-w-sm md:max-w-md lg:max-w-lg">
              {rejectTemplate.map((msg: IRejectedMessageTemplate, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setReason(msg);
                    setOpenDrawer(false);
                  }}
                  className="border-input bg-card hover:bg-accent hover:text-accent-foreground flex cursor-pointer flex-col gap-2 rounded-md border p-4"
                >
                  <h1 className="text-lg">{msg.title}</h1>
                  <p className="text-muted-foreground text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
