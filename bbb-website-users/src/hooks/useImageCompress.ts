"use client";

import { compressImage } from "@/components/system/compressImage";
import { useCallback, useState } from "react";

export type FileMetadata = {
  name: string;
  size: number;
  type: string;
  url: string;
  id: string;
};

export type FileWithPreview = {
  file: File | FileMetadata;
  id: string;
  preview?: string;
};

export function useImagesCompress(
  requiredFileSizeKB = 500,
  maxFiles = 3,
  maxSizeMB = 20
) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onChange = async (incomingFiles: File[]) => {
    // Limit number of files
    const selected = incomingFiles.slice(0, maxFiles);

    const processedFiles: FileWithPreview[] = [];

    for (const file of selected) {
      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }

      // Compress big files first
      const compressed =
        file.size > 500 * 1024 // >500KB
          ? await compressImage(file, requiredFileSizeKB) // compress before preview
          : file;

      // Create preview URL
      const preview = URL.createObjectURL(compressed);

      processedFiles.push({
        file: compressed,
        id: generateUniqueId(compressed),
        preview,
      });
    }

    setFiles(processedFiles);
  };

  const generateUniqueId = useCallback((file: File | FileMetadata): string => {
    if (file instanceof File) {
      return `${file.name}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    }
    return file.id;
  }, []);

  return {
    files,
    onChange,
    setFiles,
  };
}

export async function imageCompress(
  incomingFile: File,
  requiredFileSizeKB = 500,
  maxSizeMB = 20
) {
  // Validate size
  if (incomingFile.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  // Compress big files first
  const compressed =
    incomingFile.size > 500 * 1024 // >500KB
      ? await compressImage(incomingFile, requiredFileSizeKB) // compress before preview
      : incomingFile;

  // Create preview URL
  const preview = URL.createObjectURL(compressed);

  return {
    file: compressed,
    id: generateUniqueId(compressed),
    preview,
  };
}

const generateUniqueId = (file: File | FileMetadata): string => {
  if (file instanceof File) {
    return `${file.name}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }
  return file.id;
};
