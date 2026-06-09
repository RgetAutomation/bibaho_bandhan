import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import * as path from "path";
import { IStorageService } from "./IStorageService.js";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class GarageStorage implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    this.publicBaseUrl = process.env.GARAGE_PUBLIC_URL!; // e.g. http://localhost:3900/my-bucket

    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT!, // e.g. http://localhost:3900
      region: "garage", // any non-empty string
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true, // required for Garage / non-AWS S3
    });
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private buildKey(file: Express.Multer.File, folder?: string): string {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    return folder ? `${folder}/${filename}` : filename;
  }

  private buildUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }

  private extractKey(fileUrl: string, folder?: string): string {
    // Strip base URL to get the S3 key
    const key = fileUrl.replace(`${this.publicBaseUrl}/`, "");
    return key;
  }

  private async getFileUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: "uploads",
      Key: key,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: 3600, // 1 hour
    });

    return url;
  }

  // ─── interface implementation ────────────────────────────────────────────────

  async upload(file: Express.Multer.File, folder?: string): Promise<string> {
    const key = this.buildKey(file, folder);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || "image/jpeg",
        ContentLength: file.size,
      })
    );

    return this.buildUrl(key);
  }

  async uploadMany(
    files: Express.Multer.File[],
    folder?: string
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  async delete(fileUrl: string, folder?: string): Promise<void> {
    const key = this.extractKey(fileUrl, folder);

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}
