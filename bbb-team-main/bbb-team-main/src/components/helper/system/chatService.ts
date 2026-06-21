import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../api-constant";
import { TEAM_USER_CONNECTED } from "../constant";

let socket: Socket | null = null;

export const initTeamSocket = ({
  userId,
  teamId,
}: {
  userId?: string;
  teamId?: string;
}) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("connected!", socket?.id);
    });

    if (userId) {
      socket.emit(TEAM_USER_CONNECTED, { userId });
      console.log("user connected:", userId);
    }

    if (teamId) {
      socket.emit(TEAM_USER_CONNECTED, { teamId });
      console.log("team connected:", teamId);
    }
  }

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
