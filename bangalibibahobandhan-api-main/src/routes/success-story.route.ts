import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getSuccessStories,
  getAllSuccessStoriesAdmin,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory
} from "../controllers/success-story.controller.js";
import { authorizeSystem } from "../middlewares/authorize.middleware.js";
import { Role } from "../types/roles.js";

const successStoryRoute = express.Router();

// Public route to get active stories
successStoryRoute.get("/", asyncHandler(getSuccessStories));

// Admin routes (requires SuperAdmin auth)
successStoryRoute.get("/admin/all", authorizeSystem([Role.SUPERADMIN]), asyncHandler(getAllSuccessStoriesAdmin));
successStoryRoute.post("/admin", authorizeSystem([Role.SUPERADMIN]), asyncHandler(createSuccessStory));
successStoryRoute.patch("/admin/:id", authorizeSystem([Role.SUPERADMIN]), asyncHandler(updateSuccessStory));
successStoryRoute.delete("/admin/:id", authorizeSystem([Role.SUPERADMIN]), asyncHandler(deleteSuccessStory));

export default successStoryRoute;
