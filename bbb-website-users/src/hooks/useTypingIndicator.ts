import { useSocket } from "@/components/contexts/SocketContext";
import { useCallback, useEffect, useRef, useState } from "react";

export const useTypingIndicator = (
  receiverId: string,
  conversationId: string,
) => {
  const { sockets, isConnected } = useSocket();
  const socket = sockets["/"];
  const [isTyping, setIsTyping] = useState(false); // current user
  const [isReceiverTyping, setIsReceiverTyping] = useState(false); // other user
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopTyping = useCallback(() => {
    if (!socket || !receiverId || !isTyping) return;

    socket.emit("typing-stop", { receiverId, conversationId });
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [socket, receiverId, conversationId, isTyping]);

  // --- Emit typing events ---
  const startTyping = useCallback(() => {
    if (!socket || !receiverId) return;

    if (!isTyping) {
      socket.emit("typing-start", { receiverId, conversationId });
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [socket, receiverId, conversationId, isTyping, stopTyping]);

  // --- Listen for receiver typing events ---
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTypingStart = ({ userId }: { userId: string }) => {
      if (userId === receiverId) setIsReceiverTyping(true);
    };

    const handleTypingStop = ({ userId }: { userId: string }) => {
      if (userId === receiverId) setIsReceiverTyping(false);
    };

    socket.on("user-typing-start", handleTypingStart);
    socket.on("user-typing-stop", handleTypingStop);

    return () => {
      socket.off("user-typing-start", handleTypingStart);
      socket.off("user-typing-stop", handleTypingStop);
    };
  }, [socket, isConnected, receiverId]);

  return { startTyping, stopTyping, isTyping, isReceiverTyping };
};
