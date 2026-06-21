import { Request, Response, NextFunction, RequestHandler } from "express";
import { Role } from "../types/roles.js";
import { verifyAccessToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { UserType } from "../types/user-type.js";
import { User } from "../types/user.js";
import { AuthenticatedSocket, JwtPayload } from "../types/jwt-payload.js";
import { Gender } from "../types/gender.js";
import { authTeam, authUser, authSuperAdmin } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../config/db.js";

export function authorizeSystem(allowedRoles: Role[]): RequestHandler {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check which cookie prefix is present and use the matching auth instance
      // This prevents cross-portal session confusion when both cookies exist
      const cookieHeader = req.headers.cookie || "";
      const hasSuperAdminCookie = cookieHeader.includes("bbbsuperadmin.");

      let session = hasSuperAdminCookie
        ? await authSuperAdmin.api.getSession({ headers: fromNodeHeaders(req.headers) })
        : await authTeam.api.getSession({ headers: fromNodeHeaders(req.headers) });

      // Fallback: try the other auth if the primary one failed
      if (!session || !session.session || !session.user) {
        session = hasSuperAdminCookie
          ? await authTeam.api.getSession({ headers: fromNodeHeaders(req.headers) })
          : await authSuperAdmin.api.getSession({ headers: fromNodeHeaders(req.headers) });
      }

      if (!session || !session.session || !session.user) {
        res
          .status(401)
          .json(new ApiError(401, "Unauthorized : No session found"));
        return;
      }

      const user = session.user;

      if (!allowedRoles.includes(user.role as Role)) {
        res
          .status(403)
          .json(new ApiError(403, "Forbidden: Insufficient permissions"));
        return;
      }

      if (user?.blocked === true) {
        res
          .status(401)
          .json(new ApiError(401, "Unauthorized: User is blocked"));
        return;
      }

      req.systemUser = {
        id: user.id,
        role: user.role,
      };

      return next();
    } catch (error) {
      console.error(error);
      res.status(500).json(new ApiError(500, "Internal server error"));
    }
  };
}

export function authorize(userType: UserType[]) {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // const accessTokenData =
      //   req.cookies.userAccessToken || req.headers.authorization;

      // const accessToken =
      //   accessTokenData && accessTokenData.startsWith("Bearer ")
      //     ? accessTokenData.slice(7, accessTokenData.length)
      //     : accessTokenData;

      // if (
      //   !accessToken ||
      //   accessToken === "undefined" ||
      //   accessToken === "null"
      // ) {
      //   res
      //     .status(401)
      //     .json(new ApiError(401, "Unauthorized : No access token found"));
      //   return;
      // }

      // const payload: JwtPayload = verifyAccessToken(accessToken) as JwtPayload;
      // const user: User = payload.user;

      // if (!userType.includes(user.type as UserType)) {
      //   res
      //     .status(403)
      //     .json(new ApiError(403, "Forbidden: Insufficient permissions"));
      //   return;
      // }

      // Expiry check only if route requires PAID_USER
      //TODO if (
      //   userType.includes(UserType.PAID_USER) &&
      //   !userType.includes(UserType.FREE_USER) && // if both allowed, skip check
      //   new Date(user.planExpiryDate) < new Date()
      // ) {
      //   res.status(401).json(new ApiError(401, "Your plan has expired"));
      //   return;
      // }

      // req.accessToken = accessToken;
      // req.user = {
      //   id: user.id,
      //   gender: user.gender as Gender,
      //   type: user.type as UserType,
      //   planExpiryDate: user.planExpiryDate,
      // };

      const session = await authUser.api.getSession({
        headers: fromNodeHeaders(req?.headers),
      });

      if (!session || !session.session || !session.user) {
        res
          .status(401)
          .json(new ApiError(401, "Unauthorized : No session found"));
        return;
      }

      const user = session.user;

      if (!userType.includes(user.type as UserType)) {
        res
          .status(403)
          .json(new ApiError(403, "Forbidden: Insufficient permissions"));
        return;
      }

      if (user?.blocked === true) {
        res
          .status(401)
          .json(new ApiError(401, "Unauthorized: User is blocked"));
        return;
      }

      req.user = {
        id: user.id,
        gender: user.gender as Gender,
        type: user.type as UserType,
        planExpiryDate: user.planExpiryDate as Date,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res
          .status(401)
          .json(new ApiError(401, "Unauthorized: Access token expired"));
      } else {
        res
          .status(500)
          .json(
            new ApiError(
              500,
              "Internal server error",
              error as never,
              error as string
            )
          );
      }
    }
  };
}

export const authenticateSocket = async (
  socket: AuthenticatedSocket,
  next: (err?: any) => void
) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const extractedToken = token.split("_")[1];

    const session = await prisma.userSession.findUnique({
      where: { token: extractedToken },
      include: { user: true },
    });

    if (!session || !session.user) {
      throw new Error("Invalid or expired user session");
    }

    if (
      session.user.type !== UserType.PAID_USER &&
      session.user.type !== UserType.FREE_USER
    ) {
      return next(new Error("Authentication error: Insufficient permissions"));
    }
    const user = session.user;
    socket.user = {
      id: user.id,
      gender: user.gender,
      type: user.type as UserType,
      planExpiryDate: user.planExpiryDate as Date,
      tokenType: "USER",
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error("Authentication error: Access token expired"));
    } else {
      return next(new Error("Authentication error: Invalid token"));
    }
  }
};
