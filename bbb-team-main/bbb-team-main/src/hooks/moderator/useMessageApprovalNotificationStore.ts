import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  /** USER */
  messageApprovalCount: number;
  incrementMessageApprovalCount: () => void;
  decrementMessageApprovalCount: () => void;
  resetMessageApprovalCount: () => void;
}

export const useMessageApprovalNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      messageApprovalCount: 0,

      incrementMessageApprovalCount: () =>
        set((state) => ({
          messageApprovalCount: state.messageApprovalCount + 1,
        })),

      decrementMessageApprovalCount: () =>
        set((state) => ({
          messageApprovalCount: state.messageApprovalCount - 1,
        })),

      resetMessageApprovalCount: () =>
        set({
          messageApprovalCount: 0,
        }),
    }),
    {
      name: "bbbmoderator-approval-notification",
    }
  )
);
