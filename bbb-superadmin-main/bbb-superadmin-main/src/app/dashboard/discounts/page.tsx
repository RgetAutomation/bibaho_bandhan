import { prisma } from "@/lib/prisma";
import DiscountClient from "./DiscountClient";

export default async function DiscountsPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
  });

  const discounts = await (prisma as any).discount.findMany({
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
          <p className="text-muted-foreground mt-2">
            Manage percentage discounts for your subscription plans.
          </p>
        </div>
      </div>
      <DiscountClient plans={plans} initialDiscounts={discounts} />
    </div>
  );
}
