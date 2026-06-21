import { create } from "zustand";

interface TemporaryPhotoState {
  photos: Blob[];
  setPhotos: (photos: Blob[]) => void;
  clearPhotos: () => void;
}

export const useTemporaryPhotoStore = create<TemporaryPhotoState>((set) => ({
  photos: [],
  setPhotos: (photos) => set({ photos }),
  clearPhotos: () => set({ photos: [] }),
}));
