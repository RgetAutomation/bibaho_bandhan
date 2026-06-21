"use client";

import { ImageIcon, UploadCloud, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import api from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { compressImage } from "../system/compressImage";
import { isAxiosError } from "axios";
import NextImage from "next/image";
import { AxiosResponse } from "@/types/AxiosResponse";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import ButtonLoading from "@/components/buttonLoading";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ScreenshotUploadForPaidMatching({
  userId,
  messageId,
}: {
  userId: string;
  messageId: string;
}) {
  const maxSizeMB = 5; // 5MB
  const [isUploading, setIsUploading] = useState(false);
  const [paymentPersonName, setPaymentPersonName] = useState("");
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cropData, setCropData] = useState<CropArea | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleCrop = () => {
    if (!cropData || !selectedImage) {
      toast.error("No crop data or image selected");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast.error("Canvas not supported");
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = async () => {
        try {
          const { x, y, width, height } = cropData;

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                toast.error("Failed to crop image");
                return;
              }

              try {
                const file = new File([blob], `cropped-${Date.now()}.jpg`, {
                  type: "image/jpeg",
                });

                const compressed = await compressImage(file, 100);
                // 🔹 revoke old preview (memory safe)
                if (previewUrl) URL.revokeObjectURL(previewUrl);

                // 🔹 create new preview
                const objectUrl = URL.createObjectURL(compressed);

                setPreviewUrl(objectUrl);
                setCroppedImage(compressed);
              } catch (err) {
                console.error(err);
                toast.error("Image compression failed");
              }
            },
            "image/jpeg",
            0.9
          );
        } catch (err) {
          console.error(err);
          toast.error("Cropping failed");
        }
      };

      img.onerror = () => {
        toast.error("Failed to load image");
      };

      img.src = selectedImage;
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while cropping");
    }
  };

  const handleUpload = async () => {
    if (!croppedImage) {
      toast.error("No cropped image to upload");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", croppedImage);
      formData.append("messageId", messageId);
      formData.append("paymentName", paymentPersonName);
      formData.append("userId", userId);
      const response = await api.post<AxiosResponse<string>>(
        "/app/ghotok/matching/payment",
        formData
      );

      if (response.data.success) {
        toast.success("Upload successful!");
        router.push(`/dashboard/ghotok/matching/payment/success/${messageId}`);
      } else {
        toast.error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);

      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Upload failed"
        : "Something went wrong. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset previous state
      setSelectedImage(null);
      setCroppedImage(null);
      setCropData(null);

      // Validate type
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      // Validate size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        toast.error(`Image must be smaller than ${maxSizeMB}MB`);
        return;
      }

      const reader = new FileReader();

      reader.onload = (ev) => {
        if (!ev.target?.result) return;
        setSelectedImage(ev.target.result as string);
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while selecting image");
    } finally {
      // allow re-selecting same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* EMPTY STATE */}
        {!selectedImage && (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div className="bg-background mb-2 flex size-11 items-center justify-center rounded-full border">
              <ImageIcon className="size-4 opacity-60" />
            </div>

            <p className="mb-1.5 text-sm font-medium">Drop your image here</p>
            <p className="text-muted-foreground text-xs">
              PNG, JPG or JPEG (max. {maxSizeMB}MB)
            </p>

            <Button className="mt-4 rounded-full" onClick={handleFileSelect}>
              <UploadIcon className="-ms-1 opacity-60" />
              Select image
            </Button>
          </div>
        )}

        {/* CROPPER */}
        {selectedImage && !croppedImage && (
          <div className="flex w-full flex-col gap-4">
            <Cropper
              className="h-80 w-full rounded-2xl"
              cropPadding={20}
              aspectRatio={9 / 16}
              image={selectedImage}
              onCropChange={(area) => {
                if (!area) return;
                setCropData((prev) =>
                  !prev ||
                  prev.x !== area.x ||
                  prev.y !== area.y ||
                  prev.width !== area.width ||
                  prev.height !== area.height
                    ? area
                    : prev
                );
              }}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>

            <div className="grid w-full grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleFileSelect}
              >
                Change Image
              </Button>

              <Button
                onClick={handleCrop}
                disabled={isUploading || !cropData}
                className="rounded-full"
              >
                {isUploading ? "Processing..." : "Crop Image"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD FORM */}
      {croppedImage && (
        <div className="mt-2 flex flex-col gap-3">
          {croppedImage && previewUrl && (
            <div className="mt-3 flex justify-center">
              <NextImage
                width={900}
                height={1600}
                src={previewUrl}
                alt="Cropped Preview"
                className="max-h-64 rounded-xl border object-contain"
              />
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="name">
              <div>
                Please provide the name of the account holder from whose bank
                account you sent us the money. / অনুগ্রহ করে সেই অ্যাকাউন্টধারীর
                নাম জানান, যার ব্যাংক অ্যাকাউন্ট থেকে আপনি আমাদের টাকা
                পাঠিয়েছেন।
                <span className="text-destructive pl-2">*</span>
              </div>
            </FieldLabel>

            <Input
              id="name"
              value={paymentPersonName}
              onChange={(e) => setPaymentPersonName(e.target.value)}
              placeholder="Bank account holder's name"
              autoComplete="off"
            />
          </Field>

          <Button
            onClick={handleUpload}
            disabled={isUploading || !paymentPersonName.trim()}
            className="w-full"
          >
            {isUploading ? (
              <ButtonLoading text="Uploading" />
            ) : (
              <>
                <UploadCloud className="me-1 size-4" />
                Upload Screenshot
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
