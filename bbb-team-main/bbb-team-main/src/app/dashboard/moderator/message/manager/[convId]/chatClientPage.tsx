"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminModeratorMessages } from "@/components/useAdminModeratorMessages";
import { addIdPrefix } from "@/lib/utils";
import { TeamRole } from "@/components/enum/TeamRole";
import { Gender } from "@/types/groom";
import { ITemplate } from "@/components/interface/ITemplate";
import { MessageList } from "@/components/MessageList";
import LoadingPage from "@/components/loader";

export default function ChatClientPage({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const {
    messages,
    sendMessage,
    isLoading,
    participants,
    templates,
    startConversationForModeratorWithAdmin: startConversation,
  } = useAdminModeratorMessages(conversationId, currentUserId);
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ITemplate | null>(
    null
  );

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  const handleSelectMessage = (message: ITemplate) => {
    setSelectedMessage(message);
    setDrawerOpen(false); // close drawer
  };

  const handleSendMessage = () => {
    sendMessage(selectedMessage!.id, selectedMessage?.content || "");
    setSelectedMessage(null); // clear selected message
  };

  return isLoading ? (
    <div className={"flex flex-1 items-center justify-center"}>
      <LoadingPage />
    </div>
  ) : (
    <div className="flex h-[calc(100vh-80px)] flex-col overflow-hidden">
      {/* Header */}
      <div className="item-center flex gap-3 border-b p-3">
        <Button
          variant="ghost"
          size={"icon"}
          className="rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <Avatar className="size-10">
          <AvatarImage
            src={
              participants?.gender === Gender.MALE
                ? "/groom.webp"
                : "/bride.webp"
            }
          />
          <AvatarFallback>
            participants?.gender.charAt(0).toUpperCase()
          </AvatarFallback>
        </Avatar>
        <h1 className="flex items-center text-center text-lg font-semibold">
          {addIdPrefix(
            participants?.internalId || "",
            participants?.role as TeamRole
          )}
        </h1>
      </div>

      {/* Messages */}
      <div className={"flex-1 overflow-y-auto"}>
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      {/* Input Section */}
      <div className="flex w-full items-center justify-center gap-2 border-t p-5">
        <Button className="rounded-full" onClick={() => setDrawerOpen(true)}>
          Select Message
        </Button>

        <Input
          className="rounded-full px-4"
          placeholder="Select a message to send"
          value={selectedMessage?.content || ""}
          readOnly
        />

        <Button
          className="rounded-full"
          disabled={!selectedMessage}
          onClick={handleSendMessage}
        >
          <Send />
        </Button>
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="flex items-center justify-center p-4">
          <DrawerHeader>
            <DrawerTitle>Select a Message</DrawerTitle>
            <DrawerDescription>Select a message to send</DrawerDescription>
          </DrawerHeader>

          <div className="flex w-full justify-center">
            <div className="flex max-h-[70vh] w-full flex-col gap-2 overflow-y-auto pb-6 sm:max-w-sm md:max-w-md lg:max-w-lg">
              {templates.map((msg: ITemplate, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectMessage(msg)}
                  className="border-input bg-card hover:bg-accent hover:text-accent-foreground flex cursor-pointer flex-col gap-2 rounded-md border p-4"
                >
                  <h1 className="text-lg">{msg.name}</h1>
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
