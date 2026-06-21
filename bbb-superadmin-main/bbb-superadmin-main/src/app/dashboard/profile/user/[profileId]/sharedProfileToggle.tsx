"use client";

import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { toggleSharedProfile } from "@/action/toggleSharedProfile";

export default function SharedProfileToggle({ userId, initialValue = false }: { userId: string, initialValue?: boolean }) {
  const [isShared, setIsShared] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsShared(newValue); // Optimistic UI update
    setIsLoading(true);

    const result = await toggleSharedProfile(userId, newValue);
    if (!result.success) {
      setIsShared(!newValue); // Revert on failure
      alert("Failed to update Shared Profile status");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-2 ml-2">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input 
          type="checkbox" 
          checked={isShared} 
          onChange={handleToggle} 
          disabled={isLoading}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-50"
        />
        <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          Mark Shared {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
        </span>
      </label>
      
      {isShared && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800 animate-in fade-in zoom-in duration-200">
          <Share2 className="w-3.5 h-3.5" /> Shared Profile
        </span>
      )}
    </div>
  );
}
