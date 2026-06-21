import imageCompression from "browser-image-compression";

export async function compressImage(
  file: File,
  maxSizeKB: number
): Promise<File> {
  const options = {
    maxSizeMB: maxSizeKB / 1024, // target max size in MB
    maxWidthOrHeight: undefined, // do not force dimension, preserves ratio
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (err) {
    console.error("Image compression error:", err);
    throw err;
  }
}
