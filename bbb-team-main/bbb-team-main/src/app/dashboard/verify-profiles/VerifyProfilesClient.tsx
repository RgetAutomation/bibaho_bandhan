"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import LoadingPage from "@/components/loader";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

interface VerificationRequest {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  gender: string;
  avatar: string | null;
  verificationSelfieUrl: string | null;
}

export default function VerifyProfilesClient({ role }: { role: string }) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const prefix = role === "ADMIN" ? "/app/admin" : "/app/moderator";
      const res = await api.get<{ success: boolean; data: VerificationRequest[] }>(`${prefix}/verifications`);
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
    try {
      const prefix = role === "ADMIN" ? "/app/admin" : "/app/moderator";
      const res = await api.post(`${prefix}/verifications/${userId}/${action}`);
      if (res.data.success) {
        toast.success(`Profile ${action}d successfully`);
        setRequests(requests.filter((r) => r.id !== userId));
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} profile.`);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verify Profiles</h1>

      {requests.length === 0 ? (
        <div className="text-center text-muted-foreground p-10 border rounded-xl bg-card">
          No pending verification requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="border rounded-xl bg-card p-4 flex flex-col gap-4 shadow-sm">
              <div className="text-lg font-semibold">
                {req.title} {req.firstName} {req.lastName}
              </div>
              <div className="text-sm text-muted-foreground">Gender: {req.gender}</div>

              <div className="flex gap-4 w-full mt-2">
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-xs font-medium text-center">Profile Photo</span>
                  <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted">
                    {req.avatar ? (
                      <Image
                        src={req.avatar}
                        alt="Profile Photo"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No Photo
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-xs font-medium text-center">Verification Selfie</span>
                  <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted">
                    {req.verificationSelfieUrl ? (
                      <Image
                        src={req.verificationSelfieUrl}
                        alt="Verification Selfie"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No Selfie
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  className="flex-1"
                  variant="default"
                  onClick={() => handleAction(req.id, "approve")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => handleAction(req.id, "reject")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
