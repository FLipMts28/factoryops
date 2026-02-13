/**
 * ============================================
 * SOCKET SERVICE - Cliente WebSocket (Socket.IO)
 * ============================================
 * 
 * Este ficheiro implementa o serviço de comunicação em tempo real.
 * Usa Socket.IO para estabelecer conexões WebSocket com o backend.
 * 
 * RESPONSABILIDADES:
 * - Estabelecer conexões WebSocket ao servidor
 * - Gerir 3 namespaces separados (machines, annotations, chat)
 * - Emitir eventos para o servidor
 * - Subscrever (listen) eventos do servidor
 * - Entrar/sair de salas (rooms) por máquina
 * - Fornecer API limpa para componentes React
 * 
 * O QUE É WEBSOCKET?
 * Protocolo de comunicação bidirecional em tempo real.
 * Diferente de HTTP (request/response), WebSocket mantém conexão aberta.
 * 
 * Cliente ←──────────────────────────→ Servidor
 *         (conexão persistente aberta)
 * 
 * Permite:
 * - Servidor enviar dados SEM cliente pedir (push)
 * - Latência baixíssima (~50-100ms)
 * - Eventos em tempo real
 * 
 * HTTP vs WebSocket:
 * 
 * HTTP:
 * Cliente → REQUEST → Servidor
 * Cliente ← RESPONSE ← Servidor
 * (conexão fecha)
 * 
 * WebSocket:
 * Cliente ←→ Evento 1 ←→ Servidor
 * Cliente ←→ Evento 2 ←→ Servidor
 * Cliente ←→ Evento 3 ←→ Servidor
 * (conexão permanece aberta)
 * 
 * O QUE É SOCKET.IO?
 * Biblioteca que facilita uso de WebSocket.
 * Features extras:
 * - Auto-reconnect (se conexão cair)
 * - Fallback para HTTP polling (se WebSocket não disponível)
 * - Namespaces (separar canais de comunicação)
 * - Rooms (agrupar clientes)
 * - Eventos customizados
 * 
 * ARQUITETURA DESTE SERVIÇO:
 * 
 * 3 NAMESPACES (canais separados):
 * 
 * 1. /machines
 *    - Mudanças de estado de máquinas
 *    - Broadcast global (todos recebem)
 * 
 * 2. /annotations
 *    - Anotações criadas/editadas/apagadas
 *    - Por sala de máquina (apenas users vendo aquela máquina)
 * 
 * 3. /chat
 *    - Mensagens de chat
 *    - Por sala de máquina
 *    - Indicador "está a escrever"
 * 
 * PADRÃO SINGLETON:
 * Este serviço usa padrão Singleton:
 * - Apenas UMA instância da classe existe
 * - Exportamos instância, não a classe
 * - Todos os componentes compartilham mesma conexão
 * 
 * POR QUÊ?
 * Evitar múltiplas conexões WebSocket (desperdício)
 * Todos os componentes usam mesmos sockets
 */

// Importar biblioteca Socket.IO client
// io: Função factory para criar conexões
// Socket: Tipo TypeScript para instância de socket
import { io, Socket } from 'socket.io-client';

/**
 * SOCKET_BASE_URL: URL base do servidor
 * 
 * Em desenvolvimento: http://localhost:3001
 * Em produção: https://factoryops.com
 * 
 * IMPORTANTE:
 * Deve corresponder ao URL onde NestJS backend está rodando
 * Backend tem CORS configurado para aceitar conexões deste URL
 */
const SOCKET_BASE_URL = 'http://localhost:3001';

/**
 * CLASSE SocketService
 * 
 * Encapsula toda a lógica de WebSocket.
 * Componentes React chamam métodos desta classe.
 * 
 * PADRÃO: Service Pattern
 * Separa lógica de comunicação da lógica de UI
 */
class SocketService {
  
  // ==========================================
  // PROPRIEDADES PRIVADAS
  // ==========================================
  
  /**
   * machinesSocket: Conexão para namespace /machines
   * 
   * Socket | null:
   * - Socket: Quando conectado
   * - null: Quando ainda não conectou (ou desconectou)
   * 
   * USADO PARA:
   * - Receber mudanças de estado de máquinas
   * - Evento: 'machineStatusChanged'
   * 
   * EXEMPLO DE EVENTO:
   * {
   *   machineId: "cm5abc...",
   *   status: "WARNING",
   *   machine: { id, name, code, status, ... }
   * }
   */
  private machinesSocket: Socket | null = null;
  
