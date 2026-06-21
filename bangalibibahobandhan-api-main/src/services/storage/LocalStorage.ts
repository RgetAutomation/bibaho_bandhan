import * as path from "path";
import * as fs from "fs";
import { IStorageService } from "./IStorageService.js";
import { randomUUID } from "crypto";

const BACKEND_URL = process.env.BETTER_AUTH_URL || "http://localhost:5000";

export class LocalStorage implements IStorageService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private buildKey(file: Express.Multer.File, folder?: string): string {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    return folder ? `${folder}/${filename}` : filename;
  }

  async upload(file: Express.Multer.File, folder?: string): Promise<string> {
    const key = this.buildKey(file, folder);
    const fullPath = path.join(this.uploadDir, key);
    
    // Ensure the folder exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, file.buffer);
    // Return full URL so Next.js <Image> can fetch it from the backend
    return `${BACKEND_URL}/${key}`;
  }

  async uploadMany(files: Express.Multer.File[], folder?: string): Promise<string[]> {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  async delete(fileUrl: string, folder?: string): Promise<void> {
    // fileUrl may be a full URL like "http://localhost:5000/images/avatars/uuid.jpg"
    // or a relative path like "/images/avatars/uuid.jpg"
    let relativePath = fileUrl;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      try {
        relativePath = new URL(fileUrl).pathname;
      } catch {
        return; // Invalid URL, skip
      }
    }
    // Remove leading slash
    const cleanPath = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
    const fullPath = path.join(this.uploadDir, cleanPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
