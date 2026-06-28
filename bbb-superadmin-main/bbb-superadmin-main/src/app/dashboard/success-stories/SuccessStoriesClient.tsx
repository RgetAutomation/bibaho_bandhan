"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, PlusCircle, PenSquare, EyeOff, Eye } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSuccessStory, updateSuccessStory, toggleSuccessStory, deleteSuccessStory } from "@/action/success-story";

export default function SuccessStoriesClient({ initialStories }: { initialStories: any[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    text: "",
    isActive: true,
  });

  const resetForm = () => {
    setEditId(null);
    setFormData({ title: "", image: "", text: "", isActive: true });
  };

  const handleOpenDialog = (story?: any) => {
    if (story) {
      setEditId(story.id);
      setFormData({
        title: story.title,
        image: story.image,
        text: story.text,
        isActive: story.isActive,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.image || !formData.text) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    let res;
    if (editId) {
      res = await updateSuccessStory(editId, formData);
    } else {
      res = await createSuccessStory(formData);
    }
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      resetForm();
    } else {
      toast.error(res.message);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleSuccessStory(id, currentStatus);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this success story?")) return;
    const res = await deleteSuccessStory(id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Story Button */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground" onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Success Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Success Story" : "Add New Success Story"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title (e.g. Zahra & Hasan)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter couple's name"
                />
              </div>
              <div className="space-y-2">
                <Label>Image Path (e.g. /matching/image.webp)</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Enter image path"
                />
                {formData.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border w-full h-40">
                    <img
                      src={`http://localhost:3000${formData.image}`}
                      alt="Preview"
                      className="object-cover w-full h-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Success Story Text</Label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Write the success story..."
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show on Website</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Story"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Grid - same style as user site */}
      {initialStories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-2xl">
          No success stories yet. Click "Add Success Story" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {initialStories.map((story) => (
            <div
              key={story.id}
              className={`relative flex flex-col h-full p-4 border border-rose-700/30 rounded-2xl bg-red-100 dark:bg-zinc-800 dark:border-zinc-800 transition-opacity ${!story.isActive ? "opacity-50" : ""}`}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge variant={story.isActive ? "default" : "secondary"} className="text-xs">
                  {story.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>

              {/* Image */}
              <img
                src={`http://localhost:3000${story.image}`}
                alt={story.title}
                className="w-full h-auto object-cover rounded-lg border"
                onError={(e) => (e.currentTarget.src = "/placeholder-user.jpg")}
              />

              {/* Title */}
              <h2 className="text-xl font-semibold py-3 pl-1">{story.title}</h2>

              {/* Text - truncated like user site */}
              <p className="text-sm text-muted-foreground pl-1 flex-1 line-clamp-3">
                {story.text}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-rose-700/20 dark:border-zinc-700">
                {/* Toggle visibility */}
                <button
                  onClick={() => handleToggle(story.id, story.isActive)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {story.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {story.isActive ? "Hide" : "Show"}
                </button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleOpenDialog(story)}
                  >
                    <PenSquare className="w-3.5 h-3.5 text-blue-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDelete(story.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
