"use client";

import { useProfileEditStore } from "@/hooks/useProfileEditStore";
import { Edit, X } from "lucide-react";

export default function SidebarEditButtonClient() {
  const { isEditingMode, toggleEditingMode } = useProfileEditStore();

  return (
    <button 
      onClick={toggleEditingMode}
      className={`w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-sm rounded-lg transition-colors shadow-sm ${
        isEditingMode 
          ? "bg-red-500 text-white hover:bg-red-600" 
          : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
      }`}
    >
      {isEditingMode ? (
        <>
          <X className="w-4 h-4" /> Cancel Edit
        </>
      ) : (
        <>
          <Edit className="w-4 h-4" /> Edit Profile
        </>
      )}
    </button>
  );
}
