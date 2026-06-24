import { RegisterFormData } from "@/schema/authUserSchema";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
type CreateAccountState = Partial<RegisterFormData> & {
  setData: (data: Partial<RegisterFormData>) => void;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  clearData: () => void;
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
      clearData: () => set((state) => ({
        firstName: "",
        middleName: "",
        lastName: "",
        hydrated: state.hydrated,
        setHydrated: state.setHydrated,
        setData: state.setData,
        clearData: state.clearData
      }), true),
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
