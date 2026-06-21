// components/OnlineStatus.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/components/contexts/SocketContext";

interface OnlineStatusProps {
  userId: string;
  typing: boolean;
}

interface UserStatus {
  isOnline: boolean;
  lastSeen: Date | null;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  userId,
  typing,
}) => {
  const [status, setStatus] = useState<UserStatus>({
    isOnline: false,
    lastSeen: null,
  });
  const { sockets, isConnected, onlineUsers } = useSocket();
  const socket = sockets["/"];

  // Get initial status from onlineUsers Set
  useEffect(() => {
    const isOnline = onlineUsers.has(userId);
    setStatus((prev) => ({ ...prev, isOnline }));
  }, [onlineUsers, userId]);

  // Listen for real-time online/offline events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserOnline = ({ userId: onlineUserId }: { userId: string }) => {
      if (onlineUserId === userId) {
        setStatus((prev) => ({
          ...prev,
          isOnline: true,
          lastSeen: new Date(), // Update lastSeen when user comes online
        }));
      }
    };

    const handleUserOffline = ({
      userId: offlineUserId,
    }: {
      userId: string;
    }) => {
      if (offlineUserId === userId) {
        setStatus((prev) => ({
          ...prev,
          isOnline: false,
          lastSeen: new Date(), // Update lastSeen when user goes offline
        }));
      }
    };

    // Request initial status when component mounts
    socket.emit("get-user-status", { userId });

    // Listen for status response
    const handleUserStatus = ({
      userId: statusUserId,
      isOnline,
      lastSeen,
    }: {
      userId: string;
      isOnline: boolean;
      lastSeen: string | null;
    }) => {
      if (statusUserId === userId) {
        setStatus({
          isOnline,
          lastSeen: lastSeen ? new Date(lastSeen) : null,
        });
      }
    };

    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);
    socket.on("user-status", handleUserStatus);

    return () => {
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
      socket.off("user-status", handleUserStatus);
    };
  }, [socket, isConnected, userId]);

  const getLastSeenText = (lastSeen: Date | null) => {
    if (!lastSeen) return "Never seen";

    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSeen.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="flex items-center">
      {typing ? (
        <p className="text-sm text-green-600 font-semibold">typing...</p>
      ) : status.isOnline ? (
        <p className="text-sm text-muted-foreground">Online</p>
      ) : status.lastSeen ? (
        <p className="text-sm text-muted-foreground">
          Last seen {getLastSeenText(status.lastSeen)}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Offline</p>
      )}
    </div>
  );
};
