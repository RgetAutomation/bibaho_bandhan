import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

import { SocketService } from "./services/SocketService.js";
import { AdminModeratorSocketService } from "./services/AdminModeratorSocketService.js";
import { TeamUserSocketService } from "./services/TeamUserSocketService.js";
import { TeamToSASocketService } from "./services/TeamToSASocketService.js";
import { UserToSASocketService } from "./services/UserToSASocketService.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://192.168.0.101:3000",
      "http://192.168.97.1:3000",
      "http://192.168.1.37:3000",
      "http://10.91.50.145:3000",
      "https://bibahobandhan.com",
      "https://www.bibahobandhan.com",
      "https://team.bibahobandhan.com",
      "https://teamhead.bibahobandhan.com",
    ],
    credentials: true,
  },
});

// initialize socket services
new SocketService(io);
new AdminModeratorSocketService(io);
new TeamUserSocketService(io);
new TeamToSASocketService(io);
new UserToSASocketService(io);

export { server, io };
