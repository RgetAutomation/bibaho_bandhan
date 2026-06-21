"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllGhotokGrooms } from "@/actions/ghotok";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ContentNotFound from "@/components/contentNotFound";
import Link from "next/link";
import { BASE_URL } from "@/components/helper/constant";

export default function HomeGroomsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllGhotokGrooms"],
    queryFn: () => getAllGhotokGrooms(1, 100),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ContentNotFound
          title="Something went wrong!"
          description="We couldn't load the grooms right now."
        />
      </div>
    );
  }

  const grooms = data.data;

  return (
    <div className="flex w-full flex-col p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Home Grooms
      </h1>

      {grooms.length === 0 ? (
        <ContentNotFound
          title="No Grooms Found"
          description="There are currently no grooms available."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {grooms.map((groom) => (
            <Link
              key={groom.id}
              href={`/dashboard/ghotok/home-grooms/${groom.id}`}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md dark:border-slate-700"
            >
              <Avatar className="h-16 w-16 border">
                <AvatarImage
                  src={
                    groom.avatar
                      ? groom.avatar.startsWith("http")
                        ? groom.avatar
                        : `${BASE_URL}/images/avatars/${groom.avatar}`
                      : ""
                  }
                  alt={groom.firstName || ""}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg">
                  {groom.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {groom.title} {groom.firstName} {groom.lastName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ID : {groom.publicId}
                </p>
                <p className="text-xs font-medium text-primary mt-0.5">
                  Gender: {groom.gender === "MALE" ? "Male" : "Female"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