  /**
   * annotationsSocket: Conexão para namespace /annotations
   * 
   * USADO PARA:
   * - Criar/editar/apagar anotações
   * - Entrar/sair de salas por máquina
   * - Receber atualizações de outros users
   * 
   * EVENTOS EMITIDOS:
   * - joinMachine(machineId)
   * - leaveMachine(machineId)
   * - createAnnotation(data)
   * - updateAnnotation(data)
   * - deleteAnnotation(data)
   * 
   * EVENTOS RECEBIDOS:
   * - annotationCreated(annotation)
   * - annotationUpdated(annotation)
   * - annotationDeleted(id)
   */
  private annotationsSocket: Socket | null = null;
  
  /**
   * chatSocket: Conexão para namespace /chat
   * 
   * USADO PARA:
   * - Enviar/receber mensagens
   * - Entrar/sair de salas de chat
   * - Indicador "está a escrever"
   * - Histórico de mensagens
   * 
   * EVENTOS EMITIDOS:
   * - joinMachineChat({ machineId, userId })
   * - leaveMachineChat(machineId)
   * - sendMessage({ machineId, userId, content })
   * - userTyping({ machineId, userName })
   * 
   * EVENTOS RECEBIDOS:
   * - chatHistory(messages[])
   * - newMessage(message)
   * - userTyping({ userName })
   */
  private chatSocket: Socket | null = null;

  // ==========================================
  // MÉTODO: connect
  // ==========================================
  /**
   * Estabelece conexões WebSocket com os 3 namespaces
   * 
   * QUANDO CHAMADO:
   * - Ao iniciar aplicação (useEffect no App.tsx)
   * - Após login bem-sucedido
   * 
   * SINTAXE io():
   * io(url, options?)
   * 
   * URL com namespace:
   * - http://localhost:3001/machines
   * - http://localhost:3001/annotations
   * - http://localhost:3001/chat
   * 
   * OPTIONS (não usadas aqui, mas podem ser):
   * {
   *   auth: { token: "..." },           // Autenticação
   *   reconnection: true,                // Auto-reconnect
   *   reconnectionAttempts: 5,           // Tentativas
   *   transports: ['websocket', 'polling'] // Fallbacks
   * }
   * 
   * FLUXO:
   * 1. io() cria instância Socket
   * 2. Socket tenta conectar ao servidor
   * 3. Handshake (aperto de mão) estabelecido
   * 4. Conexão persistente aberta
   * 5. Pronto para emitir/receber eventos
   * 
   * IMPORTANTE:
   * Não há await aqui porque io() retorna imediatamente.
   * Conexão acontece assincronamente em background.
   * Se quiser esperar conexão, usar socket.on('connect', callback)
   */
  connect() {
    // Criar conexão para namespace /machines
    // Template literal: `${variavel}/path`
    this.machinesSocket = io(`${SOCKET_BASE_URL}/machines`);
    
    // Criar conexão para namespace /annotations
    this.annotationsSocket = io(`${SOCKET_BASE_URL}/annotations`);
    
    // Criar conexão para namespace /chat
    this.chatSocket = io(`${SOCKET_BASE_URL}/chat`);

    // Log para confirmar conexões iniciadas
    console.log('🔌 WebSockets connected');
    
    // OPCIONAL: Listener para confirmar quando conexão estabelecida
    // this.machinesSocket.on('connect', () => {
    //   console.log('✅ Machines socket connected')
    // })
    
    // OPCIONAL: Listener para erros de conexão
    // this.machinesSocket.on('connect_error', (error) => {
    //   console.error('❌ Connection error:', error)
    // })
  }

