/**
 * ============================================
 * CHAT STORE - Gestão de Mensagens de Chat
 * ============================================
 * 
 * Este store gere todo o estado relacionado com o sistema de chat.
 * Cada máquina tem o seu próprio chat onde utilizadores podem comunicar.
 * 
 * RESPONSABILIDADES:
 * - Armazenar mensagens do chat atual
 * - Gerir indicador "está a escrever..."
 * - Contador de mensagens não lidas por máquina
 * - Adicionar/remover mensagens
 * - Limpar chat ao mudar de máquina
 * 
 * INTEGRAÇÃO:
 * - WebSocket (Socket.IO): Recebe mensagens em tempo real
 * - ChatPanel component: Exibe mensagens
 * - Backend: GET /chat/machine/:id para histórico
 * 
 * FLUXO DE MENSAGEM:
 * 1. User escreve mensagem → ChatPanel
 * 2. addMessage() adiciona ao estado (optimistic update)
 * 3. socket.emit() envia para servidor
 * 4. Servidor salva na BD
 * 5. Servidor broadcast para todos os clientes
 * 6. Outros users recebem via WebSocket
 * 7. addMessage() adiciona ao estado deles
 * 8. UI atualiza instantaneamente
 */

// Importar Zustand para gestão de estado
import { create } from 'zustand';

// Importar tipo TypeScript para mensagem de chat
import { ChatMessage } from '../types';

/**
 * INTERFACE ChatStore
 * 
 * Define estrutura do store de chat
 */
interface ChatStore {
  // ==========================================
  // ESTADO
  // ==========================================
  
  messages: ChatMessage[];              // Array de mensagens do chat atual
  typingUsers: string[];                // Nomes dos users que estão a escrever
  unreadCounts: Record<string, number>; // Contador de não lidas por máquina
                                        // Ex: { "machine-123": 5, "machine-456": 2 }
  
  // ==========================================
  // AÇÕES
  // ==========================================
  
  setMessages: (messages: ChatMessage[]) => void;     // Define todas as mensagens (ao carregar histórico)
  addMessage: (message: ChatMessage) => void;         // Adiciona uma mensagem
  addTypingUser: (userName: string) => void;          // Adiciona user que está a escrever
  removeTypingUser: (userName: string) => void;       // Remove user que parou de escrever
  clearMessages: () => void;                          // Limpa mensagens (ao mudar de máquina)
  incrementUnread: (machineId: string) => void;       // Incrementa contador de não lidas
  clearUnread: (machineId: string) => void;           // Limpa contador (ao abrir chat)
  getUnreadCount: (machineId: string) => number;      // Obtém contagem de não lidas
}

/**
 * CRIAÇÃO DO STORE
 * 
 * useChatStore é o hook para aceder ao store
 */
