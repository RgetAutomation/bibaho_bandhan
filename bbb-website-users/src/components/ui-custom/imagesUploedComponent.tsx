"use client";

import { ImageIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { AxiosResponse } from "../interface/AxiosResponse";
import api from "@/lib/axiosInstance";
import { compressImage } from "../system/compressImage";
import { isAxiosError } from "axios";
import { LoadingButton } from "../loadingButton";
import AdvancedImageEditor from "./advanced-image-editor";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { associateTempState } from "../system/db";
import { isRawOrPsdFile, extractEmbeddedJpeg } from "../system/fileParsers";

export default function ImagesUploadComponent({
  refetch,
  onCustomUpload,
}: {
  refetch: () => void;
  onCustomUpload?: (blobs: Blob[]) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editQueue, setEditQueue] = useState<string[]>([]);
  const [editKeys, setEditKeys] = useState<string[]>([]);
  const [processedBlobs, setProcessedBlobs] = useState<Blob[]>([]);
  const maxSizeMB = 5;

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newQueue: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File ${file.name} is larger than ${maxSizeMB}MB and will be skipped.`);
        continue;
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
            newQueue.push(dataUrl);
            continue;
          } else {
            toast.error(`Could not extract preview from RAW/PSD file: ${file.name}`);
          }
        } catch (err) {
          console.error(err);
          toast.error(`Error reading RAW/PSD file: ${file.name}`);
        }
      }

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
      newQueue.push(dataUrl);
    }
    
    setEditQueue(newQueue);
    setEditKeys(newQueue);
    setProcessedBlobs([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadProcessedBlobs = async (blobs: Blob[]) => {
    setIsUploading(true);
    try {
      if (onCustomUpload) {
        await onCustomUpload(blobs);
        toast.success(`${blobs.length} image(s) processed successfully!`);
        setIsUploading(false);
        setEditQueue([]);
        setEditKeys([]);
        setProcessedBlobs([]);
        return;
      }

      const formData = new FormData();
      
      for (let i = 0; i < blobs.length; i++) {
        const file = new File([blobs[i]], `gallery-${Date.now()}-${i}.jpg`, { type: "image/jpeg" });
        
        let uploadFile: File = file;
        if (file.size > 10 * 1024 * 1024) {
          uploadFile = await compressImage(file, 5000); // Compress to 5MB if > 10MB
        }
        formData.append("files", uploadFile);
      }

      const response = await api.post<AxiosResponse<any>>(
        "/users/profile/update/images",
        formData
      );

      if (response.data.success) {
        toast.success(`${blobs.length} image(s) uploaded successfully!`);
        
        // Associate states from temp keys to the newly generated URLs
        const newUrls = response.data.data;
        if (newUrls) {
          const urlsArray = Array.isArray(newUrls) ? newUrls : [newUrls];
          for (let i = 0; i < Math.min(urlsArray.length, editKeys.length); i++) {
            await associateTempState(editKeys[i], urlsArray[i]);
          }
        }
        refetch();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to upload images"
        : "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setEditQueue([]);
      setEditKeys([]);
      setProcessedBlobs([]);
    }
  };

  const applySettingsToImage = (src: string, settings: any): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }
        
        const mapValue = (val: number, points: { x: number; y: number }[]): number => {
          const sorted = [...points].sort((a, b) => a.x - b.x);
          if (val <= sorted[0].x) return sorted[0].y;
          if (val >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].y;
          for (let i = 0; i < sorted.length - 1; i++) {
            const p1 = sorted[i];
            const p2 = sorted[i + 1];
            if (val >= p1.x && val <= p2.x) {
              const ratio = (val - p1.x) / (p2.x - p1.x);
              return p1.y + ratio * (p2.y - p1.y);
            }
          }
          return val;
        };

        const getChannelLUT = (channel: 'r' | 'g' | 'b') => {
          let lift = 0; let gamma = 0; let gain = 0;
          if (channel === 'r') {
            lift = settings.shadowsR || 0;
            gamma = settings.midtonesR || 0;
            gain = settings.highlightsR || 0;
          } else if (channel === 'g') {
            lift = settings.shadowsG || 0;
            gamma = settings.midtonesG || 0;
            gain = settings.highlightsG || 0;
          } else {
            lift = settings.shadowsB || 0;
            gamma = settings.midtonesB || 0;
            gain = settings.highlightsB || 0;
          }

          const samples = 16;
          const table = [];
          for (let i = 0; i < samples; i++) {
            const x = i / (samples - 1);
            const inputVal = x * 255;
            const y = mapValue(inputVal, settings.curvesPoints || [{ x: 0, y: 0 }, { x: 128, y: 128 }, { x: 255, y: 255 }]) / 255;
            const liftOffset = (lift / 100) * (1 - y);
            const gainOffset = (gain / 100) * y;
            const gammaOffset = (gamma / 100) * Math.sin(Math.PI * y);
            const finalVal = Math.max(0, Math.min(1, y + liftOffset + gainOffset + gammaOffset));
            table.push(finalVal.toFixed(3));
          }
          return table.join(" ");
        };

        const presetCSS = (() => {
          switch (settings.presetFilter) {
            case "vivid": return "saturate(140%) contrast(110%)";
            case "vintage": return "sepia(40%) contrast(85%) hue-rotate(-10deg) saturate(90%)";
            case "bw": return "grayscale(100%) contrast(110%)";
            case "hdr": return "saturate(120%) contrast(115%) brightness(105%)";
            default: return "";
          }
        })();

        const svgFilters = `url(#sharpen-filter) url(#color-balance-filter) url(#exposure-filter) url(#soft-focus-filter) url(#teeth-whitening-filter) url(#eye-enhancement-filter) url(#curves-filter-r) url(#curves-filter-g) url(#curves-filter-b) url(#creative-blur-filter) ${settings.presetFilter === 'cartoon' ? 'url(#cartoon-filter)' : ''} ${settings.presetFilter === 'sketch' ? 'url(#sketch-filter)' : ''}`;
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) grayscale(${settings.grayscale}%) sepia(${settings.sepia}%) blur(${settings.blur}px) hue-rotate(${settings.hueRotate}deg) ${presetCSS} ${svgFilters}`;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale((1 - (settings.faceSlimming || 0) * 0.001) * (settings.flipH ? -1 : 1), settings.flipV ? -1 : 1);

        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Blob extraction failed"));
        }, "image/jpeg", 0.9);
      };
      img.onerror = () => reject(new Error("Image load failed"));
    });
  };

  const handleApplyToAll = async (settings: any) => {
    setIsUploading(true);
    const toastId = toast.loading("Processing remaining images...");
    try {
      const blobs = [...processedBlobs];
      // Process remaining queue
      for (const src of editQueue) {
        const blob = await applySettingsToImage(src, settings);
        blobs.push(blob);
      }
      toast.dismiss(toastId);
      await uploadProcessedBlobs(blobs);
    } catch (err) {
      toast.dismiss(toastId);
      console.error(err);
      toast.error("Batch processing failed");
      setIsUploading(false);
    }
  };

  const handleEditorConfirm = (blob: Blob) => {
    const newProcessedBlobs = [...processedBlobs, blob];
    setProcessedBlobs(newProcessedBlobs);
    
    const remainingQueue = editQueue.slice(1);
    setEditQueue(remainingQueue);

    if (remainingQueue.length === 0) {
      uploadProcessedBlobs(newProcessedBlobs);
    }
  };

  const handleEditorCancel = () => {
    setEditQueue([]);
    setEditKeys([]);
    setProcessedBlobs([]);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, .dng, .cr2, .nef, .arw, .raw, .psd"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center px-4 py-3 text-center border-2 border-dashed rounded-2xl bg-muted/30">
        <div
          className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
          aria-hidden="true"
        >
          <ImageIcon className="size-4 opacity-60" />
        </div>
        <p className="mb-1.5 text-sm font-medium">Select multiple images</p>
        <p className="text-muted-foreground text-xs">
          PNG, JPG or JPEG (max. {maxSizeMB}MB per file)
        </p>
        {isUploading ? (
          <Button className="rounded-full mt-4" disabled>
            <LoadingButton title="Uploading..." />
          </Button>
        ) : (
          <Button className="rounded-full mt-4" onClick={handleFileSelect}>
            <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
            Select images
          </Button>
        )}
      </div>

      {editQueue.length > 0 && (
        <AdvancedImageEditor
          imageSrc={editQueue[0]}
          onConfirm={handleEditorConfirm}
          onCancel={handleEditorCancel}
          fullScreen={true}
          title={`Edit Image (${processedBlobs.length + 1} of ${processedBlobs.length + editQueue.length})`}
          imageKey={editQueue[0]}
          hasMoreInQueue={editQueue.length > 1}
          onApplyToAll={handleApplyToAll}
        />
      )}
    </div>
  );
}
