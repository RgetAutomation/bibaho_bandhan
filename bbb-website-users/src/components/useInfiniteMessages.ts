import api from "@/lib/axiosInstance";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { IMessage } from "./interface/IMessage";

// Single API response page
export interface IMessagesPage<T> {
  messages: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const useInfiniteMessages = (conversationId: string) => {
  return useInfiniteQuery<
    IMessagesPage<IMessage>,
    Error,
    InfiniteData<IMessagesPage<IMessage>>,
    [string, string],
    string | null
  >({
    queryKey: ["messages", conversationId],

    queryFn: async ({ pageParam }) => {
      const response = await api.get<IMessagesPage<IMessage>>(
        `/users/conversations/${conversationId}/messages`,
        {
          params: pageParam ? { cursor: pageParam } : {},
        },
      );

      return response.data;
    },

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : null,

    initialPageParam: null,
    enabled: !!conversationId,
  });
};