export const useChatStore = create<ChatStore>((set, get) => ({
  
  // ==========================================
  // ESTADO INICIAL
  // ==========================================
  
  messages: [],         // Sem mensagens inicialmente
  typingUsers: [],      // Ninguém está a escrever
  unreadCounts: {},     // Sem mensagens não lidas

  // ==========================================
  // AÇÃO: setMessages
  // ==========================================
  /**
   * Define array completo de mensagens
   * 
   * QUANDO USADO:
   * - Ao abrir chat de uma máquina
   * - Carrega histórico do backend: GET /chat/machine/:id
   * - Substitui mensagens antigas pelas novas
   * 
   * IMPORTANTE:
   * - Não concatena, SUBSTITUI array completo
   * - Para adicionar mensagem individual, usar addMessage()
   * 
   * EXEMPLO:
   * const history = await fetch('/chat/machine/123');
   * setMessages(history); // Carrega todas as mensagens antigas
   */
  setMessages: (messages) => {
    set({ messages });
    console.log('📨 Mensagens carregadas:', messages.length);
  },

  // ==========================================
  // AÇÃO: addMessage
  // ==========================================
  /**
   * Adiciona uma nova mensagem ao array
   * 
   * @param message - Objeto ChatMessage
   * 
   * QUANDO USADO:
   * - User envia mensagem (optimistic update)
   * - WebSocket recebe mensagem de outro user
   * 
   * IMPORTANTE - OPTIMISTIC UPDATE:
   * Quando user envia mensagem, adicionamos IMEDIATAMENTE ao array
   * antes de receber confirmação do servidor. Isto torna UI responsiva.
   * 
   * PROBLEMA RESOLVIDO - Duplicação:
   * Inicialmente, mensagem aparecia duplicada:
   * 1. addMessage() ao enviar (optimistic)
   * 2. WebSocket recebia de volta (broadcast)
   * 
   * SOLUÇÃO:
   * Usar ID temporário único ao enviar:
   * - Frontend: id = "temp-" + Date.now() + Math.random()
   * - Backend: retorna com ID real (UUID)
   * - Frontend: substitui mensagem temporária por real
   * 
   * Neste código simplificado, apenas adiciona ao array.
   * Verificação de duplicação pode ser feita no ChatPanel.
   */
  addMessage: (message) => {
    set((state) => ({
      // Spread operator [...] cria novo array
      // Adiciona nova mensagem no fim
      messages: [...state.messages, message],
    }));
    
    console.log('💬 Nova mensagem:', message.content.substring(0, 30) + '...');
  },

  // ==========================================
  // AÇÃO: addTypingUser
  // ==========================================
  /**
   * Adiciona utilizador à lista de quem está a escrever
   * 
   * @param userName - Nome do utilizador
   * 
   * QUANDO USADO:
   * - WebSocket recebe evento 'user:typing'
   * - Outro utilizador começou a escrever
   * 
   * UI MOSTRA:
   * "João Silva está a escrever..."
   * ou
   * "João Silva e Maria Costa estão a escrever..."
   * 
   * IMPORTANTE:
   * - Verifica se user já está na lista (.includes())
   * - Se já existe, não adiciona duplicado
   * - Se não existe, adiciona ao array
   * 
   * TIMEOUT:
   * Geralmente, após 3 segundos sem digitar,
   * removeTypingUser() é chamado automaticamente.
   * Ver useWebSocket.ts para implementação.
   */
  addTypingUser: (userName) => {
    set((state) => ({
      typingUsers: state.typingUsers.includes(userName)
        ? state.typingUsers  // Já existe, manter array como está
        : [...state.typingUsers, userName],  // Não existe, adicionar
    }));
    
    console.log('⌨️  A escrever:', userName);
  },

  // ==========================================
  // AÇÃO: removeTypingUser
  // ==========================================
  /**
   * Remove utilizador da lista de quem está a escrever
   * 
   * @param userName - Nome do utilizador
   * 
   * QUANDO USADO:
   * - Após timeout de 3 segundos sem digitar
   * - User enviou mensagem (parou de escrever)
   * - User saiu do chat
   * 
   * MÉTODO .filter():
   * Cria novo array SEM o utilizador especificado
   * Mantém todos os outros
   * 
   * EXEMPLO:
   * typingUsers = ["João", "Maria", "Pedro"]
   * removeTypingUser("Maria")
   * → typingUsers = ["João", "Pedro"]
   */
  removeTypingUser: (userName) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u !== userName),
    }));
    
    console.log('⌨️  Parou de escrever:', userName);
  },

  // ==========================================
  // AÇÃO: clearMessages
  // ==========================================
  /**
   * Limpa todas as mensagens e indicadores de typing
   * 
   * QUANDO USADO:
   * - User fecha chat (clica fora)
   * - User muda para outra máquina
   * - Cleanup ao desmontar componente
   * 
   * IMPORTANTE:
   * Isto apenas limpa memória do frontend.
   * Mensagens permanecem na BD.
   * Ao reabrir, setMessages() carrega histórico novamente.
   * 
   * POR QUE LIMPAR?
   * - Economizar memória
   * - Evitar mostrar mensagens erradas ao mudar de máquina
   * - Chat de cada máquina é independente
   */
  clearMessages: () => {
    set({ 
      messages: [],      // Array vazio
      typingUsers: []    // Ninguém está a escrever
    });
    
    console.log('🧹 Chat limpo');
  },

  // ==========================================
  // AÇÃO: incrementUnread
  // ==========================================
  /**
   * Incrementa contador de mensagens não lidas
   * 
   * @param machineId - ID da máquina
   * 
   * QUANDO USADO:
   * - WebSocket recebe mensagem
   * - Chat da máquina NÃO está aberto
   * - User está a ver outra máquina
   * 
   * ESTRUTURA unreadCounts:
   * {
   *   "machine-123": 5,   // 5 mensagens não lidas
   *   "machine-456": 0,   // Tudo lido
   *   "machine-789": 12   // 12 não lidas
   * }
   * 
   * UI:
   * Badge vermelho no botão/tab do chat
   * Mostra número de não lidas
   * 
   * SPREAD OPERATOR {...}:
   * Cria novo objeto copiando todos os contadores existentes
   * Atualiza apenas o contador da máquina específica
   * 
   * [machineId]: 
   * Computed property name - usa valor da variável como chave
   */
  incrementUnread: (machineId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,  // Copiar todos os contadores existentes
        [machineId]: (state.unreadCounts[machineId] || 0) + 1,  // Incrementar específico
      },
    }));
    
    console.log('🔴 Mensagem não lida na máquina:', machineId);
  },

  // ==========================================
  // AÇÃO: clearUnread
  // ==========================================
  /**
   * Limpa contador de não lidas
   * 
   * @param machineId - ID da máquina
   * 
   * QUANDO USADO:
   * - User abre chat da máquina
   * - Todas as mensagens são marcadas como lidas
   * - Badge desaparece
   * 
   * EFEITO:
   * Define contador para 0
   * Badge vermelho desaparece do UI
   */
  clearUnread: (machineId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [machineId]: 0,  // Definir como zero
      },
    }));
    
    console.log('✅ Mensagens lidas da máquina:', machineId);
  },

  // ==========================================
  // AÇÃO: getUnreadCount
  // ==========================================
  /**
   * Obtém número de mensagens não lidas
   * 
   * @param machineId - ID da máquina
   * @returns number - Quantidade de não lidas (0 se nenhuma)
   * 
   * QUANDO USADO:
   * - Componente quer mostrar badge
   * - Verificar se há mensagens não lidas
   * 
   * IMPORTANTE:
   * get() retorna estado atual completo
   * Acessa unreadCounts do estado
   * Retorna contador ou 0 se não existir
   * 
   * EXEMPLO DE USO:
   * const count = getUnreadCount("machine-123");
   * if (count > 0) {
   *   return <Badge>{count}</Badge>;
   * }
   */
  getUnreadCount: (machineId) => {
    return get().unreadCounts[machineId] || 0;
  },
}));

