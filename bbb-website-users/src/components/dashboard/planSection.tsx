import {
  CheckCircleIcon,
  Crown,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { cn, formatINR } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getPlans } from "@/actions/get-plans";
import { Badge } from "../ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getMySubscriptions } from "@/actions/payments";
import ApiErrorPage from "../apiErrorPage";
import { isAxiosError } from "axios";
import { motion } from "motion/react";
import { format } from "date-fns";
import { UserType } from "../enum/userType";

interface PlanProps {
  id: string;
  title: string;
  price: string;
  connection: string;
  duration: string;
  refId?: string | null;
  mid?: string | null;
  isActive?: boolean;
  discountPercentage?: number;
  isPremiumMember?: boolean;
  isPopular?: boolean;
}

export function PlansSection({
  showFreeSection = false,
  showPlanExpiredSection = false,
  isPending = false,
  planExpiryDate,
  userType,
  totalLimit,
  hasUsedFreePlan,
  activePlanId,
  gridClassName,
}: {
  showFreeSection: boolean;
  showPlanExpiredSection?: boolean;
  isPending?: boolean;
  planExpiryDate?: string;
  userType: UserType;
  totalLimit?: number;
  hasUsedFreePlan?: boolean;
  activePlanId?: string;
  gridClassName?: string;
}) {
  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(),
    enabled: true,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => getMySubscriptions(),
    enabled: true,
  });

  const activePlanIds = subscriptions ? new Set(subscriptions.map((sub: any) => sub.planId)) : new Set();

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load plans"
      : "Something went wrong";
    return (
      <div className="w-full flex-1 flex items-center justify-center flex-col">
        <ApiErrorPage
          title={"Failed to load plan"}
          description={errorMessage}
        />
      </div>
    );
  }

  const isPremiumMember = !showPlanExpiredSection && userType === UserType.PAID_USER;
  const isFreePlanActive = totalLimit === 0;

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* <div className="flex-1 flex items-center justify-center p-4 md:p-5 lg:p-6">
        <p className="text-gray-500">No chats available</p>
      </div> */}

      {isLoading || isPending ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <PlanCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-2">
          {(isPremiumMember || (showFreeSection && !hasUsedFreePlan)) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full overflow-hidden bg-gradient-to-r from-rose-50/80 to-pink-50/80 dark:from-rose-950/20 dark:to-pink-950/20 flex flex-col md:flex-row items-center md:justify-between p-5 md:p-6 md:px-10 rounded-3xl shadow-sm border border-rose-100 dark:border-rose-900/30 mb-2"
            >
              {/* Background Glows */}
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 via-transparent to-emerald-400/10 blur-2xl opacity-70" />
              
              {/* Text Content */}
              <div className="flex-1 space-y-2 z-10 text-center md:text-left md:pr-4">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-[1.2] tracking-tight">
                  {isPremiumMember ? (
                    <>You are a <span className="text-rose-600">Premium Member</span><br className="hidden md:block" /> Enjoy Your Exclusive Features</>
                  ) : (
                    <>Upgrade to Premium and <br className="hidden md:block" /> Find Your Perfect Match Faster</>
                  )}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm max-w-sm mx-auto md:mx-0">
                  {isPremiumMember 
                    ? "You have full access to all exclusive matchmaking tools, direct messaging, and priority visibility."
                    : "Unlock all exclusive features and take full control of your matchmaking journey."}
                </p>
                {isPremiumMember && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-black/20 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid until {format(planExpiryDate || new Date(), "dd MMM yyyy")}
                  </div>
                )}
              </div>

              {/* Graphic / Podium */}
              <div className="relative w-full md:w-[220px] flex justify-center items-center mt-6 md:mt-0 z-10 h-[120px] md:h-[140px]">
                {/* Floating Elements */}
                <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-2 left-2 text-pink-400 opacity-80">
                  <Heart className="w-5 h-5 fill-pink-400" />
                </motion.div>
                <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute bottom-6 right-6 text-rose-500 opacity-60">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </motion.div>
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-6 right-8 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute bottom-8 left-6 text-pink-300">
                  <div className="w-2 h-2 bg-pink-300 rotate-45 rounded-sm" />
                </motion.div>

                {/* Podium & Crown */}
                <div className="relative flex flex-col items-center justify-end h-full pb-4">
                  <motion.div 
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="relative z-10 drop-shadow-[0_10px_10px_rgba(251,191,36,0.3)] mb-[-8px]"
                  >
                    <Crown className="w-20 h-20 md:w-24 md:h-24 text-amber-400 fill-amber-400" />
                    <div className="absolute inset-0 flex items-center justify-center pt-6">
                       <div className="w-2.5 h-2.5 bg-white/80 rotate-45 rounded-sm shadow-sm" />
                    </div>
                  </motion.div>
                  
                  {/* Pink Podium Base */}
                  <div className="absolute bottom-0 w-32 h-8 md:w-40 md:h-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-[100%] shadow-[0_10px_20px_rgba(225,29,72,0.3)] z-0 flex items-center justify-center">
                    <div className="w-28 h-6 md:w-36 md:h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-[100%] shadow-inner translate-y-[-3px]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {showPlanExpiredSection && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden bg-gradient-to-b from-muted/80 to-background p-6 rounded-3xl shadow-xl text-center space-y-5 border border-border"
            >
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-amber-400/10 blur-2xl opacity-70" />

              {/* Icon */}
              <div className="relative flex justify-center">
                <div className="p-3 rounded-full bg-destructive/10 text-destructive shadow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              {/* Main Text */}
              <p className="relative text-xl font-semibold text-foreground">
                Your plan has been{" "}
                <span className="text-destructive font-bold">Expired</span>
              </p>

              {/* Subtitle */}
              <p className="relative text-sm text-muted-foreground max-w-xs mx-auto">
                Please renew your plan to continue enjoying our exclusive
                features.
              </p>
            </motion.div>
          )}

          <div className={cn("grid gap-6 w-full mt-8 md:px-10 max-w-7xl mx-auto", gridClassName || "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
            {plans
              ?.filter((plan) => !( (hasUsedFreePlan || isFreePlanActive) && Number(plan.price) === 0))
              .map((plan: any, index: number) => {
                const activeDiscount = plan.discounts && plan.discounts.length > 0 ? plan.discounts[0].percentage : 0;
                const isPlanActive = activePlanIds.has(plan.id);
                return (
                <PlanCard
                  key={plan.id}
                  id={plan.id}
                  title={plan.title}
                  price={plan.price}
                  connection={plan.connection}
                  duration={plan.duration}
                  isActive={isPlanActive}
                  discountPercentage={activeDiscount}
                  isPremiumMember={isPremiumMember}
                  isPopular={index === 1}
                />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export function PlanCard({
  id,
  title,
  price,
  connection,
  duration,
  refId,
  mid,
  isActive,
  discountPercentage,
  isPremiumMember,
  isPopular,
}: PlanProps) {
  const router = useRouter();
  const rawPrice = Number(price);
  const discountedPrice = discountPercentage ? Math.round(rawPrice - (rawPrice * discountPercentage) / 100) : rawPrice;
  const formattedOriginalPrice = formatINR(rawPrice);
  const formattedDiscountedPrice = formatINR(discountedPrice);

  function handleChoosePlan() {
    if (refId) router.push(`/users/plan/${id}?ref=${refId}&mid=${mid}`);
    else router.push(`/users/plan/${id}`);
  }

  return (
    <motion.div
      transition={{ duration: 0.3 }}
      className={cn(
        "relative flex flex-col p-4 lg:p-5 rounded-2xl transition-all h-full border-2",
        isPopular 
          ? "border-rose-500 bg-gradient-to-b from-rose-50/80 to-card dark:from-rose-950/20 dark:to-card shadow-xl shadow-rose-500/10 scale-100 lg:scale-[1.03] z-10" 
          : "border-border bg-card hover:border-rose-300/50 dark:hover:border-rose-800 shadow-sm",
        isActive && "opacity-80"
      )}
    >
      {/* Corner Discount Ribbon */}
      {discountPercentage ? (
        <div className="absolute -top-3 -right-3 z-30 transform hover:scale-110 transition-transform cursor-default">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white dark:border-zinc-900 rotate-12">
            🔥 {discountPercentage}% OFF
          </div>
        </div>
      ) : null}

      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap shadow-md">
          Most Popular
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-1 mb-2 mt-1">
        <h3 className={cn("text-base lg:text-lg font-bold", isPopular ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>
          {title}
        </h3>
        
        <div className="flex flex-row items-baseline justify-center gap-1.5 mt-1">
           <span className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">{formattedDiscountedPrice}</span>
           <span className="text-sm lg:text-base text-muted-foreground font-medium">/ {duration} days</span>
        </div>
        
        <div className="h-5 flex items-center justify-center mt-1">
          {discountPercentage ? (
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/50 flex items-center gap-1">
              Regular price 
              <span className="line-through decoration-rose-500/50 opacity-80">{formattedOriginalPrice}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-4 flex-1 border-t border-border pt-3">
        {[
          "View full details of brides",
          "Send Interests to brides",
          "Chat directly with brides",
          `Valid for ${duration} days`,
        ].map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            <CheckCircleIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-auto space-y-2 flex flex-col items-center">
        <Button
          onClick={handleChoosePlan}
          disabled={isActive}
          variant={isPopular ? "default" : "outline"}
          className={cn(
            "w-full rounded-lg py-2 text-sm font-bold transition-all duration-300 h-10",
            isActive 
              ? "bg-muted text-muted-foreground cursor-not-allowed border-none" 
              : isPopular 
                ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md shadow-rose-500/20 border-0"
                : "border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 hover:border-rose-500 bg-transparent"
          )}
        >
          {isActive ? "Active Plan" : isPremiumMember ? "Extend Plan" : "Choose Plan"}
        </Button>
        
        {discountPercentage ? (
          <div className="bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block border border-emerald-200 dark:border-emerald-800">
             Save {discountPercentage}%
          </div>
        ) : (
          <div className="h-4" />
        )}
        <div className="text-xs text-muted-foreground font-medium">
          Billed {formattedDiscountedPrice} for {duration} days
        </div>
      </div>
    </motion.div>
  );
}

export function PlanCardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5 p-5 border rounded-2xl shadow-lg bg-card transition hover:shadow-xl">
      <div className="flex items-center justify-between">
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-16 h-8 rounded-2xl" />
      </div>
      <ul className="space-y-2">
        <Skeleton className="w-5/12 h-5" />
        <Skeleton className="w-10/12 h-5" />
        <Skeleton className="w-7/12 h-5" />
        <Skeleton className="w-9/12 h-5" />
        <Skeleton className="w-10/12 h-5" />
      </ul>
      <Skeleton className="h-10 rounded-3xl" />
    </div>
  );
}
