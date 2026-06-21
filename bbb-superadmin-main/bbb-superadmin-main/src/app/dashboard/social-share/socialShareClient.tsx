"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EpmptyList } from "@/components/emptyList";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import UserCardView from "@/components/userCardView";
import { IUsers } from "@/components/interface/IUsers";
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

export default function SocialShareClient({
  data,
  page,
  totalPages,
  total,
  search,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(search);
  const [sortBy, setSortBy] = useState("all");

  // Filter + Sort combined
  // 🔍 Server-side search
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
    <div className="flex w-full flex-1 flex-col">
      <div className="flex w-full flex-col items-center justify-between gap-4 p-4 md:flex-row md:p-6 lg:p-8">
        {/* Title + Avatar */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl lg:text-3xl dark:text-gray-100">
            Users ({total})
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
          <Select onValueChange={setSortBy} defaultValue="all">
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="brides">Brides</SelectItem>
              <SelectItem value="grooms">Grooms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {data?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <EpmptyList
            title="No Users Found"
            subtitle="We could not find any users that matches your search."
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-5"
          }
        >
          <div className="mb-3 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((groom) => (
              <Link href={`/dashboard/profile/user/${groom.id}`} key={groom.id}>
                <UserCardView user={groom} />
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
