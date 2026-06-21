import { infiniteQueryOptions } from "@tanstack/react-query";
import { getUsers } from "@/actions/api";

export default function createUsersInfiniteQueryOptions() {
  return infiniteQueryOptions({
    queryKey: ["users"],
    queryFn: ({ pageParam = 1 }) => getUsers({ page: pageParam, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
}
