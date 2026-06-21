"use client";

import {
  AlertCircleIcon,
  ImageIcon,
  Upload,
  UploadCloud,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import NextImage from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { compressImage } from "./helper/system/compressImage";
import { AxiosResponse } from "@/types/AxiosResponse";
import ButtonLoading from "./buttonLoading";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "./ui/cropper";
import { isAxiosError } from "axios";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImagesUploadComponent({
  userId,
  refetch,
}: {
  userId: string;
  refetch: () => void;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cropData, setCropData] = useState<CropArea | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const maxSizeMB = 5;
  // const maxSizeMB = 5;
  // const maxSize = maxSizeMB * 1024 * 1024; // 5MB default
  // const maxFiles = 3;

  // const [uploading, setUploading] = useState(false);

  // const [
  //   { files, isDragging, errors },
  //   {
  //     handleDragEnter,
  //     handleDragLeave,
  //     handleDragOver,
  //     handleDrop,
  //     openFileDialog,
  //     removeFile,
  //     getInputProps,
  //   },
  // ] = useFileUpload({
  //   accept: "image/png,image/jpeg,image/jpg",
  //   maxSize,
  //   multiple: true,
  //   maxFiles,
  // });

  // const handleUpload = async () => {
  //   if (!files.length)
  //     return toast("Please select a file first", { icon: <AlertCircleIcon /> });
  //   // compress all files in parallel
  //   const compressedFiles = await Promise.all(
  //     files.map(async (f) => {
  //       const originalFile = f.file as File;
  //       return originalFile.size > 150 * 1024 // 100kb
  //         ? await compressImage(originalFile, 150) // compress if bigger than maxSize
  //         : originalFile; // keep as is
  //     })
  //   );
  //   const formData = new FormData();
  //   compressedFiles.forEach((file) => {
  //     formData.append("files", file); // use "files" since it's multiple
  //   });

  //   try {
  //     setUploading(true);
  //     const res = await api.post<AxiosResponse<null>>(
  //       `/app/ghotok/users/profile/${userId}/images/upload`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     if (res.data?.success) {
  //       files.forEach((f) => {
  //         removeFile(f.id);
  //       });
  //       toast.success("Upload successful!");
  //       refetch();
  //     } else {
  //       toast.error("Upload failed, please try again.");
  //     }
  //   } catch (err) {
  //     console.error("Upload failed", err);
  //     toast.error("Upload failed");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setCroppedImageUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCropAndUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      // Create canvas to crop the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = async () => {
        // Set canvas size to crop area size
        canvas.width = cropData?.width || 0;
        canvas.height = cropData?.height || 0;

        // Draw cropped portion of image
        ctx?.drawImage(
          img,
          cropData?.x || 0,
          cropData?.y || 0,
          cropData?.width || 0,
          cropData?.height || 0,
          0,
          0,
          cropData?.width || 0,
          cropData?.height || 0
        );

        // Convert canvas to blob
        canvas.toBlob(
          async (blob) => {
            if (!blob) return;

            try {
              const filename = `image-${new Date().getTime()}.jpg`;
              const file = new File([blob], filename, { type: "image/jpeg" });
              const compressedImage = await compressImage(file, 150);

              const formData = new FormData();
              formData.append("files", compressedImage);

              const response = await api.post<AxiosResponse<string>>(
                `/app/ghotok/users/profile/${userId}/images/upload`,
                formData
              );

              if (response.data.success) {
                const imageUrl = response.data.data;
                setCroppedImageUrl(imageUrl);
                setSelectedImage(null);
                toast.success("Image uploaded successfully");
                refetch();
              } else {
                toast.error(response.data.message);
              }
            } catch (error) {
              const errorMessage = isAxiosError(error)
                ? error.response?.data?.message || "Failed to upload image"
                : "Something went wrong. Please try again.";
              toast.error(errorMessage);
            } finally {
              setIsUploading(false);
            }
          },
          "image/jpeg",
          0.9
        );
      };

      img.crossOrigin = "anonymous";
      img.src = selectedImage;
    } catch (error) {
      console.error("Crop error:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedImage && (
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div
            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <ImageIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
          <p className="text-muted-foreground text-xs">
            PNG, JPG or JPEG (max. {maxSizeMB}MB)
          </p>
          <Button className="mt-4 rounded-full" onClick={handleFileSelect}>
            <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
            Select images
          </Button>
        </div>
      )}

      {selectedImage && !croppedImageUrl && (
        <div className="flex w-full flex-col gap-4">
          <Cropper
            className="h-80 w-full rounded-2xl"
            image={selectedImage}
            onCropChange={(area) => {
              setCropData((prev) => {
                if (
                  !prev ||
                  prev.x !== area?.x ||
                  prev.y !== area.y ||
                  prev.width !== area.width ||
                  prev.height !== area.height
                ) {
                  return area;
                }
                return prev;
              });
            }}
          >
            <CropperDescription />
            <CropperImage />
            <CropperCropArea />
          </Cropper>
          <div className="grid w-full grid-cols-2 gap-3">
            <Button
              onClick={handleFileSelect}
              variant={"outline"}
              className="rounded-full"
            >
              {selectedImage ? (
                "Change Image"
              ) : (
                <>
                  <Upload />
                  Select Image
                </>
              )}
            </Button>
            {selectedImage && (
              <Button
                onClick={handleCropAndUpload}
                disabled={isUploading}
                className="rounded-full"
              >
                {isUploading ? (
                  <ButtonLoading text="Uploading..." />
                ) : (
                  "Crop & Upload"
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
