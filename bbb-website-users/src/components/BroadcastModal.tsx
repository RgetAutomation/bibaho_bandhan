"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";
import axios from "axios";
import { MAIN_API_URL } from "@/lib/constant-data";

interface Broadcast {
  id: string;
  content: string;
  targetGender: string | null;
  imageUrl?: string | null;
  createdAt: string;
}

export default function BroadcastModal() {
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Small delay to let the page load before fetching broadcasts
    const timer = setTimeout(() => {
      fetchActiveBroadcasts();
    }, 1500);

    const handleOpenBroadcast = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-broadcast', handleOpenBroadcast);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-broadcast', handleOpenBroadcast);
    };
  }, []);

  const fetchActiveBroadcasts = async () => {
    try {
      const res = await axios.get(`${MAIN_API_URL}/broadcasts/active`, { withCredentials: true });
      const activeBroadcasts: Broadcast[] = res.data?.data || [];

      if (activeBroadcasts.length > 0) {
        // We'll just show the latest one for now
        const latest = activeBroadcasts[0];

        // Check if user has already dismissed this specific broadcast
        const dismissed = localStorage.getItem("dismissed_broadcasts");
        let dismissedIds: string[] = [];
        if (dismissed) {
          try {
            dismissedIds = JSON.parse(dismissed);
          } catch (e) {}
        }

        setBroadcast(latest);
        if (!dismissedIds.includes(latest.id)) {
          setIsOpen(true);
        }
      }
    } catch (error) {
      // Fail silently on network errors so it doesn't pollute the console
      // console.warn("Could not fetch active broadcasts. Backend might be down.");
    }
  };

  const handleDismiss = () => {
    if (broadcast) {
      const dismissed = localStorage.getItem("dismissed_broadcasts");
      let dismissedIds: string[] = [];
      if (dismissed) {
        try {
          dismissedIds = JSON.parse(dismissed);
        } catch (e) {}
      }
      
      dismissedIds.push(broadcast.id);
      localStorage.setItem("dismissed_broadcasts", JSON.stringify(dismissedIds));
    }
    setIsOpen(false);
  };

  if (!broadcast) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 sm:max-w-md overflow-hidden gap-0 border-0" onInteractOutside={(e) => {
        // Force them to click dismiss to acknowledge? Optional.
        // e.preventDefault(); 
      }}>
        {broadcast.imageUrl ? (
          <div className="w-full h-auto max-h-[320px] relative bg-zinc-50 dark:bg-zinc-900 p-1.5 flex items-center justify-center overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
            <img src={broadcast.imageUrl} alt="Announcement" className="w-auto h-auto max-w-full max-h-[300px] object-contain rounded-md shadow-sm" />
          </div>
        ) : (
          <div className="pt-8 pb-2 flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Megaphone className="h-8 w-8 text-primary" />
            </div>
          </div>
        )}
        
        <div className={`px-6 pb-6 ${broadcast.imageUrl ? 'pt-5' : ''}`}>
          <DialogHeader>
            <DialogTitle className="sr-only">Special Announcement</DialogTitle>
            <DialogDescription className="text-center text-[15px] pt-3 whitespace-pre-wrap text-foreground leading-relaxed">
              {broadcast.content}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-8">
            <Button onClick={handleDismiss} size="lg" className="w-full sm:w-auto px-10 rounded-full font-semibold">
              Got it, thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
