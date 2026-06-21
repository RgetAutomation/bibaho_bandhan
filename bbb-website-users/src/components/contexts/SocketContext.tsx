// contexts/SocketContext.tsx
"use client";

import { SOCKET_URL } from "@/lib/constant-data";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { IMessage } from "../interface/IMessage";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { Logger } from "../utils/logger";

interface SocketContextType {
  sockets: Record<string, Socket | null>; // multiple namespaces
  isConnected: Record<string, boolean>;
  onlineUsers: Set<string>;
  typingUsers: Map<string, Set<string>>;
}

const SocketContext = createContext<SocketContextType>({
  sockets: {},
  isConnected: {},
  onlineUsers: new Set(),
  typingUsers: new Map(),
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{
  children: React.ReactNode;
  token: string;
}> = ({ children, token }) => {
  const [sockets, setSocket] = useState<Record<string, Socket | null>>({});
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(
    new Map(),
  );
  const { addConversation, addTeamConversation, addUserSAConversation } =
    useNotificationStore();

  useEffect(() => {
    if (!token) return;

    const namespaces = ["/", "/teamuser", "/sauser"];
    const createdSockets: Record<string, Socket> = {};
    const connectedStatus: Record<string, boolean> = {};

    namespaces.forEach((namespace) => {
      const socketInstance = io(`${SOCKET_URL}${namespace}`, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log(`Socket connected to ${namespace} : ` + socketInstance.id);
        // setIsConnected(true);
        // setSocket(socketInstance);
        connectedStatus[namespace] = true;
        setIsConnected((prev) => ({ ...prev, [namespace]: true }));
      });

      // socketInstance.on("moderation-message-updated", (data) => {
      //   Logger.socket("moderation-message-updated : ", data);
      // });

      socketInstance.on("disconnect", () => {
        console.log("socket disconnected from server");
        //setIsConnected(false);
        connectedStatus[namespace] = false;
        setIsConnected((prev) => ({ ...prev, [namespace]: false }));
      });

      socketInstance.on("online-users", (users: string[]) => {
        setOnlineUsers(new Set(users));
      });

      socketInstance.on("user-online", ({ userId }: { userId: string }) => {
        setOnlineUsers((prev) => new Set(prev).add(userId));
      });

      socketInstance.on("user-offline", ({ userId }: { userId: string }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      socketInstance.on("user-typing-start", ({ userId, conversationId }) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          const users = newMap.get(conversationId) || new Set();
          users.add(userId);
          newMap.set(conversationId, users);
          return newMap;
        });
      });

      socketInstance.on("user-typing-stop", ({ userId, conversationId }) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          const users = newMap.get(conversationId);
          if (users) {
            users.delete(userId);
            if (users.size === 0) {
              newMap.delete(conversationId);
            } else {
              newMap.set(conversationId, users);
            }
          }
          return newMap;
        });
      });

      socketInstance.on("new-message", (message: IMessage) => {
        addConversation(message.conversationId);
      });

      socketInstance.on("ghotok-user-new-message", (data: IMessage) => {
        addConversation(data.conversationId);
      });

      socketInstance.on("team-user-message:notify", (data: any) => {
        addTeamConversation(data.conversationId);
      });

      socketInstance.on("user-superadmin-chat:notification", (data: string) => {
        addUserSAConversation(data);
      });

      socketInstance.on("message-error", (data: any) => {
        Logger.error("message-error", data);
      });

      createdSockets[namespace] = socketInstance;
    });

    setSocket(createdSockets);

    return () => {
      // socketInstance.disconnect();
      // setSocket(null);
      // setIsConnected(false);
      Object.values(createdSockets).forEach((sock) => sock.disconnect());
      setSocket({});
      setIsConnected({});
    };
  }, [token, addConversation, addTeamConversation, addUserSAConversation]);

  return (
    <SocketContext.Provider
      value={{ sockets, isConnected, onlineUsers, typingUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
};
