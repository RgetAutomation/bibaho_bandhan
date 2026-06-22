import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import VerifyProfilesClient from "./VerifyProfilesClient";

export default async function VerifyProfilesPage() {
  const user = await checkRoleAndGetSession([Role.ADMIN, Role.MODERATOR]);

  if (!user || !user.role) {
    return <div>Unauthorized</div>;
  }

  return <VerifyProfilesClient role={user.role} />;
}
