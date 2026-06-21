"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Camera, CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useUpdatingProfileStore } from "@/lib/updateProfileStore";
import { useCreateAccountStore } from "@/lib/createAccountStore";
import { usePasswordStore } from "@/lib/passwordStore";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/axiosInstance";
import { LoadingButton } from "@/components/loadingButton";

export default function Step9FaceVerify({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);

  const passwordStore = usePasswordStore();
  const accountStore = useCreateAccountStore();
  const profileStore = useUpdatingProfileStore();

  type CustomSignUpInput = Parameters<typeof authClient.signUp.email>[0] & {
    title: string;
    middleName?: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
  };

  const handleSimulateFaceVerify = () => {
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

      const profileResponse = await api.post("/users/profile/update", { ...profileStore }, { withCredentials: true });

      if (profileResponse.data.success || profileResponse.status === 200) {
        passwordStore.clearPassword();
        toast.success("Account created and profile fully completed!");
        router.replace("/users/home");
      } else {
        toast.error("Account created, but profile update failed.");
        router.replace("/users/home");
      }
    } catch (error) {
      const errorMessage = isAxiosError(error) ? error?.response?.data?.message || "Failed to complete setup" : "Failed to complete setup";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-card rounded-[2rem] shadow-sm border p-6 md:p-10">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Verify Your Identity</h2>
          <p className="text-muted-foreground text-sm">We require a quick face scan to ensure the authenticity of profiles and keep our community safe.</p>
        </div>

        {!faceVerified ? (
          <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 bg-secondary/10">
            <Camera size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <Button onClick={handleSimulateFaceVerify} className="rounded-full w-full" variant="outline">
              Start Face Scan
            </Button>
          </div>
        ) : (
          <div className="border-2 border-green-300 bg-green-50 rounded-xl p-8">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <p className="font-medium text-green-600">Verification Successful!</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Button className="w-full rounded-full h-12 font-semibold" onClick={handleFinalSubmit} disabled={!faceVerified || loading}>
            {loading ? <LoadingButton title="Creating Account..." /> : "Finish & Create Account"}
          </Button>
          <p className="text-xs text-muted-foreground">Your account will only be created after this step is complete.</p>
          <Button type="button" variant="ghost" className="rounded-full" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Photos
          </Button>
        </div>
      </div>
    </div>
  );
}
