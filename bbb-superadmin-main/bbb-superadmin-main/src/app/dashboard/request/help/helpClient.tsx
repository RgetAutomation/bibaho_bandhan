"use client";

import { getAllHelpRequests } from "@/action/helpRequest";
import { EpmptyList } from "@/components/emptyList";
import { IHelpRequest } from "@/components/interface/IHelpRequest";
import { IPaginatedResult } from "@/components/interface/IPagenation";
import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { isAxiosError } from "axios";
import {
  Check,
  Clipboard,
  Info,
  MessageSquare,
  Phone,
  Reply,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

export default function HelpClientPage() {
  const [sortBy, setSortBy] = useState("LATEST");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  const [helpRequests, setHelpRequests] = useState<IPaginatedResult<IHelpRequest[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    getAllHelpRequests(page, limit)
      .then((data) => {
        if (isMounted) {
          setHelpRequests(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
      
    return () => {
      isMounted = false;
    };
  }, [page, limit]);

  const filteredAndSorted = useMemo(() => {
    let filtered = helpRequests?.data || [];

    // 1️⃣ Filter by search query
    if (query) {
      filtered = filtered?.filter(
        (help) =>
          help.name.toLowerCase().includes(query.toLowerCase()) ||
          help.phone.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 2️⃣ Sort filtered results
    return [...filtered].sort((a, b) => {
      if (
        sortBy === "PENDING" ||
        sortBy === "INPROGRESS" ||
        sortBy === "RESOLVED"
      ) {
        // Push selected status to the top
        const aPriority = a.status.toUpperCase() === sortBy ? 0 : 1;
        const bPriority = b.status.toUpperCase() === sortBy ? 0 : 1;

        const priorityDiff = aPriority - bPriority;
        if (priorityDiff !== 0) return priorityDiff;

        // If same priority (both selected or both other), sort by newest first
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (sortBy === "LATEST") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (sortBy === "OLDEST") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      return 0; // default: no sorting
    });
  }, [helpRequests, query, sortBy]);

  if (isLoading && !helpRequests) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error?.response?.data?.message || "Failed to load data"
      : "Something went wrong. Please try again.";

    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
           <h2 className="text-xl font-bold">Failed to load data</h2>
           <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:p-6 lg:p-8">
        {/* Title + Avatar */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl lg:text-3xl dark:text-gray-100">
            Help Requests
          </h1>
        </div>

        {/* Search + Sort */}
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full md:w-72"
          />
          <Select onValueChange={setSortBy} defaultValue="LATEST">
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LATEST">LATEST</SelectItem>
              <SelectItem value="OLDEST">OLDEST</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="INPROGRESS">INPROGRESS</SelectItem>
              <SelectItem value="RESOLVED">RESOLVED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex w-full flex-1 flex-col">
        {filteredAndSorted.length > 0 ? (
          <div
            className={
              "flex w-full flex-1 flex-col items-center justify-between p-5"
            }
          >
            <div className="grid w-full grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
              {filteredAndSorted.map((request) => (
                <RequestCardView key={request.id} request={request} />
              ))}
            </div>
            {helpRequests && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault();
                        if (helpRequests.currentPage > 1) {
                          setPage((prev) => prev - 1);
                        }
                      }}
                    />
                  </PaginationItem>

                  {Array.from({ length: helpRequests.totalPages }).map(
                    (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={helpRequests.currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          helpRequests.currentPage < helpRequests.totalPages
                        ) {
                          setPage((prev) => prev + 1);
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <EpmptyList
              title="No Requests Found"
              subtitle="We could not find any help request that matches your search."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCardView({ request }: { request: IHelpRequest }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    INPROGRESS: request.isReopened ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
  };

  const statusLabel = (status: string) => {
    if (status === "INPROGRESS" && request.isReopened) return "REOPENED";
    if (status === "INPROGRESS") return "IN PROGRESS";
    return status;
  };

  return (
    <div className="bg-card relative flex w-full flex-1 flex-col rounded-2xl border p-3 shadow-lg transition-shadow duration-300 hover:shadow-xl">
      {request.isNew ? (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 border border-green-200 text-green-600 shadow-md animate-pulse">
          <MessageSquare className="h-3 w-3" />
        </span>
      ) : request.hasUnread ? (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 border border-red-200 text-red-600 shadow-md animate-pulse">
          <MessageSquare className="h-3 w-3" />
        </span>
      ) : null}
      {/* Header */}
      <div className="mb-4 flex items-start justify-between p-2">
        <h3 className="text-lg font-semibold">
          {request.createdAt &&
            format(new Date(request.createdAt), "dd MMM yyyy")}
        </h3>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              statusColor[request.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            <Info className="h-4 w-4" /> {statusLabel(request.status)}
          </span>
      </div>

      <div className="flex w-full flex-1 flex-col justify-between">
        <div className="w-full">
          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="divide-border bg-card flex flex-col divide-y overflow-hidden rounded-xl border shadow-sm">
              <div className="flex items-center gap-2 p-3">
                <UserRound className="size-4" />
                <div className="text-md flex-1 font-bold break-all">
                  {request.name}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 px-3 py-1">
                <Phone className="size-4" />
                <div className="flex-1 text-sm break-all">{request.phone}</div>
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  onClick={() => copyToClipboard(request.phone, "phone")}
                  className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-zinc-700"
                  title="Copy Phone"
                >
                  {copiedField === "phone" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-2 rounded-xl border bg-gray-50 p-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-zinc-800">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <span className="leading-relaxed">Reason: </span>
                </div>
                <div className="flex-1 text-sm break-all">{request.reason}</div>
              </div>

              {request.message && (
                <div className="flex items-start gap-2 text-sm">
                  <div
                    className={"text-muted-foreground flex items-center gap-2"}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Message:</span>
                  </div>
                  <p>{request.message}</p>
                </div>
              )}

              {request.feedback && (
                <div className="flex items-start gap-2 text-sm">
                  <div
                    className={"text-muted-foreground flex items-center gap-2"}
                  >
                    <Reply className="h-4 w-4" />
                    <span className="font-medium">Feedback:</span>
                  </div>
                  <p>{request.feedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Button className="mt-3 w-full" asChild>
        <Link href={`/dashboard/request/help/${request.id}`}>View Details</Link>
      </Button>
    </div>
  );
}
