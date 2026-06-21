import express from "express";
import { authorize } from "../middlewares/authorize.middleware.js";
import { UserType } from "../types/user-type.js";
import {
  acceptInterest,
  activateFreePlan,
  allReceivedInterests,
  allSentInterests,
  blockUser,
  changeContactDetails,
  claimDiscountedPlan,
  connectionRequestReject,
  createGhotokReview,
  createMatchingPayment,
  createSubscriptionPayment,
  deleteBlockedData,
  deleteImage,
  deleteInterest,
  getAllBlockedUsers,
  getAllImages,
  getAllPublicProfile,
  getAllReportedUsers,
  getAllSubscriptionPayment,
  getAllUsers,
  getBrideUserIdByProfileId,
  getConversation,
  getConversationDetails,
  getGhotokById,
  getHelpCenterTeam,
  getMessages,
  getOrCreateUserSuperAdminConversation,
  getOrCreateUserTeamConversation,
  getPaymentIdByMessageId,
  getPlanById,
  getPlans,
  getPublicProfile,
  getSelfDetails,
  getSingleReportedUsers,
  getUserById,
  getUserMatchingPaymentDetailsByMessageId,
  getUserMatchingPaymentDetailsByPaymentId,
  getUserMatchingPaymentRequestByMessageId,
  getUserPaymentsById,
  getUserTeamConversationAndMessages,
  isProfileCompleted,
  isUserSessionActive,
  markAsRead,
  reportProfile,
  sendInterest,
  sendMessage,
  updateProfile,
  updateProfileAvatar,
  uploadImages,
  getVipProfiles,
  getMySubscriptions,
} from "../controllers/user.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadFileMiddleware,
  uploadMultipleFileMiddleware,
} from "../middlewares/fileupload.middleware.js";

///api/v1/users
const userRoute = express.Router();

//********************* PROFILE ROUTES START *************************  */

//api/v1/users/session
userRoute.get(
  "/session",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(isUserSessionActive)
);

//api/v1/users/profiles
userRoute.get(
  "/profiles",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getAllUsers)
);

//api/v1/users/vip-profiles
userRoute.get(
  "/vip-profiles",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getVipProfiles)
);

//api/v1/users/profile/:id/view
userRoute.get(
  "/profile/:id/view",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getUserById)
);

//api/v1/users/profile/self
userRoute.get(
  "/profile/self",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getSelfDetails)
);

//api/v1/users/me/subscriptions
userRoute.get(
  "/me/subscriptions",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getMySubscriptions)
);

//api/v1/users/profile/update
userRoute.post(
  "/profile/update",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(updateProfile)
);

//api/v1/users/profile/update/avatar
userRoute.post(
  "/profile/update/avatar",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  uploadFileMiddleware(20480, ["image/png", "image/jpeg", "image/jpg"]),
  asyncHandler(updateProfileAvatar)
);

//api/v1/users/profile/update/images
userRoute.get(
  "/profile/update/images",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getAllImages)
);

//api/v1/users/profile/update/images
userRoute.post(
  "/profile/update/images",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  uploadMultipleFileMiddleware(100, 20480, [
    "image/png",
    "image/jpeg",
    "image/jpg",
  ]),
  asyncHandler(uploadImages)
);

//api/v1/users/profile/:imageId/image
userRoute.delete(
  "/profile/:imageId/image",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(deleteImage)
);

//api/v1/users/profile/update/contact
userRoute.post(
  "/profile/update/contact",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(changeContactDetails)
);

//api/v1/users/profile/complete/status
userRoute.get(
  "/profile/complete/status",
  authorize([UserType.PAID_USER, UserType.FREE_USER]),
  asyncHandler(isProfileCompleted)
);

//api/v1/users/payments/subscription
userRoute.get(
  "/payments/subscription",
  authorize([UserType.PAID_USER, UserType.FREE_USER]),
  asyncHandler(getAllSubscriptionPayment)
);

//api/v1/users/public/profile
userRoute.get("/public/profiles", asyncHandler(getPublicProfile));

//api/v1/users/public/profile
userRoute.get("/public/profiles/all", asyncHandler(getAllPublicProfile));

//********************* PROFILE ROUTES END *************************  */

// ********************* FRIEND REQUEST ROUTES START *************************  */

//api/v1/users/connection/interests/received
userRoute.get(
  "/connection/interests/received",
  authorize([UserType.PAID_USER]),
  allReceivedInterests
);

//api/v1/users/connection/interests/sent
userRoute.get(
  "/connection/interests/sent",
  authorize([UserType.PAID_USER]),
  allSentInterests
);

//api/v1/users/connection/send
userRoute.post(
  "/connection/send",
  authorize([UserType.PAID_USER]),
  asyncHandler(sendInterest)
);

//api/v1/users/connection/accept
userRoute.post(
  "/connection/accept",
  authorize([UserType.PAID_USER]),
  acceptInterest
);

//api/v1/users/connection/reject
userRoute.post(
  "/connection/reject",
  authorize([UserType.PAID_USER]),
  connectionRequestReject
);

//api/v1/users/connection/delete
userRoute.post(
  "/connection/delete",
  authorize([UserType.PAID_USER]),
  deleteInterest
);

// ********************* FRIEND REQUEST ROUTES END *************************  */

//********************* CHAT ROUTES START *************************  */

//api/v1/users/conversations
userRoute.get(
  "/conversations",
  authorize([UserType.PAID_USER]),
  getConversation
);

//api/v1/users/conversations/:conversationId/details
userRoute.get(
  "/conversations/:conversationId/details",
  authorize([UserType.PAID_USER]),
  asyncHandler(getConversationDetails)
);

