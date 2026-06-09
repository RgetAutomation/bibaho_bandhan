import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  activateGhotokUserProfile,
  connectionRequestAcceptGhotok,
  connectionRequestRejecGhotok,
  createGhotokUser,
  deactivateGhotokUserProfile,
  deleteGhotokUserProfileImage,
  getAllConnectionRequest,
  getAllConversationOfGhotokUser,
  getGhotokRequestById,
  getUserDetailsByIdForGhotok,
  ghotokAllGrooms,
  ghotokAllBrides,
  ghotokDashboard,
  ghotokUserProfileStatusAndImages,
  joinGhotokRequestUser,
  loadGhotokUserProfileDataForEdit,
  updateGhotokUserProfile,
  updateGhotokUserProfileAvatar,
  uploadGhotokUserProfileImages,
  viewGhotokUserProfileById,
  createReportGhotokUser,
  allReportedGhotokUser,
  getSingleReportedGhotokUser,
  getAllMatchingUsers,
  getMatchingUserConversationDetailsById,
  getMatchingPaymentRequestByMessageIdForGhotok,
  createMatchingPaymentForGhotok,
  getMatchingPaymentDetailsByMessageIdForGhotok,
  getAllPaidMatchedGroomsForGhotok,
  getAllGhotokBridesForChat,
  getAllGhotokGroomsForChat,
  getAllConversationByGhotokBrideIdForChat,
  getAllConversationByGhotokGroomIdForChat,
  getBrideUserIdByProfileIdForGhotok,
  joinGhotokRequestUserSearch,
} from "../controllers/ghotok.controller.js";
import { Role } from "../types/roles.js";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import {
  uploadFileMiddleware,
  uploadMultipleFileMiddleware,
} from "../middlewares/fileupload.middleware.js";

const ghotokRoute = express.Router();

//api/v1/app/ghotok/dashboard
ghotokRoute.get(
  "/dashboard",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(ghotokDashboard)
);

//api/v1/app/ghotok/users/bride
ghotokRoute.get(
  "/users/bride",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(ghotokAllBrides)
);

//api/v1/app/ghotok/users/groom
ghotokRoute.get(
  "/users/groom",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(ghotokAllGrooms)
);

//api/v1/app/ghotok/users/public/:id
ghotokRoute.get(
  "/users/public/:id",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getUserDetailsByIdForGhotok)
);

// Join Ghotok
ghotokRoute.post("/join", asyncHandler(joinGhotokRequestUser));

ghotokRoute.post("/join/search", asyncHandler(joinGhotokRequestUserSearch));

// View Ghotok Request
ghotokRoute.get("/join/view/:userId", asyncHandler(getGhotokRequestById));

/************************** FOR USERS  **************************** */

//api/v1/app/ghotok/users/create
ghotokRoute.post(
  "/users/create",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(createGhotokUser)
);

//api/v1/app/ghotok/users/:userId/view
ghotokRoute.get(
  "/users/:userId/view",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(viewGhotokUserProfileById)
);

//api/v1/app/ghotok/users/:userId/load
ghotokRoute.get(
  "/users/:userId/load",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(loadGhotokUserProfileDataForEdit)
);

//api/v1/app/ghotok/users/update/:userId
ghotokRoute.post(
  "/users/update/:userId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(updateGhotokUserProfile)
);

//api/v1/app/ghotok/users/:userId/status-images
ghotokRoute.get(
  "/users/:userId/status-images",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(ghotokUserProfileStatusAndImages)
);

//api/v1/app/ghotok/users/profile/:userId/avatar
ghotokRoute.post(
  "/users/profile/:userId/avatar",
  authorizeSystem([Role.GHOTOK]),
  uploadFileMiddleware(20480, ["image/png", "image/jpeg", "image/jpg"]),
  asyncHandler(updateGhotokUserProfileAvatar)
);

//api/v1/app/ghotok/users/profile/:userId/images/upload
ghotokRoute.post(
  "/users/profile/:userId/images/upload",
  authorizeSystem([Role.GHOTOK]),
  uploadMultipleFileMiddleware(2, 20480, [
    "image/png",
    "image/jpeg",
    "image/jpg",
  ]),
  asyncHandler(uploadGhotokUserProfileImages)
);

