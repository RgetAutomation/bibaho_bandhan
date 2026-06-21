import { SOCKET_URL } from "@/lib/constant-data";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (accessToken?: string) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: { token: accessToken },
  });
  console.log("initSocket", socket?.id);

  socket.on("connect", () => {
    console.log("socket connected", socket?.id);
    //if (userId) socket?.emit(USER_CONNECTED, userId);
  });

  // reconnect handling can be added

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
