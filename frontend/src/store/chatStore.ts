import { create } from 'zustand';
import { ChatMessage } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  typingUsers: string[];
  
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  addTypingUser: (userName: string) => void;
  removeTypingUser: (userName: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  typingUsers: [],

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
}));
