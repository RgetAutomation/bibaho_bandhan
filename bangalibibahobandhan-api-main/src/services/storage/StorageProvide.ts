// src/services/storage/index.js
import { IStorageService } from "./IStorageService.js";
import { CloudinaryStorage } from "./CloudinaryStorage.js";
import { AppwriteStorage } from "./AppwriteStorage.js";
import { GarageStorage } from "./GarageStorage.js";
import { LocalStorage } from "./LocalStorage.js";

let storageProvider: IStorageService;

if (process.env.STORAGE_PROVIDER === "garage") {
  storageProvider = new GarageStorage();
} else if (process.env.STORAGE_PROVIDER === "appwrite") {
  storageProvider = new AppwriteStorage();
} else {
  storageProvider = new LocalStorage();
}

export default storageProvider;
