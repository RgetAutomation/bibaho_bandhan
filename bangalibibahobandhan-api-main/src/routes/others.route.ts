import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createFeedback,
  createHelpRequest,
  getHelpRequestById,
  helpRequestSearch,
  updateHelpRequestFeedback,
  getHelpRequestMessages,
  sendGuestHelpMessage,
  reopenHelpRequest,
} from "../controllers/others.controller.js";

const othersRoute = express.Router();

//api/v1/other/feedback
othersRoute.post("/feedback", asyncHandler(createFeedback));

//api/v1/other/help/request
othersRoute.post("/help/request", asyncHandler(createHelpRequest));

//api/v1/other/help/request/search
othersRoute.post("/help/request/search", asyncHandler(helpRequestSearch));

//api/v1/other/help/request/:requestId
othersRoute.get("/help/request/:requestId", asyncHandler(getHelpRequestById));

//api/v1/other/help/request/feedback
othersRoute.post(
  "/help/request/feedback",
  asyncHandler(updateHelpRequestFeedback)
);

//api/v1/other/help/request/:requestId/messages
othersRoute.get(
  "/help/request/:requestId/messages",
  asyncHandler(getHelpRequestMessages)
);

//api/v1/other/help/request/:requestId/messages
othersRoute.post(
  "/help/request/:requestId/messages",
  asyncHandler(sendGuestHelpMessage)
);

//api/v1/other/help/request/:requestId/reopen
othersRoute.patch(
  "/help/request/:requestId/reopen",
  asyncHandler(reopenHelpRequest)
);

export default othersRoute;
