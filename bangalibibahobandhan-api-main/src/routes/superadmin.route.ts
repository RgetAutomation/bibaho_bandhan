import express from "express";

///api/v1/app/sa
const superAdminRoute = express.Router();

// superAdminRoute.get(
//   "/plan",
//   authorizeSystem([Role.SUPERADMIN]),
//   asyncHandler(getPlansForSA)
// );

// ///api/v1/app/sa/user/sa/conversation/:userId
// superAdminRoute.get(
//   "/user/sa/conversation/:userId",
//   authorizeSystem([Role.SUPERADMIN]),
//   asyncHandler(getOrCreateUserSAConversationForSA)
// );

export default superAdminRoute;
