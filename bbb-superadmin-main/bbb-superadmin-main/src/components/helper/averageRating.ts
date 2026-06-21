export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce(
    (sum, r) => sum + parseFloat(r.rating.toString()),
    0
  );
  return parseFloat((total / reviews.length).toFixed(1)); // rounded to 1 decimal
}
