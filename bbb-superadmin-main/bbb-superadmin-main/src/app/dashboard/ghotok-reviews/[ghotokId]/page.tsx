export const dynamic = "force-dynamic";

import { getAllGhotokReviewsById } from "@/action/review";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { IGhotokReviewDetail } from "@/components/interface/IGhotokReview";
import { calculateAverageRating } from "@/components/helper/averageRating";
import Link from "next/link";
import {
  RatingIcon50,
  RatingIcon45,
  RatingIcon40,
  RatingIcon35,
  RatingIcon30,
  RatingIcon25,
  RatingIcon20,
  RatingIcon15,
  RatingIcon10,
} from "@/components/resource/image/icons/rating-icon";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function GhotokReviewsPage({
  params,
}: {
  params: Promise<{ ghotokId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { ghotokId } = await params;
  const reviews = await getAllGhotokReviewsById(ghotokId);

  if (!reviews) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 lg:px-4">
        <div className="p-4">No reviews found for this Ghotok.</div>
      </div>
    );
  }

  const ghotokFullName = `${reviews?.firstName} ${reviews?.middleName ?? ""} ${
    reviews?.lastName
  }`.trim();
  const averageRating = calculateAverageRating(
    reviews?.ghotokReviews as IGhotokReviewDetail[]
  );
  return (
    <div className="container mx-auto space-y-4 p-4 lg:px-4">
      <div className="flex items-center justify-between p-2 md:p-4">
        <Link href={`/dashboard/profile/team/${ghotokId}`}>
          <div className="flex gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={reviews?.avatar || ""} />
              <AvatarFallback>
                {reviews?.firstName?.charAt(0).toUpperCase()}
                {reviews?.lastName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{ghotokFullName}</h1>
              <p className="text-muted-foreground text-sm">
                {reviews?.ghotokReviews.length ?? 0} Reviews
              </p>
              <p className="text-muted-foreground text-sm">
                Average Rating: {averageRating.toFixed(1)} / 5
              </p>
            </div>
          </div>
        </Link>
      </div>
      {reviews.ghotokReviews.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="p-4">No reviews available.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews?.ghotokReviews.map((review) => (
            <RatingCardView key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function RatingCardView({ review }: { review: IGhotokReviewDetail }) {
  const reviewerName = `${review.user.title} ${review.user.firstName} ${
    review.user.middleName ?? ""
  } ${review.user.lastName}`.trim();

  const Rating = ({ rating }: { rating: number }) => {
    if (rating >= 5) return <RatingIcon50 className="h-6 w-auto" />;
    if (rating >= 4.5) return <RatingIcon45 className="h-6 w-auto" />;
    if (rating >= 4) return <RatingIcon40 className="h-6 w-auto" />;
    if (rating >= 3.5) return <RatingIcon35 className="h-6 w-auto" />;
    if (rating >= 3) return <RatingIcon30 className="h-6 w-auto" />;
    if (rating >= 2.5) return <RatingIcon25 className="h-6 w-auto" />;
    if (rating >= 2) return <RatingIcon20 className="h-6 w-auto" />;
    if (rating >= 1.5) return <RatingIcon15 className="h-6 w-auto" />;
    if (rating == 1) return <RatingIcon10 className="h-6 w-auto" />;
    return <span className="text-gray-400">No rating</span>;
  };

  return (
    <div
      key={review.id}
      className="bg-muted/30 max-w-lg rounded-lg border shadow-sm"
    >
      {/* Reviewer Info */}
      <Link
        href={`/dashboard/profile/user/${review.user.id}`}
        className="hover:bg-primary/10 flex items-center gap-3 border-b p-4 transition-all duration-200 ease-in-out hover:rounded-t-lg"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={
              review.user?.avatar
                ? review.user?.avatar
                : review.user?.gender === "MALE"
                  ? "/groom.webp"
                  : "/bride.webp"
            }
          />
          <AvatarFallback>
            {review.user.firstName[0]}
            {review.user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{reviewerName}</p>
          <p className="text-muted-foreground text-xs">
            +91 {review.user.phone}
          </p>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Rating rating={Number(review.rating)} />

          <Badge variant="outline" className="ml-2">
            {review.rating} / 5
          </Badge>
        </div>

        {/* Review Text */}
        <p className="text-sm italic">“{review.review}”</p>

        {/* Date */}
        <p className="text-muted-foreground text-xs">
          {format(new Date(review.createdAt), "dd MMM yyyy")} - (
          {formatDistanceToNow(new Date(review.createdAt), {
            addSuffix: true,
          })}{" "}
          )
        </p>
      </div>
    </div>
  );
}