/**
 * ============================================
 * ESTRUTURA DE DADOS
 * ============================================
 * 
 * CHAT MESSAGE:
 * {
 *   id: "cm5abc123...",           // UUID único
 *   content: "Máquina parada",    // Texto da mensagem
 *   machineId: "cm5xyz...",       // ID da máquina
 *   userId: "cm5user...",         // ID do autor
 *   userName: "João Silva",       // Nome do autor (denormalized)
 *   user: { id, name, role },     // Objeto User completo (incluído)
 *   createdAt: "2026-01-15T...",  // Timestamp
 * }
 * 
 * TYPING USERS:
 * ["João Silva", "Maria Costa"]  // Array de nomes
 * 
 * UNREAD COUNTS:
 * {
 *   "machine-id-1": 5,
 *   "machine-id-2": 0,
 *   "machine-id-3": 12
 * }
 */

/**
 * ============================================
 * FLUXO COMPLETO DE MENSAGEM
 * ============================================
 * 
 * CENÁRIO: João envia "Máquina OK" → Maria recebe
 * 
 * === NO BROWSER DO JOÃO ===
 * 
 * 1. João digita no MessageInput
 * 2. João pressiona Enter
 * 3. ChatPanel chama handleSendMessage()
 * 4. addMessage({ id: "temp-123", content: "Máquina OK", ... })
 *    → João vê mensagem IMEDIATAMENTE (optimistic update)
 * 5. socket.emit('chat:message', { content, machineId, userId })
 *    → Envia para servidor
 * 
 * === NO SERVIDOR ===
 * 
 * 6. ChatGateway recebe evento
 * 7. Valida dados
 * 8. Salva na BD com Prisma
 * 9. Gera UUID real: "cm5abc123..."
 * 10. socket.broadcast.to(machineId).emit('chat:message', savedMessage)
 *     → Envia para TODOS os clientes na sala desta máquina
 * 
 * === NO BROWSER DA MARIA ===
 * 
 * 11. useWebSocket hook recebe evento
 * 12. addMessage({ id: "cm5abc123", content: "Máquina OK", ... })
 * 13. Maria vê mensagem instantaneamente
 * 
 * === SE MARIA ESTIVER NOUTRA MÁQUINA ===
 * 
 * 14. incrementUnread(machineId)
 * 15. Badge aparece: "1"
 * 16. Maria clica no chat
 * 17. clearUnread(machineId)
 * 18. Badge desaparece
 * 
 * LATÊNCIA TOTAL: ~50-100ms do João pressionar Enter até Maria ver
 */

