import { Socket } from "socket.io";
import { SystemUser, User } from "./user.js";

export interface JwtPayload {
  user: User;
  iat: number;
  exp: number;
}

export interface SystemJwtPayload {
  user: SystemUser;
  iat: number;
  exp: number;
}

export interface JwtPayloadRefresh {
  id: string;
  iat: number;
  exp: number;
}

export interface SystemJwtPayloadRefresh {
  id: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedSocket extends Socket {
  user?: User;
}

export interface AuthenticatedTeamSocket extends Socket {
  user?: SystemUser;
}

export interface AuthenticatedTeamUserSocket extends Socket {
  user?: SystemUser | User;
}
