import { Role } from "@/types/Role";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import FreeClientPage from "./freeClientPage";

export default async function FreeGroomPage() {
  await checkRoleAndGetSession([Role.ADMIN]);
  return <FreeClientPage />;
}
