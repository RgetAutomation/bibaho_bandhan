import CreateUserClient from "./createUserClient";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";

export default async function CreateUserPage({
  searchParams,
}: {
  searchParams: Promise<{ gender: string }>;
}) {
  await checkRoleAndGetSession([Role.GHOTOK]);
  const { gender } = await searchParams;
  return <CreateUserClient gender={gender} />;
}
