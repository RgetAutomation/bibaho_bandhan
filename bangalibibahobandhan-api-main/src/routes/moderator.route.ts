import express, { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createMatchingConversationsForModerator,
  createReportBrideByModerator,
  deleteMatchingConversationsForModerator,
  getAllAdmins,
  getAllAssignedWork,
  getAllModerationMessages,
  getAllRejectedMessages,
  getAllRejectedTemplates,
  getAllStarredConversation,
  getSingleReportedBrideByModerator,
  getTotalMatchingConversationsForModerator,
  moderatorDashboard,
  reportedBridesByModerator,
  starMarkConversation,
} from "../controllers/moderator.controller.js";
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../controllers/profile-verification.controller.js";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import { Role } from "../types/roles.js";

//api/v1/app/moderator
const moderatorRoute = express.Router();

//api/v1/app/moderator/dashboard
moderatorRoute.get(
  "/dashboard",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(moderatorDashboard)
);

//api/v1/app/moderator/dashboard
moderatorRoute.get(
  "/dashboard",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(moderatorDashboard)
);

//api/v1/app/moderator/messages/moderation
moderatorRoute.get(
  "/messages/moderation",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(getAllModerationMessages)
);

//api/v1/app/moderator/conversations/star
moderatorRoute.post(
  "/conversations/star",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(starMarkConversation)
);

//api/v1/app/moderator/admins
moderatorRoute.get(
  "/admins",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(getAllAdmins)
);

//api/v1/app/moderator/assigned/work
moderatorRoute.get(
  "/assigned/work",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(getAllAssignedWork)
);

//api/v1/app/moderator/conversations/starred
moderatorRoute.get(
  "/conversations/starred",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(getAllStarredConversation)
);

//api/v1/app/moderator/bride/report
moderatorRoute.post(
  "/bride/report",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(createReportBrideByModerator)
);

//api/v1/app/moderator/bride/reported
moderatorRoute.get(
  "/bride/reported",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(reportedBridesByModerator)
);

//api/v1/app/moderator/bride/reported/:reportedId
moderatorRoute.get(
  "/bride/reported/:reportedId",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(getSingleReportedBrideByModerator)
);

//api/v1/app/moderator/users/conversation/matching
moderatorRoute.get(
  "/users/conversation/matching",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(getTotalMatchingConversationsForModerator)
);

//api/v1/app/moderator/users/conversation/matching
moderatorRoute.post(
  "/users/conversation/matching",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(createMatchingConversationsForModerator)
);

//api/v1/app/moderator/users/conversation/matching
moderatorRoute.delete(
  "/users/conversation/matching/:reportId",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(deleteMatchingConversationsForModerator)
);

//api/v1/app/moderator/messages/rejected
moderatorRoute.get(
  "/messages/rejected",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(getAllRejectedMessages)
);

//api/v1/app/moderator/messages/rejected/templates
moderatorRoute.get(
  "/messages/rejected/templates",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(getAllRejectedTemplates)
);

//api/v1/app/moderator/verifications
moderatorRoute.get(
  "/verifications",
  authorizeSystem([Role.MODERATOR]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.query.gender = "FEMALE"; // Moderators only see Bride (Female)
    next();
  }),
  getPendingVerifications
);

//api/v1/app/moderator/verifications/:userId/approve
moderatorRoute.post(
  "/verifications/:userId/approve",
  authorizeSystem([Role.MODERATOR]),
  approveVerification
);

//api/v1/app/moderator/verifications/:userId/reject
moderatorRoute.post(
  "/verifications/:userId/reject",
  authorizeSystem([Role.MODERATOR]),
  rejectVerification
);

export default moderatorRoute;
