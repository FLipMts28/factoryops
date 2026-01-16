import { create } from 'zustand';
import { ChatMessage } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  typingUsers: string[];
  unreadCounts: Record<string, number>; // machineId -> count
  
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  addTypingUser: (userName: string) => void;
  removeTypingUser: (userName: string) => void;
  clearMessages: () => void;
  incrementUnread: (machineId: string) => void;
  clearUnread: (machineId: string) => void;
  getUnreadCount: (machineId: string) => number;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  typingUsers: [],
  unreadCounts: {},

  setMessages: (messages) => {
    set({ messages });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  addTypingUser: (userName) => {
    set((state) => ({
      typingUsers: state.typingUsers.includes(userName)
        ? state.typingUsers
        : [...state.typingUsers, userName],
    }));
  },

  removeTypingUser: (userName) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u !== userName),
    }));
  },

  clearMessages: () => {
    set({ messages: [], typingUsers: [] });
  },

  incrementUnread: (machineId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [machineId]: (state.unreadCounts[machineId] || 0) + 1,
      },
    }));
  },

  clearUnread: (machineId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [machineId]: 0,
      },
    }));
  },

  getUnreadCount: (machineId) => {
    return get().unreadCounts[machineId] || 0;
  },
}));