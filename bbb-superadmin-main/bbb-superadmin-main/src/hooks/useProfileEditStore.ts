import { create } from "zustand";

interface ProfileEditState {
  isEditingMode: boolean;
  editingSection: string | null;
  draftValues: Record<string, string>;
  toggleEditingMode: () => void;
  openSection: (sectionName: string) => void;
  closeSection: () => void;
  setDraftField: (key: string, value: string) => void;
  setDraftValues: (values: Record<string, string>) => void;
  reset: () => void;
}

export const useProfileEditStore = create<ProfileEditState>((set) => ({
  isEditingMode: false,
  editingSection: null,
  draftValues: {},

  toggleEditingMode: () =>
    set((state) => ({
      isEditingMode: !state.isEditingMode,
      editingSection: null,
      draftValues: {},
    })),

  openSection: (sectionName) =>
    set({ editingSection: sectionName, draftValues: {} }),

  closeSection: () =>
    set({ editingSection: null, draftValues: {} }),

  setDraftField: (key, value) =>
    set((state) => ({
      draftValues: { ...state.draftValues, [key]: value },
    })),

  setDraftValues: (values) =>
    set({ draftValues: values }),

  reset: () =>
    set({ isEditingMode: false, editingSection: null, draftValues: {} }),
}));
