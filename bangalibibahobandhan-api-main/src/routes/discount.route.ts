import express from "express";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import { Role } from "../types/roles.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createDiscount,
  getAllDiscounts,
  toggleDiscountStatus,
  deleteDiscount,
} from "../controllers/discount.controller.js";

const router = express.Router();

// Public / User Routes
// Users need to see discounts to apply them on the frontend
router.get("/", asyncHandler(getAllDiscounts));

// SuperAdmin Routes
router.post(
  "/",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(createDiscount)
);

router.put(
  "/:id/toggle",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(toggleDiscountStatus)
);

router.delete(
  "/:id",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(deleteDiscount)
);

export default router;
