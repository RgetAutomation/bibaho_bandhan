"use client";

import { getFreeGrooms } from "@/actions/getGrooms";
import ApiErrorPage from "@/components/apiErrorPage";
import ContentNotFound from "@/components/contentNotFound";
import { GroomBadgeType } from "@/components/enum/GroomBadgeType";
import { GroomComponent } from "@/components/helper/admin/groom-component";
import LoadingPage from "@/components/loader";
import { Groom } from "@/types/groom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export default function FreeClientPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllFreeGrooms"],
    queryFn: () => getFreeGrooms(),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load free grooms"
      : "Something went wrong. Please try again later.";
    return (
      <ApiErrorPage
        title={"Failed to load grooms"}
        description={errorMessage}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col md:min-h-min">
      <h1 className="border-b px-5 py-5 text-lg font-bold md:text-xl lg:text-2xl">
        Free Grooms
      </h1>
      {data && data.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((groom: Groom) => (
            <GroomComponent
              key={groom.id}
              groom={groom}
              groomBadge={GroomBadgeType.FREE}
              canReport={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-screen w-full flex-1 items-center justify-center md:min-h-min">
          <ContentNotFound
            title={"Free Grooms Not Found"}
            description={
              "We couldn't find any free grooms. Please try again later."
            }
          />
        </div>
      )}
    </div>
  );
}
