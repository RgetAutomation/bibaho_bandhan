"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { CircleX } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface ReadMoreProps {
  id: string;
  title: string;
  image?: string;
  text: string;
  amountOfChars?: number;
  className?: string;
}

export default function SeeMoreHelper({
  id,
  title,
  image,
  text,
  amountOfChars = 95,
  className,
}: ReadMoreProps) {
  const itCanOverflow = text.length > amountOfChars;
  const beginText = itCanOverflow ? text.slice(0, amountOfChars - 1) : text;

  return (
    <div id={id} className={className}>
      {beginText}
      {itCanOverflow && (
        <>
          <span> ... </span>
          <Dialog>
            <DialogTrigger asChild>
              <span
                className="text-blue-600 ml-2 cursor-pointer hover:underline underline-offset-2"
                role="button"
                tabIndex={0}
                aria-controls={id}
              >
                Show more
              </span>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-md md:max-w-lg lg:max-w-xl"
              showCloseButton={false}
            >
              <div className="flex flex-col gap-4 h-fit">
                <div className="flex flex-col md:flex-row items-start gap-3 md:gap-5">
                  <Image
                    src={image || "/default-image.jpg"}
                    alt={title}
                    className="w-full md:w-48 h-48 object-cover aspect-square mb-4 rounded-2xl"
                    width={500}
                    height={300}
                  />
                  <div>
                    <DialogTitle className="md:pt-2">{title}</DialogTitle>
                    <ScrollArea className="pt-4">
                      <p className="text-muted-foreground italic text-sm">
                        {text}
                      </p>
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter className="sm:justify-end">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <CircleX className="h-4 w-4" />
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
