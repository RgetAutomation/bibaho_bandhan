"use client";

import React from "react";
import { ChatTeamClient } from "./chatTeamClient";
import { useParams } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function ChatWithTeamPage() {
  const { convId } = useParams<{ convId: string }>();
  const { user } = useAuthSession();
  return (
    <ChatTeamClient
      conversationId={convId}
      currentUserId={user?.id as string}
    />
  );
}
