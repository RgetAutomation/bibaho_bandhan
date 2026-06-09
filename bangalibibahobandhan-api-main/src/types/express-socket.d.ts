// types/express-socket.d.ts
import { AppSocketServer } from "../socket"; // adjust path

declare module "express-serve-static-core" {
  interface Request {
    io: AppSocketServer;
    socketUserMap: Map<string, string>;
  }
}
