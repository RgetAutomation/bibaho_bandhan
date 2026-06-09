import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createFeedback,
  createHelpRequest,
  getHelpRequestById,
  helpRequestSearch,
  updateHelpRequestFeedback,
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

export default othersRoute;