//api/v1/users/conversations/:conversationId/messages
userRoute.get(
  "/conversations/:conversationId/messages",
  authorize([UserType.PAID_USER]),
  asyncHandler(getMessages)
);

//api/v1/users/message/send
userRoute.post(
  "/message/send",
  authorize([UserType.PAID_USER]),
  asyncHandler(sendMessage)
);

//api/v1/users/message/read
userRoute.post(
  "/message/read",
  authorize([UserType.PAID_USER]),
  asyncHandler(markAsRead)
);

//********************* CHAT ROUTES END *************************  */

//********************* BLOCK USER ROUTES START *************************  */

//api/v1/users/blocked
userRoute.get(
  "/blocked",
  authorize([UserType.PAID_USER]),
  asyncHandler(getAllBlockedUsers)
);

//api/v1/users/:id/block
userRoute.get(
  "/:id/block",
  authorize([UserType.PAID_USER]),
  asyncHandler(blockUser)
);

//api/v1/users/:id/block
userRoute.delete(
  "/:id/block",
  authorize([UserType.PAID_USER]),
  asyncHandler(deleteBlockedData)
);

//********************* BLOCK USER ROUTES END *************************  */

//********************* PLANS ROUTES START *************************  */

//api/v1/users/plans
userRoute.get("/plans", asyncHandler(getPlans));

//api/v1/users/plans/:id
userRoute.get("/plans/:id", asyncHandler(getPlanById));

//api/v1/users/plans/activate-free
userRoute.post("/plans/activate-free", authorize([UserType.FREE_USER, UserType.PAID_USER]), asyncHandler(activateFreePlan));

//api/v1/users/plans/claim-discounted
userRoute.post("/plans/claim-discounted", authorize([UserType.FREE_USER, UserType.PAID_USER]), asyncHandler(claimDiscountedPlan));

//********************* PLANS ROUTES END *************************  */

/***************** SUBSCRIPTION ROUTES START ********************  */

//api/v1/users/payment/subscription
userRoute.post(
  "/payment/subscription",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  uploadFileMiddleware(400, ["image/png", "image/jpeg", "image/jpg"]),
  asyncHandler(createSubscriptionPayment)
);

//api/v1/users/payment/subscription/:id/view"
userRoute.get(
  "/payment/subscription/:id/view",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getUserPaymentsById)
);

//api/v1/users/payment/matching/request/:messageId"
userRoute.get(
  "/payment/matching/request/:messageId",
  authorize([UserType.PAID_USER]),
  asyncHandler(getUserMatchingPaymentRequestByMessageId)
);

//api/v1/users/payment/matching"
userRoute.post(
  "/payment/matching",
  authorize([UserType.PAID_USER]),
  uploadFileMiddleware(400, ["image/png", "image/jpeg", "image/jpg"]),
  asyncHandler(createMatchingPayment)
);

//api/v1/users/payment/matching/bypaymentid/:paymentId"
userRoute.get(
  "/payment/matching/bypaymentid/:paymentId",
  authorize([UserType.PAID_USER]),
  asyncHandler(getUserMatchingPaymentDetailsByPaymentId)
);

//api/v1/users/payment/matching/bymessageid/:messageId"
userRoute.get(
  "/payment/matching/bymessageid/:messageId",
  authorize([UserType.PAID_USER]),
  asyncHandler(getUserMatchingPaymentDetailsByMessageId)
);

/***************** SUBSCRIPTION ROUTES END ********************  */

//api/v1/users/helpcenter/team
userRoute.get(
  "/helpcenter/team",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getHelpCenterTeam)
);

//api/v1/users/user/team/:teamId/conversation
userRoute.get(
  "/user/team/:teamId/conversation",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getOrCreateUserTeamConversation)
);

//api/v1/users/user/team/conversation/:convId/details
userRoute.get(
  "/user/team/conversation/:convId/details",
  authorize([UserType.FREE_USER, UserType.PAID_USER]),
  asyncHandler(getUserTeamConversationAndMessages)
);

//api/v1/users/ghotok/profile/:id
userRoute.get(
  "/ghotok/profile/:id",
  authorize([UserType.PAID_USER]),
  asyncHandler(getGhotokById)
);

//api/v1/users/ghotok/review
userRoute.post(
  "/ghotok/review",
  authorize([UserType.PAID_USER, UserType.FREE_USER]),
  asyncHandler(createGhotokReview)
);

//api/v1/users/profile/report/all
userRoute.get(
  "/profile/report/all",
  authorize([UserType.PAID_USER, UserType.FREE_USER]),
  asyncHandler(getAllReportedUsers)
);

//api/v1/users/profile/report/:reportedId
userRoute.get(
  "/profile/report/:reportedId",
  authorize([UserType.PAID_USER, UserType.FREE_USER]),
  asyncHandler(getSingleReportedUsers)
);

//api/v1/users/profile/report
userRoute.post(
  "/profile/report",
  authorize([UserType.PAID_USER]),
  uploadFileMiddleware(20480, ["image/png", "image/jpeg", "image/jpg"]),
  asyncHandler(reportProfile)
);

//api/v1/users/user/sa/conversation
userRoute.get(
  "/user/sa/conversation",
  authorize([UserType.PAID_USER]),
  asyncHandler(getOrCreateUserSuperAdminConversation)
);

//api/v1/users/bride/publicId/:publicId
userRoute.get(
  "/bride/publicId/:publicId",
  authorize([UserType.PAID_USER]),
  asyncHandler(getBrideUserIdByProfileId)
);

//api/v1/users/payment/:messageId
userRoute.get(
  "/payment/:messageId",
  authorize([UserType.PAID_USER, UserType.FREE_USER]),
  asyncHandler(getPaymentIdByMessageId)
);

export default userRoute;
