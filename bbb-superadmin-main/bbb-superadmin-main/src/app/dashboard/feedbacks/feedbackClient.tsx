"use client";

import { deleteFeedbacksById } from "@/action/feedbacks";
import { CopyButton } from "@/components/copyButton";
import { EpmptyList } from "@/components/emptyList";
import { IFeedback } from "@/components/interface/IFeedback";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@radix-ui/react-avatar";
import {
  Angry,
  Frown,
  Laugh,
  Loader2,
  Mail,
  Meh,
  MessageSquareQuote,
  Phone,
  Smile,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function FeedbackClientPage({
  feedbacks,
}: {
  feedbacks: IFeedback[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return feedbacks;
    return feedbacks.filter(
      (ghotok) =>
        ghotok.name.toLowerCase().includes(query.toLowerCase()) ||
        ghotok.phone?.toLowerCase().includes(query.toLowerCase()) ||
        ghotok.email?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, feedbacks]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6 lg:p-8">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            All Feedbacks
          </h1>
          <Input
            placeholder="Search feedback user..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((fb) => (
            <FeedbackCard key={fb.id} fb={fb} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <EpmptyList
            title="No Feedbacks Found"
            subtitle="We could not find feedbacks to show here."
          />
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ fb }: { fb: IFeedback }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id);
      const response = await deleteFeedbacksById(id);
      if (response.success) {
        router.refresh();
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete feedback. Please try again.");
    } finally {
      setDeleteId(null);
    }
  };

  const ratingIcons = {
    "5": {
      icon: <Laugh size={25} className="text-green-500" />,
      label: "Excellence",
    },
    "4": { icon: <Smile size={25} className="text-lime-500" />, label: "Good" },
    "3": {
      icon: <Meh size={25} className="text-yellow-500" />,
      label: "Average",
    },
    "2": {
      icon: <Frown size={25} className="text-orange-500" />,
      label: "Poor",
    },
    "1": { icon: <Angry size={25} className="text-red-500" />, label: "Bad" },
  };
  const rating = ratingIcons[fb.rating as keyof typeof ratingIcons];
  return (
    <div
      key={fb.id}
      className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Top section: Avatar + Name + Date */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={""} alt={fb.name} />
            <AvatarFallback>{fb.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {fb.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-400">
              {new Date(fb.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {/* Rating badge */}
        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">
          {rating.icon}
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
            {rating.label}
          </span>
        </div>
      </div>

      {/* Feedback text */}
      <p className="mb-3 flex items-center gap-2 text-base leading-relaxed">
        <MessageSquareQuote className="h-4 w-4" />
        {fb.feedback}
      </p>

      <div className="flex items-end justify-between">
        {/* Contact info */}
        <div className="flex flex-col gap-1 space-y-1 text-sm">
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {fb.phone.startsWith("+91")
              ? fb.phone.replace("+91", "+91-")
              : `+91-${fb.phone}`}
            <CopyButton text={fb.phone} className="ml-2" />
          </span>
          {fb.email && (
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {fb.email}
              <CopyButton text={fb.phone} className="ml-2" />
            </span>
          )}
        </div>

        <Button
          className=""
          size="icon"
          onClick={() => handleDelete(fb.id)}
          disabled={deleteId === fb.id}
        >
          {deleteId === fb.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