//api/v1/app/ghotok/users/profile/:userId/image/:imageId
ghotokRoute.delete(
  "/users/profile/:userId/image/:imageId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(deleteGhotokUserProfileImage)
);

//api/v1/app/ghotok/users/profile/:userId/deactivate
ghotokRoute.get(
  "/users/profile/:userId/deactivate",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(deactivateGhotokUserProfile)
);

//api/v1/app/ghotok/users/profile/:userId/activate
ghotokRoute.get(
  "/users/profile/:userId/activate",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(activateGhotokUserProfile)
);

//api/v1/app/ghotok/users/request/connections
ghotokRoute.get(
  "/users/request/connections",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getAllConnectionRequest)
);

//api/v1/app/ghotok/users/request/connections/:requestId/accept
ghotokRoute.get(
  "/users/request/connections/:requestId/accept",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(connectionRequestAcceptGhotok)
);

//api/v1/app/ghotok/users/request/connections/:requestId/reject
ghotokRoute.get(
  "/users/request/connections/:requestId/reject",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(connectionRequestRejecGhotok)
);

//api/v1/app/ghotok/users/conversations
ghotokRoute.get(
  "/users/conversations",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getAllConversationOfGhotokUser)
);

//api/v1/app/ghotok/user/report
ghotokRoute.post(
  "/user/report",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(createReportGhotokUser)
);

//api/v1/app/ghotok/user/reported
ghotokRoute.get(
  "/user/reported",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(allReportedGhotokUser)
);

//api/v1/app/ghotok/user/reported/:reportedId
ghotokRoute.get(
  "/user/reported/:reportedId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getSingleReportedGhotokUser)
);

//api/v1/app/ghotok/matching/users/conversations
ghotokRoute.get(
  "/matching/users/conversations",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getAllMatchingUsers)
);

//api/v1/app/ghotok/matching/users/conversations/:conversationId
ghotokRoute.get(
  "/matching/users/conversations/:conversationId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getMatchingUserConversationDetailsById)
);

//api/v1/app/ghotok/matching/payment/request/:messageId
ghotokRoute.get(
  "/matching/payment/request/:messageId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getMatchingPaymentRequestByMessageIdForGhotok)
);

//api/v1/app/ghotok/matching/payment
ghotokRoute.post(
  "/matching/payment",
  authorizeSystem([Role.GHOTOK]),
  uploadFileMiddleware(400, ["image/png", "image/jpeg", "image/jpg"]),
  asyncHandler(createMatchingPaymentForGhotok)
);

//api/v1/app/ghotok/matching/payment/bymessageid/:messageId
ghotokRoute.get(
  "/matching/payment/bymessageid/:messageId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getMatchingPaymentDetailsByMessageIdForGhotok)
);

//api/v1/app/ghotok/matched/users
ghotokRoute.get(
  "/matched/users",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getAllPaidMatchedGroomsForGhotok)
);

//api/v1/app/ghotok/chat/brides
ghotokRoute.get(
  "/chat/brides",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getAllGhotokBridesForChat)
);

//api/v1/app/ghotok/chat/brides/conversations/:brideId
ghotokRoute.get(
  "/chat/brides/conversations/:brideId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getAllConversationByGhotokBrideIdForChat)
);

//api/v1/app/ghotok/chat/grooms
ghotokRoute.get(
  "/chat/grooms",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getAllGhotokGroomsForChat)
);

//api/v1/app/ghotok/chat/grooms/conversations/:groomId
ghotokRoute.get(
  "/chat/grooms/conversations/:groomId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getAllConversationByGhotokGroomIdForChat)
);

//api/v1/app/ghotok/bride/publicId/:publicId
ghotokRoute.get(
  "/bride/publicId/:publicId",
  authorizeSystem([Role.GHOTOK]),
  asyncHandler(getBrideUserIdByProfileIdForGhotok)
);

export default ghotokRoute;
