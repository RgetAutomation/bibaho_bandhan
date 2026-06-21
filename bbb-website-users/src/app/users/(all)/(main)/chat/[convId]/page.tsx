"use client";

import { ChatContainer } from "@/components/ChatContainer";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useParams } from "next/navigation";
import React from "react";

export default function ChatPage() {
  const { convId } = useParams<{ convId: string }>();
  const { user } = useAuthSession();
  const userId = user?.id as string;

  if (!convId || !userId) return null;

  return <ChatContainer conversationId={convId} currentUserId={userId} />;
}
