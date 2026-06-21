import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  userConversationIds: string[];

  addConversation: (id: string) => void;
  removeConversation: (id: string) => void;
  resetUserMessage: () => void;

  teamConversationIds: string[];
  addTeamConversation: (id: string) => void;
  removeTeamConversation: (id: string) => void;
  resetTeamMessage: () => void;

  userSAConversationIds: string[];
  addUserSAConversation: (id: string) => void;
  removeUserSAConversation: (id: string) => void;
  resetUserSAMessage: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      /** USER */
      userConversationIds: [],

      addConversation: (id) =>
        set((state) => {
          if (state.userConversationIds.includes(id)) return state;
          return {
            userConversationIds: [...state.userConversationIds, id],
          };
        }),

      removeConversation: (id) =>
        set((state) => ({
          userConversationIds: state.userConversationIds.filter(
            (cid) => cid !== id,
          ),
        })),

      resetUserMessage: () =>
        set({
          userConversationIds: [],
        }),

      /** TEAM HEAD */
      teamConversationIds: [],

      addTeamConversation: (id) =>
        set((state) => {
          if (state.teamConversationIds.includes(id)) return state;
          return {
            teamConversationIds: [...state.teamConversationIds, id],
          };
        }),

      removeTeamConversation: (id) =>
        set((state) => ({
          teamConversationIds: state.teamConversationIds.filter(
            (cid) => cid !== id,
          ),
        })),

      resetTeamMessage: () =>
        set({
          teamConversationIds: [],
        }),

      /** SA USER */
      userSAConversationIds: [],

      addUserSAConversation: (id) =>
        set((state) => {
          if (state.userSAConversationIds.includes(id)) return state;
          return {
            userSAConversationIds: [...state.userSAConversationIds, id],
          };
        }),

      removeUserSAConversation: (id) =>
        set((state) => ({
          userSAConversationIds: state.userSAConversationIds.filter(
            (cid) => cid !== id,
          ),
        })),

      resetUserSAMessage: () =>
        set({
          userSAConversationIds: [],
        }),
    }),
    { name: "bbb-notifications" },
  ),
);
