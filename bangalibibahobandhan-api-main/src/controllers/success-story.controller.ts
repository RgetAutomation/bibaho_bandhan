import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Public: Get all active success stories
export const getSuccessStories = async (req: Request, res: Response) => {
  try {
    const stories = await prisma.successStory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin: Get all success stories (including inactive)
export const getAllSuccessStoriesAdmin = async (req: Request, res: Response) => {
  try {
    const stories = await prisma.successStory.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin: Create a new success story
export const createSuccessStory = async (req: Request, res: Response) => {
  try {
    const { title, image, text, isActive } = req.body;
    if (!title || !image || !text) {
      return res.status(400).json({ success: false, message: "Title, image and text are required" });
    }
    const story = await prisma.successStory.create({
      data: {
        title,
        image,
        text,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin: Update a success story
export const updateSuccessStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, image, text, isActive } = req.body;
    
    const story = await prisma.successStory.update({
      where: { id },
      data: { title, image, text, isActive },
    });
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin: Delete a success story
export const deleteSuccessStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.successStory.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
