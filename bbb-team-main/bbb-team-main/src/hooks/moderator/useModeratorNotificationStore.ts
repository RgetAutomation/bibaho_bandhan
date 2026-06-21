import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  /** USER */
  adminModeratorConversationIds: string[];
  addAdminModeratorConversation: (conversationId: string) => void;
  removeAdminModeratorConversation: (conversationId: string) => void;
  resetAdminModeratorConversation: () => void;

  brideConversationIds: string[];
  addBrideConversation: (conversationId: string) => void;
  removeBrideConversation: (conversationId: string) => void;
  resetBrideConversation: () => void;
}

export const useModeratorNotificationStore = create<NotificationState>()(
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

      brideConversationIds: [],

      addBrideConversation: (conversationId) =>
        set((state) => {
          if (state.brideConversationIds.includes(conversationId)) {
            return state; // avoid duplicate unread count
          }

          return {
            brideConversationIds: [
              ...state.brideConversationIds,
              conversationId,
            ],
          };
        }),

      removeBrideConversation: (conversationId) =>
        set((state) => ({
          brideConversationIds: state.brideConversationIds.filter(
            (id) => id !== conversationId
          ),
        })),

      resetBrideConversation: () =>
        set({
          brideConversationIds: [],
        }),
    }),
    {
      name: "bbbmoderator-notification-state",
    }
  )
);