  // ==========================================
  // MÉTODO: disconnect
  // ==========================================
  /**
   * Desconecta todos os sockets
   * 
   * QUANDO CHAMADO:
   * - Ao fazer logout
   * - Ao fechar aplicação
   * - Component unmount (cleanup)
   * 
   * OPTIONAL CHAINING (?.)
   * socket?.disconnect()
   * 
   * Se socket for null: Não faz nada (não erro)
   * Se socket existir: Chama disconnect()
   * 
   * Equivalente a:
   * if (socket) {
   *   socket.disconnect()
   * }
   * 
   * POR QUÊ DESCONECTAR?
   * - Liberar recursos do servidor
   * - Evitar memory leaks
   * - Limpar event listeners
   * - Boa prática de cleanup
   */
  disconnect() {
    // Desconectar machines socket (se existir)
    this.machinesSocket?.disconnect();
    
    // Desconectar annotations socket (se existir)
    this.annotationsSocket?.disconnect();
    
    // Desconectar chat socket (se existir)
    this.chatSocket?.disconnect();
    
    console.log('🔌 WebSockets disconnected');
  }

  // ==========================================
  // SECÇÃO: MACHINES
  // ==========================================
  
  /**
   * onMachineStatusChanged: Subscrever mudanças de estado
   * 
   * @param callback - Função a chamar quando evento recebido
   * 
   * QUANDO USAR:
   * Componente quer ser notificado quando máquina muda estado
   * 
   * EXEMPLO DE USO:
   * ```typescript
   * useEffect(() => {
   *   socketService.onMachineStatusChanged((machine) => {
   *     console.log('Máquina mudou:', machine)
   *     updateMachineStatus(machine.id, machine)
   *   })
   * }, [])
   * ```
   * 
   * SINTAXE socket.on():
   * socket.on(eventName, callback)
   * 
   * - eventName: String do evento
   * - callback: Função a executar quando evento recebido
   * 
   * COMO FUNCIONA:
   * 1. Backend detecta mudança de estado
   * 2. Backend: socket.emit('machineStatusChanged', machine)
   * 3. Todos os clientes conectados recebem
   * 4. Callback é executado com dados recebidos
   * 5. Componente atualiza UI
   * 
   * DADOS RECEBIDOS:
   * {
   *   id: "cm5abc...",
   *   name: "Injetora 3",
   *   code: "INJ-003",
   *   status: "WARNING",  // Mudou de NORMAL para WARNING
   *   productionLineId: "...",
   *   ...
   * }
   */
  onMachineStatusChanged(callback: (machine: any) => void) {
    // Registrar listener no socket de machines
    // Optional chaining: Só executa se socket existir
    this.machinesSocket?.on('machineStatusChanged', callback);
    
    // IMPORTANTE: Não há return
    // Listener fica ativo até socket.off() ou disconnect()
  }

  // ==========================================
  // SECÇÃO: ANNOTATIONS
  // ==========================================

  /**
   * joinMachine: Entrar na sala de uma máquina
   * 
   * @param machineId - UUID da máquina
   * 
   * O QUE SÃO ROOMS (SALAS)?
   * Conceito de Socket.IO para agrupar clientes.
   * Permite broadcast para subconjunto de clientes.
   * 
   * SEM ROOMS:
   * socket.emit() → Vai para TODOS os clientes
   * 
   * COM ROOMS:
   * socket.to('machine:123').emit() → Só clientes na sala 'machine:123'
   * 
   * POR QUÊ USAR?
   * Quando user abre MachineDetail da máquina X:
   * - Queremos receber anotações apenas da máquina X
   * - Não queremos anotações de outras máquinas
   * - Entramos na sala 'machine:X'
   * 
   * FLUXO:
   * 1. User clica em máquina no dashboard
   * 2. MachineDetail monta
   * 3. useEffect: joinMachine(machineId)
   * 4. Socket emite evento 'joinMachine' para servidor
   * 5. Servidor: socket.join(`machine:${machineId}`)
   * 6. Agora recebemos apenas eventos desta máquina
   * 
   * QUANDO USER FECHA:
   * 1. MachineDetail unmount
   * 2. useEffect cleanup: leaveMachine(machineId)
   * 3. Para de receber eventos desta máquina
   * 
   * SINTAXE socket.emit():
   * socket.emit(eventName, data?)
   * 
   * - Envia evento para servidor
   * - Pode incluir dados (payload)
   */
  joinMachine(machineId: string) {
    // Emitir evento 'joinMachine' com ID da máquina
    this.annotationsSocket?.emit('joinMachine', machineId);
    
    console.log('🚪 Joined machine room:', machineId);
  }

