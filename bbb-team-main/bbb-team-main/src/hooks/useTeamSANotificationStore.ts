import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  /** TEAM HEAD */
  teamHeadMessageCount: number;
  incrementTeamHeadMessage: () => void;
  resetTeamHeadMessage: () => void;
}

export const useTeamSANotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      /** TEAM HEAD */
      teamHeadMessageCount: 0,

      incrementTeamHeadMessage: () =>
        set((state) => ({
          teamHeadMessageCount: state.teamHeadMessageCount + 1,
        })),

      resetTeamHeadMessage: () =>
        set({
          teamHeadMessageCount: 0,
        }),
    }),
    {
      name: "bbb-teamsa-notification",
    }
  )
);
