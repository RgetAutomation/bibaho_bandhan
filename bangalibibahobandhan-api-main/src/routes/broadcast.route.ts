import express from "express";
import { authorizeSystem, authorize } from "../middlewares/authorize.middleware.js";
import { Role } from "../types/roles.js";
import { UserType } from "../types/user-type.js";
import { 
  createBroadcast, 
  getActiveBroadcast, 
  getAllBroadcasts, 
  deactivateBroadcast 
} from "../controllers/broadcast.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFileMiddleware } from "../middlewares/fileupload.middleware.js";

const router = express.Router();

// User Route (Optional user authorization to get their gender, 
// though we can also just use the token without strict blocking)
// We removed authorize so guests can also see broadcasts.
router.get("/active", asyncHandler(getActiveBroadcast));

// SuperAdmin Routes
router.post(
  "/",
  authorizeSystem([Role.SUPERADMIN]),
  uploadFileMiddleware(5120, ["image/png", "image/jpeg", "image/jpg", "image/webp"]),
  asyncHandler(createBroadcast)
);

router.get(
  "/",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(getAllBroadcasts)
);

router.put(
  "/:id/deactivate",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(deactivateBroadcast)
);

export default router;
