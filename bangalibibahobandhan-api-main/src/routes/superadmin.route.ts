import express from "express";
import { getSystemSettings, updateSystemSettings } from "../controllers/settings.controller.js";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import { Role } from "../types/roles.js";
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../controllers/profile-verification.controller.js";

const superAdminRoute = express.Router();

superAdminRoute.get(
  "/settings",
  authorizeSystem([Role.SUPERADMIN]),
  getSystemSettings
);

superAdminRoute.put(
  "/settings",
  authorizeSystem([Role.SUPERADMIN]),
  updateSystemSettings
);

//api/v1/app/sa/verifications
superAdminRoute.get(
  "/verifications",
  authorizeSystem([Role.SUPERADMIN]),
  getPendingVerifications
);

//api/v1/app/sa/verifications/:userId/approve
superAdminRoute.post(
  "/verifications/:userId/approve",
  authorizeSystem([Role.SUPERADMIN]),
  approveVerification
);

//api/v1/app/sa/verifications/:userId/reject
superAdminRoute.post(
  "/verifications/:userId/reject",
  authorizeSystem([Role.SUPERADMIN]),
  rejectVerification
);

export default superAdminRoute;
