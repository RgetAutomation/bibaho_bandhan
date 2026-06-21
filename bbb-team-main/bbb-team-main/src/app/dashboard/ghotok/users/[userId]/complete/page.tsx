import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import React from "react";
import CompleteProfileClient from "./completeProfileClient";
import { redirect } from "next/navigation";

export default async function CompleteGhotokUserProfile({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ gender: string }>;
}) {
  await checkRoleAndGetSession([Role.GHOTOK]);
  const { userId } = await params;
  const { gender } = await searchParams;

  if (!gender || gender === "undefined") {
    redirect("/dashboard/ghotok/users");
  }

  return <CompleteProfileClient userId={userId} gender={gender} />;
}
