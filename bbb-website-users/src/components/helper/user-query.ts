import { queryOptions } from "@tanstack/react-query";
import { getUsers } from "@/actions/api";

export default function createUsersQueryOptions() {
  return queryOptions({
    queryKey: ["users"],
    queryFn: () => getUsers({ limit: 20 }),
    select: (data) => data,
  });
}
