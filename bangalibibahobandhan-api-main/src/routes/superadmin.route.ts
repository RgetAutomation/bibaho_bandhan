import express from "express";
import { getSystemSettings, updateSystemSettings } from "../controllers/settings.controller.js";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import { Role } from "../types/roles.js";

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

export default superAdminRoute;
