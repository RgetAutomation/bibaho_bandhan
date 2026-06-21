"use client";

import { getPublicUserProfile } from "@/actions/ghotok";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { FlagIcon, IndianRupee } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { UserGender } from "@/components/enum/UserGender";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IProfileImage {
  id: string;
  url: string;
}

export default function PublicUserProfileClient({
  userId,
}: {
  userId: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["publicUserProfile", userId],
    queryFn: () => getPublicUserProfile(userId),
  });

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load profile"
      : "Something went wrong";

    return (
      <ApiErrorPage
        title={"Failed to load profile"}
        description={errorMessage}
      />
    );
  }

  const skinToneColor =
    data?.skinTone === "Light"
      ? "bg-[#f8d2b3]"
      : data?.skinTone === "Fair"
        ? "bg-[#ebb68f]"
        : data?.skinTone === "Medium"
          ? "bg-[#cfa07c]"
          : data?.skinTone === "Tan"
            ? "bg-[#bd7852]"
            : data?.skinTone === "Brown"
              ? "bg-[#90493d]"
              : "bg-[#3c1f1b]";

  const profileImage: IProfileImage = {
    id: data?.id as string,
    url: data?.avatar as string,
  };
  const profileImages = [profileImage, ...(data?.profileImages || [])];

  return (
    <div className="flex max-w-lg flex-1 flex-col">
      <div className="flex w-full flex-col items-center overflow-y-auto p-4 transition-shadow duration-300">
        <div className="flex w-full flex-col items-center">
          <div className="bg-card w-full rounded-3xl border p-4 shadow-lg hover:shadow-xl">
            {/* content */}
            <div className="w-full space-y-1 text-center">
              {profileImages && profileImages.length > 0 && (
                <div className="relative flex w-full flex-col items-center justify-center">
                  <Carousel className="relative w-full" setApi={setApi}>
                    <CarouselContent>
                      {profileImages.map((image, index) => (
                        <CarouselItem
                          key={index}
                          className="flex justify-center rounded-xl"
                        >
                          {/* 👇 The rounded + overflow-hidden container */}
                          <div className="relative isolate aspect-square w-full overflow-hidden rounded-xl">
                            {image.url && (
                              <div className="absolute inset-0 overflow-hidden rounded-xl">
                                <Image
                                  src={image.url}
                                  alt={`Background blur ${index}`}
                                  fill
                                  className="scale-110 rounded-xl object-cover blur-lg"
                                />
                              </div>
                            )}

                            {/* Actual image */}
                            <Image
                              key={image.id}
                              src={
                                image.url
                                  ? image.url
                                  : data?.gender === UserGender.MALE
                                    ? "/groom.webp"
                                    : "/bride.webp"
                              }
                              alt={`Profile Image ${index}`}
                              fill
                              className="rounded-xl object-contain"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    {current > 1 && (
                      <div className={"absolute top-1/2 left-12"}>
                        <CarouselPrevious
                          variant={"default"}
                          className="bg-primary/60 rounded-l-none"
                        />
                      </div>
                    )}
                    {current < profileImages?.length && (
                      <div className={"absolute top-1/2 right-12"}>
                        <CarouselNext
                          variant={"default"}
                          className="bg-primary/60 rounded-r-none"
                        />
                      </div>
                    )}
                  </Carousel>

                  <div className="bg-card/80 absolute bottom-2 rounded-full px-3 text-center text-sm">
                    {current} / {profileImages?.length}
                  </div>
                </div>
              )}

              <div className="flex w-full flex-col items-start gap-1 py-5 pl-1">
                <h1 className="text-lg font-semibold md:text-xl">
                  {data?.title} {data?.lastName}
                </h1>

                <div className="text-muted-foreground flex gap-2 text-sm">
                  <span>{data?.publicId}</span>
                  {/* {data?.status === "Online" ? (
                    <div className="flex items-center gap-1">
                      <div className="h-[0.62rem] w-[0.62rem] rounded-full bg-green-600" />
                      <span className="font-bold">Online</span>
                    </div>
                  ) : (
                    data?.status
                  )} */}
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center space-x-2">
                  {[
                    data?.maritalStatus,
                    data?.age ? `${data?.age} years` : null,
                    data?.height,
                    data?.subCaste && data?.subCaste,
                    data?.education,
                    data?.profession,
                    data?.dist && data?.state
                      ? `${data?.dist
                          .toLowerCase()
                          .replace(/\b\w/g, (c) =>
                            c.toUpperCase()
                          )}, ${data?.state
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase())}`
                      : null,
                  ]
                    .filter(Boolean)
                    .map((item, index, arr) => (
                      <div key={index} className="flex items-center gap-2">
                        <span>{item}</span>
                        {index !== arr.length - 1 && (
                          <div className="bg-muted-foreground h-1 w-1 rounded-full" />
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div
                className={
                  "from-primary flex rounded-l-xl bg-linear-to-r to-transparent p-2"
                }
              >
                <h1 className="px-2 text-lg font-semibold">Personal Details</h1>
              </div>

              <div className="mt-4 w-full space-y-5 text-sm">
                {data?.maritalStatus && (
                  <Field label="Marital Status" value={data.maritalStatus} />
                )}

                {(data?.children ?? 0) > 0 && (
                  <Field
                    label="Children"
                    value={`${data?.children} ${
                      data?.children === 1 ? "child" : "children"
                    }`}
                  />
                )}

                {data?.religion && (
                  <Field label="Religion" value={data.religion} />
                )}

                {data?.gotra && <Field label="Gothra" value={data.gotra} />}

                {data?.caste && <Field label="Caste" value={data.caste} />}

                {data?.subCaste && (
                  <Field label="Sub-caste" value={data.subCaste} />
                )}

                <Field
                  label="Manglik Dosha"
                  value={
                    data?.manglikDosh
                      ? "Yes, I'm Manglik"
                      : "No, I'm not Manglik"
                  }
                />

                {data?.dist && data?.state && (
                  <Field
                    label="Lives In"
                    value={`${data.dist}, ${data.state}`}
                  />
                )}
                {data?.language && (
                  <Field label="Spoken Language" value={data.language} />
                )}

                <div className="space-y-5">
                  {data?.bloodGroup && (
                    <Field label="Blood Group" value={data.bloodGroup} />
                  )}

                  {data?.education && (
                    <Field label="Education" value={data.education} />
                  )}

                  {data?.profession && (
                    <Field label="Profession" value={data.profession} />
                  )}

                  <Field
                    label="Specially Able"
                    value={data?.speciallyAble ? "Yes" : "No"}
                  />

                  {data?.height && (
                    <Field label="Height" value={`${data.height} cm`} />
                  )}

                  {data?.weight && (
                    <Field label="Weight" value={`${data.weight} kg`} />
                  )}

                  {data?.skinTone && (
                    <Field
                      label="Skin Tone"
                      value={
                        <div className="flex items-center gap-2">
                          <div
                            className={`${skinToneColor} h-4 w-4 rounded-full`}
                          />
                          {data.skinTone}
                        </div>
                      }
                    />
                  )}

                  {data?.bodyType && (
                    <Field label="Body Type" value={data.bodyType} />
                  )}

                  {data?.hobbies && (
                    <Field label="Hobbies" value={data.hobbies} />
                  )}

                  {data?.monthlyIncome && (
                    <Field
                      label="Annual Income"
                      value={
                        <span className="flex items-center gap-1">
                          <IndianRupee size={12} />
                          {data.monthlyIncome}
                        </span>
                      }
                    />
                  )}

                  {data?.eatingHabits && (
                    <Field label="Eating Habits" value={data.eatingHabits} />
                  )}

                  {data?.drinkingHabits && (
                    <Field
                      label="Drinking Habits"
                      value={data.drinkingHabits}
                    />
                  )}

                  {data?.smokingHabits && (
                    <Field label="Smoking Habits" value={data.smokingHabits} />
                  )}

                  {data?.aboutMyself && (
                    <Field label="About Myself" value={data.aboutMyself} />
                  )}

                  {data?.familyMembers ||
                  data?.fatherProfession ||
                  data?.candidatePreference ||
                  data?.locationPreference ? (
                    <div
                      className={
                        "from-primary flex rounded-l-xl bg-linear-to-r to-transparent p-2"
                      }
                    >
                      <h1 className="px-2 text-lg font-semibold">
                        Others Details
                      </h1>
                    </div>
                  ) : null}

                  {data?.aboutMyPartner && (
                    <Field
                      label="About My Partnet"
                      value={data.aboutMyPartner}
                    />
                  )}

                  {data?.familyMembers !== undefined &&
                    data?.familyMembers !== null &&
                    Number(data.familyMembers) !== 0 && (
                      <Field
                        label="Family Members"
                        value={
                          isNaN(Number(data.familyMembers))
                            ? data.familyMembers
                            : `${Number(data.familyMembers)} ${
                                Number(data.familyMembers) === 1
                                  ? "member"
                                  : "members"
                              }`
                        }
                      />
                    )}

                  {data?.fatherProfession && (
                    <Field
                      label="Father Occupation"
                      value={data.fatherProfession}
                    />
                  )}

                  {data?.candidatePreference && (
                    <Field
                      label="Preferred Life-partner"
                      value={data.candidatePreference}
                    />
                  )}

                  {data?.locationPreference && (
                    <Field
                      label="Preferred Location"
                      value={data.locationPreference}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button asChild className="mx-4 mb-8 rounded-full">
        <Link href={`/dashboard/ghotok/report/user/${userId}`}>
          <FlagIcon /> Report Profile
        </Link>
      </Button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-5 items-start text-start">
      <span className="text-muted-foreground col-span-2 flex font-medium">
        {label}
      </span>
      <div className="col-span-3 flex items-start gap-4">
        <span>:</span>
        <span className="flex items-start font-medium">{value}</span>
      </div>
    </div>
  );
}
