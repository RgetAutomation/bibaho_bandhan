export const dynamic = "force-dynamic";

import DashboardGrid from "@/components/dashboard/DashboardGrid";
import DashboardGridMatchmaker from "@/components/dashboard/DashboardGridMatchmaker";
import DashboardGridModerator from "@/components/dashboard/DashboardGridModerator";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";

export default async function DashboardPage() {
  const user = await checkRoleAndGetSession([
    Role.ADMIN,
    Role.MODERATOR,
    Role.GHOTOK,
  ]);

  return (
    <section className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor activities and manage operations for Bengali Bibaho Bandhan.
        </p>
      </div>
      {user.role === Role.ADMIN && <DashboardGrid />}
      {user.role === Role.MODERATOR && <DashboardGridModerator />}
      {user.role === Role.GHOTOK && <DashboardGridMatchmaker />}
    </section>
  );
}
