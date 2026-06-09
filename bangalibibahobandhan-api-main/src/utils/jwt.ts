import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { JwtPayload, SystemJwtPayload } from "../types/jwt-payload.js";
import { SystemUser, User } from "../types/user.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "./constant.js";

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, config.refreshTokenSecret as string, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const generateAccessToken = (user: User) => {
  return jwt.sign({ user }, config.accessTokenSecret as string, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.accessTokenSecret as string) as JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.refreshTokenSecret as string);
};

export const generateTokens = (user: User) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);
  return { accessToken, refreshToken };
};
