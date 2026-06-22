"use client";

import { useEffect, useState } from "react";
import StepActions from "./StepActions";
import ImagesUploadComponent from "@/components/ui-custom/imagesUploedComponent";
import { ImageIcon, X } from "lucide-react";
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
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">Upload Photos</h3>
              <p className="text-sm text-muted-foreground">You can upload multiple photos here.</p>
            </div>
          </div>
          
          <ImagesUploadComponent 
            refetch={() => {}} 
            onCustomUpload={async (blobs) => {
              setPhotos([...photos, ...blobs]);
            }}
          />

          {previewUrls.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Selected Photos</h4>
              <div className="flex gap-4 flex-wrap">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                    <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
