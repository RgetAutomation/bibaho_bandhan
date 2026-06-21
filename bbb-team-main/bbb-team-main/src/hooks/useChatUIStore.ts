import { create } from "zustand";

interface ChatUIState {
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),
}));
