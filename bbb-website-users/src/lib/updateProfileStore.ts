import { UpdateProfileSchema } from "@/schema/updateProfileSchema";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
type UpdatingProfileState = Partial<UpdateProfileSchema> & {
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  setData: (data: Partial<UpdateProfileSchema>) => void;
};

export const useUpdatingProfileStore = create<UpdatingProfileState>()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setData: (data: Partial<UpdateProfileSchema>) => set(data),
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
