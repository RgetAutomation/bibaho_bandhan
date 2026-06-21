import { RegisterFormData } from "@/schema/authUserSchema";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
type CreateAccountState = Partial<RegisterFormData> & {
  setData: (data: Partial<RegisterFormData>) => void;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
};

export const useCreateAccountStore = create<CreateAccountState>()(
  persist(
    (set) => ({
      firstName: "",
      middleName: "",
      lastName: "",
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setData: (data: Partial<RegisterFormData>) => set(data),
    }),
    {
      name: "create-account-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration is complete
        state?.setHydrated(true);
      },
    }
  )
);
