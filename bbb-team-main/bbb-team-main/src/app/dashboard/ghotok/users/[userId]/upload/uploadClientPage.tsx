"use client";

import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import api from "@/lib/axiosInstance";
import NextImage from "next/image";
import React, { useState } from "react";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import ApiErrorPage from "@/components/apiErrorPage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isAxiosError } from "axios";
import { AxiosResponse } from "@/types/AxiosResponse";
import ButtonLoading from "@/components/buttonLoading";
import { getGhotokAlreadySavedUserData } from "@/actions/ghotok";
import { IGhotokUserProfileImage } from "@/components/interface/ghotok/IGhotokUserStatus";
import ImagesUploadComponent from "@/components/imagesUploedComponent";
import { compressImage } from "@/components/helper/system/compressImage";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function UserImageUploadClient({
  userId,
  gender,
}: {
  userId: string;
  gender: string;
}) {
  const maxImages = 2;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageForView, setSelectedImageForView] =
    useState<IGhotokUserProfileImage | null>(null);
  const [openImageView, setOpenImageView] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteImage, setDeleteImage] = useState<boolean>(false);
  const [cropData, setCropData] = useState<CropArea | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["getGhotokAlreadySaveUserData", userId],
    queryFn: () => getGhotokAlreadySavedUserData(userId),
  });

  const handleOpen = (file: IGhotokUserProfileImage) => {
    setSelectedImageForView(file);
    setOpenImageView(true);
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
              const filename = `profile-${userId}.jpg`;
              const file = new File([blob], filename, { type: "image/jpeg" });
              const compressedImage = await compressImage(file, 100);

              const formData = new FormData();
              formData.append("file", compressedImage);
              const response = await api.post<AxiosResponse<string>>(
                `/app/ghotok/users/profile/${userId}/avatar`,
                formData
              );

              if (response.data.success) {
                const imageUrl = response.data.data;
                setCroppedImageUrl(imageUrl);
                setSelectedImage(null);
                toast.success("Image uploaded successfully");
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

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setSelectedImage(ev.target?.result as string);
          setCroppedImageUrl(null);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDeleteImage = async (imageId: string) => {
    setDeleteImage(true);
    try {
      const response = await api.delete<AxiosResponse<string>>(
        `/app/ghotok/users/profile/${userId}/image/${imageId}`
      );
      if (response.data.success) {
        setOpenImageView(false);
        //setSelectedImageForView(null);
        refetch();
        toast.success("Image deleted successfully");
      } else {
        toast.error("Image delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
    setDeleteImage(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      {isLoading ? (
        <LoadingPage />
      ) : error ? (
        <div className="flex flex-1 items-center justify-center">
          <ApiErrorPage
            title={"Failed to load data"}
            description={"We could not load the images for you."}
          />
        </div>
      ) : data?.isProfileComplete !== true ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="bg-card flex w-full max-w-sm flex-col rounded-2xl border px-4 py-8 shadow-md">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="bg-primary/10 flex items-center justify-center rounded-full border p-4">
                <TriangleAlert className="text-primary size-10" />
              </div>
              <p className="text-primary text-xl font-semibold">
                Profile Incomplete
              </p>
              <p className="text-muted-foreground">
                Please complete your profile first.
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href={`/dashboard/ghotok/users/${userId}/complete`}>
                  Complete Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-4 overflow-y-auto p-4 lg:flex-row">
          <div className="bg-card flex flex-1 flex-col space-y-6 rounded-2xl border p-6 shadow-md">
            {/* Title */}
            <div className="space-y-1 pb-3">
              <h1 className="text-primary text-lg font-semibold">
                Upload Profile Photos
              </h1>
              <p className="text-muted-foreground w-4/5 text-sm text-wrap">
                Add clear and recent photos of yourself to make your profile
                stand out.
              </p>
            </div>

            {!selectedImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <div className="outline-primary/90 h-32 w-32 overflow-hidden rounded-full outline-4 outline-offset-4">
                      <NextImage
                        src={
                          croppedImageUrl
                            ? croppedImageUrl
                            : data?.avatar
                              ? data?.avatar
                              : gender.toUpperCase() === "MALE"
                                ? "/groom.webp"
                                : "/bride.webp"
                        }
                        alt="Cropped profile"
                        className="h-full w-full object-cover"
                        width={100}
                        height={100}
                      />
                    </div>
                    <Button
                      onClick={handleFileSelect}
                      variant={"outline"}
                      className="mt-2 rounded-full"
                    >
                      {selectedImage ? "Change Image" : "Select Image"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                  <CropperCropArea className="rounded-full" />
                </Cropper>
                <div className="grid w-full grid-cols-2 gap-3">
                  <Button
                    onClick={handleFileSelect}
                    variant={"outline"}
                    className="rounded-full"
                  >
                    {selectedImage ? "Change Image" : "Select Image"}
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
                        "Crop and Upload"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-1 py-2">
                <h1 className="text-primary text-lg font-semibold">Gallery</h1>
                <p className="text-primary font-semibold">
                  {data.profileImages.length} / {maxImages}
                </p>
              </div>
              {data.profileImages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 rounded-2xl border p-4 sm:grid-cols-2 md:grid-cols-3">
                  {data.profileImages.map((file: IGhotokUserProfileImage) => (
                    <NextImage
                      key={file.id}
                      src={file.url}
                      alt={file.id}
                      className="h-full w-full cursor-pointer rounded-2xl object-cover"
                      width={100}
                      height={100}
                      priority
                      onClick={() => handleOpen(file)}
                    />
                  ))}

                  {selectedImageForView && (
                    <Dialog
                      open={openImageView}
                      onOpenChange={setOpenImageView}
                    >
                      <DialogContent className="bg-background max-w-3xl p-0">
                        <DialogHeader className="flex items-center justify-between border-b p-3">
                          <DialogTitle className="text-lg font-semibold">
                            Image Preview
                          </DialogTitle>
                        </DialogHeader>

                        <div className="bg-muted flex max-h-[80vh] flex-col items-center justify-center overflow-auto p-4">
                          <NextImage
                            src={selectedImageForView?.url as string}
                            alt={`Full view of ${
                              selectedImageForView?.id as string
                            }`}
                            width={1000}
                            height={1000}
                            className="h-auto max-h-[75vh] w-auto object-contain"
                            priority
                          />
                          <div className="w-full px-5 pt-4">
                            <Button
                              className="w-full rounded-full"
                              variant={"destructive"}
                              onClick={() =>
                                handleDeleteImage(selectedImageForView.id)
                              }
                              disabled={deleteImage}
                            >
                              {deleteImage ? (
                                <ButtonLoading text="Deleting..." />
                              ) : (
                                <>
                                  <Trash2 className="dark:text-primary" />
                                  <span>Delete Image</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground rounded-2xl border p-8 text-center">
                  No images uploaded yet.
                </p>
              )}
            </div>
            {data.profileImages.length < maxImages && (
              <ImagesUploadComponent refetch={refetch} userId={userId} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
