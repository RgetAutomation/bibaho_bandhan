"use client";

import { useEffect, useState } from "react";
import StepActions from "./StepActions";
import ImagesUploadComponent from "@/components/ui-custom/imagesUploedComponent";
import { X } from "lucide-react";
import { useTemporaryPhotoStore } from "@/lib/temporaryPhotoStore";

export default function Step8Photos({ onComplete, onBack }: { onComplete: () => void, onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const { photos, setPhotos } = useTemporaryPhotoStore();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    // Generate object URLs for the blobs
    const urls = photos.map(blob => URL.createObjectURL(blob));
    setPreviewUrls(urls);

    // Cleanup
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const handleRemove = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleComplete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 400);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-foreground">Profile Photos</h2>
        <p className="text-slate-500 dark:text-muted-foreground">Upload your best photos to attract more matches</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-[#F0E8E8] dark:border-zinc-800 shadow-sm rounded-3xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#F0E8E8] dark:border-zinc-800">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100">Photo Gallery</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
                  Add more photos to show your personality and lifestyle.
                </p>
              </div>
              {previewUrls.length > 0 && (
                <span className="bg-rose-50 dark:bg-[#9B1C31]/10 text-[#9B1C31] dark:text-[#E35269] text-xs font-bold px-3.5 py-1.5 rounded-full border border-rose-100 dark:border-[#9B1C31]/20 shrink-0">
                  {previewUrls.length} Photos Uploaded
                </span>
              )}
            </div>

            {previewUrls.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {previewUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="relative w-36 sm:w-44 md:w-48 aspect-square rounded-2xl overflow-hidden border border-[#F0E8E8] dark:border-zinc-800 shadow-xs group bg-gray-50 dark:bg-zinc-800 shrink-0" 
                  >
                    <img
                      src={url}
                      alt={`Preview ${idx}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <button 
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#FCFAF8] dark:bg-zinc-950 border border-dashed border-[#E5D0D0] dark:border-zinc-800 rounded-2xl p-10 text-center mb-8">
                <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
                  No photos uploaded yet. Add some to get noticed!
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-[#F0E8E8] dark:border-zinc-800">
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-zinc-200 mb-4">Upload New Photos</h3>
              <ImagesUploadComponent 
                refetch={() => {}} 
                onCustomUpload={async (blobs) => {
                  setPhotos([...photos, ...blobs]);
                }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
          <StepActions 
            loading={loading} 
            showBack={true} 
            onBack={onBack} 
            submitLabel="Save & Continue" 
          />
        </form>
      </div>
    </div>
  );
}
