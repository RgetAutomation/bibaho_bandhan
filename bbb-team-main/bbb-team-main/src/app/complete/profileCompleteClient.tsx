"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Check, Image as ImageIcon } from "lucide-react";
import { updateTeamProfileSchema } from "@/schema/updateTeamProfileSchema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subYears } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import ButtonLoading from "@/components/buttonLoading";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import NextImage from "next/image";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import { compressImage } from "@/components/helper/system/compressImage";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ProfileCompleteClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [cropData, setCropData] = useState<CropArea | null>(null);
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof updateTeamProfileSchema>>({
    resolver: zodResolver(updateTeamProfileSchema),
    defaultValues: {
      dob: subYears(new Date(), 18),
      addressLine1: "",
      addressLine2: "",
      postOffice: "",
      policeStation: "",
      dist: "",
      state: "",
      pinCode: "",
      identification: "",
    },
  });

  const handleCheckStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await api.get<AxiosResponse<string>>(
        "/auth/system/profile/update/request"
      );
      if (response.data.success) {
        router.push("/complete/" + response.data.data);
      } else {
        toast.error(response.data.message);
        setCheckingStatus(false);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to check status"
        : "Something went wrong. Please try again later.";
      toast.error(errorMessage);
      setCheckingStatus(false);
    }
  };

  const handleCropAndCompress = async () => {
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
              const compressedImage = await compressImage(file, 150);
              setCompressedImage(compressedImage);
              setCroppedImageUrl(URL.createObjectURL(compressedImage));
              setSelectedImage(null);
            } catch (error) {
              console.error("Upload error:", error);
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

  async function onSubmit(data: z.infer<typeof updateTeamProfileSchema>) {
    try {
      setLoading(true);
      const compressedDoc = await compressImage(data.identification[0], 500);
      const formData = new FormData();
      formData.append("profileImage", compressedImage as File);
      formData.append("identificationProof", compressedDoc as File);
      formData.append("dob", (data.dob as Date).toISOString());
      formData.append("addressLine1", data.addressLine1);
      formData.append("addressLine2", data.addressLine2 || "");
      formData.append("postOffice", data.postOffice);
      formData.append("policeStation", data.policeStation);
      formData.append("dist", data.dist);
      formData.append("state", data.state);
      formData.append("pinCode", data.pinCode);

      const response = await api.post<AxiosResponse<string>>(
        "/auth/system/profile/update/request",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("response", response);
      if (response.data.success) {
        toast.success(response.data.message);
        router.push("/complete/" + response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit profile. Please try again.");
    }
    setLoading(false);
  }

  //handleCheckStatus();

  return (
    <div className="flex h-screen w-full flex-1 flex-col md:min-h-min">
      <h1 className="mx-auto mt-2 p-5 text-2xl font-bold">Update Profile</h1>
      <div className="flex w-full flex-col gap-4 p-5">
        <div className="bg-card mx-auto max-w-sm rounded-2xl border shadow-lg md:max-w-lg lg:max-w-2xl">
          <div className="bg-muted/30 flex items-center justify-between gap-4 rounded-xl border p-5 shadow-sm">
            <div className="flex flex-col">
              <h3 className="text-primary text-lg font-semibold">
                Profile Status Notice
              </h3>
              <p className="text-muted-foreground text-sm">
                If your profile has already been verified by our team and this
                page is still showing, please log out and log back in to refresh
                your account status.
              </p>
            </div>
            <Button
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/auth/login");
                    },
                  },
                })
              }
              className="rounded-full px-6"
              variant="destructive"
            >
              Logout
            </Button>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-5"
            >
              <h1 className="border-b pb-5 text-2xl font-bold">
                Complete Profile
              </h1>
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Date of birth <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover
                      open={openIndex === 0}
                      onOpenChange={(isOpen) => setOpenIndex(isOpen ? 0 : null)}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd-MM-yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          //onSelect={field.onChange}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(new Date(date));
                              setOpenIndex(null);
                            }
                          }}
                          disabled={(date) =>
                            date > new Date(subYears(new Date(), 18)) ||
                            date < new Date("1900-01-01")
                          }
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Enter Your date of birth as per your Aadhar Card
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 items-start justify-start gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Village, Colony, Street{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Village, Colony, Street"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appartment, House, Floor</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Appartment, House, Floor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postOffice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Post Office <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Post Office"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="policeStation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Police Station{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Police Station"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        District <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter district"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        State <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter state"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pinCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Pincode <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter pincode"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        ID Proof <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormDescription>
                        Aadhaar / Voter / PAN / Driving License / Passport
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="bg-card space-y-6 rounded-2xl border p-6 shadow-md">
                {/* Title */}
                <div className="space-y-1 pb-3">
                  <h1 className="text-primary text-lg font-semibold">
                    Select Profile Image
                  </h1>
                  <p className="text-muted-foreground w-4/5 text-sm text-wrap">
                    Please upload a clear image of your face to verify your
                    identity.
                  </p>
                </div>

                {!selectedImage && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="outline-primary/90 h-32 w-32 overflow-hidden rounded-full outline-4 outline-offset-4">
                      <NextImage
                        src={croppedImageUrl ? croppedImageUrl : "/groom.webp"}
                        alt="Cropped profile"
                        className="h-full w-full object-cover"
                        width={100}
                        height={100}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleFileSelect}
                      className="mt-2 rounded-full"
                    >
                      {croppedImageUrl ? (
                        "Change Image"
                      ) : (
                        <>
                          <ImageIcon className="mr-1 h-4 w-4" />
                          Upload Image
                        </>
                      )}
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
                      <CropperCropArea className="rounded-full" />
                    </Cropper>
                    <div className="grid w-full grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={handleFileSelect}
                        variant={"outline"}
                        className="rounded-full"
                      >
                        {selectedImage ? "Change Image" : "Select Image"}
                      </Button>
                      {selectedImage && (
                        <Button
                          type="button"
                          onClick={handleCropAndCompress}
                          disabled={isUploading}
                          className="rounded-full"
                        >
                          {isUploading ? (
                            <ButtonLoading text="Cropping" />
                          ) : (
                            "Crop Image"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex w-full justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <ButtonLoading text="Please wait" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Submit Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <div className="mx-auto flex w-full items-center justify-center gap-3 p-4">
          <span>Already submitted?</span>
          <Button
            className="rounded-full"
            variant={"outline"}
            disabled={checkingStatus}
            onClick={handleCheckStatus}
          >
            {checkingStatus ? (
              <ButtonLoading text="Please wait" />
            ) : (
              <span> View Status</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