  /**
   * leaveMachine: Sair da sala de uma máquina
   * 
   * @param machineId - UUID da máquina
   * 
   * QUANDO USAR:
   * - Component unmount (cleanup)
   * - User volta ao dashboard
   * - User abre outra máquina
   * 
   * IMPORTANTE:
   * Sempre dar leave quando não precisar mais dos eventos.
   * Evita receber eventos desnecessários.
   * Economiza processamento.
   */
  leaveMachine(machineId: string) {
    // Emitir evento 'leaveMachine'
    this.annotationsSocket?.emit('leaveMachine', machineId);
    
    console.log('🚪 Left machine room:', machineId);
  }

  /**
   * onAnnotationCreated: Subscrever criação de anotações
   * 
   * @param callback - Função a chamar quando anotação criada
   * 
   * QUANDO EVENTO É DISPARADO:
   * - Outro user desenha forma no canvas
   * - Backend salva na BD
   * - Backend emite 'annotationCreated' para sala
   * - Todos na sala recebem
   * - Callback executado
   * 
   * EXEMPLO DE USO:
   * ```typescript
   * useEffect(() => {
   *   socketService.onAnnotationCreated((annotation) => {
   *     addAnnotation(annotation)  // Adicionar ao store
   *     renderAnnotation(annotation)  // Desenhar no canvas
   *   })
   * }, [])
   * ```
   * 
   * DADOS RECEBIDOS:
   * {
   *   id: "cm5xyz...",
   *   type: "LINE",
   *   content: { x1: 10, y1: 20, x2: 100, y2: 80, color: "#FF0000", strokeWidth: 2 },
   *   machineId: "cm5abc...",
   *   userId: "cm5user...",
   *   user: { id: "...", name: "João Silva", role: "ENGINEER" },
   *   createdAt: "2026-01-15T10:30:00Z"
   * }
   */
  onAnnotationCreated(callback: (annotation: any) => void) {
    this.annotationsSocket?.on('annotationCreated', callback);
  }

  /**
   * onAnnotationUpdated: Subscrever edição de anotações
   * 
   * @param callback - Função a chamar quando anotação editada
   * 
   * QUANDO DISPARA:
   * - User move forma no canvas (modo edição)
   * - User redimensiona forma
   * - User muda cor/espessura
   */
  onAnnotationUpdated(callback: (annotation: any) => void) {
    this.annotationsSocket?.on('annotationUpdated', callback);
  }

  /**
   * onAnnotationDeleted: Subscrever remoção de anotações
   * 
   * @param callback - Função a chamar quando anotação apagada
   * 
   * QUANDO DISPARA:
   * - User pressiona DELETE em forma selecionada
   * - Botão "Limpar Minhas"
   * - Botão "Limpar Todas" (ADMIN)
   * 
   * DADOS RECEBIDOS:
   * "cm5xyz..."  (apenas o ID da anotação apagada)
   * 
   * Não recebe objeto completo porque já foi apagado da BD
   */
  onAnnotationDeleted(callback: (id: string) => void) {
    this.annotationsSocket?.on('annotationDeleted', callback);
  }

  /**
   * createAnnotation: Emitir criação de anotação
   * 
   * @param data - Dados da anotação a criar
   * 
   * FLUXO COMPLETO:
   * 1. User desenha forma no canvas
   * 2. handleMouseUp() captura coordenadas
   * 3. createAnnotation({ type, content, machineId, userId })
   * 4. Servidor recebe evento
   * 5. Servidor salva na BD
   * 6. Servidor emite 'annotationCreated' para sala
   * 7. Todos (incluindo quem criou) recebem
   * 8. UI atualiza
   * 
   * DADOS ENVIADOS:
   * {
   *   type: "LINE",
   *   content: { x1: 10, y1: 20, x2: 100, y2: 80, color: "#FF0000", strokeWidth: 2 },
   *   machineId: "cm5abc...",
   *   userId: "cm5user..."
   * }
   * 
   * IMPORTANTE: Não inclui ID
   * ID é gerado pelo backend (UUID)
   */
  createAnnotation(data: any) {
    this.annotationsSocket?.emit('createAnnotation', data);
  }

  /**
   * updateAnnotation: Emitir edição de anotação
   * 
   * @param data - Dados completos da anotação atualizada
   * 
   * DADOS ENVIADOS:
   * {
   *   id: "cm5xyz...",  // IMPORTANTE: Inclui ID existente
   *   type: "LINE",
   *   content: { x1: 15, y1: 25, x2: 105, y2: 85, ... },  // Coords novas
   *   machineId: "...",
   *   userId: "..."
   * }
   */
  updateAnnotation(data: any) {
    this.annotationsSocket?.emit('updateAnnotation', data);
  }

