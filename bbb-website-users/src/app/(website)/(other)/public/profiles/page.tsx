"use client";

import { getAllPublicProfile } from "@/actions/getPublicProfile";
import { getAgeByDob } from "@/components/functions/getAgeByDob";
import { IPublicProfile } from "@/components/interface/IPublicProfile";
import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftCircle, Info, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { AUTHENTICATION_REGISTER } from "@/components/helper/constant";
import { useAuthSession } from "@/hooks/useAuthSession";
import Image from "next/image";

export default function AllPublicProfiles() {
  const { user, isPending } = useAuthSession();

  const [selectedProfile, setSelectedProfile] = useState<IPublicProfile | null>(
    null
  );
  const { data, isLoading, error } = useQuery({
    queryKey: ["publicProfile"],
    queryFn: () => getAllPublicProfile(),
  });

  if (isLoading || isPending)
    return (
      <div className="flex flex-col flex-1 min-h-full my-auto">
        <LoadingPage />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col flex-1 min-h-full my-auto">
        <p>Something went wrong</p>
      </div>
    );

  return (
    <section className="flex flex-col items-center justify-center bg-gradient-to-t from-rose-100 to-white border-t dark:from-zinc-800 dark:to-zinc-900 py-16 px-6 sm:px-10 lg:px-20">
      {/* Header */}
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-rose-600 dark:text-white">
          Featured Profiles
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Meet some of our recently active members. Explore their details and
          start your journey toward finding the right match.
        </p>
      </div>

      {/* Profiles Grid */}
      {data?.length && data?.length > 0 ? (
        <div className="w-full flex flex-wrap gap-6 sm:gap-8 items-stretch justify-center">
          {data?.map((profile: IPublicProfile) => (
            <div
              className="w-full max-w-[280px] sm:w-[280px] cursor-pointer flex flex-col items-center justify-center"
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
            >
              <PublicProfileCard profile={profile} />
            </div>
          ))}

          <AlertDialog
            open={!!selectedProfile}
            onOpenChange={() => setSelectedProfile(null)}
          >
            <AlertDialogContent className="rounded-2xl shadow-lg border max-w-md">
              <AlertDialogHeader className="text-center space-y-2">
                <AlertDialogTitle className="text-xl font-semibold text-zinc-800 dark:text-white">
                  {user?.id
                    ? selectedProfile?.gender !== user.gender
                      ? "View Profile"
                      : "Cannot View Profile"
                    : "Create an Account to View More"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {user?.id ? (
                    selectedProfile?.gender !== user.gender ? (
                      <>
                        You can view the full details of{" "}
                        <span className="font-medium">
                          {selectedProfile?.title} {selectedProfile?.lastName}
                        </span>
                        . Just click the button below.
                      </>
                    ) : (
                      <>
                        You cannot view the profile because both are same
                        gender.
                      </>
                    )
                  ) : (
                    <>
                      To view the full details of{" "}
                      <span className="font-medium">
                        {selectedProfile?.title} {selectedProfile?.lastName}
                      </span>
                      , you need to create an account with us. It only takes a
                      minute!
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">
                  <ArrowLeftCircle className="w-5 h-5" />
                  <span>Back</span>
                </AlertDialogCancel>
                {selectedProfile?.gender !== user?.gender && (
                  <AlertDialogAction asChild className="rounded-full">
                    {user?.id ? (
                      <Link href={`/users/profile/${selectedProfile?.id}`}>
                        <span>View Profile</span>
                      </Link>
                    ) : (
                      <Link href={AUTHENTICATION_REGISTER}>
                        <PlusCircle className="w-5 h-5" />
                        <span>Create an Account</span>
                      </Link>
                    )}
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Info className="w-12 h-12 bg-card p-2 rounded-full" />
          <p className="text-muted-foreground text-sm sm:text-base">
            No public profiles found.
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 text-center space-y-4 max-w-xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-800 dark:text-white">
          Ready to Find Your Match?
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Create your profile today and explore thousands of genuine members
          waiting to connect.
        </p>
        <Button
          className="rounded-full text-base px-6 py-2 shadow-md hover:shadow-lg transition-all"
          asChild
        >
          <Link href={user?.id ? "/users/home" : AUTHENTICATION_REGISTER}>
            <span>View More Profiles</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}

function PublicProfileCard({ profile }: { profile: IPublicProfile }) {
  return (
    <div
      key={profile.id}
      className="group relative w-full sm:w-fit sm:min-w-[16rem] flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
    >
      {/* Profile Image */}
      <Image
        src={
          profile.avatar
            ? profile.avatar
            : profile.gender === "MALE"
            ? "/groom.webp"
            : "/bride.webp"
        }
        alt={`${profile.title} ${profile.lastName}`}
        width={400}
        height={500}
        className="w-full h-72 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-2xl z-10" />

      {/* Text Overlay */}
      <div className="absolute bottom-0 left-0 w-full z-20 p-4 flex flex-col gap-1 text-left">
        <h2 className="text-lg font-semibold text-white drop-shadow">
          {profile.title} {profile.lastName},{" "}
          {getAgeByDob(profile.profile?.dob || new Date().toISOString())}
        </h2>

        <p className="text-sm text-zinc-200 truncate">
          {profile.profile?.dist
            ? profile.profile.dist
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "-"}
          ,{" "}
          {profile.profile?.state
            ? profile.profile.state
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "-"}
        </p>
      </div>

      {/* Subtle hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
    </div>
  );
}
