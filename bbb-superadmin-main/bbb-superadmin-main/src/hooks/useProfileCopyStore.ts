import { create } from "zustand";

interface ProfileCopyState {
  isMarkingMode: boolean;
  toggleMarkingMode: () => void;
  selectedFields: string[];
  toggleField: (field: string) => void;
  selectMultiple: (fields: string[]) => void;
  deselectMultiple: (fields: string[]) => void;
  clearFields: () => void;
  reset: () => void;
}

export const useProfileCopyStore = create<ProfileCopyState>((set) => ({
  isMarkingMode: false,
  toggleMarkingMode: () => 
    set((state) => {
      const turningOff = state.isMarkingMode;
      return {
        isMarkingMode: !state.isMarkingMode,
        selectedFields: turningOff ? [] : state.selectedFields,
      };
    }),

  selectedFields: [],

  toggleField: (field) =>
    set((state) => {
      const exists = state.selectedFields.includes(field);
      return {
        selectedFields: exists
          ? state.selectedFields.filter((f) => f !== field)
          : [...state.selectedFields, field],
      };
    }),

  selectMultiple: (fields) =>
    set((state) => ({
      selectedFields: Array.from(new Set([...state.selectedFields, ...fields])),
    })),

  deselectMultiple: (fields) =>
    set((state) => ({
      selectedFields: state.selectedFields.filter((f) => !fields.includes(f)),
    })),

  clearFields: () => set({ selectedFields: [] }),

  reset: () => set({ selectedFields: [], isMarkingMode: false }),
}));