  /**
   * deleteAnnotation: Emitir remoção de anotação
   * 
   * @param data - Dados mínimos (ID é suficiente)
   * 
   * DADOS ENVIADOS:
   * {
   *   id: "cm5xyz...",
   *   machineId: "cm5abc..."  // Para broadcast à sala correta
   * }
   */
  deleteAnnotation(data: any) {
    this.annotationsSocket?.emit('deleteAnnotation', data);
  }

  // ==========================================
  // SECÇÃO: CHAT
  // ==========================================

  /**
   * joinMachineChat: Entrar no chat de uma máquina
   * 
   * @param machineId - UUID da máquina
   * @param userId - UUID do utilizador
   * 
   * Similar a joinMachine para annotations.
   * Cada máquina tem seu próprio chat.
   * 
   * DADOS ENVIADOS:
   * { machineId: "cm5abc...", userId: "cm5user..." }
   * 
   * BACKEND:
   * 1. Recebe evento
   * 2. socket.join(`machine:${machineId}`)
   * 3. Envia histórico de mensagens (chatHistory)
   */
  joinMachineChat(machineId: string, userId: string) {
    this.chatSocket?.emit('joinMachineChat', { machineId, userId });
    
    console.log('💬 Joined chat room:', machineId);
  }

  /**
   * leaveMachineChat: Sair do chat
   * 
   * @param machineId - UUID da máquina
   * 
   * QUANDO USAR:
   * - User fecha MachineDetail
   * - User muda de máquina
   * - Component unmount
   */
  leaveMachineChat(machineId: string) {
    this.chatSocket?.emit('leaveMachineChat', machineId);
    
    console.log('💬 Left chat room:', machineId);
  }

  /**
   * onChatHistory: Receber histórico de mensagens
   * 
   * @param callback - Função a chamar com array de mensagens
   * 
   * QUANDO DISPARA:
   * Logo após joinMachineChat()
   * Backend envia últimas 100 mensagens (ou todas)
   * 
   * DADOS RECEBIDOS:
   * [
   *   {
   *     id: "cm5msg1...",
   *     content: "Máquina OK",
   *     machineId: "cm5abc...",
   *     userId: "cm5user1...",
   *     user: { id, name: "João Silva", role: "OPERATOR" },
   *     createdAt: "2026-01-15T09:00:00Z"
   *   },
   *   { ... },
   *   { ... }
   * ]
   * 
   * ORDEM: Mais antigas primeiro (ascending)
   */
  onChatHistory(callback: (messages: any[]) => void) {
    this.chatSocket?.on('chatHistory', callback);
  }

  /**
   * onNewMessage: Subscrever novas mensagens
   * 
   * @param callback - Função a chamar quando mensagem recebida
   * 
   * QUANDO DISPARA:
   * - Outro user (ou você) envia mensagem
   * - Backend salva na BD
   * - Backend broadcast para sala
   * - Todos recebem
   * 
   * DADOS RECEBIDOS:
   * {
   *   id: "cm5msg123...",
   *   content: "Tudo resolvido!",
   *   machineId: "cm5abc...",
   *   userId: "cm5user2...",
   *   user: { name: "Maria Costa", ... },
   *   createdAt: "2026-01-15T10:35:00Z"
   * }
   */
  onNewMessage(callback: (message: any) => void) {
    this.chatSocket?.on('newMessage', callback);
  }

  /**
   * sendMessage: Enviar mensagem
   * 
   * @param data - Dados da mensagem
   * 
   * DADOS ENVIADOS:
   * {
   *   content: "Máquina está OK",
   *   machineId: "cm5abc...",
   *   userId: "cm5user..."
   * }
   * 
   * FLUXO:
   * 1. User digita e pressiona Enter
   * 2. sendMessage({ content, machineId, userId })
   * 3. Backend recebe
   * 4. Backend salva na BD (gera ID e timestamp)
   * 5. Backend emite 'newMessage' para sala
   * 6. Todos recebem (incluindo remetente)
   * 7. UI atualiza
   */
  sendMessage(data: any) {
    this.chatSocket?.emit('sendMessage', data);
  }

