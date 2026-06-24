"use client";

import { useEffect, useState } from "react";
import api from "@/components/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import LoadingPage from "@/components/loader";
import { CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpmptyList } from "@/components/emptyList";

interface VerificationRequest {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  gender: string;
  avatar: string | null;
  verificationSelfieUrl: string | null;
}

export default function VerifyProfilesPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: VerificationRequest[] }>("/app/sa/verifications");
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load verification requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    setActionLoading(userId + action);
    try {
      const res = await api.post(`/app/sa/verifications/${userId}/${action}`);
      if (res.data.success) {
        toast.success(`Profile ${action}d successfully`);
        setRequests(requests.filter((r) => r.id !== userId));
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} profile.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl lg:text-3xl dark:text-gray-100">
            Verify Profiles ({requests.length})
          </h1>
        </div>
      </div>

      {/* Content */}
      {requests.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <EpmptyList
            title="No pending verifications"
            subtitle="All verification requests have been handled."
          />
        </div>
      ) : (
        <div className="p-4 md:p-6 lg:p-8 pt-0">
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => {
              const fullName = [req.title, req.firstName, req.lastName]
                .filter(Boolean)
                .join(" ")
                .trim();
              return (
                <Card key={req.id} className="mb-0 w-full rounded-2xl shadow-sm">
                  <CardHeader className="flex items-center gap-4 pb-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={req.avatar || (req.gender === "MALE" ? "/groom.webp" : "/bride.webp")}
                        alt={fullName}
                      />
                      <AvatarFallback>{req.firstName[0]}{req.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-semibold">{fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{req.gender?.toLowerCase()}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">


                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                        onClick={() => handleAction(req.id, "approve")}
                        disabled={actionLoading === req.id + "approve"}
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        {actionLoading === req.id + "approve" ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        className="flex-1 text-sm"
                        variant="destructive"
                        onClick={() => handleAction(req.id, "reject")}
                        disabled={actionLoading === req.id + "reject"}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        {actionLoading === req.id + "reject" ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>

                    {/* View Profile Link */}
                    <Link
                      href={`/dashboard/profile/user/${req.id}`}
                      className="w-full flex items-center justify-center py-2 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      View Full Profile
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
