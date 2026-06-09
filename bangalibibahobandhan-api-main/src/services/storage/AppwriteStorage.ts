// src/services/storage/VpsStorage.js
import fs from "fs";
import path from "path";
import { IStorageService } from "./IStorageService.js";
import { Client, Storage, ID } from "node-appwrite";
import { randomUUID } from "crypto";
import { InputFile } from "node-appwrite/file";

export const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

export class AppwriteStorage implements IStorageService {
  private bucketId = process.env.APPWRITE_BUCKET_ID!;
  private fileId = randomUUID();

  async upload(file: Express.Multer.File, folder?: string): Promise<string> {
    // ✅ create file name with folder
    const ext = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${this.fileId}.${ext}`;
    const fullPath = folder ? `${folder}/${fileName}` : fileName;

    const result = await storage.createFile({
      bucketId: this.bucketId,
      fileId: ID.unique(),
      file: InputFile.fromBuffer(file.buffer, fullPath),
      permissions: ['read("any")'],
    });

    return `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${result.$id}/view?project=bangalibibahobandhan`;
  }

  async uploadMany(
    files: Express.Multer.File[],
    folder?: string
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  async delete(fileUrl: string, folder?: string): Promise<void> {
    const fileId = fileUrl?.split("/files/")[1]?.split("/")[0];
    await storage.deleteFile({
      bucketId: this.bucketId,
      fileId: fileId as string,
    });
  }
}
