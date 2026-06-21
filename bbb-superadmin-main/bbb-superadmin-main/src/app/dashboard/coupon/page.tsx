import { prisma } from "@/lib/prisma";
import CouponClient from "./CouponClient";

export default async function CouponPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
  });

  const coupons = await (prisma as any).coupon.findMany({
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Codes</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage promotional coupon codes for your plans.
          </p>
        </div>
      </div>
      <CouponClient plans={plans} initialCoupons={coupons} />
    </div>
  );
}
