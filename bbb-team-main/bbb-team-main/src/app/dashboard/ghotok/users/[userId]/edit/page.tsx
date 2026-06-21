import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import { redirect } from "next/navigation";
import EditUserProfileClient from "./editUserProfileClient";

export default async function EditUserProfilePage({
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
  return <EditUserProfileClient userId={userId} gender={gender} />;
}
