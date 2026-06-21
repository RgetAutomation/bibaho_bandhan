"use client";

import { useState, useEffect } from "react";
import api from "@/components/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import toast from "react-hot-toast";
import LoadingPage from "@/components/loader";

interface BroadcastMessage {
  id: string;
  content: string;
  targetGender: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function BroadcastClient() {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [targetGender, setTargetGender] = useState<string>("ALL");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await api.get("/broadcasts");
      setBroadcasts(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch broadcasts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!content.trim()) {
      toast.error("Message content cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (targetGender !== "ALL") {
        formData.append("targetGender", targetGender);
      }
      if (imageFile) {
        formData.append("file", imageFile);
      }

      await api.post("/broadcasts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Broadcast created successfully");
      setContent("");
      setImageFile(null);
      fetchBroadcasts();
    } catch (error) {
      toast.error("Failed to create broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.put(`/broadcasts/${id}/deactivate`);
      toast.success("Broadcast deactivated");
      fetchBroadcasts();
    } catch (error) {
      toast.error("Failed to deactivate broadcast");
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Broadcasting Messages</h1>
        <p className="text-muted-foreground mt-2">
          Create marketing popups that will immediately display to users when they log in or refresh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">New Broadcast</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Target Audience</label>
            <Select value={targetGender} onValueChange={setTargetGender}>
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Select Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Everyone</SelectItem>
                <SelectItem value="MALE">Grooms Only</SelectItem>
                <SelectItem value="FEMALE">Brides Only</SelectItem>
                <SelectItem value="FREE_GROOM">Free Groom</SelectItem>
                <SelectItem value="EXPIRED_GROOM">Expired Groom</SelectItem>
                <SelectItem value="PAID_GROOM">Paid Groom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Message Content</label>
            <Textarea 
              placeholder="Write your marketing message or offer here..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Banner Image (Optional)</label>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>

          <Button 
            onClick={handleCreate} 
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Sending..." : "Publish Broadcast"}
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Broadcast History</h2>
        
        {broadcasts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No broadcasts found.</p>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((broadcast) => (
              <div 
                key={broadcast.id} 
                className={`border p-4 rounded-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${
                  broadcast.isActive ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      broadcast.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {broadcast.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">
                      Target: {
                        broadcast.targetGender === "MALE" ? "Grooms Only" : 
                        broadcast.targetGender === "FEMALE" ? "Brides Only" : 
                        broadcast.targetGender === "FREE_GROOM" ? "Free Groom" :
                        broadcast.targetGender === "EXPIRED_GROOM" ? "Expired Groom" :
                        broadcast.targetGender === "PAID_GROOM" ? "Paid Groom" :
                        "Everyone"
                      }
                    </span>
                    {broadcast.imageUrl && (
                      <span className="text-xs text-blue-700 font-medium bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        Banner attached
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(broadcast.createdAt), "dd MMM yyyy, hh:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{broadcast.content}</p>
                </div>

                {broadcast.isActive && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeactivate(broadcast.id)}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
