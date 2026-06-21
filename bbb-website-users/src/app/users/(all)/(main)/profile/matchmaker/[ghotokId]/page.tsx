"use client";

import { getGhotokProfileDetailsById } from "@/actions/ghotok";
import ApiErrorPage from "@/components/apiErrorPage";
import DashboardHeader from "@/components/dashboard/header";
import { UserGender } from "@/components/enum/userGender";
import {
  RatingIcon10,
  RatingIcon15,
  RatingIcon20,
  RatingIcon25,
  RatingIcon30,
  RatingIcon35,
  RatingIcon40,
  RatingIcon45,
  RatingIcon50,
} from "@/components/icons/rating-icon";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import LoadingPage from "@/components/loader";
import { LoadingButton } from "@/components/loadingButton";
import { RatingComponent } from "@/components/rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

const FormSchema = z.object({
  review: z
    .string()
    .min(3, {
      message: "Review must be at least 3 characters.",
    })
    .max(160, {
      message: "Review must be at most 160 characters.",
    }),
});

export default function MatchmakerProfileView() {
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { ghotokId } = useParams<{ ghotokId: string }>();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ghotokProfileDetails"],
    queryFn: () => getGhotokProfileDetailsById(ghotokId),
    //enabled: userType !== UserType.FREE_USER,
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      review: "",
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load matchmaker profile"
      : "Something went wrong";

    return (
      <ApiErrorPage
        title={"Failed to load profile"}
        description={errorMessage}
      />
    );
  }

  async function onSubmit(value: z.infer<typeof FormSchema>) {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/users/ghotok/review",
        {
          ghotokId: data?.id,
          rating: rating,
          review: value.review,
        }
      );
      if (response.data.success) {
        toast.success("Review submitted successfully");
        form.reset();
        refetch();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to submit review"
        : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const ghotokRatingForIcon = Math.round((data?.averageRating || 0) * 2) / 2;
  const userRatingForIcon = Math.round((data?.yourReview.rating || 0) * 2) / 2;
  return (
    <div className={"flex flex-col flex-1 pb-[80px]"}>
      <DashboardHeader
        title={
          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4">
            <h1 className="font-semibold text-lg md:text-xl">
              Matchmaker Profile
            </h1>
          </div>
        }
      />

      <div className="w-full flex flex-col gap-4 p-2 md:p-4">
        {/* Profile Card */}
        <div
          className={
            "w-full flex items-center gap-4 border shadow-md bg-card rounded-2xl p-3 sm:p-4 md:p-5"
          }
        >
          <Avatar className={"size-12"}>
            <AvatarImage
              src={
                data?.gender === UserGender.FEMALE
                  ? "/bride.webp"
                  : "/groom.webp"
              }
            />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>

          <div className={"flex flex-col"}>
            <h1 className={"font-semibold text-lg"}>
              BBBMM{data?.ghotokPublicId}
            </h1>
            <div className={"flex gap-2 text-muted-foreground text-sm"}>
              <p>
                {data?.averageRating === 0
                  ? "No reviews"
                  : data?.averageRating
                  ? data?.averageRating.toFixed(1)
                  : "0.0"}
              </p>
              {data?.averageRating && (
                <p className={"text-sm w-full"}>
                  <GetReviewIcon review={ghotokRatingForIcon.toFixed(1)} />
                </p>
              )}
              <p>({data?.reviewCount})</p>
            </div>
          </div>
        </div>

        {/* Your Review */}
        {data?.yourReview.rating && (
          <div
            className={
              "w-full flex flex-col gap-2 border shadow-md bg-card rounded-2xl p-3 sm:p-4 md:p-5"
            }
          >
            <h1 className={"font-semibold text-xl"}>Your Review</h1>

            <div className={"flex flex-col"}>
              <div className={"flex gap-2 items-center"}>
                <span className={"text-muted-foreground"}>Rating : </span>
                <p className={"text-lg"}>
                  {Number(data?.yourReview.rating).toFixed(1)}
                </p>
                {data?.averageRating && (
                  <p className={"text-sm w-1/3"}>
                    <GetReviewIcon
                      review={Number(userRatingForIcon).toFixed(1)}
                    />
                  </p>
                )}
              </div>

              <div className={"flex gap-2 items-center"}>
                <span className={"text-muted-foreground"}>Review : </span>
                <p className={"text-lg"}>{data?.yourReview.review}</p>
              </div>

              <div className={"flex gap-2 items-center"}>
                <span className={"text-muted-foreground"}>Reviewed At : </span>
                <p className={"text-lg"}>
                  {format(data?.yourReview?.updatedAt, "dd MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={"flex flex-col gap-4"}>
          <div className={"flex flex-col p-2 md:p-3"}>
            <h1 className="font-semibold text-xl">Give a review</h1>
            <p className={"text-sm text-muted-foreground"}>
              Give your own valuable review of this matchmaker profile to
              improve their profile
            </p>
          </div>
          <div
            className={
              "w-full flex items-center gap-4 border shadow-md bg-card rounded-2xl p-3 sm:p-4 md:p-5"
            }
          >
            <div className={"flex fle-1 flex-col gap-4 items-center w-full"}>
              <div className={"mt-4"}>
                <RatingComponent value={rating} onChange={setRating} />
              </div>

              <p>
                <ReviewType review={rating.toString()} />
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="review"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Write a review</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us your experience with this matchmaker"
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className={"w-full rounded-full"}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoadingButton title="Submitting..." />
                    ) : (
                      "Send Review"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewType({ review }: { review?: string }) {
  if (!review) return null;
  switch (review) {
    case "5":
      return "Excellent";
    case "4":
      return "Very Good";
    case "3":
      return "Good";
    case "2":
      return "Average";
    case "1":
      return "Bad";
    default:
      return null;
  }
}

function GetReviewIcon({ review }: { review: string }) {
  if (review === "5.0") {
    return <RatingIcon50 />;
  } else if (review === "4.5") {
    return <RatingIcon45 />;
  } else if (review === "4.0") {
    return <RatingIcon40 />;
  } else if (review === "3.5") {
    return <RatingIcon35 />;
  } else if (review === "3.0") {
    return <RatingIcon30 />;
  } else if (review === "2.5") {
    return <RatingIcon25 />;
  } else if (review === "2.0") {
    return <RatingIcon20 />;
  } else if (review === "1.5") {
    return <RatingIcon15 />;
  } else if (review === "1.0") {
    return <RatingIcon10 />;
  }
  return null;
}
