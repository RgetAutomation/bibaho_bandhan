import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  /** USER */
  adminModeratorConversationIds: string[];
  addAdminModeratorConversation: (conversationId: string) => void;
  removeAdminModeratorConversation: (conversationId: string) => void;
  resetAdminModeratorConversation: () => void;

  /** GROOM CONVERSATION */
  groomConversationIds: string[];
  addGroomConversation: (conversationId: string) => void;
  removeGroomConversation: (conversationId: string) => void;
  resetGroomMessage: () => void;
}

export const useAdminNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      /** USER */
      adminModeratorConversationIds: [],

      addAdminModeratorConversation: (conversationId) =>
        set((state) => {
          if (state.adminModeratorConversationIds.includes(conversationId)) {
            return state; // avoid duplicate unread count
          }

          return {
            adminModeratorConversationIds: [
              ...state.adminModeratorConversationIds,
              conversationId,
            ],
          };
        }),

      removeAdminModeratorConversation: (conversationId) =>
        set((state) => ({
          adminModeratorConversationIds:
            state.adminModeratorConversationIds.filter(
              (id) => id !== conversationId
            ),
        })),

      resetAdminModeratorConversation: () =>
        set({
          adminModeratorConversationIds: [],
        }),

      /**BRIDE CONVERSATION */

      groomConversationIds: [],

      addGroomConversation: (conversationId) =>
        set((state) => {
          if (state.groomConversationIds.includes(conversationId)) {
            return state; // avoid duplicate unread count
          }

          return {
            groomConversationIds: [
              ...state.groomConversationIds,
              conversationId,
            ],
          };
        }),

      removeGroomConversation: (conversationId) =>
        set((state) => ({
          groomConversationIds: state.groomConversationIds.filter(
            (id) => id !== conversationId
          ),
        })),

      resetGroomMessage: () =>
        set({
          groomConversationIds: [],
        }),
    }),
    {
      name: "bbbadmin-notification-state",
    }
  )
);
