import { UpdateProfileSchema } from "@/schema/updateProfileSchema";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
type UpdatingProfileState = Partial<UpdateProfileSchema> & {
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  setData: (data: Partial<UpdateProfileSchema>) => void;
  clearData: () => void;
};

export const useUpdatingProfileStore = create<UpdatingProfileState>()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setData: (data: Partial<UpdateProfileSchema>) => set(data),
      clearData: () => set((state) => ({
        hydrated: state.hydrated,
        setHydrated: state.setHydrated,
        setData: state.setData,
        clearData: state.clearData
      }), true),
    }),
    {
      name: "update-profile-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration is complete
        state?.setHydrated(true);
      },
    }
  )
);
