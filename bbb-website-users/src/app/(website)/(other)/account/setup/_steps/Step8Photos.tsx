"use client";

import { useState } from "react";
import StepActions from "./StepActions";
import ImagesUploadComponent from "@/components/ui-custom/imagesUploedComponent";
import { ImageIcon } from "lucide-react";
import { useTemporaryPhotoStore } from "@/lib/temporaryPhotoStore";

export default function Step8Photos({ onComplete, onBack }: { onComplete: () => void, onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const setPhotos = useTemporaryPhotoStore((state) => state.setPhotos);

  const handleComplete = () => {
    setLoading(true);
    // Add a slight delay for better UX before proceeding
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
              setPhotos(blobs);
            }}
          />
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
