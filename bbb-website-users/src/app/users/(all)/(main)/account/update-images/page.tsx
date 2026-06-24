"use client";

import { UserType } from "@/components/enum/userType";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import api from "@/lib/axiosInstance";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { LoadingButton } from "@/components/loadingButton";
import toast from "react-hot-toast";
import { compressImage } from "@/components/system/compressImage";
import DashboardHeader from "@/components/dashboard/header";
import ImagesUploadComponent from "@/components/ui-custom/imagesUploedComponent";
import AdvancedImageEditor from "@/components/ui-custom/advanced-image-editor";
import { associateTempState } from "@/components/system/db";
import { isRawOrPsdFile, extractEmbeddedJpeg } from "@/components/system/fileParsers";
import { useQuery } from "@tanstack/react-query";
import { fetchProfileImages } from "@/actions/users";
import { Trash2, TriangleAlert, Upload } from "lucide-react";
import Link from "next/link";
import ApiErrorPage from "@/components/apiErrorPage";
import { IProfileImage } from "@/components/interface/IProfileImages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isAxiosError } from "axios";
import { useAuthSession } from "@/hooks/useAuthSession";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function FinleProfilePage() {
  const maxImages = 100; // Effectively unlimited
  const { user, isPending, refetch: refetchSession } = useAuthSession();
  useEffect(() => {
    refetchSession(); // << refresh session from server
  }, []);

  const userId = user?.id;
  const userType = user?.type as UserType;
  const userGender = user?.gender;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageForView, setSelectedImageForView] =
    useState<IProfileImage | null>(null);
  const [openImageView, setOpenImageView] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteImage, setDeleteImage] = useState<boolean>(false);
  const [isEditingGalleryImage, setIsEditingGalleryImage] = useState(false);
  const [isEditingProfileImage, setIsEditingProfileImage] = useState(false);
  const [editorMode, setEditorMode] = useState<"crop" | "filter">("crop");
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [cropData, setCropData] = useState<CropArea | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["fetchProfileImages"],
    queryFn: fetchProfileImages,
    enabled: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPending) {
    // Render a consistent placeholder to avoid SSR/client mismatch
    return (
      <div className="flex flex-1">
        <LoadingPage />
      </div>
    );
  }

  // allowed for free users as well

  const handleOpen = (file: IProfileImage) => {
    setSelectedImageForView(file);
    setIsEditingGalleryImage(false);
    setOpenImageView(true);
  };

  const handleCropAndUpload = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const filename = `profile-${userId}.jpg`;
      const file = new File([blob], filename, { type: "image/jpeg" });
      
      let uploadFile: File = file;
      if (file.size > 10 * 1024 * 1024) {
        uploadFile = await compressImage(file, 5000); // Compress to 5MB if > 10MB
      }

      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await api.post<AxiosResponse<string>>(
        "/users/profile/update/avatar",
        formData,
      );

      if (response.data.success) {
        const imageUrl = response.data.data;
        if (imageUrl) {
          await associateTempState(`profile_temp_${userId}`, imageUrl);
        }
        setCroppedImageUrl(imageUrl);
        setSelectedImage(null);
        toast.success("Profile image updated successfully");
        refetchSession();
      } else {
        toast.error("Profile image update failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Profile image update failed";
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message
          ? error.response.data.message
          : "Something went wrong. Please try again.";
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile image must be less than 5MB");
      return;
    }

    if (isRawOrPsdFile(file.name)) {
      try {
        const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
        const jpegBlob = extractEmbeddedJpeg(buffer);
        if (jpegBlob) {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(jpegBlob);
          });
          setSelectedImage(dataUrl);
          setCroppedImageUrl(null);
          setIsEditingProfileImage(false);
          return;
        } else {
          toast.error(`Could not extract preview from RAW/PSD file: ${file.name}`);
        }
      } catch (err) {
        console.error(err);
        toast.error(`Error reading RAW/PSD file: ${file.name}`);
      }
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setCroppedImageUrl(null);
      setIsEditingProfileImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = async (imageId: string) => {
    setDeleteImage(true);
    try {
      const response = await api.delete<AxiosResponse<string>>(
        `/users/profile/${imageId}/image`,
      );
      if (response.data.success) {
        setOpenImageView(false);
        setSelectedImageForView(null);
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

  const handleEditGalleryImage = async (blob: Blob) => {
    if (!selectedImageForView) return;
    setIsGalleryUploading(true);
    try {
      // 1. Upload new image first
      const formData = new FormData();
      const filename = `gallery-${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: "image/jpeg" });
      
      let uploadFile: File = file;
      if (file.size > 10 * 1024 * 1024) {
        uploadFile = await compressImage(file, 5000); // Compress to 5MB if > 10MB
      }
      formData.append("files", uploadFile);

      const uploadResponse = await api.post<AxiosResponse<string>>(
        "/users/profile/update/images",
        formData
      );

      if (uploadResponse.data.success) {
        // 2. Delete old image
        await api.delete(`/users/profile/${selectedImageForView.id}/image`);
        
        const newUrl = Array.isArray(uploadResponse.data.data) 
          ? uploadResponse.data.data[0] 
          : uploadResponse.data.data;
          
        if (newUrl) {
          await associateTempState(selectedImageForView.url, newUrl);
        }

        setOpenImageView(false);
        setIsEditingGalleryImage(false);
        setSelectedImageForView(null);
        refetch();
        toast.success("Image updated successfully");
      } else {
        toast.error("Failed to update image");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsGalleryUploading(false);
    }
  };

  if (
    user?.isProfileComplete !== true &&
    !isLoading &&
    !isPending
  ) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm flex flex-col px-4 py-8 rounded-2xl shadow-md border bg-card">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center p-4 bg-primary/10 rounded-full border">
              <TriangleAlert className="size-10 text-primary" />
            </div>
            <p className="text-xl font-semibold text-primary">
              Profile Incomplete
            </p>
            <p className="text-muted-foreground">
              Please complete your profile first.
            </p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/users/account">Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden">

      {isLoading || isPending ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingPage />
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center">
          <ApiErrorPage
            title={"Failed to load data"}
            description={"We could not load the images for you."}
          />
        </div>
      ) : (
        <div className="flex flex-col flex-1 p-4 md:p-8 gap-6 overflow-y-auto bg-[#FCFAF8] dark:bg-zinc-950">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
            
            {/* Primary Profile Picture Card */}
            <div className="bg-white dark:bg-zinc-900 border border-[#F0E8E8] dark:border-zinc-800 shadow-sm rounded-3xl overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                
                {/* Left Side: Info */}
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <h1 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100">
                    Profile Picture
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                    This is the first photo people will see. We recommend using a clear, recent face photo to make your profile stand out and receive more interests.
                  </p>
                </div>

                {/* Right Side: Upload Control */}
                <div className="shrink-0 flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/jpg, image/jpeg, image/png, .dng, .cr2, .nef, .arw, .raw, .psd"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!selectedImage && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-36 md:w-40 h-auto aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg relative bg-gray-100 dark:bg-zinc-800 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10 group">
                        <NextImage
                          src={
                            croppedImageUrl
                              ? croppedImageUrl
                              : user?.image
                                ? user.image
                                : userGender === "MALE"
                                  ? "/groom.webp"
                                  : "/bride.webp"
                          }
                          alt="Profile Picture"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          width={160}
                          height={200}
                        />
                      </div>
                      <Button
                        onClick={handleFileSelect}
                        className="rounded-full bg-[#9B1C31] hover:bg-[#801426] text-white font-bold px-6 shadow-sm h-auto py-2.5"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  )}
                  {selectedImage && !croppedImageUrl && (
                    <AdvancedImageEditor
                      imageSrc={selectedImage}
                      aspectRatio={4 / 5}
                      onConfirm={handleCropAndUpload}
                      onCancel={() => setSelectedImage(null)}
                      isUploading={isUploading}
                      title="Edit Profile Image"
                      fullScreen={true}
                      mode="all"
                      imageKey={`profile_temp_${userId}`}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Photo Gallery Card */}
            <div className="bg-white dark:bg-zinc-900 border border-[#F0E8E8] dark:border-zinc-800 shadow-sm rounded-3xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#F0E8E8] dark:border-zinc-800">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100">Photo Gallery</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
                      Add more photos to show your personality and lifestyle.
                    </p>
                  </div>
                  <span className="bg-rose-50 dark:bg-[#9B1C31]/10 text-[#9B1C31] dark:text-[#E35269] text-xs font-bold px-3.5 py-1.5 rounded-full border border-rose-100 dark:border-[#9B1C31]/20 shrink-0">
                    {data?.profileImages?.length || 0} Photos Uploaded
                  </span>
                </div>

                {data?.profileImages && data.profileImages?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                    {data.profileImages.map((file: IProfileImage) => (
                      <div 
                        key={file.id} 
                        className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[#F0E8E8] dark:border-zinc-800 shadow-xs cursor-pointer group bg-gray-50 dark:bg-zinc-800" 
                        onClick={() => handleOpen(file)}
                      >
                        <NextImage
                          src={file.url}
                          alt={file.id}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          width={300}
                          height={300}
                          priority
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                    ))}

                    {/* Single Dialog for all images */}
                    {selectedImageForView && (
                      <Dialog
                        open={openImageView}
                        onOpenChange={setOpenImageView}
                      >
                        <DialogContent className="max-w-3xl p-0 bg-white dark:bg-zinc-900 overflow-hidden rounded-3xl">
                          <DialogHeader className="flex justify-between items-center p-4 border-b border-[#F0E8E8] dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50">
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                              Image Preview
                            </DialogTitle>
                          </DialogHeader>

                          <div className="flex flex-col justify-center items-center bg-[#FCFAF8] dark:bg-zinc-950 p-6 max-h-[80vh] overflow-auto">
                            <div className="relative rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5 dark:ring-white/10">
                              <NextImage
                                src={selectedImageForView?.url as string}
                                alt={`Full view of ${selectedImageForView?.id as string}`}
                                width={800}
                                height={800}
                                className="object-contain max-h-[65vh] w-auto h-auto"
                                priority
                              />
                            </div>
                            
                            <div className="w-full max-w-md pt-8 flex gap-3">
                              <Button
                                className="flex-1 rounded-xl font-bold py-5 h-auto bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingGalleryImage(true);
                                  setOpenImageView(false);
                                }}
                                disabled={deleteImage}
                              >
                                Edit Photo
                              </Button>
                              <Button
                                className="flex-1 rounded-xl font-bold py-5 h-auto bg-red-600 hover:bg-red-700 text-white border-none shadow-sm shadow-red-600/20"
                                onClick={() => handleDeleteImage(selectedImageForView.id)}
                                disabled={deleteImage}
                              >
                                {deleteImage ? (
                                  <LoadingButton title="Deleting..." />
                                ) : (
                                  <>
                                    <Trash2 className="mr-2 w-4 h-4" />
                                    <span>Delete Image</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Full screen editor for existing gallery images */}
                    {isEditingGalleryImage && selectedImageForView && (
                      <AdvancedImageEditor
                        imageSrc={selectedImageForView.url}
                        onConfirm={handleEditGalleryImage}
                        onCancel={() => {
                          setIsEditingGalleryImage(false);
                          setOpenImageView(true);
                        }}
                        title="Edit Gallery Image"
                        isUploading={isGalleryUploading}
                        fullScreen={true}
                        mode="all"
                        imageKey={selectedImageForView.url}
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-[#FCFAF8] dark:bg-zinc-950 border border-dashed border-[#E5D0D0] dark:border-zinc-800 rounded-2xl p-10 text-center mb-8">
                    <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
                      No gallery images uploaded yet. Add some to get noticed!
                    </p>
                  </div>
                )}

                {data?.profileImages && data.profileImages.length < maxImages && (
                  <div className="pt-6 border-t border-[#F0E8E8] dark:border-zinc-800">
                    <h3 className="text-sm font-extrabold text-gray-800 dark:text-zinc-200 mb-4">Upload New Photos</h3>
                    <ImagesUploadComponent refetch={refetch} />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
