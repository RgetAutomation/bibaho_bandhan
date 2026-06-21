import imageCompression from "browser-image-compression";

export async function compressImage(
  file: File,
  maxSizeKB: number
): Promise<File> {
  const options = {
    maxSizeMB: maxSizeKB / 1024,
    maxWidthOrHeight: 1200, // 🔥 IMPORTANT (resize large images)
    useWebWorker: true,
    fileType: "image/jpeg", // 🔥 convert PNG → JPEG
    initialQuality: 0.7, // 🔥 strong compression
  };

  try {
    const compressedFile = await imageCompression(file, options);

    return new File([compressedFile], file.name.replace(/\.\w+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.error("Image compression error:", err);
    throw err;
  }
}

// export async function compressImage(
//   file: File,
//   maxSizeKB: number
// ): Promise<File> {
//   const options = {
//     maxSizeMB: maxSizeKB / 1024, // target max size in MB
//     maxWidthOrHeight: undefined, // do not force dimension, preserves ratio
//     useWebWorker: true,
//   };

//   try {
//     const compressedFile = await imageCompression(file, options);
//     return compressedFile;
//   } catch (err) {
//     console.error("Image compression error:", err);
//     throw err;
//   }
// }