  /**
   * onUserTyping: Subscrever indicador "está a escrever"
   * 
   * @param callback - Função a chamar quando user digita
   * 
   * QUANDO DISPARA:
   * - Outro user está a digitar
   * - Evento emitido a cada keystroke (debounced)
   * 
   * DADOS RECEBIDOS:
   * { userName: "João Silva" }
   * 
   * UI MOSTRA:
   * "João Silva está a escrever..."
   * 
   * TIMEOUT:
   * Após 3 segundos sem digitar, indicador desaparece
   */
  onUserTyping(callback: (data: any) => void) {
    this.chatSocket?.on('userTyping', callback);
  }

  /**
   * emitUserTyping: Notificar que está a escrever
   * 
   * @param machineId - UUID da máquina
   * @param userName - Nome do utilizador
   * 
   * QUANDO USAR:
   * onChange do input de chat (debounced)
   * 
   * DADOS ENVIADOS:
   * { machineId: "cm5abc...", userName: "João Silva" }
   * 
   * BACKEND:
   * Recebe e faz broadcast para sala (exceto remetente)
   * socket.to(roomName).emit('userTyping', { userName })
   */
  emitUserTyping(machineId: string, userName: string) {
    this.chatSocket?.emit('userTyping', { machineId, userName });
  }
}

/**
 * EXPORTAR INSTÂNCIA (SINGLETON)
 * 
 * new SocketService() cria instância única
 * Exportamos a instância, não a classe
 * 
 * VANTAGEM:
 * Todos os componentes usam mesma instância
 * Compartilham mesmas conexões WebSocket
 * 
 * ALTERNATIVA (não usada):
 * export default SocketService
 * (cada import criaria nova instância - errado!)
 */
export const socketService = new SocketService();

/**
 * ============================================
 * COMO USAR ESTE SERVIÇO
 * ============================================
 * 
 * EXEMPLO 1: Conectar ao iniciar app
 * 
 * ```typescript
 * // App.tsx
 * import { socketService } from './services/socket'
 * 
 * function App() {
 *   useEffect(() => {
 *     socketService.connect()
 *     
 *     return () => {
 *       socketService.disconnect()  // Cleanup
 *     }
 *   }, [])
 * }
 * ```
 * 
 * EXEMPLO 2: Subscrever mudanças de máquinas
 * 
 * ```typescript
 * // Dashboard.tsx
 * import { socketService } from '../services/socket'
 * import { useMachineStore } from '../store/machineStore'
 * 
 * function Dashboard() {
 *   const { updateMachineStatus } = useMachineStore()
 *   
 *   useEffect(() => {
 *     socketService.onMachineStatusChanged((machine) => {
 *       console.log('Máquina atualizada:', machine.name, '→', machine.status)
 *       updateMachineStatus(machine.id, machine)
 *     })
 *   }, [])
 * }
 * ```
 * 
 * EXEMPLO 3: Anotações em tempo real
 * 
 * ```typescript
 * // AnnotationCanvas.tsx
 * import { socketService } from '../services/socket'
 * import { useAnnotationStore } from '../store/annotationStore'
 * 
 * function AnnotationCanvas({ machineId }) {
 *   const { addAnnotation, updateAnnotation, removeAnnotation } = useAnnotationStore()
 *   
 *   useEffect(() => {
 *     // Entrar na sala
 *     socketService.joinMachine(machineId)
 *     
 *     // Subscrever eventos
 *     socketService.onAnnotationCreated(addAnnotation)
 *     socketService.onAnnotationUpdated((ann) => updateAnnotation(ann.id, ann))
 *     socketService.onAnnotationDeleted(removeAnnotation)
 *     
 *     // Cleanup
 *     return () => {
 *       socketService.leaveMachine(machineId)
 *     }
 *   }, [machineId])
 *   
 *   const handleDrawComplete = (annotationData) => {
 *     socketService.createAnnotation(annotationData)
 *   }
 * }
 * ```
 * 
 * EXEMPLO 4: Chat em tempo real
 * 
 * ```typescript
 * // ChatPanel.tsx
 * import { socketService } from '../services/socket'
 * import { useChatStore } from '../store/chatStore'
 * 
 * function ChatPanel({ machineId }) {
 *   const { setMessages, addMessage, addTypingUser } = useChatStore()
 *   const { currentUser } = useUserStore()
 *   
 *   useEffect(() => {
 *     // Entrar no chat
 *     socketService.joinMachineChat(machineId, currentUser.id)
 *     
 *     // Receber histórico
 *     socketService.onChatHistory((messages) => {
 *       setMessages(messages)
 *     })
 *     
 *     // Receber novas mensagens
 *     socketService.onNewMessage((message) => {
 *       addMessage(message)
 *     })
 *     
 *     // Indicador typing
 *     socketService.onUserTyping((data) => {
 *       addTypingUser(data.userName)
 *       setTimeout(() => removeTypingUser(data.userName), 3000)
 *     })
 *     
 *     // Cleanup
 *     return () => {
 *       socketService.leaveMachineChat(machineId)
 *     }
 *   }, [machineId])
 *   
 *   const handleSend = (text) => {
 *     socketService.sendMessage({
 *       content: text,
 *       machineId,
 *       userId: currentUser.id
 *     })
 *   }
 *   
 *   const handleTyping = () => {
 *     socketService.emitUserTyping(machineId, currentUser.name)
 *   }
 * }
 * ```
 */

