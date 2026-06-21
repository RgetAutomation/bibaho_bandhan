"use client";

import ButtonLoading from "@/components/buttonLoading";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      className="w-full rounded-2xl"
      variant={"destructive"}
      disabled={isLoading}
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onRequest: () => {
              setIsLoading(true);
            },
            onSuccess: () => {
              router.replace("/auth/login");
            },
            onError: () => {
              toast.error("Something went wrong. Please try again.");
              setIsLoading(false);
            },
          },
        })
      }
    >
      {isLoading ? <ButtonLoading text="Logging out" /> : "Logout"}
    </Button>
  );
}
