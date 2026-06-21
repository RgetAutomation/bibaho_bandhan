// contexts/SocketContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../api-constant";
import { Logger } from "@/components/utils/logger";
import { useModeratorNotificationStore } from "@/hooks/moderator/useModeratorNotificationStore";
import { useGhotokNotificationStore } from "@/hooks/ghotok/useGhotokNotificationStore";
import { IGhotokUserConversationMessage } from "@/components/interface/ghotok/IGhotokUserConversation";
import { Gender } from "@/types/groom";
import { useTeamSANotificationStore } from "@/hooks/useTeamSANotificationStore";
import { useAdminNotificationStore } from "@/hooks/admin/useAdminNotificationStore";
import { useMessageApprovalNotificationStore } from "@/hooks/moderator/useMessageApprovalNotificationStore";

// interface SocketContextType {
//   socket: Socket | null;
//   isConnected: boolean;
//   // onlineUsers: Set<string>;
//   // typingUsers: Map<string, Set<string>>;
// }

// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   isConnected: false,
//   // onlineUsers: new Set(),
//   // typingUsers: new Map(),
// });

interface SocketContextType {
  sockets: Record<string, Socket | null>; // multiple namespaces
  isConnected: Record<string, boolean>;
}

const SocketContext = createContext<SocketContextType>({
  sockets: {},
  isConnected: {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{
  children: React.ReactNode;
  token: string;
}> = ({ children, token }) => {
  const [sockets, setSocket] = useState<Record<string, Socket | null>>({});
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({});
  const { addGroomConversation } = useAdminNotificationStore();
  const { addAdminModeratorConversation, addBrideConversation } =
    useModeratorNotificationStore();
  const { incrementMessageApprovalCount } =
    useMessageApprovalNotificationStore();

  const {
    addBrideConversation: addGhotokBrideConversation,
    addGroomConversation: addGhotokGroomConversation,
    addMatchingUserConversation,
  } = useGhotokNotificationStore();
  const { incrementTeamHeadMessage } = useTeamSANotificationStore();

  useEffect(() => {
    if (!token) return;

    const namespaces = ["/teamuser", "/adminmoderator", "/teamtosa", "/sauser"];
    const createdSockets: Record<string, Socket> = {};
    const connectedStatus: Record<string, boolean> = {};

    namespaces.forEach((namespace) => {
      const socketInstance = io(`${SOCKET_URL}${namespace}`, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        Logger.socket(
          `Socket connected to Server ${namespace} : ` + socketInstance.id
        );
        connectedStatus[namespace] = true;
        setIsConnected((prev) => ({ ...prev, [namespace]: true }));
      });

      socketInstance.on("message-mark-read", (data) => {
        Logger.socket("message-mark-read : ", data);
      });

      socketInstance.on(
        "admin-moderator-message:notification",
        (data: { conversationId: string }) => {
          addAdminModeratorConversation(data.conversationId);
        }
      );

      socketInstance.on("new-team-to-sa-message:notify", () => {
        incrementTeamHeadMessage();
      });

      socketInstance.on("user-superadmin-chat:notification", (data: string) => {
        addMatchingUserConversation(data);
      });

      socketInstance.on(
        "team-user-message:notify",
        (data: { conversationId: string; receiverGender: string }) => {
          //console.log("new-team-user-message:notify", data.conversationId);
          const gender = data.receiverGender;
          if (gender === "MALE") {
            addGroomConversation(data.conversationId);
          }
          if (gender === "FEMALE") {
            addBrideConversation(data.conversationId);
          }
        }
      );

      socketInstance.on(
        "ghotok-user-new-message",
        (message: IGhotokUserConversationMessage) => {
          if (message.receiverGender === Gender.FEMALE)
            addGhotokBrideConversation(
              message.receiverId,
              message.conversationId
            );
          if (message.receiverGender === Gender.MALE)
            addGhotokGroomConversation(
              message.receiverId,
              message.conversationId
            );
        }
      );

      socketInstance.on("need-moderation-message", () => {
        incrementMessageApprovalCount();
      });

      socketInstance.on("message-error", (data) => {
        Logger.error("WEBSOCKET ERROR : ", data);
        connectedStatus[namespace] = false;
      });

      socketInstance.on("disconnect", () => {
        Logger.socket("socket disconnected from server");
        connectedStatus[namespace] = false;
        setIsConnected((prev) => ({ ...prev, [namespace]: false }));
      });

      createdSockets[namespace] = socketInstance;
    });

    setSocket(createdSockets);

    return () => {
      Object.values(createdSockets).forEach((sock) => sock.disconnect());
      setSocket({});
      setIsConnected({});
    };
  }, [
    token,
    addAdminModeratorConversation,
    addBrideConversation,
    addMatchingUserConversation,
    addGhotokBrideConversation,
    addGhotokGroomConversation,
    incrementTeamHeadMessage,
    addGroomConversation,
    incrementMessageApprovalCount,
  ]);

  return (
    <SocketContext.Provider value={{ sockets, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
