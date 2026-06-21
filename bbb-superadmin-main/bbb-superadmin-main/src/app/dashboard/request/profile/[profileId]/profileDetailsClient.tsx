"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ITeamUserProfileRequest } from "@/components/interface/ITeam";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, Hourglass, Loader2, Save, ShieldCheck } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { approveProfile, rejectProfile } from "@/action/request";
import Link from "next/link";

const FormSchema = z.object({
  teamId: z.string().min(3, { error: "User ID is required." }),
  status: z.string().min(3, { error: "Status is required." }),
  feedback: z.string().optional(),
});

export function ProfileStatusCard({ data }: { data: ITeamUserProfileRequest }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      teamId: data.team.id,
      status: "PENDING",
      feedback: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      let response: IServerResponse;
      if (data.status === "PENDING") {
        toast.success("Status remain same");
      }
      if (data.status === "APPROVED") {
        response = await approveProfile(data.teamId);
        if (response.success) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      }
      if (data.status === "REJECTED") {
        response = await rejectProfile(data.teamId, data.feedback || "");
        if (response.success) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      toast.error(
        (error as string) ||
          "Failed to update payment status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Top: Back + Status */}
      <div className="flex w-full flex-row items-center gap-4 border-b p-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="size-10 rounded-full"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Profile Status</h1>
      </div>

      {/* Middle Card */}
      <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
        {/* Left: Profile Card */}
        <div className="flex flex-col gap-4 p-4">
          {/* Profile Card */}
          <div className="bg-card flex max-w-lg items-start gap-4 rounded-xl border p-5 shadow-sm">
            <Avatar className="size-16">
              <AvatarImage src={data.team.avatar || ""} />
              <AvatarFallback>
                {data.team.firstName[0]}
                {data.team.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <h2 className="text-lg font-semibold">
                {data.team.firstName}{" "}
                {data.team.middleName ? data.team.middleName + " " : ""}
                {data.team.lastName}
              </h2>
              {data.team.email && (
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {data.team.email}
                </p>
              )}
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                +91-{data.team.phone}
              </p>
            </div>
          </div>
          {/* Request Card */}
          <div className="bg-card w-full max-w-lg overflow-hidden rounded-xl border shadow-md">
            {/* Status Section */}
            <div className="bg-muted/30 border-b p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  Status:{" "}
                  <Badge
                    className={`rounded-full ${
                      data.status === "APPROVED"
                        ? "bg-green-600"
                        : data.status === "REJECTED"
                          ? "bg-red-600"
                          : "bg-yellow-500 text-black"
                    }`}
                  >
                    {data.status}
                  </Badge>
                </p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(data.createdAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            </div>

            {/* Personal Details */}
            <div className="border-b p-5">
              <h3 className="mb-3 text-lg font-semibold">Personal Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex w-full flex-col items-center justify-center gap-2">
                  <Avatar className="size-26">
                    <AvatarImage src={data.avatar || ""} />
                    <AvatarFallback>
                      {data.team.firstName[0]}
                      {data.team.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size={"sm"}
                    asChild
                    variant={"outline"}
                    className="my-2 rounded-full"
                  >
                    <Link target="_blank" href={data.avatar || ""}>
                      View Full Image
                    </Link>
                  </Button>
                </div>
                <p>
                  <span className="font-medium">Date of Birth:</span>{" "}
                  {format(new Date(data.dob || ""), "dd MMM yyyy")}
                </p>
                <p>
                  <span className="font-medium">Gender:</span>{" "}
                  {data.team.gender}
                </p>
                <p>
                  <span className="font-medium">ID Proof:</span>{" "}
                  <a
                    href={data.identificationProof || ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Document
                  </a>
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="p-5">
              <h3 className="mb-3 text-lg font-semibold">Address</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Vill / Town : </span>
                  {data.addressLine1}
                </p>
                {data.addressLine2 && (
                  <p>
                    <span className="text-muted-foreground">Appartment : </span>
                    {data.addressLine2}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Post : </span>
                  {data.postOffice},{" "}
                  <span className="text-muted-foreground">
                    Police Station :{" "}
                  </span>{" "}
                  {data.policeStation}
                </p>
                <p>
                  <span className="text-muted-foreground">District : </span>
                  {data.dist},<br />
                  <span className="text-muted-foreground">State : </span>
                  {data.state} <br />
                  <span className="text-muted-foreground">Pin : </span>{" "}
                  {data.pinCode}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Response Form */}
        <div className="flex flex-col gap-4 p-4">
          <div className="bg-card flex max-w-lg flex-col gap-5 rounded-xl border shadow-sm">
            <div className="border-b p-5">
              <h2 className="text-xl font-semibold">Response</h2>
              <p className="text-muted-foreground text-sm">
                Please provide a response to the user.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6 px-5 py-4"
              >
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Status <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">
                            <Hourglass className="h-4 w-4 text-orange-500" />{" "}
                            PENDING
                          </SelectItem>
                          <SelectItem value="APPROVED">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            APPROVED
                          </SelectItem>
                          <SelectItem value="REJECTED">
                            <Ban className="h-4 w-4 text-red-500" />
                            REJECTED
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your feedback"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pb-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating Status</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Update Status</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
