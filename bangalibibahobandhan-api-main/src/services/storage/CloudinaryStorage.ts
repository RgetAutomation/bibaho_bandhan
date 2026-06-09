// src/services/storage/CloudinaryStorage.js
import { v2 as cloudinary } from "cloudinary";
import { IStorageService } from "./IStorageService.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export class CloudinaryStorage implements IStorageService {
  async upload(file: Express.Multer.File, folder?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "auto", folder }, (err, result) => {
          if (err || !result) return reject(err);
          resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }

  async uploadMany(
    files: Express.Multer.File[],
    folder?: string
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  async delete(fileUrl: string, folder?: string): Promise<void> {
    const publicId = fileUrl.split("/").pop()?.split(".")[0];
    if (publicId) await cloudinary.uploader.destroy(`${folder}/${publicId}`);
  }
}
