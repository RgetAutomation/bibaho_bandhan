"use client";

import { UserType } from "@/components/enum/userType";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/axiosInstance";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { LoadingButton } from "@/components/loadingButton";
import toast from "react-hot-toast";
import { compressImage } from "@/components/system/compressImage";
import ImagesUploadComponent from "@/components/ui-custom/imagesUploedComponent";
import AdvancedImageEditor from "@/components/ui-custom/advanced-image-editor";
import { associateTempState } from "@/components/system/db";
import { isRawOrPsdFile, extractEmbeddedJpeg } from "@/components/system/fileParsers";
import { useQuery } from "@tanstack/react-query";
import { fetchProfileImages } from "@/actions/users";
import { Camera, Trash2, TriangleAlert, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ApiErrorPage from "@/components/apiErrorPage";
import { IProfileImage } from "@/components/interface/IProfileImages";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { isAxiosError } from "axios";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function FinleProfilePage() {
  const maxImages = 100; // Effectively unlimited
  const { user, isPending, refetch: refetchSession } = useAuthSession();
  
  useEffect(() => {
    refetchSession(); // refresh session from server
  }, []);

  const userId = user?.id;
  const userType = user?.type as UserType;
  const userGender = user?.gender;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageForView, setSelectedImageForView] = useState<IProfileImage | null>(null);
  const [openImageView, setOpenImageView] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteImage, setDeleteImage] = useState<boolean>(false);
  const [isEditingGalleryImage, setIsEditingGalleryImage] = useState(false);
  const [isEditingProfileImage, setIsEditingProfileImage] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

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
    return (
      <div className="flex flex-1">
        <LoadingPage />
      </div>
    );
  }

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
        uploadFile = await compressImage(file, 5000);
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
        errorMessage = error.response.data?.message || "Something went wrong. Please try again.";
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
      const formData = new FormData();
      const filename = `gallery-${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: "image/jpeg" });
      
      let uploadFile: File = file;
      if (file.size > 10 * 1024 * 1024) {
        uploadFile = await compressImage(file, 5000);
      }
      formData.append("files", uploadFile);

      const uploadResponse = await api.post<AxiosResponse<string>>(
        "/users/profile/update/images",
        formData
      );

      if (uploadResponse.data.success) {
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

  if (user?.isProfileComplete !== true && !isLoading && !isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm flex flex-col px-4 py-8 rounded-2xl shadow-md border bg-card">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center p-4 bg-primary/10 rounded-full border">
              <TriangleAlert className="size-10 text-primary" />
            </div>
            <p className="text-xl font-semibold text-primary">Profile Incomplete</p>
            <p className="text-muted-foreground">Please complete your profile first.</p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/users/account">Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Common UI Sections
  const ProfilePictureSection = (
    <div className="md:bg-white md:dark:bg-zinc-900 md:border md:border-[#F0E8E8] md:dark:border-zinc-800 md:shadow-sm md:rounded-3xl overflow-hidden h-full flex flex-col">
      <div className="py-2 md:p-8 flex flex-col items-center flex-1">
        <div className="text-center space-y-1 md:space-y-2 mb-4 md:mb-8">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-zinc-100">Primary Photo</h1>
          <p className="hidden md:block text-sm text-gray-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
            This is the first photo people will see. Keep it clear and recent.
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-center justify-center w-full">
          <input
            type="file"
            accept="image/jpg, image/jpeg, image/png, .dng, .cr2, .nef, .arw, .raw, .psd"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedImage && (
            <div className="flex flex-col items-center gap-6 group relative">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl relative bg-gray-100 dark:bg-zinc-800 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10 before:absolute before:inset-[-10px] before:bg-rose-100/50 dark:before:bg-rose-900/20 before:rounded-full before:blur-xl before:-z-10 cursor-pointer" onClick={handleFileSelect}>
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
                  width={256}
                  height={256}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white/20 p-4 rounded-full text-white backdrop-blur-md shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Camera className="w-8 h-8" />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleFileSelect}
                variant="outline"
                className="rounded-full font-bold px-6 border-[#F0E8E8] dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 shadow-sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>
          )}
          
          {selectedImage && !croppedImageUrl && (
            <div className="w-full relative">
              <AdvancedImageEditor
                imageSrc={selectedImage}
                aspectRatio={4 / 5}
                onConfirm={handleCropAndUpload}
                onCancel={() => setSelectedImage(null)}
                isUploading={isUploading}
                title="Crop Avatar"
                fullScreen={true}
                mode="all"
                imageKey={`profile_temp_${userId}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderGallerySection = (scrollRef: React.RefObject<HTMLDivElement | null>) => (
    <div className="md:bg-white md:dark:bg-zinc-900 md:border md:border-[#F0E8E8] md:dark:border-zinc-800 md:shadow-sm md:rounded-3xl overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="py-2 md:p-8 flex-1 flex flex-col">
        <div className="flex flex-row items-center justify-between gap-2 md:gap-4 mb-4 pb-3 md:mb-6 md:pb-5 border-b border-[#F0E8E8] dark:border-zinc-800">
          <div className="space-y-0.5 md:space-y-1">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-zinc-100">Photo Gallery</h2>
            <p className="hidden md:block text-sm text-gray-500 dark:text-zinc-400 font-medium">
              Upload multiple photos to show your personality.
            </p>
          </div>
          <span className="bg-rose-50 dark:bg-[#9B1C31]/10 text-[#9B1C31] dark:text-[#E35269] text-[10px] md:text-xs font-bold px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full border border-rose-100 dark:border-[#9B1C31]/20 shrink-0 shadow-sm">
            {data?.profileImages?.length || 0} Photos
          </span>
        </div>

        {data?.profileImages && data.profileImages.length < maxImages && (
          <div className="mb-8">
            <ImagesUploadComponent refetch={refetch} />
          </div>
        )}

        {data?.profileImages && data.profileImages?.length > 0 ? (
          <div className="relative w-full group">
            {/* Left Scroll Arrow */}
            <button 
              onClick={() => scrollLeft(scrollRef)}
              className="absolute left-1 md:-left-2 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white/50 dark:bg-black/50 md:bg-white/80 dark:md:bg-zinc-800/80 backdrop-blur-sm md:shadow-md rounded-full text-gray-700 dark:text-zinc-200 active:scale-95 transition-all md:hover:bg-white md:hover:text-rose-500"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-7 h-7 pr-0.5 md:w-7 md:h-7 md:pr-0.5 drop-shadow-sm md:drop-shadow-none" />
            </button>

            <div 
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 w-full pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth pt-2"
            >
              {data.profileImages.map((file: IProfileImage) => (
                <div 
                  key={file.id} 
                  className="relative w-[45vw] sm:w-[180px] lg:w-[220px] shrink-0 aspect-[4/5] rounded-2xl overflow-hidden border border-[#F0E8E8] dark:border-zinc-800 shadow-sm cursor-pointer group bg-gray-50 dark:bg-zinc-800 snap-center" 
                  onClick={() => handleOpen(file)}
                >
                  <NextImage
                    src={file.url}
                    alt={file.id}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    width={300}
                    height={375}
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                    <span className="text-white text-xs font-bold bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      View & Edit
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Scroll Arrow */}
            <button 
              onClick={() => scrollRight(scrollRef)}
              className="absolute right-1 md:-right-2 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white/50 dark:bg-black/50 md:bg-white/80 dark:md:bg-zinc-800/80 backdrop-blur-sm md:shadow-md rounded-full text-gray-700 dark:text-zinc-200 active:scale-95 transition-all md:hover:bg-white md:hover:text-rose-500"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-7 h-7 pl-0.5 md:w-7 md:h-7 md:pl-0.5 drop-shadow-sm md:drop-shadow-none" />
            </button>
          </div>
        ) : (
          <div className="bg-[#FCFAF8] dark:bg-zinc-950 border border-dashed border-[#E5D0D0] dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center mt-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
              No gallery images uploaded yet.<br/> Add some to get noticed!
            </p>
          </div>
        )}

        {/* Immersive Lightbox Dialog */}
        {selectedImageForView && (
          <Dialog open={openImageView} onOpenChange={setOpenImageView}>
            <DialogContent aria-describedby={undefined} className="max-w-4xl p-0 bg-black/95 dark:bg-black/95 backdrop-blur-xl border-none overflow-hidden rounded-3xl shadow-2xl">
              <DialogTitle className="sr-only">Image Preview</DialogTitle>
              <div className="relative flex flex-col justify-center items-center w-full min-h-[50vh] max-h-[85vh]">
                <NextImage
                  src={selectedImageForView?.url as string}
                  alt={`Full view`}
                  width={800}
                  height={1000}
                  className="object-contain w-auto h-auto max-h-[85vh] transition-opacity duration-300"
                  priority
                />
                
                {/* Floating Actions */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
                  <Button
                    className="rounded-xl font-bold px-6 bg-white/10 hover:bg-white/20 text-white border-none"
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
                    className="rounded-xl font-bold px-6 bg-red-600/90 hover:bg-red-600 text-white border-none"
                    onClick={() => handleDeleteImage(selectedImageForView.id)}
                    disabled={deleteImage}
                  >
                    {deleteImage ? (
                      <LoadingButton title="Deleting..." />
                    ) : (
                      <>
                        <Trash2 className="mr-2 w-4 h-4" />
                        Delete
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
    </div>
  );

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-[#FCFAF8] dark:bg-zinc-950">
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
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">
          
          {/* Desktop Layout (Two Column) */}
          <div className="hidden lg:grid grid-cols-12 gap-8 max-w-[1400px] mx-auto w-full pb-10">
            {/* Sticky Sidebar */}
            <div className="col-span-4 h-full relative">
              <div className="sticky top-6">
                {ProfilePictureSection}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="col-span-8 flex flex-col">
              {renderGallerySection(desktopScrollRef)}
            </div>
          </div>

          {/* Mobile Layout (Tabs) */}
          <div className="block lg:hidden w-full max-w-xl mx-auto pb-10">
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="flex bg-gray-100/80 dark:bg-zinc-800/80 p-1 rounded-xl w-full shrink-0 shadow-inner z-10 relative mb-6 h-auto">
                <TabsTrigger 
                  value="profile" 
                  className="flex-1 text-center px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-700 data-[state=active]:text-[#E51E44] data-[state=active]:dark:text-rose-400 data-[state=active]:shadow-sm text-gray-500 dark:text-zinc-400 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:dark:hover:text-zinc-200"
                >
                  Profile Picture
                </TabsTrigger>
                <TabsTrigger 
                  value="gallery" 
                  className="flex-1 text-center px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-700 data-[state=active]:text-[#E51E44] data-[state=active]:dark:text-rose-400 data-[state=active]:shadow-sm text-gray-500 dark:text-zinc-400 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:dark:hover:text-zinc-200"
                >
                  Photo Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {ProfilePictureSection}
              </TabsContent>
              <TabsContent value="gallery" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderGallerySection(mobileScrollRef)}
              </TabsContent>
            </Tabs>
          </div>
          
        </div>
      )}
    </div>
  );
}
