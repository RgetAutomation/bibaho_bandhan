"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function uploadCroppedImage(base64Data: string, userId: string) {
  try {
    // Remove the data URL prefix (data:image/jpeg;base64,)
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, "base64");

    // Create images directory if it doesn't exist
    const imagesDir = join(process.cwd(), "public", "images");
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    // Generate unique filename
    //const timestamp = Date.now();
    const filename = `profile-${userId}.jpg`;
    const filepath = join(imagesDir, filename);

    // Write file to disk
    await writeFile(filepath, imageBuffer);

    // Return the public URL
    const imageUrl = `/images/${filename}`;

    return {
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "Failed to upload image",
      imageUrl: null,
    };
  }
}
