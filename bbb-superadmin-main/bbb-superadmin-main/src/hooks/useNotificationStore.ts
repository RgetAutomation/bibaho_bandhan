import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  /** USER */
  adminConversationIds: string[];
  addAdminConversation: (conversationId: string) => void;
  removeAdminConversation: (conversationId: string) => void;
  resetAdminConversation: () => void;

  moderatorConversationIds: string[];
  addModeratorConversation: (conversationId: string) => void;
  removeModeratorConversation: (conversationId: string) => void;
  resetModeratorConversation: () => void;

  ghotokConversationIds: string[];
  addGhotokConversation: (conversationId: string) => void; //
  removeGhotokConversation: (conversationId: string) => void;
  resetGhotokConversation: () => void;

  userSAConversationIds: string[];
  addUserSAConversation: (id: string) => void;
  removeUserSAConversation: (id: string) => void;
  resetUserSAMessage: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      /** USER */
      adminConversationIds: [],

      addAdminConversation: (conversationId) =>
        set((state) => {
          if (state.adminConversationIds.includes(conversationId)) {
            return state; // avoid duplicate unread count
          }

          return {
            adminConversationIds: [
              ...state.adminConversationIds,
              conversationId,
            ],
          };
        }),

      removeAdminConversation: (conversationId) =>
        set((state) => ({
          adminConversationIds: state.adminConversationIds.filter(
            (id) => id !== conversationId
          ),
        })),

      resetAdminConversation: () =>
        set({
          adminConversationIds: [],
        }),

      /** MODERATOR */
      moderatorConversationIds: [],

      addModeratorConversation: (conversationId) =>
        set((state) => {
          if (state.moderatorConversationIds.includes(conversationId)) {
            return state; // avoid duplicate unread count
          }

          return {
            moderatorConversationIds: [
              ...state.moderatorConversationIds,
              conversationId,
            ],
          };
        }),

      removeModeratorConversation: (conversationId) =>
        set((state) => ({
          moderatorConversationIds: state.moderatorConversationIds.filter(
            (id) => id !== conversationId
          ),
        })),

      resetModeratorConversation: () =>
        set({
          moderatorConversationIds: [],
        }),

      /** GHOTOK */
      ghotokConversationIds: [],

      addGhotokConversation: (conversationId) =>
        set((state) => {
          if (state.ghotokConversationIds.includes(conversationId)) {
            return state; // avoid duplicate unread count
          }

          return {
            ghotokConversationIds: [
              ...state.ghotokConversationIds,
              conversationId,
            ],
          };
        }),

      removeGhotokConversation: (conversationId) =>
        set((state) => ({
          ghotokConversationIds: state.ghotokConversationIds.filter(
            (id) => id !== conversationId
          ),
        })),

      resetGhotokConversation: () =>
        set({
          ghotokConversationIds: [],
        }),

      /** USER SA */
      userSAConversationIds: [],

      addUserSAConversation: (id) =>
        set((state) => {
          if (state.userSAConversationIds.includes(id)) {
            return state; // avoid duplicate unread count
          }

          return {
            userSAConversationIds: [...state.userSAConversationIds, id],
          };
        }),

      removeUserSAConversation: (id) =>
        set((state) => ({
          userSAConversationIds: state.userSAConversationIds.filter(
            (cid) => cid !== id
          ),
        })),

      resetUserSAMessage: () =>
        set({
          userSAConversationIds: [],
        }),
    }),
    {
      name: "bbbsuperadmin-notification-state",
    }
  )
);
