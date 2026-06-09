import express from "express";
import {
  teamProfileRequestFind,
  teamProfileRequestStatus,
  updateTeamProfileRequest,
} from "../controllers/auth.controller.js";
import { Role } from "../types/roles.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  authorize,
  authorizeSystem,
} from "../middlewares/authorize.middleware.js";
import { UserType } from "../types/user-type.js";
import { uploadMultipleDiffFileMiddleware } from "../middlewares/fileupload.middleware.js";

const authRoute = express.Router();

// Register User Route  /api/v1/auth/register
//authRoute.post("/register", asyncHandler(registerUser));

// Login User Route
//authRoute.post("/login", asyncHandler(loginUser));

// Refresh Token
//authRoute.get("/refresh", asyncHandler(refreshToken));

//View All Profiles
// authRoute.get(
//   "/profile",
//   authorize([UserType.FREE_USER, UserType.PAID_USER]),
//   asyncHandler(userProfile)
// );

// Logout User Route
//authRoute.get("/logout", asyncHandler(logoutUser));

// Login User Route
//authRoute.post("/system/login", asyncHandler(loginSystemUser));

// Refresh Token
//authRoute.get("/system/refresh", asyncHandler(refreshTokenSystem));

// Logout User Route
// authRoute.get(
//   "/system/profile",
//   authorizeSystem([Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR, Role.GHOTOK]),
//   asyncHandler(teamProfile)
// );

//  /api/v1/auth/system/profile/update/request
authRoute.get(
  "/system/profile/update/request",
  authorizeSystem([Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR, Role.GHOTOK]),
  asyncHandler(teamProfileRequestFind)
);

//  /api/v1/auth/system/profile/update/request/details
authRoute.get(
  "/system/profile/update/request/:profileId/details",
  authorizeSystem([Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR, Role.GHOTOK]),
  asyncHandler(teamProfileRequestStatus)
);

//  /api/v1/auth/system/profile/update/request
authRoute.post(
  "/system/profile/update/request",
  authorizeSystem([Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR, Role.GHOTOK]),
  uploadMultipleDiffFileMiddleware([
    {
      name: "profileImage",
      maxCount: 1,
      maxSizeKB: 150, // e.g. 150KB
      allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    },
    {
      name: "identificationProof",
      maxCount: 1,
      maxSizeKB: 500, // e.g. 500KB
      allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    },
  ]),
  asyncHandler(updateTeamProfileRequest)
);

// Change Password Route
// authRoute.post(
//   "/system/change-password",
//   authorizeSystem([Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR, Role.GHOTOK]),
//   asyncHandler(changePasswordSystem)
// );

// Logout User Route
//authRoute.get("/system/logout", asyncHandler(logoutSystemUser));

export default authRoute;
