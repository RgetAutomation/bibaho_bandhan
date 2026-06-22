"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Camera, CheckCircle2, ArrowLeft, TriangleAlert, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useUpdatingProfileStore } from "@/lib/updateProfileStore";
import { useCreateAccountStore } from "@/lib/createAccountStore";
import { usePasswordStore } from "@/lib/passwordStore";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/axiosInstance";
import { LoadingButton } from "@/components/loadingButton";
import { useTemporaryPhotoStore } from "@/lib/temporaryPhotoStore";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";

export default function Step9FaceVerify({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);

  const passwordStore = usePasswordStore();
  const accountStore = useCreateAccountStore();
  const profileStore = useUpdatingProfileStore();
  const { photos, clearPhotos } = useTemporaryPhotoStore();

  type CustomSignUpInput = Parameters<typeof authClient.signUp.email>[0] & {
    title: string;
    middleName?: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/face-models";
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
        toast.error("Failed to load face recognition models.");
      }
    };
    loadModels();
  }, []);

  const handleStartScan = () => {
    if (!modelsLoaded) {
      toast.error("Please wait for models to load...");
      return;
    }
    if (photos.length === 0) {
      toast.error("You must upload at least one profile photo to verify against.");
      onBack();
      return;
    }
    setIsScanning(true);
    setMatchError(null);
  };

  const getFaceDescriptor = async (imageElement: HTMLImageElement | HTMLCanvasElement) => {
    const detection = await faceapi.detectSingleFace(imageElement).withFaceLandmarks().withFaceDescriptor();
    return detection?.descriptor;
  };

  const createBlobImageElement = (blob: Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const createBase64ImageElement = (base64: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Failed to capture image.");
      return;
    }

    setIsMatching(true);
    setMatchError(null);

    try {
      // 1. Get descriptor for uploaded profile photo (photos[0])
      const profileImg = await createBlobImageElement(photos[0]);
      const profileDescriptor = await getFaceDescriptor(profileImg);

      if (!profileDescriptor) {
        setMatchError("No face detected in your uploaded profile photo. Please go back and upload a clearer photo.");
        setIsScanning(false);
        setIsMatching(false);
        return;
      }

      // 2. Get descriptor for live selfie
      const liveImg = await createBase64ImageElement(imageSrc);
      const liveDescriptor = await getFaceDescriptor(liveImg);

      if (!liveDescriptor) {
        setMatchError("No face detected in the live camera. Please look directly at the camera and ensure good lighting.");
        setIsMatching(false);
        return;
      }

      // 3. Compare faces
      const distance = faceapi.euclideanDistance(profileDescriptor, liveDescriptor);
      const threshold = 0.55; // Lower is stricter. 0.6 is default, 0.55 is recommended.

      if (distance < threshold) {
        setFaceVerified(true);
        setIsScanning(false);
        toast.success("Face Verification Successful!");
      } else {
        setMatchError("Face does not match the uploaded profile photo. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setMatchError("An error occurred during verification. Please try again.");
    } finally {
      setIsMatching(false);
    }
  }, [photos]);

  const handleFinalSubmit = async () => {
    if (!faceVerified) {
      toast.error("Please complete face verification first.");
      return;
    }
    if (!passwordStore.password) {
      toast.error("Session expired. Please start over.");
      router.replace("/account");
      return;
    }
    setLoading(true);
    try {
      const signUpResponse = await authClient.signUp.email({
        title: accountStore.gender === "MALE" ? "Mr." : "Miss",
        email: accountStore.email || "",
        name: accountStore.firstName || "",
        middleName: accountStore.middleName || "",
        lastName: accountStore.lastName || "",
        gender: (accountStore.gender as "MALE" | "FEMALE") || "MALE",
        phone: accountStore.mobile || "",
        password: passwordStore.password,
        username: accountStore.mobile || "",
        displayUsername: accountStore.mobile || "",
      } as CustomSignUpInput);

      if (signUpResponse.error) {
        toast.error(signUpResponse.error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      const profileResponse = await api.post("/users/profile/update", { ...profileStore }, { withCredentials: true });

      if (profileResponse.data.success || profileResponse.status === 200) {
        
        // Upload any profile photos if they exist
        if (photos.length > 0) {
          try {
            const formData = new FormData();
            photos.forEach((blob, i) => {
              formData.append("files", new File([blob], `gallery-${Date.now()}-${i}.jpg`, { type: "image/jpeg" }));
            });
            await api.post("/users/profile/update/images", formData, { withCredentials: true });
            clearPhotos();
          } catch (imgError) {
            console.error("Failed to upload profile photos during setup", imgError);
            toast.error("Account created, but profile photos failed to upload.");
          }
        }

        passwordStore.clearPassword();
        toast.success("Account created and profile fully completed!");
        router.replace("/users/home");
      } else {
        toast.error("Account created, but profile update failed.");
        router.replace("/users/home");
      }
    } catch (error) {
      const errorMessage = isAxiosError(error) ? error?.response?.data?.message || "Failed to complete setup" : "Failed to complete setup";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-card rounded-[2rem] shadow-sm border p-6 md:p-10">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Verify Your Identity</h2>
          <p className="text-muted-foreground text-sm">We require a quick face scan to ensure the authenticity of profiles and keep our community safe.</p>
        </div>

        {!faceVerified ? (
          isScanning ? (
            <div className="border border-border rounded-xl p-4 bg-secondary/10 space-y-4">
              <div className="relative w-full aspect-square md:aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover"
                />
                {isMatching && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
                    <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-medium">Matching faces...</span>
                  </div>
                )}
              </div>
              
              {matchError && (
                <div className="flex items-start gap-2 text-left bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs">
                  <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{matchError}</p>
                </div>
              )}

              <Button onClick={handleCapture} disabled={isMatching} className="w-full rounded-full">
                <Camera className="w-4 h-4 mr-2" /> 
                {isMatching ? "Processing..." : "Capture & Verify"}
              </Button>
              <Button onClick={() => setIsScanning(false)} variant="ghost" className="w-full rounded-full text-xs" disabled={isMatching}>
                Cancel Scan
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 bg-secondary/10 flex flex-col items-center">
              <Camera size={48} className="text-muted-foreground mb-4 opacity-50" />
              <Button onClick={handleStartScan} disabled={!modelsLoaded} className="rounded-full w-full" variant="outline">
                {modelsLoaded ? "Start Face Scan" : "Loading AI Models..."}
              </Button>
              {!modelsLoaded && <p className="text-[10px] text-muted-foreground mt-2 animate-pulse">Initializing verification system...</p>}
            </div>
          )
        ) : (
          <div className="border-2 border-green-300 bg-green-50 rounded-xl p-8">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <p className="font-medium text-green-600">Verification Successful!</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Button className="w-full rounded-full h-12 font-semibold" onClick={handleFinalSubmit} disabled={!faceVerified || loading}>
            {loading ? <LoadingButton title="Creating Account..." /> : "Finish & Create Account"}
          </Button>
          <p className="text-xs text-muted-foreground">Your account will only be created after this step is complete.</p>
          <Button type="button" variant="ghost" className="rounded-full" onClick={onBack} disabled={isScanning}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Photos
          </Button>
        </div>
      </div>
    </div>
  );
}
