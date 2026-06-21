"use client";

import { Button } from "@/components/ui/button";
import { useProfileEditStore } from "@/hooks/useProfileEditStore";
import { updateProfileSection } from "@/action/adminProfileEdit";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  profileId: string;
}

export default function UpdateProfileClient({ profileId }: Props) {
  const { editingSection, draftValues, closeSection, isEditingMode } = useProfileEditStore();
  const router = useRouter();

  if (!isEditingMode || !editingSection) return null;

  const handleUpdate = async () => {
    const toastId = toast.loading("Saving changes...");
    try {
      const result = await updateProfileSection(profileId, editingSection, draftValues);
      if (result.success) {
        toast.success("Section updated successfully!", { id: toastId });
        closeSection();
        router.refresh();
      } else {
        toast.error(result.message || "Update failed.", { id: toastId });
      }
    } catch {
      toast.error("Something went wrong.", { id: toastId });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-card border rounded-2xl shadow-2xl px-5 py-3">
      <span className="text-sm text-muted-foreground font-medium">
        Editing: <span className="text-foreground font-semibold">{editingSection}</span>
      </span>
      <Button
        variant="default"
        className="gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold"
        onClick={handleUpdate}
      >
        <Save className="h-4 w-4" />
        Save Section
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={closeSection}
        className="text-muted-foreground"
      >
        Cancel
      </Button>
    </div>
  );
}
