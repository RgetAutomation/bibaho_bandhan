// contexts/SocketContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./api-constant";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { RoleConversationType } from "../interface/ITeam";

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
  const {
    addAdminConversation,
    addModeratorConversation,
    addGhotokConversation,
    addUserSAConversation,
  } = useNotificationStore();

  useEffect(() => {
    if (!token) return;

    const namespaces = ["/teamuser", "/teamtosa", "/sauser"];
    const createdSockets: Record<string, Socket> = {};
    const connectedStatus: Record<string, boolean> = {};

    namespaces.forEach((namespace) => {
      const socketInstance = io(`${SOCKET_URL}${namespace}`, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log(`Socket connected to ${namespace} ` + socketInstance.id);
        connectedStatus[namespace] = true;
        setIsConnected((prev) => ({ ...prev, [namespace]: true }));

        socketInstance.emit("user-superadmin-chat:join-notification");
      });

      socketInstance.on(
        "new-team-to-sa-message:notify",
        (data: { conversationId: string; type: RoleConversationType }) => {
          console.log("new-team-to-sa-message:notify", data);
          if (data.type === RoleConversationType.SUPERADMIN_ADMIN)
            addAdminConversation(data.conversationId);
          if (data.type === RoleConversationType.SUPERADMIN_MODERATOR)
            addModeratorConversation(data.conversationId);
          if (data.type === RoleConversationType.SUPERADMIN_GHOTOK)
            addGhotokConversation(data.conversationId);
        }
      );

      socketInstance.on("user-superadmin-chat:notification", (data: string) => {
        addUserSAConversation(data);
      });

      socketInstance.on("message-error", (data) => {
        console.log("WEBSOCKET ERROR : ", data);
      });

      socketInstance.on("disconnect", () => {
        console.log("socket disconnected from server");
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
    addAdminConversation,
    addModeratorConversation,
    addGhotokConversation,
    addUserSAConversation,
  ]);

  return (
    <SocketContext.Provider value={{ sockets, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
