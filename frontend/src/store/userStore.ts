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
  setCurrentUser: (user: User | null) => void;
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

// Mock users com passwords (TEMPORÁRIO - usar password123 até integrar com backend)
const MOCK_CREDENTIALS = {
  'op.silva.t1': 'password123',
  'op.costa.t1': 'password123',
  'op.santos.t1': 'password123',
  'op.oliveira.t1': 'password123',
  'op.pereira.t2': 'password123',
  'op.rodrigues.t2': 'password123',
  'op.fernandes.t2': 'password123',
  'op.alves.t2': 'password123',
  'op.gomes.t3': 'password123',
  'op.martins.t3': 'password123',
  'mnt.sousa': 'password123',
  'mnt.lopes': 'password123',
  'mnt.ferreira': 'password123',
  'mnt.carvalho': 'password123',
  'eng.ribeiro': 'password123',
  'eng.correia': 'password123',
  'eng.machado': 'password123',
  'admin': 'password123',
};

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: null, // Sempre começar sem user
  users: [],
  isAuthenticated: false, // Sempre começar como não autenticado

  setCurrentUser: (user) => {
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      localStorage.setItem('factoryops_current_user_id', user.id);
      localStorage.setItem('factoryops_is_authenticated', 'true');
      console.log('✅ Utilizador autenticado:', user.name);
    } else {
      set({ currentUser: null, isAuthenticated: false });
      localStorage.removeItem('factoryops_current_user_id');
      localStorage.removeItem('factoryops_is_authenticated');
      console.log('✅ Sessão terminada');
    }
  },
  
  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    try {
      // Tentar buscar da API primeiro
      try {
        const response = await fetch('http://localhost:3001/users');
        if (response.ok) {
          const usersFromApi = await response.json();
          set({ users: usersFromApi });
          localStorage.setItem('factoryops_users', JSON.stringify(usersFromApi));
          console.log('✅ Users carregados da API:', usersFromApi.length);
          return;
        }
      } catch (apiError) {
        console.warn('⚠️  API não disponível, usando mock users');
      }

      // Fallback para localStorage
      const savedUsers = JSON.parse(localStorage.getItem('factoryops_users') || '[]');
      
      if (savedUsers.length > 0) {
        set({ users: savedUsers });
        return;
      }

      // Fallback final para mock users (apenas para desenvolvimento)
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
    // Verificar se há autenticação salva
    const isAuth = localStorage.getItem('factoryops_is_authenticated') === 'true';
    if (!isAuth) {
      console.log('⚠️  Sem autenticação salva');
      return;
    }

    const savedUser = loadSavedUser();
    if (savedUser) {
      set({ currentUser: savedUser, isAuthenticated: true });
      console.log('✅ Último utilizador carregado:', savedUser.name);
    } else {
      // Se não conseguir carregar user, limpar autenticação
      localStorage.removeItem('factoryops_is_authenticated');
      set({ currentUser: null, isAuthenticated: false });
      console.log('⚠️  User salvo inválido, autenticação limpa');
    }
  },

  login: async (username: string, password: string): Promise<boolean> => {
    try {
      // Tentar fazer login via API
      try {
        const response = await fetch('http://localhost:3001/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          set({ currentUser: user, isAuthenticated: true });
          localStorage.setItem('factoryops_current_user_id', user.id);
          localStorage.setItem('factoryops_is_authenticated', 'true');
          
          console.log('✅ Login bem-sucedido via API:', user.name);
          return true;
        } else if (response.status === 401) {
          // Credenciais inválidas - NÃO usar fallback
          console.log('❌ Credenciais inválidas');
          return false;
        }
        // Se for outro erro (500, etc), tentar fallback
      } catch (apiError) {
        console.warn('⚠️  API de login não disponível, usando mock fallback');
      }

      // Fallback para MOCK (só se API não responder)
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
        console.log('✅ Login bem-sucedido via MOCK:', user.name);
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