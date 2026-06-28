"use client";

import { MouseEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, CopyPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CardMarkButton({ isMarked, onToggle }: { isMarked: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false);

  const handleOpen = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleConfirm = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
    setOpen(false);
  };

  const handleCancel = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant={isMarked ? "default" : "secondary"}
        size="sm"
        className={`absolute top-4 right-4 z-10 shadow-md h-8 text-xs font-semibold transition-all ${
          !isMarked 
            ? "bg-white/80 hover:bg-white text-primary hover:text-primary border border-primary/20" 
            : "bg-primary text-white hover:bg-primary/90"
        }`}
        onClick={handleOpen}
      >
        {isMarked ? <Check className="w-3.5 h-3.5 mr-1" /> : <CopyPlus className="w-3.5 h-3.5 mr-1" />}
        {isMarked ? "Marked" : "Mark"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isMarked ? "Unmark this profile?" : "Mark this profile?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isMarked 
                ? "Are you sure you want to unmark this profile?" 
                : "Are you sure you want to mark this profile? The card will be highlighted for your reference."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-primary text-white">
              {isMarked ? "Yes, Unmark it" : "Yes, Mark it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
