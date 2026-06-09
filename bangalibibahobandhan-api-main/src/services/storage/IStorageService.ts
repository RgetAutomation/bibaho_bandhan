// src/services/storage/IStorageService.ts
export interface IStorageService {
  upload(file: Express.Multer.File, folder?: string): Promise<string>; // folder optional
  uploadMany(files: Express.Multer.File[], folder?: string): Promise<string[]>;
  delete(fileUrl: string, folder?: string): Promise<void>;
}
