"use client";

import { getAllGhotokBrides } from "@/actions/ghotok";
import ApiErrorPage from "@/components/apiErrorPage";
import ButtonLoading from "@/components/buttonLoading";
import ContentNotFound from "@/components/contentNotFound";
import { IGhotokUser } from "@/components/interface/ghotok/IGhotokUser";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  Ban,
  CheckCircle2,
  Clipboard,
  Edit,
  Flag,
  Mars,
  Phone,
  Venus,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function GhotokBridesClientPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["getAllGhotokBrides", page],
    queryFn: () => getAllGhotokBrides(page, limit),
    placeholderData: keepPreviousData,
  });

  const users = data?.data;
  const pagination = data;

  const filtered = useMemo(() => {
    if (!query) return users;
    return users?.filter(
      (user) =>
        (user.firstName + " " + user.middleName + " " + user.lastName)
          .toString()
          .includes(query.toLowerCase()) ||
        user.phone.toString().includes(query.toLowerCase())
    );
  }, [query, users]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to get users"
      : "Something went wrong. Please try again.";

    return (
      <div className={"flex w-full flex-1 flex-col"}>
        <ApiErrorPage title="Failed to load users" description={errorMessage} />
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-1 flex-col">
      <div className="bg-card flex w-full flex-col justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}

        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
          Brides ({filtered?.length || 0})
        </h1>
        <div className={"flex items-center justify-between gap-2"}>
          <Input
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm md:w-64"
          />
          <Button asChild>
            <Link href="/dashboard/ghotok/users/new?gender=FEMALE">
              Create User
            </Link>
          </Button>
        </div>
      </div>

      {users?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ContentNotFound
            title="No Users found"
            description={"We couldn't find any users."}
          />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ContentNotFound
            title="No users found"
            description={"We couldn't find any users that match your search."}
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-3 md:p-4 lg:p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((user) => (
              <UserCard key={user.id} user={user} refetch={refetch} />
            ))}
          </div>

          {pagination && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage > 1) {
                        setPage((prev) => prev - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pagination.currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage < pagination.totalPages) {
                        setPage((prev) => prev + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}

function UserCard({
  user,
  refetch,
}: {
  user: IGhotokUser;
  refetch: () => void;
}) {
  const [updateStatus, setUpdateStatus] = useState(false);
  const hanleCopy = () => {
    navigator.clipboard.writeText(user.phone);
    toast.success("Phone number copied to clipboard");
  };

  const handleProfileActivateStatus = async (isActive: boolean) => {
    setUpdateStatus(true);
    try {
      const response = await api.get<AxiosResponse<null>>(
        isActive
          ? `/app/ghotok/users/profile/${user.id}/activate`
          : `/app/ghotok/users/profile/${user.id}/deactivate`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        refetch();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data.message
        : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setUpdateStatus(false);
    }
  };

  return (
    <div className={"bg-card flex flex-col gap-4 rounded-2xl border shadow-md"}>
      <Link
        href={`/dashboard/ghotok/users/${user.id}/view`}
        className={"hover:bg-primary/10 hover:rounded-t-2xl"}
      >
        <div className={"flex items-center gap-4 border-b p-4"}>
          <Avatar className={"size-12"}>
            <AvatarImage
              src={
                user.avatar
                  ? user.avatar
                  : user.gender === "MALE"
                    ? "/groom.webp"
                    : "/bride.webp"
              }
              alt={user.id}
            />
            <AvatarFallback>{user.lastName[0]}</AvatarFallback>
          </Avatar>
          <div className={"flex flex-col"}>
            <h1 className={"text-lg font-semibold"}>
              {user.title} {user.firstName} {user.middleName} {user.lastName}
            </h1>
            <div className={"flex items-center gap-1"}>
              {user.gender === "MALE" ? (
                <Mars className={"h-4 w-4 text-blue-500"} />
              ) : (
                <Venus className={"h-4 w-4 text-pink-500"} />
              )}
              {user.gender}
            </div>
          </div>
        </div>
      </Link>

      {/* Details Sesction */}
      <div className={"flex flex-col gap-2"}>
        <div
          className={
            "flex items-center justify-between gap-2 border-b px-4 pb-4"
          }
        >
          <div className={"flex items-center gap-2"}>
            <Phone className={"h-4 w-4"} />
            <span>+91-{user.phone}</span>
          </div>
          <Button onClick={hanleCopy} variant={"ghost"} size={"icon"}>
            <Clipboard className={"h-4 w-4"} />
          </Button>
        </div>

        <div
          className={
            "flex items-center justify-between gap-2 border-b px-4 pb-4"
          }
        >
          <div className={"flex items-center gap-2"}>
            <span>Profile : </span>
            <span>
              <Badge
                className={`rounded-full ${user.isProfileComplete ? "bg-green-500 dark:bg-green-800" : "bg-red-500"}`}
              >
                {user.isProfileComplete ? "Complete" : "Incomplete"}
              </Badge>
            </span>
          </div>
          <div className={"flex items-center gap-2"}>
            <span>Status : </span>
            <span>
              <Badge
                className={`rounded-full ${!user.blocked ? "bg-green-500 dark:bg-green-800" : "bg-red-500"}`}
              >
                {user.blocked ? "Inactive" : "Active"}
              </Badge>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className={"flex items-center gap-2 p-3"}>
            {!user.isProfileComplete && !user.blocked && (
              <Button asChild className={"rounded-full"} size={"sm"}>
                <Link
                  href={`/dashboard/ghotok/users/${user.id}/complete?gender=${user.gender}`}
                >
                  Update Profile
                </Link>
              </Button>
            )}
            {user.isProfileComplete && !user.blocked && (
              <Button
                asChild
                className={"rounded-full"}
                size={"sm"}
                variant={"outline"}
              >
                <Link
                  href={`/dashboard/ghotok/users/${user.id}/edit?gender=${user.gender}`}
                >
                  <Edit className={"h-4 w-4"} /> Edit Profile
                </Link>
              </Button>
            )}

            {user.isProfileComplete && !user.blocked && (
              <Button
                className={"rounded-full"}
                size={"sm"}
                variant={"destructive"}
                onClick={() => handleProfileActivateStatus(false)}
                disabled={updateStatus}
              >
                {updateStatus ? (
                  <ButtonLoading text={"Deactivating"} />
                ) : (
                  <>
                    <Ban className={"h-4 w-4"} /> Deactive Profile
                  </>
                )}
              </Button>
            )}

            {user.isProfileComplete && user.blocked && (
              <Button
                className={"rounded-full bg-green-600 dark:bg-green-800"}
                size={"sm"}
                onClick={() => handleProfileActivateStatus(true)}
                disabled={updateStatus}
              >
                {updateStatus ? (
                  <ButtonLoading text={"Activating"} />
                ) : (
                  <>
                    <CheckCircle2 className={"h-4 w-4"} /> Active Profile
                  </>
                )}
              </Button>
            )}
          </div>
          <Button variant={"secondary"} size={"icon"} className="me-3" asChild>
            <Link href={`/dashboard/ghotok/report/user/${user.id}`}>
              <Flag className={"h-4 w-4"} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