/**
 * ============================================
 * COMO USAR ESTE STORE
 * ============================================
 * 
 * EXEMPLO 1: Exibir mensagens
 * 
 * function ChatPanel({ machineId }) {
 *   const { messages, setMessages } = useChatStore();
 *   
 *   useEffect(() => {
 *     // Carregar histórico ao abrir
 *     const loadHistory = async () => {
 *       const res = await fetch(`/chat/machine/${machineId}`);
 *       const data = await res.json();
 *       setMessages(data);
 *     };
 *     loadHistory();
 *     
 *     // Limpar ao fechar
 *     return () => clearMessages();
 *   }, [machineId]);
 *   
 *   return (
 *     <div>
 *       {messages.map(msg => (
 *         <div key={msg.id}>{msg.content}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * 
 * EXEMPLO 2: Enviar mensagem
 * 
 * function MessageInput() {
 *   const addMessage = useChatStore(s => s.addMessage);
 *   
 *   const handleSend = (text) => {
 *     // Optimistic update
 *     addMessage({
 *       id: `temp-${Date.now()}`,
 *       content: text,
 *       // ... outros campos
 *     });
 *     
 *     // Enviar para servidor
 *     socket.emit('chat:message', { content: text });
 *   };
 * }
 * 
 * 
 * EXEMPLO 3: Indicador "está a escrever"
 * 
 * function TypingIndicator() {
 *   const typingUsers = useChatStore(s => s.typingUsers);
 *   
 *   if (typingUsers.length === 0) return null;
 *   
 *   return (
 *     <div>
 *       {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} a escrever...
 *     </div>
 *   );
 * }
 * 
 * 
 * EXEMPLO 4: Badge de não lidas
 * 
 * function MachineCard({ machine }) {
 *   const getUnreadCount = useChatStore(s => s.getUnreadCount);
 *   const count = getUnreadCount(machine.id);
 *   
 *   return (
 *     <div>
 *       {machine.name}
 *       {count > 0 && (
 *         <span className="badge">{count}</span>
 *       )}
 *     </div>
 *   );
 * }
 * 
 * 
 * EXEMPLO 5: WebSocket integration
 * 
 * function useWebSocket() {
 *   const { addMessage, addTypingUser, removeTypingUser } = useChatStore();
 *   
 *   useEffect(() => {
 *     socket.on('chat:message', (msg) => {
 *       addMessage(msg);
 *     });
 *     
 *     socket.on('user:typing', ({ userName }) => {
 *       addTypingUser(userName);
 *       setTimeout(() => removeTypingUser(userName), 3000);
 *     });
 *   }, []);
 * }
 */