/**
 * ============================================
 * USER STORE - Gestão de Estado de Utilizadores
 * ============================================
 * 
 * Este ficheiro implementa o store Zustand para gestão de utilizadores.
 * Zustand é uma biblioteca de gestão de estado global para React.
 * 
 * RESPONSABILIDADES:
 * - Manter o utilizador atualmente autenticado
 * - Gerir lista de todos os utilizadores do sistema
 * - Implementar login/logout
 * - Persistir sessão no localStorage
 * - Comunicar com backend para autenticação
 * 
 * FLUXO DE AUTENTICAÇÃO:
 * 1. User introduz username e password
 * 2. login() tenta autenticar via API backend
 * 3. Se API não disponível, usa MOCK_CREDENTIALS (fallback)
 * 4. Se sucesso, salva user no estado + localStorage
 * 5. App atualiza automaticamente (Zustand notifica componentes)
 */

// Importar função create do Zustand para criar o store
import { create } from 'zustand';

/**
 * INTERFACE User
 * Define a estrutura de dados de um utilizador
 */
interface User {
  id: string;         // UUID único do utilizador
  username: string;   // Username para login (ex: "admin", "op.silva.t1")
  name: string;       // Nome completo (ex: "João Silva")
  role: string;       // Role/permissão: OPERATOR, MAINTENANCE, ENGINEER, ADMIN
}

/**
 * INTERFACE UserStore
 * Define todas as propriedades e métodos disponíveis no store
 */
interface UserStore {
  // ESTADO
  currentUser: User | null;      // Utilizador atualmente autenticado (null se não autenticado)
  users: User[];                 // Lista de todos os utilizadores do sistema
  isAuthenticated: boolean;      // Flag de autenticação (true se logged in)
  
  // AÇÕES
  setCurrentUser: (user: User | null) => void;        // Define utilizador atual
  setUsers: (users: User[]) => void;                  // Define lista de utilizadores
  fetchUsers: () => Promise<void>;                    // Busca utilizadores do backend
  loadLastUser: () => void;                           // Carrega último user do localStorage
  login: (username: string, password: string) => Promise<boolean>;  // Efetua login
  logout: () => void;                                 // Efetua logout
}

/**
 * FUNÇÃO loadSavedUser
 * 
 * Carrega o último utilizador autenticado do localStorage
 * Utilizada para manter sessão após refresh da página
 * 
 * RETORNA: User | null
 */
const loadSavedUser = (): User | null => {
  // Buscar ID do utilizador salvo no localStorage
  const savedUserId = localStorage.getItem('factoryops_current_user_id');
  
  // Verificar flag de autenticação
  const isAuth = localStorage.getItem('factoryops_is_authenticated') === 'true';
  
  // Se não há ID ou não está autenticado, retornar null
  if (!savedUserId || !isAuth) return null;

  // Buscar lista de utilizadores do localStorage
  const savedUsers = JSON.parse(localStorage.getItem('factoryops_users') || '[]');
  
  // Encontrar utilizador pelo ID
  const user = savedUsers.find((u: any) => u.id === savedUserId);
  
  return user || null;
};

/**
 * MOCK_CREDENTIALS
 * 
 * Credenciais hardcoded para desenvolvimento e fallback
 * Todos usam password "password123"
 * 
 * NOTA: Em produção, NUNCA armazenar passwords no frontend!
 * Isto é apenas para desenvolvimento quando backend não está disponível
 */
const MOCK_CREDENTIALS = {
  'op.silva.t1': 'password123',      // Operador Turno 1
  'op.costa.t1': 'password123',
  'op.santos.t1': 'password123',
  'op.oliveira.t1': 'password123',
  'op.pereira.t2': 'password123',    // Operador Turno 2
  'op.rodrigues.t2': 'password123',
  'op.fernandes.t2': 'password123',
  'op.alves.t2': 'password123',
  'op.gomes.t3': 'password123',      // Operador Turno 3
  'op.martins.t3': 'password123',
  'mnt.sousa': 'password123',        // Manutenção
  'mnt.lopes': 'password123',
  'mnt.ferreira': 'password123',
  'mnt.carvalho': 'password123',
  'eng.ribeiro': 'password123',      // Engenheiros
  'eng.correia': 'password123',
  'eng.machado': 'password123',
  'admin': 'password123',            // Administrador
};

/**
 * CRIAÇÃO DO STORE
 * 
 * useUserStore é o hook que será usado nos componentes React
 * Componentes podem ler estado e chamar ações através deste hook
 * 
 * EXEMPLO DE USO:
 * const { currentUser, login } = useUserStore();
 * const handleLogin = () => login("admin", "password123");
 */
