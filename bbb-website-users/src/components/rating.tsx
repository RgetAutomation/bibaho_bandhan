import { useState } from "react";

interface RatingProps {
  value?: number;
  onChange?: (rating: number) => void;
}

export const RatingComponent = ({ value = 5, onChange }: RatingProps) => {
  const [selectedRating, setSelectedRating] = useState<number>(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rating = Number(e.target.value);
    setSelectedRating(rating);
    onChange?.(rating);
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <label key={star} className="cursor-pointer relative w-8 h-8">
          <input
            type="radio"
            name="rating"
            value={star}
            checked={selectedRating === star}
            onChange={handleChange}
            className="sr-only"
          />
          {/* Outline star */}
          <svg
            className="w-full h-full text-muted-foreground absolute top-0 left-0"
            stroke="currentColor"
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {/* Filled star */}
          <svg
            className={`w-full h-full absolute top-0 left-0 ${
              selectedRating >= star ? "text-yellow-400" : "text-transparent"
            }`}
            stroke="currentColor"
            fill="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </label>
      ))}
    </div>
  );
};
