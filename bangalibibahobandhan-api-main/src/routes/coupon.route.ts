import express from "express";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import { Role } from "../types/roles.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createCoupon,
  getAllCoupons,
  getCouponsByPlan,
  toggleCouponStatus,
  deleteCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

// Public / User Routes
// Users need to see available coupons for a specific plan to apply them on the frontend
router.get("/plan/:planId", asyncHandler(getCouponsByPlan));

// SuperAdmin Routes
router.get(
  "/",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(getAllCoupons)
);

router.post(
  "/",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(createCoupon)
);

router.put(
  "/:id/toggle",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(toggleCouponStatus)
);

router.delete(
  "/:id",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(deleteCoupon)
);

export default router;
