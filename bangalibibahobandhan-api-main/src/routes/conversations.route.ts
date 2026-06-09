import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getAdminUserConversationDetails,
  getAllAdminModeratorConversation,
  getAllTeamUserConversation,
  getConversationAndMessages,
  getConversationDetailsForSA,
  getGhotokUserConversationDetails,
  getOrCreateAdminModeratorConversation,
  getOrCreateConversationForSA,
  getOrCreateConversationWithSA,
  getOrCreateTeamUserConversation,
  getTeamUserConversationAndMessages,
  getUserConversationByConvId,
  sendAdminUserMessage,
} from "../controllers/conversation.controller.js";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import { Role } from "../types/roles.js";

const conversationsRoute = express.Router();

//api/v1/conversations/users/conversations/:convId
conversationsRoute.get(
  "/users/conversations/:convId",
  authorizeSystem([Role.ADMIN, Role.MODERATOR]),
  asyncHandler(getUserConversationByConvId)
);

conversationsRoute.get(
  "/teamuser/conversation/:convId/view",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(getAdminUserConversationDetails)
);

conversationsRoute.post(
  "/teamuser/conversation/:convId/send",
  authorizeSystem([Role.ADMIN]),
  asyncHandler(sendAdminUserMessage)
);

/****************** ADMIN & MODERATOR CONVERSATION  ********************** */

//api/v1/conversations/admin/moderator/conversation/all
conversationsRoute.get(
  "/admin/moderator/conversation/all",
  authorizeSystem([Role.ADMIN, Role.MODERATOR]),
  asyncHandler(getAllAdminModeratorConversation)
);

//api/v1/conversations/admin/moderator/conversation/:teamId
conversationsRoute.get(
  "/admin/moderator/conversation/:teamId",
  authorizeSystem([Role.ADMIN, Role.MODERATOR]),
  asyncHandler(getOrCreateAdminModeratorConversation)
);

//api/v1/conversations/admin/moderator/conversation/:convId/details
conversationsRoute.get(
  "/admin/moderator/conversation/:convId/details",
  authorizeSystem([Role.ADMIN, Role.MODERATOR]),
  asyncHandler(getConversationAndMessages)
);

/****************** ADMIN & MODERATOR CONVERSATION  ********************** */

/****************** TEAM & USER CONVERSATION  ********************** */

//api/v1/conversations/team/user/conversation/all
conversationsRoute.get(
  "/team/user/conversation/all",
  authorizeSystem([Role.ADMIN, Role.MODERATOR]),
  asyncHandler(getAllTeamUserConversation)
);

//api/v1/conversations/team/user/:userId/conversation
conversationsRoute.get(
  "/team/user/:userId/conversation",
  authorizeSystem([Role.ADMIN, Role.MODERATOR]),
  asyncHandler(getOrCreateTeamUserConversation)
);

//api/v1/conversations/team/user/conversation/:convId/details
conversationsRoute.get(
  "/team/user/conversation/:convId/details",
  authorizeSystem([Role.ADMIN, Role.MODERATOR]),
  asyncHandler(getTeamUserConversationAndMessages)
);

/****************** TEAM & SUPERADMIN CONVERSATION  ********************** */

//api/v1/conversations/sa/conversation
conversationsRoute.get(
  "/sa/conversation",
  authorizeSystem([Role.ADMIN, Role.MODERATOR, Role.GHOTOK]),
  asyncHandler(getOrCreateConversationWithSA)
);

//api/v1/conversations/sa/conversation/:userId
conversationsRoute.get(
  "/sa/conversation/:userId",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(getOrCreateConversationForSA)
);

//api/v1/conversations/sa/conversation/:convId/details
conversationsRoute.get(
  "/sa/conversation/:convId/details",
  authorizeSystem([Role.SUPERADMIN]),
  asyncHandler(getConversationDetailsForSA)
);

/****************** MESSAGE MODERATION CONVERSATION  ***********************/
//api/v1/conversations/ghotok/user/conversation/:convId/details
conversationsRoute.get(
  "/ghotok/user/conversation/:convId/details",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getGhotokUserConversationDetails)
);

export default conversationsRoute;
