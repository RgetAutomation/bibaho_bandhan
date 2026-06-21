"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export default function SharedProfileToggle() {
  const [isShared, setIsShared] = useState(false);

  return (
    <div className="flex items-center gap-2 ml-2">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input 
          type="checkbox" 
          checked={isShared} 
          onChange={(e) => setIsShared(e.target.checked)} 
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
        />
        <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Mark Shared</span>
      </label>
      
      {isShared && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800 animate-in fade-in zoom-in duration-200">
          <Share2 className="w-3.5 h-3.5" /> Shared Profile
        </span>
      )}
    </div>
  );
}
