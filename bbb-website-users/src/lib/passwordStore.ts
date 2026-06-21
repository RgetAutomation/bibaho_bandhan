import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type PasswordState = {
  password?: string;
  setPassword: (password: string) => void;
  clearPassword: () => void;
};

export const usePasswordStore = create<PasswordState>()(
  persist(
    (set) => ({
      password: "",
      setPassword: (password: string) => set({ password }),
      clearPassword: () => set({ password: "" }),
    }),
    {
      name: "temporary-auth-storage",
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage so it survives refresh but clears on tab close
    }
  )
);
