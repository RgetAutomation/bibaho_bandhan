"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loadingButton";
import { Camera, CheckCircle2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateAccountStore } from "@/lib/createAccountStore";
import { usePasswordStore } from "@/lib/passwordStore";
import { useUpdatingProfileStore } from "@/lib/updateProfileStore";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/axiosInstance";
import { isAxiosError } from "axios";

type CustomSignUpInput = Parameters<typeof authClient.signUp.email>[0] & {
  title: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
};

export default function FaceVerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);

  const passwordStore = usePasswordStore();
  const accountStore = useCreateAccountStore();
  const profileStore = useUpdatingProfileStore();

  const handleSimulateFaceVerify = () => {
    // In a real scenario, this would open a camera or upload a selfie for verification.
    setFaceVerified(true);
    toast.success("Face Verification Successful!");
  };

  const handleFinalSubmit = async () => {
    if (!faceVerified) {
      toast.error("Please complete face verification first.");
      return;
    }

    if (!passwordStore.password) {
      toast.error("Session expired. Please start over.");
      router.replace("/account");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the account
      const signUpResponse = await authClient.signUp.email({
        title: accountStore.gender === "MALE" ? "Mr." : "Miss",
        email: accountStore.email || "",
        name: accountStore.firstName || "",
        middleName: accountStore.middleName || "",
        lastName: accountStore.lastName || "",
        gender: (accountStore.gender as "MALE" | "FEMALE") || "MALE",
        phone: accountStore.mobile || "",
        password: passwordStore.password,
        username: accountStore.mobile || "",
        displayUsername: accountStore.mobile || "",
      } as CustomSignUpInput);

      if (signUpResponse.error) {
        toast.error(signUpResponse.error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      // 2. Immediately update the profile with all 100+ fields
      const profileResponse = await api.post(
        "/users/profile/update",
        {
          ...profileStore, // This spreads all the state fields from the store
          // We can omit hydrated, setData, setHydrated if needed, but the backend usually ignores extra fields
        },
        { withCredentials: true }
      );

      if (profileResponse.data.success || profileResponse.status === 200) {
        // Clear sensitive temporary stores
        passwordStore.clearPassword();
        
        toast.success("Account created and profile fully completed!");
        
        // 3. Finally, redirect into the secure user section!
        router.replace("/users/home");
      } else {
        toast.error("Account created, but profile update failed.");
        router.replace("/users/home");
      }
    } catch (error) {
      console.error("Final Submit Error:", error);
      const errorMessage = isAxiosError(error)
        ? error?.response?.data?.message || "Failed to complete setup"
        : "Failed to complete setup";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-y-auto p-4 md:p-6 items-center justify-center">
        <div className="bg-card rounded-2xl shadow-md p-8 max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <ShieldCheck size={32} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Verify Your Identity</h2>
            <p className="text-muted-foreground text-sm">
              We require a quick face scan to ensure the authenticity of profiles and keep our community safe.
            </p>
          </div>

          {!faceVerified ? (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 bg-secondary/10">
              <Camera size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <Button onClick={handleSimulateFaceVerify} className="rounded-full w-full" variant="outline">
                Start Face Scan
              </Button>
            </div>
          ) : (
            <div className="border-2 border-success/30 bg-success/10 rounded-xl p-8 text-success-foreground">
              <CheckCircle2 size={48} className="mx-auto text-success mb-4" />
              <p className="font-medium text-success">Verification Successful!</p>
            </div>
          )}

          <div className="pt-4">
            <Button
              className="w-full rounded-full h-12 font-semibold"
              onClick={handleFinalSubmit}
              disabled={!faceVerified || loading}
            >
              {loading ? (
                <LoadingButton title="Creating Account..." />
              ) : (
                "Finish & Create Account"
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Your account will only be created after this step is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
