import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IUserData {
  conversationId: string;
  userId: string;
}

interface NotificationState {
  /** BRIDE USER */
  brideConversationIds: IUserData[];
  addBrideConversation: (userId: string, conversationId: string) => void;
  removeBrideConversation: (conversationId: string) => void;
  resetBrideMessage: () => void;

  /* GROOM USER */
  groomConversationIds: IUserData[];
  addGroomConversation: (userId: string, conversationId: string) => void;
  removeGroomConversation: (conversationId: string) => void;
  resetGroomMessage: () => void;

  matchingConversationIds: string[];
  addMatchingUserConversation: (conversationId: string) => void;
  removeMatchingUserConversation: (conversationId: string) => void;
  resetMatchingConversation: () => void;
}

export const useGhotokNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      /**BRIDE USER */
      brideConversationIds: [],

      addBrideConversation: (userId, conversationId) =>
        set((state) => {
          // avoid duplicate notifications for same conversation
          const exists = state.brideConversationIds.some(
            (item) => item.conversationId === conversationId
          );

          if (exists) return state;

          return {
            brideConversationIds: [
              ...state.brideConversationIds,
              { userId, conversationId },
            ],
          };
        }),

      removeBrideConversation: (conversationId) =>
        set((state) => ({
          brideConversationIds: state.brideConversationIds.filter(
            (item) => item.conversationId !== conversationId
          ),
        })),

      resetBrideMessage: () =>
        set({
          brideConversationIds: [],
        }),

      /** GROOM USER */
      groomConversationIds: [],

      addGroomConversation: (userId, conversationId) =>
        set((state) => {
          // avoid duplicate notifications for same conversation
          const exists = state.groomConversationIds.some(
            (item) => item.conversationId === conversationId
          );

          if (exists) return state;

          return {
            groomConversationIds: [
              ...state.groomConversationIds,
              { userId, conversationId },
            ],
          };
        }),

      removeGroomConversation: (conversationId) =>
        set((state) => ({
          groomConversationIds: state.groomConversationIds.filter(
            (item) => item.conversationId !== conversationId
          ),
        })),

      resetGroomMessage: () =>
        set({
          groomConversationIds: [],
        }),

      /** MATCHING */
      matchingConversationIds: [],

      addMatchingUserConversation: (conversationId) =>
        set((state) => {
          if (state.matchingConversationIds.includes(conversationId)) {
            return state;
          }

          return {
            matchingConversationIds: [
              ...state.matchingConversationIds,
              conversationId,
            ],
          };
        }),

      removeMatchingUserConversation: (conversationId) =>
        set((state) => ({
          matchingConversationIds: state.matchingConversationIds.filter(
            (id) => id !== conversationId
          ),
        })),
      resetMatchingConversation: () =>
        set({
          matchingConversationIds: [],
        }),
    }),

    {
      name: "bbbghotok-notification-state",
    }
  )
);
