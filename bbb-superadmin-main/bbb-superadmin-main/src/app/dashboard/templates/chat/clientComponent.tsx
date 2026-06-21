"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Edit,
  Loader2,
  ShieldMinus,
  ShieldPlus,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import ButtonLoading from "@/components/buttonLoading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMessageTemplate } from "@/components/interface/IMessageTemplate";
import { format, formatDistanceToNow } from "date-fns";
import {
  deleteMessageTemplate,
  updateMessageTemplateStatus,
} from "@/action/templates";

export default function TemplateCardView({
  id,
  name,
  content,
  roles,
  isActive,
  createdAt,
}: IMessageTemplate) {
  return (
    <Card className="w-full rounded-2xl border shadow-md transition-all hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <Badge
          className={`rounded-full px-3 py-1 font-bold text-white shadow-sm ${
            isActive
              ? "bg-green-500 dark:bg-green-700"
              : "bg-red-500 dark:bg-red-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <div className="text-sm">
          <p className="text-muted-foreground font-sans">Content:</p>
          <p className="text-foreground py-1 text-base font-medium">
            {content}
          </p>
          <p className="text-muted-foreground mt-2 mb-1 font-sans">Roles:</p>
          {roles.length > 0 &&
            roles.map((role, index) => (
              <div className="flex items-center gap-2" key={index}>
                <CheckCircle2 size={16} className="text-green-600" />
                {role}
              </div>
            ))}
          <div className="mt-4 flex flex-col">
            <span className="text-muted-foreground font-sans text-sm">
              Created At:
            </span>
            <span className="">
              {format(new Date(createdAt), "dd MMM yyyy")} (
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })})
            </span>
          </div>
        </div>

        <div className="pt-2">
          <TemplateClientComponent id={id ?? ""} status={isActive} />
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateClientComponent({
  id,
  status,
}: {
  id: string;
  status: boolean;
}) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await deleteMessageTemplate(id);
      if (response.success) {
        toast.success(response.message);
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to delete message template. Please try again.");
    }
    setDeleting(false);
  };

  const handleActiveOrDeactive = async () => {
    setActivating(true);
    try {
      const response = await updateMessageTemplateStatus(id, !status);
      if (response.success) {
        toast.success(response.message);
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error(
        "Failed to update message template status. Please try again."
      );
    }
    setActivating(false);
  };

  return (
    <div className="flex items-center justify-between pt-3">
      <Button
        onClick={handleActiveOrDeactive}
        size="sm"
        className={`rounded-full ${
          !status && "bg-green-600 hover:bg-green-700"
        }`}
        disabled={activating}
        variant={status ? "destructive" : "default"}
      >
        {activating ? (
          <ButtonLoading text="Please wait" />
        ) : status ? (
          <>
            <ShieldMinus />
            <span>Deactivate</span>
          </>
        ) : (
          <>
            <ShieldPlus />
            <span>Activate</span>
          </>
        )}
      </Button>
      <div className="flex gap-1">
        <Button variant={"secondary"} size={"icon"}>
          <Link href={`/dashboard/templates/chat/${id}`}>
            <Edit />
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={"destructive"} size={"icon"} disabled={deleting}>
              {deleting ? <Loader2 className="animate-spin" /> : <Trash2Icon />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                message template and remove your data from servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
