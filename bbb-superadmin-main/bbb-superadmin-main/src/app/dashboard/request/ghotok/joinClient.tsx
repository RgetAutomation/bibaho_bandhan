"use client";

import {
  GhotokJoinRequestStatus,
  IGhotokJoinRequest,
} from "@/components/interface/IGhotokJoinRequest";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Ban,
  CheckCircle,
  Hourglass,
  IdCard,
  Loader2,
  Mail,
  Phone,
  Trash2,
  User2,
  UserRound,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  approveGhotokJoinRequest,
  deleteGhotokJoinRequest,
  pendingGhotokJoinRequest,
  rejectGhotokJoinRequest,
} from "@/action/request";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
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
import ButtonLoading from "@/components/buttonLoading";

export default function JoinClientComponent({
  ghotoks,
}: {
  ghotoks: IGhotokJoinRequest[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return ghotoks;
    return ghotoks.filter(
      (ghotok) =>
        ghotok.firstName.toLowerCase().includes(query.toLowerCase()) ||
        ghotok.phone?.toLowerCase().includes(query.toLowerCase()) ||
        ghotok.email?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, ghotoks]);

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 lg:p-8 bg-card border">
        {/* Left: Title + Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Ghotok Users
          </h1>
          <Input
            placeholder="Search ghotok..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 lg:p-4">
        {filtered.length > 0 ? (
          filtered.map((ghotok) => (
            <GhotokProfileCard key={ghotok.id} data={ghotok} />
          ))
        ) : (
          <p className="text-muted-foreground text-center">No results found</p>
        )}
      </div>
    </div>
  );
}

function GhotokProfileCard({ data }: { data: IGhotokJoinRequest }) {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");

  const initials = `${data.firstName?.[0] ?? ""}${
    data.lastName?.[0] ?? ""
  }`.toUpperCase();

  const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-500",
    APPROVED: "bg-green-600",
    REJECTED: "bg-red-600",
  };

  async function pendingGhotok(id: string) {
    setPending(true);
    try {
      const response = await pendingGhotokJoinRequest(id);
      if (response.success) {
        toast.success(response.message);
        router.refresh();
      }
      if (!response.success) {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error rejecting ghotok:", error);
      toast.error("Failed to reject ghotok. Please try again.");
    }
    setPending(false);
  }

  async function rejectGhotok(id: string) {
    setRejecting(true);
    try {
      const response = await rejectGhotokJoinRequest(id);
      if (response.success) {
        toast.success(response.message);
        router.refresh();
      }
      if (!response.success) {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error rejecting ghotok:", error);
      toast.error("Failed to reject ghotok. Please try again.");
    }
    setRejecting(false);
  }

  async function approveGhotok(id: string) {
    setApproving(true);
    try {
      const response = await approveGhotokJoinRequest(id);
      if (response.success) {
        toast.success(response.message);
        router.refresh();
      }
      if (!response.success) {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error approving ghotok:", error);
      toast.error("Failed to approve ghotok. Please try again.");
    }
    setApproving(false);
  }

  async function deleteGhotok(id: string) {
    setDeleting(true);
    try {
      const response = await deleteGhotokJoinRequest(id);
      if (response.success) {
        toast.success(response.message);
        router.refresh();
      }
      if (!response.success) {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error rejecting ghotok:", error);
      toast.error("Failed to reject ghotok. Please try again.");
    }
    setDeleting(false);
  }

  return (
    <div className="max-w-xl">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader className="flex gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-20 w-20 ring ring-primary shadow-sm">
              <AvatarImage src={""} alt={fullName} />
              <AvatarFallback className="text-lg bg-muted">
                {initials || <User2 className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name + Status */}
          <div className="flex-1">
            <CardTitle className="flex items-center justify-between text-xl md:text-2xl tracking-tight">
              {fullName}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    type="button"
                    className="border-destructive dark:border-destructive"
                    aria-label="Delete"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="animate-spin text-destructive" />
                    ) : (
                      <Trash2 className="h-6 w-6 cursor-pointer text-destructive" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Do you really want to{" "}
                      <span className="font-bold">delete</span> this ghotok?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteGhotok(data.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardTitle>
            <CardDescription className="mt-1">
              Matchmaker Request •{" "}
              <span className="font-mono text-xs">{data.id}</span>
            </CardDescription>

            <div className="mt-3">
              <Badge
                className={`${
                  statusStyles[data.status] || "bg-gray-500"
                } text-white px-3 py-1 rounded-full`}
              >
                {data.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-4" />

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem
              label="Gender"
              value={data.gender}
              icon={<UserRound className="h-4 w-4" />}
            />
            <DetailItem
              label="Phone"
              value={data.phone}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <DetailItem
              label="Email"
              value={data.email}
              icon={<Mail className="h-4 w-4" />}
            />

            <DetailItem
              label="Request ID"
              value={data.id}
              icon={<IdCard className="h-4 w-4" />}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full grid grid-cols-2 gap-3 items-center justify-center">
            {data.status === GhotokJoinRequestStatus.PENDING ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full rounded-full bg-red-600 hover:bg-red-700"
                    disabled={rejecting}
                  >
                    {rejecting ? (
                      <ButtonLoading text="Rejecting" />
                    ) : (
                      <>
                        <Ban className="h-4 w-4" />
                        Reject
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Do you really want to reject this ghotok?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => rejectGhotok(data.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant={"outline"}
                className="w-full rounded-full"
                onClick={() => pendingGhotok(data.id)}
                disabled={pending}
              >
                {pending ? (
                  <ButtonLoading text="Please wait" />
                ) : (
                  <>
                    <Hourglass className="h-4 w-4" />
                    <span>Pending</span>
                  </>
                )}
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full rounded-full bg-green-600 hover:bg-green-700"
                  disabled={approving}
                >
                  {approving ? (
                    <ButtonLoading text="Approving" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you really want to approve this ghotok?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => approveGhotok(data.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Yes, Approve
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 p-3 bg-muted/40">
      {icon ? <div className="mt-0.5 text-muted-foreground">{icon}</div> : null}
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-sm md:text-base font-medium">{value ?? "—"}</span>
      </div>
    </div>
  );
}
