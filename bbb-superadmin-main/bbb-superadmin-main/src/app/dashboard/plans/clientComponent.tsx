"use client";

import { deletePlan, updatePlanStatus } from "@/action/plan";
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
import { IPlan } from "@/components/interface/IPlan";
import { Badge } from "@/components/ui/badge";
import { cn, formatRupees } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanCardView({
  id,
  title,
  price,
  duration,
  status,
}: IPlan) {
  return (
    <Card className="w-full rounded-2xl border shadow-md transition-all hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <span className="rounded-full bg-green-700 px-3 py-1 text-lg font-bold text-white shadow-sm md:text-xl">
          {formatRupees(Number(price))}
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground space-y-3 text-sm">
          <p>
            <span className="text-foreground font-medium">Duration:</span>{" "}
            {duration}
          </p>
          {/* <p>
            <span className="font-medium text-foreground">Limits:</span>{" "}
            {connection} connections
          </p> */}
          <p className="flex items-center gap-2">
            <span className="text-foreground font-medium">Status:</span>
            <Badge
              variant={status ? "default" : "secondary"}
              className={cn(
                "rounded-full px-3 py-0.5 text-xs font-semibold",
                status ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"
              )}
            >
              {status ? "Active" : "Inactive"}
            </Badge>
          </p>
        </div>

        {/* CTA or Actions */}
        <div className="pt-2">
          <PlanClientComponent id={id ?? ""} status={status} price={price} />
        </div>
      </CardContent>
    </Card>
  );
}

function PlanClientComponent({ id, status, price }: { id: string; status: boolean; price: string }) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await deletePlan(id);
      if (response.success) {
        toast.success(response.message);
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to delete plan. Please try again.");
    }
    setDeleting(false);
  };

  const handleActiveOrDeactive = async () => {
    setActivating(true);
    try {
      const response = await updatePlanStatus(id, !status);
      if (response.success) {
        toast.success(response.message);
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to update plan status. Please try again.");
    }
    setActivating(false);
  };

  return (
    <div className="flex items-center justify-between pt-3">
      <Button
        onClick={handleActiveOrDeactive}
        size="sm"
        className={`${!status && "bg-green-600 hover:bg-green-700"}`}
        disabled={activating}
        variant={status ? "destructive" : "default"}
      >
        {activating ? (
          <ButtonLoading text="Please wait" />
        ) : status ? (
          <>
            <ShieldMinus />
            <span>Deactivate Plan</span>
          </>
        ) : (
          <>
            <ShieldPlus />
            <span>Activate Plan</span>
          </>
        )}
      </Button>
      <div className="flex gap-1">
        <Button variant={"secondary"} size={"icon"}>
          <Link href={`/dashboard/plans/edit/${id}`}>
            <Edit />
          </Link>
        </Button>

        {price !== "0" && (
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
                  plan and remove your data from servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