/**
 * ============================================
 * BACKEND - Como Funciona do Outro Lado
 * ============================================
 * 
 * GATEWAY (NestJS):
 * 
 * ```typescript
 * @WebSocketGateway({ namespace: 'chat' })
 * export class ChatGateway {
 *   @WebSocketServer()
 *   server: Server
 *   
 *   @SubscribeMessage('joinMachineChat')
 *   handleJoin(
 *     @MessageBody() data: { machineId: string, userId: string },
 *     @ConnectedSocket() client: Socket
 *   ) {
 *     const roomName = `machine:${data.machineId}`
 *     client.join(roomName)
 *     
 *     // Enviar histórico
 *     const messages = await this.chatService.getHistory(data.machineId)
 *     client.emit('chatHistory', messages)
 *   }
 *   
 *   @SubscribeMessage('sendMessage')
 *   async handleMessage(
 *     @MessageBody() data: { content: string, machineId: string, userId: string },
 *     @ConnectedSocket() client: Socket
 *   ) {
 *     // Salvar na BD
 *     const message = await this.chatService.create(data)
 *     
 *     // Broadcast para sala
 *     const roomName = `machine:${data.machineId}`
 *     this.server.to(roomName).emit('newMessage', message)
 *   }
 *   
 *   @SubscribeMessage('userTyping')
 *   handleTyping(
 *     @MessageBody() data: { machineId: string, userName: string },
 *     @ConnectedSocket() client: Socket
 *   ) {
 *     const roomName = `machine:${data.machineId}`
 *     // Enviar para todos EXCETO remetente
 *     client.to(roomName).emit('userTyping', { userName: data.userName })
 *   }
 * }
 * ```
 */

/**
 * ============================================
 * DEBUGGING E TROUBLESHOOTING
 * ============================================
 * 
 * PROBLEMA: "WebSocket connection failed"
 * CAUSA: Backend não está rodando ou URL errado
 * SOLUÇÃO: Verificar se backend está em localhost:3001
 * 
 * PROBLEMA: "Events not being received"
 * CAUSA: Não entrou na sala (joinMachine / joinMachineChat)
 * SOLUÇÃO: Verificar se join foi chamado antes de subscrever eventos
 * 
 * PROBLEMA: "Receiving events from wrong machine"
 * CAUSA: Não saiu da sala anterior (leaveMachine)
 * SOLUÇÃO: Sempre chamar leave em cleanup
 * 
 * PROBLEMA: "Multiple connections"
 * CAUSA: connect() chamado múltiplas vezes
 * SOLUÇÃO: Chamar connect() apenas uma vez (useEffect [] no App)
 * 
 * DEBUGGING:
 * 
 * // Ver eventos recebidos
 * this.chatSocket?.onAny((event, ...args) => {
 *   console.log('Event received:', event, args)
 * })
 * 
 * // Ver eventos enviados
 * this.chatSocket?.onAnyOutgoing((event, ...args) => {
 *   console.log('Event sent:', event, args)
 * })
 * 
 * // Verificar se conectado
 * console.log('Connected?', this.chatSocket?.connected)
 */