export const useUserStore = create<UserStore>((set, get) => ({
  // ==========================================
  // ESTADO INICIAL
  // ==========================================
  
  currentUser: null,           // Sem utilizador autenticado inicialmente
  users: [],                   // Lista vazia de utilizadores
  isAuthenticated: false,      // Não autenticado inicialmente

  // ==========================================
  // AÇÃO: setCurrentUser
  // ==========================================
  /**
   * Define o utilizador atual e persiste no localStorage
   * 
   * @param user - User object ou null (para logout)
   * 
   * SIDE EFFECTS:
   * - Atualiza estado do Zustand
   * - Salva/remove ID do user no localStorage
   * - Salva/remove flag de autenticação
   * - Logs no console para debugging
   */
  setCurrentUser: (user) => {
    if (user) {
      // LOGIN: Salvar utilizador
      set({ currentUser: user, isAuthenticated: true });
      localStorage.setItem('factoryops_current_user_id', user.id);
      localStorage.setItem('factoryops_is_authenticated', 'true');
      console.log('✅ Utilizador autenticado:', user.name);
    } else {
      // LOGOUT: Limpar utilizador
      set({ currentUser: null, isAuthenticated: false });
      localStorage.removeItem('factoryops_current_user_id');
      localStorage.removeItem('factoryops_is_authenticated');
      console.log('✅ Sessão terminada');
    }
  },
  
  // ==========================================
  // AÇÃO: setUsers
  // ==========================================
  /**
   * Define a lista completa de utilizadores
   * Chamado após fetchUsers()
   */
  setUsers: (users) => set({ users }),

  // ==========================================
  // AÇÃO: fetchUsers
  // ==========================================
  /**
   * Busca lista de utilizadores do backend
   * 
   * ESTRATÉGIA DE FALLBACK (3 níveis):
   * 1. Tentar buscar da API (http://localhost:3001/users)
   * 2. Se falhar, usar localStorage (dados em cache)
   * 3. Se falhar, usar MOCK users (desenvolvimento)
   * 
   * ASSÍNCRONO: Usa async/await para chamadas HTTP
   */
  fetchUsers: async () => {
    try {
      // NÍVEL 1: Tentar API
      try {
        const response = await fetch('http://localhost:3001/users');
        if (response.ok) {
          const usersFromApi = await response.json();
          
          // Salvar no estado Zustand
          set({ users: usersFromApi });
          
          // Salvar no localStorage para cache
          localStorage.setItem('factoryops_users', JSON.stringify(usersFromApi));
          
          console.log('✅ Users carregados da API:', usersFromApi.length);
          return; // Sucesso! Terminar aqui
        }
      } catch (apiError) {
        console.warn('⚠️  API não disponível, usando fallback');
      }

      // NÍVEL 2: Fallback para localStorage
      const savedUsers = JSON.parse(localStorage.getItem('factoryops_users') || '[]');
      
      if (savedUsers.length > 0) {
        set({ users: savedUsers });
        console.log('✅ Users carregados do localStorage:', savedUsers.length);
        return;
      }

      // NÍVEL 3: Fallback para MOCK (último recurso)
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
      console.log('✅ Users MOCK carregados:', mockUsers.length);
      
    } catch (error) {
      console.error('❌ Falha ao carregar users:', error);
    }
  },

  // ==========================================
  // AÇÃO: loadLastUser
  // ==========================================
  /**
   * Carrega último utilizador do localStorage
   * Chamado ao iniciar aplicação para restaurar sessão
   * 
   * FLUXO:
   * 1. Verifica se há flag de autenticação
   * 2. Se sim, busca dados do user
   * 3. Se encontrar, define como currentUser
   * 4. Se não encontrar, limpa autenticação (dados inconsistentes)
   */
  loadLastUser: () => {
    // Verificar se há autenticação salva
    const isAuth = localStorage.getItem('factoryops_is_authenticated') === 'true';
    
    if (!isAuth) {
      console.log('⚠️  Sem autenticação salva - user precisa fazer login');
      return;
    }

    // Carregar dados do utilizador
    const savedUser = loadSavedUser();
    
    if (savedUser) {
      // User válido encontrado - restaurar sessão
      set({ currentUser: savedUser, isAuthenticated: true });
      console.log('✅ Sessão restaurada:', savedUser.name);
    } else {
      // Dados inconsistentes - limpar autenticação
      localStorage.removeItem('factoryops_is_authenticated');
      set({ currentUser: null, isAuthenticated: false });
      console.log('⚠️  Dados de sessão inválidos - autenticação limpa');
    }
  },

  // ==========================================
  // AÇÃO: login
  // ==========================================
  /**
   * Efetua login do utilizador
   * 
   * @param username - Nome de utilizador (ex: "admin")
   * @param password - Password em texto plano
   * @returns Promise<boolean> - true se login bem-sucedido
   * 
   * FLUXO DE AUTENTICAÇÃO:
   * 1. Tenta autenticar via API POST /auth/login
   * 2. Backend valida com bcrypt e retorna user data
   * 3. Se API retornar 401, credenciais inválidas (não usar fallback)
   * 4. Se API não responder (erro rede), usar MOCK_CREDENTIALS
   * 5. Se MOCK válido, buscar user da lista e autenticar
   * 
   * SEGURANÇA:
   * - Password nunca é armazenada no frontend
   * - Backend usa bcrypt para validação segura
   * - MOCK apenas para desenvolvimento
   */
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      // ========================================
      // TENTATIVA 1: Autenticação via API
      // ========================================
      try {
        const response = await fetch('http://localhost:3001/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          // LOGIN SUCESSO via API
          const data = await response.json();
          const user = data.user;
          
          // Salvar utilizador autenticado
          set({ currentUser: user, isAuthenticated: true });
          localStorage.setItem('factoryops_current_user_id', user.id);
          localStorage.setItem('factoryops_is_authenticated', 'true');
          
          console.log('✅ Login bem-sucedido via API:', user.name);
          return true;
          
        } else if (response.status === 401) {
          // CREDENCIAIS INVÁLIDAS
          // Status 401 = Unauthorized
          // Backend validou e rejeitou - NÃO usar fallback
          console.log('❌ Credenciais inválidas');
          return false;
        }
        
        // Outro erro (500, 503, etc) - tentar fallback
        
      } catch (apiError) {
        // API não respondeu (erro de rede, backend offline, etc)
        console.warn('⚠️  API não disponível - usando MOCK fallback');
      }

      // ========================================
      // TENTATIVA 2: Fallback MOCK
      // ========================================
      // Só chega aqui se API não respondeu
      // Verificar se username existe no MOCK e password corresponde
      if (MOCK_CREDENTIALS[username as keyof typeof MOCK_CREDENTIALS] !== password) {
        console.log('❌ Credenciais MOCK inválidas');
        return false;
      }

      // Credenciais MOCK válidas - buscar dados do user
      const { users, fetchUsers } = get();
      
      // Se lista de users vazia, buscar primeiro
      if (users.length === 0) {
        await fetchUsers();
      }

      // Procurar user pelo username
      const user = get().users.find(u => u.username === username);
      
      if (user) {
        // User encontrado - autenticar
        set({ currentUser: user, isAuthenticated: true });
        localStorage.setItem('factoryops_current_user_id', user.id);
        localStorage.setItem('factoryops_is_authenticated', 'true');
        console.log('✅ Login bem-sucedido via MOCK:', user.name);
        return true;
      }

      // User não encontrado (não devia acontecer se MOCK está correto)
      console.log('❌ User não encontrado na lista');
      return false;
      
    } catch (error) {
      // Erro inesperado
      console.error('❌ Erro no login:', error);
      return false;
    }
  },

  // ==========================================
  // AÇÃO: logout
  // ==========================================
  /**
   * Efetua logout do utilizador
   * 
   * SIDE EFFECTS:
   * - Limpa currentUser (define como null)
   * - Define isAuthenticated como false
   * - Remove dados do localStorage
   * - App redireciona automaticamente para tela de login
   */
  logout: () => {
    // Limpar estado
    set({ currentUser: null, isAuthenticated: false });
    
    // Limpar localStorage
    localStorage.removeItem('factoryops_current_user_id');
    localStorage.removeItem('factoryops_is_authenticated');
    
    console.log('✅ Logout realizado com sucesso');
  },
}));

/**
 * ============================================
 * COMO USAR ESTE STORE NOS COMPONENTES
 * ============================================
 * 
 * EXEMPLO 1: Ler estado
 * 
 * import { useUserStore } from './store/userStore';
 * 
 * function MyComponent() {
 *   const { currentUser, isAuthenticated } = useUserStore();
 *   
 *   if (!isAuthenticated) {
 *     return <div>Por favor faça login</div>;
 *   }
 *   
 *   return <div>Olá, {currentUser.name}!</div>;
 * }
 * 
 * 
 * EXEMPLO 2: Chamar ações
 * 
 * function LoginForm() {
 *   const login = useUserStore(state => state.login);
 *   
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const success = await login(username, password);
 *     if (success) {
 *       // Login bem-sucedido
 *     } else {
 *       // Credenciais inválidas
 *     }
 *   };
 * }
 * 
 * 
 * EXEMPLO 3: Subscrever apenas parte do estado
 * 
 * function Navbar() {
 *   // Só re-renderiza se currentUser mudar
 *   const currentUser = useUserStore(state => state.currentUser);
 *   
 *   return <div>{currentUser?.name}</div>;
 * }
 */