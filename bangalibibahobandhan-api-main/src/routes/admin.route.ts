import express, { Request, Response, NextFunction } from "express";
import { Role } from "../types/roles.js";
import {
  adminDashboard,
  assignConversationToModerator,
  blockedGroom,
  createMatchingConversations,
  createReportGroomByAdmin,
  endPlanGroom,
  freeGroom,
  getAllGroomConversations,
  getAllModerators,
  getAllPayments,
  getPaymentDetailsById,
  getSingleReportedGroomByAdmin,
  getTotalAssignedConversationsLog,
  getTotalMatchingConversations,
  paidGroom,
  paidMatching,
  reportedGroomByAdmin,
} from "../controllers/admin.controller.js";
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../controllers/profile-verification.controller.js";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getAllHelpRequests,
  getSingleHelpRequestById,
  updateHelpRequestStatus,
  sendAdminHelpMessage,
} from "../controllers/auth.controller.js";

//api/v1/app/admin
const adminRoute = express.Router();

//api/v1/app/admin/dashboard
adminRoute.get(
  "/dashboard",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(adminDashboard)
);

//api/v1/app/admin/users/groom/conversations
adminRoute.get(
  "/users/groom/conversations",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(getAllGroomConversations)
);

//api/v1/app/admin/users/conversation/assign
adminRoute.post(
  "/users/conversation/assign",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(assignConversationToModerator)
);

//api/v1/app/admin/users/conversation/assign/logs
adminRoute.get(
  "/users/conversation/assign/logs",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(getTotalAssignedConversationsLog)
);

//api/v1/app/admin/users/conversation/matching
adminRoute.get(
  "/users/conversation/matching",
  authorizeSystem([Role.ADMIN, Role.MODERATOR]),
  asyncHandler(getTotalMatchingConversations)
);

//api/v1/app/admin/users/conversation/matching
adminRoute.post(
  "/users/conversation/matching",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(createMatchingConversations)
);

///api/v1/app/admin/groom/free
// View Free Groom Route
adminRoute.get(
  "/groom/free",
  asyncHandler(authorizeSystem([Role.ADMIN])),
  freeGroom
);

//api/v1/app/admin/groom/paid
// View Paid Groom Route
adminRoute.get("/groom/paid", authorizeSystem([Role.ADMIN]), paidGroom);

//api/v1/app/admin/groom/blocked
// View Blocked Groom
adminRoute.get("/groom/blocked", authorizeSystem([Role.ADMIN]), blockedGroom);

//api/v1/app/admin/groom/endplan
// View End Plan Groom
adminRoute.get("/groom/endplan", authorizeSystem([Role.ADMIN]), endPlanGroom);

//api/v1/app/admin/groom/paidmatching
// View Paid Matching
adminRoute.get(
  "/groom/paidmatching",
  authorizeSystem([Role.ADMIN]),
  paidMatching
);

//api/v1/app/admin/groom/report
adminRoute.post(
  "/groom/report",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(createReportGroomByAdmin)
);

//api/v1/app/admin/groom/reported
adminRoute.get(
  "/groom/reported",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(reportedGroomByAdmin)
);

//api/v1/app/admin/groom/reported/:reportedId
adminRoute.get(
  "/groom/reported/:reportedId",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(getSingleReportedGroomByAdmin)
);

//api/v1/app/admin/payments
adminRoute.get(
  "/payments",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(getAllPayments)
);

//api/v1/app/admin/payments/:paymentId/view
adminRoute.get(
  "/payments/:paymentId/view",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(getPaymentDetailsById)
);

/**********************  MODERATOR ********************************* */

//api/v1/app/admin/moderators
adminRoute.get(
  "/moderators",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(getAllModerators)
);

//api/v1/app/admin/request/help
adminRoute.get(
  "/request/help",
  authorizeSystem([Role.ADMIN, Role.SUPERADMIN]),
  asyncHandler(getAllHelpRequests)
);

//api/v1/app/admin/request/help/:requstId
adminRoute.get(
  "/request/help/:requestId",
  authorizeSystem([Role.ADMIN, Role.SUPERADMIN]),
  asyncHandler(getSingleHelpRequestById)
);

//api/v1/app/admin/request/help/update
adminRoute.post(
  "/request/help/update",
  authorizeSystem([Role.ADMIN, Role.SUPERADMIN]),
  asyncHandler(updateHelpRequestStatus)
);

//api/v1/app/admin/request/help/:requestId/messages
adminRoute.post(
  "/request/help/:requestId/messages",
  authorizeSystem([Role.ADMIN, Role.SUPERADMIN]),
  asyncHandler(sendAdminHelpMessage)
);

//api/v1/app/admin/verifications
adminRoute.get(
  "/verifications",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.query.gender = "MALE"; // Admins only see Groom (Male)
    next();
  }),
  getPendingVerifications
);

//api/v1/app/admin/verifications/:userId/approve
adminRoute.post(
  "/verifications/:userId/approve",
  authorizeSystem([Role.ADMIN]),
  approveVerification
);

//api/v1/app/admin/verifications/:userId/reject
adminRoute.post(
  "/verifications/:userId/reject",
  authorizeSystem([Role.ADMIN]),
  rejectVerification
);

export default adminRoute;
