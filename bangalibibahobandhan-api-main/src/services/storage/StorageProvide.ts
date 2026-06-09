// src/services/storage/index.js
import { IStorageService } from "./IStorageService.js";
import { CloudinaryStorage } from "./CloudinaryStorage.js";
import { AppwriteStorage } from "./AppwriteStorage.js";
import { GarageStorage } from "./GarageStorage.js";

let storageProvider: IStorageService;

if (process.env.STORAGE_PROVIDER === "garage") {
  storageProvider = new GarageStorage();
} else {
  storageProvider = new AppwriteStorage();
}

export default storageProvider;
