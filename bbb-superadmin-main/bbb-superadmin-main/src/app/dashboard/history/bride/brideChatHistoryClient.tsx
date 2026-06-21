"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EpmptyList } from "@/components/emptyList";
import { IUsers } from "@/components/interface/IUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import UserCardView from "@/components/userCardView";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  data: IUsers[];
  page: number;
  totalPages: number;
  total: number;
  search: string;
};

export default function BrideChatHistoryClient({
  data,
  page,
  totalPages,
  total,
  search,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(search);
  const [sortBy, setSortBy] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`?page=${page}&q=${query}&sortBy=${sortBy}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, router, sortBy, page]);

  const goToPage = (p: number) => {
    router.push(`?page=${p}&q=${query}&sortBy=${sortBy}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:p-6 lg:p-8">
        {/* Title + Avatar */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/bride.webp" alt="Bride" />
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl lg:text-3xl dark:text-gray-100">
            Brides ({total})
          </h1>
        </div>

        {/* Search + Sort */}
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full md:w-72"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brides</SelectItem>
              <SelectItem value="direct-active">My Active Brides</SelectItem>
              <SelectItem value="direct-blocked">My Blocked Brides</SelectItem>
              <SelectItem value="ghotok-active">
                Ghotok Non-Block Brides
              </SelectItem>
              <SelectItem value="ghotok-blocked">
                Ghotok Blocked Brides
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {data?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <EpmptyList
            title="No Bride found"
            subtitle={"We couldn't find any bride."}
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 space-y-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((bride) => (
              <Link
                href={`/dashboard/history/bride/${bride.id}`}
                key={bride.id}
              >
                <UserCardView user={bride} />
              </Link>
            ))}
          </div>

          {data && total > 9 && (
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) {
                        goToPage(page - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) {
                        goToPage(page + 1);
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
