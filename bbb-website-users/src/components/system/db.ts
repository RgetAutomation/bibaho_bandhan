const DB_NAME = "ImageEditorDB";
const STORE_NAME = "imageStates";
const DB_VERSION = 1;

export interface ImageState {
  originalBlob: Blob;
  settings: {
    brightness: number;
    contrast: number;
    saturation: number;
    grayscale: number;
    sepia: number;
    blur: number;
    hueRotate: number;
    zoom: number;
    flipH: boolean;
    flipV: boolean;
    resizeWidth: string;
    resizeHeight: string;
    lockAspectRatio: boolean;
    sharpness: number;
    exposure: number;
    redBalance: number;
    greenBalance: number;
    blueBalance: number;
    skinSmoothing?: number;
    teethWhitening?: number;
    faceSlimming?: number;
    eyeEnhancement?: number;
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImageState(key: string, originalBlob: Blob, settings: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ originalBlob, settings }, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB save error:", error);
  }
}

export async function getImageState(key: string): Promise<ImageState | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB get error:", error);
    return null;
  }
}

export async function associateTempState(tempKey: string, newKey: string): Promise<void> {
  try {
    const state = await getImageState(tempKey);
    if (state) {
      await saveImageState(newKey, state.originalBlob, state.settings);
      // Clean up temporary state
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(tempKey);
    }
  } catch (error) {
    console.error("IndexedDB association error:", error);
  }
}
