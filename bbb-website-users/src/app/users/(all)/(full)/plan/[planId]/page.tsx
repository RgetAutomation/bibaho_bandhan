"use client";

import { getPlanById } from "@/actions/get-plans";
import ApiErrorPage from "@/components/apiErrorPage";
import DashboardHeader from "@/components/dashboard/header";
import { companyDetails, PAYMENT_UPI_ID } from "@/components/helper/constant";
import LoadingPage from "@/components/loader";
import ScreenshotUploadComponent from "@/components/ui-custom/screenshot-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  BadgeCheck,
  CalendarDays,
  Copy,
  IndianRupee,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { useState } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const { planId } = useParams<{ planId: string }>();
  const referanceId = searchParams.get("ref");
  const messsageId = searchParams.get("mid");
  const { data, isLoading, error } = useQuery({
    queryKey: ["planDetails", planId],
    queryFn: () => getPlanById(planId),
  });

  const { data: coupons } = useQuery({
    queryKey: ["coupons", planId],
    queryFn: async () => {
      try {
        const res = await api.get(`/coupons/plan/${planId}`);
        return res.data.data;
      } catch (e) {
        return [];
      }
    },
  });
  
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [couponInput, setCouponInput] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const router = useRouter();

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const foundCoupon = coupons?.find((c: any) => c.code === couponInput.trim().toUpperCase());
    if (foundCoupon) {
      setSelectedCoupon(foundCoupon);
      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid coupon code");
      setSelectedCoupon(null);
    }
  };

  const handleActivateFreePlan = async () => {
    try {
      setIsActivating(true);
      const res = await api.post("/users/plans/activate-free");
      toast.success(res.data.message || "Free plan activated successfully!");
      router.replace("/users/home"); // Or wherever the dashboard is
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to activate free plan.");
    } finally {
      setIsActivating(false);
    }
  };

  const handleClaimDiscountedPlan = async () => {
    if (!selectedCoupon) return;
    try {
      setIsActivating(true);
      const res = await api.post("/users/plans/claim-discounted", {
        planId,
        couponCode: selectedCoupon.code
      });
      toast.success(res.data.message || "Plan claimed successfully!");
      router.replace("/users/home");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to claim plan.");
    } finally {
      setIsActivating(false);
    }
  };

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load plan details"
      : "Something went wrong";
    return (
      <div className="flex flex-1 items-center justify-center">
        <ApiErrorPage
          title="Failed to load plan details"
          description={errorMessage}
        />
      </div>
    );
  }

  const activeDiscount = data?.discounts && data?.discounts.length > 0 ? data.discounts[0].percentage : 0;
  const couponDiscount = selectedCoupon ? selectedCoupon.percentage : 0;
  
  const rawPrice = Number(data?.price || 0);
  const baseDiscountedPrice = activeDiscount ? Math.round(rawPrice - (rawPrice * activeDiscount) / 100) : rawPrice;
  const discountedPrice = couponDiscount ? Math.round(baseDiscountedPrice - (baseDiscountedPrice * couponDiscount) / 100) : baseDiscountedPrice;

  const handleCopy = () => {
    navigator.clipboard.writeText(PAYMENT_UPI_ID);
    toast.success("UPI ID copied!");
  };

  return (
    <div className="flex flex-col flex-1">
      {isLoading ? (
        <LoadingPage />
      ) : (
        data && (
          <div className="flex flex-col flex-1">
            <DashboardHeader
              title={
                <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4">
                  <h1 className="font-semibold text-lg md:text-xl">
                    Plan Details
                  </h1>
                </div>
              }
            />
            <div className="flex flex-col flex-1 p-4">
              <div className="flex flex-col space-y-4">
                <span className="text-xl font-bold text-primary pl-2">
                  Plan Details
                </span>

                <div className="flex flex-col gap-2 p-5 bg-card border border-border rounded-2xl shadow-sm text-sm md:text-base lg:text-lg">
                  {/* Plan Name */}
                  <div className="flex items-center gap-3">
                    <BadgeCheck
                      size={16}
                      className="text-green-600 dark:text-green-400"
                    />
                    <span className="font-medium text-muted-foreground">
                      Plan Name:
                    </span>
                    <span className="font-semibold text-foreground">
                      {data.title}
                    </span>
                  </div>

                  {/* Plan Price */}
                  <div className="flex items-center gap-3">
                    <IndianRupee
                      size={16}
                      className="text-yellow-600 dark:text-yellow-400"
                    />
                    <span className="font-medium text-muted-foreground">
                      Plan Price:
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatINR(discountedPrice)}
                    </span>
                    {(activeDiscount > 0 || couponDiscount > 0) && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        {formatINR(rawPrice)}
                      </span>
                    )}
                    {activeDiscount > 0 && (
                      <span className="ml-2 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {activeDiscount}% OFF
                      </span>
                    )}
                    {couponDiscount > 0 && (
                      <span className="ml-2 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        + {couponDiscount}% COUPON
                      </span>
                    )}
                  </div>

                  {/* Plan Duration */}
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <span className="font-medium text-muted-foreground">
                      Plan Duration:
                    </span>
                    <span className="font-semibold text-foreground">
                      {data.duration} days
                    </span>
                  </div>
                </div>
              </div>

              {Number(data.price) === 0 ? (
                <div className="flex flex-col space-y-4 mt-6 p-6 bg-card border border-border rounded-2xl shadow-sm items-center">
                  <h2 className="text-xl font-bold text-primary text-center">
                    Activate Free Plan
                  </h2>
                  <p className="text-center text-muted-foreground">
                    Click the button below to instantly activate your free plan and start connecting.
                  </p>
                  <Button 
                    onClick={handleActivateFreePlan} 
                    disabled={isActivating}
                    className="w-full max-w-sm rounded-full py-6 text-lg font-medium bg-gradient-to-r from-rose-600 to-primary transition-all duration-300 shadow-md"
                  >
                    {isActivating ? "Activating..." : "Activate Now"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col space-y-4 mt-6 p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold text-primary">
                      Have a Coupon Code?
                    </h2>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter code here" 
                        value={couponInput} 
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={selectedCoupon !== null}
                      />
                      {selectedCoupon ? (
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            setSelectedCoupon(null);
                            setCouponInput("");
                          }}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button onClick={handleApplyCoupon}>Apply</Button>
                      )}
                    </div>
                    {selectedCoupon && (
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        {selectedCoupon.percentage}% discount applied!
                      </p>
                    )}
                  </div>


                  {discountedPrice === 0 ? (
                    <div className="flex flex-col space-y-4 mt-6 p-6 bg-card border border-border rounded-2xl shadow-sm items-center">
                      <h2 className="text-xl font-bold text-green-600 text-center">
                        Plan is fully discounted!
                      </h2>
                      <p className="text-center text-muted-foreground">
                        Your coupon has made this plan completely free. You don't need to make any payment.
                      </p>
                      <Button 
                        onClick={handleClaimDiscountedPlan} 
                        disabled={isActivating}
                        className="w-full max-w-sm rounded-full py-6 text-lg font-medium bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300 shadow-md"
                      >
                        {isActivating ? "Claiming..." : "Claim Plan for Free"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4 mt-6 p-4 bg-card border border-border rounded-2xl shadow-sm">
                      <h2 className="text-xl font-bold text-primary">
                        Payment Method
                      </h2>
                      <div className="flex flex-col md:flex-row items-center gap-6 justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex flex-col items-center gap-2">
                          <p className="font-medium text-muted-foreground mb-2">Scan to Pay</p>
                          <div className="bg-white p-2 rounded-xl shadow-sm">
                            <Image
                              src="/payment/qr-code.svg"
                              alt="Payment QR Code"
                              width={150}
                              height={150}
                              className="rounded-lg object-contain"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Use any UPI app (GPay, PhonePe, Paytm)
                          </p>
                        </div>
                        <div className="w-px h-32 bg-border hidden md:block"></div>
                        <div className="flex flex-col justify-center gap-4 flex-1 w-full max-w-sm">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">UPI ID</p>
                            <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-3">
                              <span className="font-mono text-sm flex-1">{PAYMENT_UPI_ID}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                onClick={handleCopy}
                              >
                                <Copy size={16} />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg flex gap-3">
                            <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                              Please pay exactly <span className="font-bold">₹{discountedPrice}</span>. Any other amount may cause delays in plan activation.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <h3 className="font-semibold text-foreground mb-4">Confirm Payment</h3>
                        <ScreenshotUploadComponent
                          planId={planId as string}
                          ref={referanceId as string}
                          mid={messsageId as string}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <p className={`mt-4 text-center text-primary/80 text-lg md:text-xl`}>
                Welcome to the {companyDetails.name}
              </p>
              </div>
            </div>
        )
      )}
    </div>
  );
}
