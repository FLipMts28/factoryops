// frontend/src/store/userStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface UserStore {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null ) => void;
  setUsers: (users: User[]) => void;
  fetchUsers: () => Promise<void>;
  loadLastUser: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Carregar último utilizador do localStorage
const loadSavedUser = (): User | null => {
  const savedUserId = localStorage.getItem('factoryops_current_user_id');
  const isAuth = localStorage.getItem('factoryops_is_authenticated') === 'true';
  
  if (!savedUserId || !isAuth) return null;

  const savedUsers = JSON.parse(localStorage.getItem('factoryops_users') || '[]');
  const user = savedUsers.find((u: any) => u.id === savedUserId);
  
  return user || null;
};

// Mock users com passwords (em produção, isto seria no backend)
const MOCK_CREDENTIALS = {
  'op.silva.t1': 'operator123',
  'mnt.sousa': 'maintenance123',
  'eng.ribeiro': 'engineer123',
  'op.costa.t1': 'operator123',
  'mnt.lopes': 'maintenance123',
  'admin': 'admin123',
};

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: loadSavedUser(),
  users: [],
  isAuthenticated: localStorage.getItem('factoryops_is_authenticated') === 'true',

  setCurrentUser: (user) => {
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      localStorage.setItem('factoryops_current_user_id', user.id);
      localStorage.setItem('factoryops_is_authenticated', 'true');
      console.log('✅ Utilizador autenticado:', user.name);
    } else {
      set({ currentUser: null, isAuthenticated: false });
      localStorage.removeItem('factoryops_current_user_id');
      localStorage.setItem('factoryops_is_authenticated', 'false');
      console.log('✅ Utilizador desautenticado');
    }
  },
  
  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem('factoryops_users') || '[]');
      
      if (savedUsers.length > 0) {
        set({ users: savedUsers });
        return;
      }

      const mockUsers: User[] = [
        { id: '00000000-0000-0000-0000-000000000001', username: 'op.silva.t1', name: 'João Silva', role: 'OPERATOR' },
        { id: '00000000-0000-0000-0000-000000000002', username: 'mnt.sousa', name: 'Rui Sousa', role: 'MAINTENANCE' },
        { id: '00000000-0000-0000-0000-000000000003', username: 'eng.ribeiro', name: 'Eng. Luís Ribeiro', role: 'ENGINEER' },
        { id: '00000000-0000-0000-0000-000000000004', username: 'op.costa.t1', name: 'Maria Costa', role: 'OPERATOR' },
        { id: '00000000-0000-0000-0000-000000000005', username: 'mnt.lopes', name: 'André Lopes', role: 'MAINTENANCE' },
        { id: '00000000-0000-0000-0000-000000000006', username: 'admin', name: 'Administrador', role: 'ADMIN' },
      ];
      
      set({ users: mockUsers });
      localStorage.setItem('factoryops_users', JSON.stringify(mockUsers));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  },

  loadLastUser: () => {
    const savedUser = loadSavedUser();
    if (savedUser) {
      set({ currentUser: savedUser, isAuthenticated: true });
      console.log('✅ Último utilizador carregado:', savedUser.name);
    }
  },

  login: async (username: string, password: string): Promise<boolean> => {
    try {
      // Verificar credenciais (mock)
      if (MOCK_CREDENTIALS[username as keyof typeof MOCK_CREDENTIALS] !== password) {
        return false;
      }

      // Buscar utilizador
      const { users, fetchUsers } = get();
      if (users.length === 0) {
        await fetchUsers();
      }

      const user = get().users.find(u => u.username === username);
      
      if (user) {
        set({ currentUser: user, isAuthenticated: true });
        localStorage.setItem('factoryops_current_user_id', user.id);
        localStorage.setItem('factoryops_is_authenticated', 'true');
        console.log('✅ Login bem-sucedido:', user.name);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
    localStorage.removeItem('factoryops_current_user_id');
    localStorage.removeItem('factoryops_is_authenticated');
    console.log('✅ Logout realizado');
  },
}));