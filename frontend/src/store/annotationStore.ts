/**
 * ============================================
 * ANNOTATION STORE - Gestão de Anotações Gráficas
 * ============================================
 * 
 * Este ficheiro implementa o store Zustand para gestão de anotações.
 * Anotações são formas desenhadas sobre esquemas técnicos das máquinas.
 * 
 * RESPONSABILIDADES:
 * - Armazenar array de anotações da máquina atual
 * - Recolher anotações do backend por machineId
 * - Adicionar novas anotações (recebidas via WebSocket ou criadas localmente)
 * - Atualizar anotações existentes (quando user move/edita)
 * - Remover anotações (quando user apaga)
 * - Salvar anotações offline  sem conexão
 * - Gerir estados de loading e erro
 * 
 * TIPOS DE ANOTAÇÃO:
 * - LINE: Linha reta (x1, y1, x2, y2)
 * - ARROW: Seta (linha com ponta triangular)
 * - RECTANGLE: Retângulo (x, y, width, height)
 * - CIRCLE: Círculo (cx, cy, radius)
 * - TEXT: Texto (x, y, text, fontSize)
 * 
 * FLUXO TÍPICO:
 * 1. User abre MachineDetail → Tab Anotações
 * 2. fetchAnnotations(machineId) busca anotações salvas
 * 3. AnnotationCanvas renderiza todas as formas
 * 4. User desenha nova forma → addAnnotation()
 * 5. Socket.IO emite evento → Backend salva
 * 6. Outros users recebem via WebSocket → addAnnotation()
 * 
 * MODO OFFLINE:
 * - Se fetchAnnotations falhar, procura no IndexedDB
 * - Novas anotações salvas localmente
 * - Sincroniza quando voltar online
 */

// Importar Zustand para criação de store global
import { create } from 'zustand';

// Importar tipo TypeScript que define estrutura de Annotation
import { Annotation } from '../types';

// Importar serviço API para comunicação HTTP com backend
import { annotationsApi } from '../services/api';

// Importar serviço IndexedDB para armazenamento offline
import { indexedDBService } from '../services/indexedDB';

/**
 * INTERFACE AnnotationStore
 * 
 * Define todos os campos e métodos disponíveis neste store.
 * TypeScript usa isto para type-checking e autocompletar no IDE.
 */
interface AnnotationStore {
  // ==========================================
  // ESTADO
  // ==========================================
  
  /**
   * annotations: Array de anotações da máquina atual
   * 
   * Cada anotação contém:
   * - id: UUID único (gerado pelo backend)
   * - type: 'LINE' | 'ARROW' | 'RECTANGLE' | 'CIRCLE' | 'TEXT'
   * - content: JSON com coordenadas e propriedades (x, y, color, etc)
   * - machineId: ID da máquina a que pertence
   * - userId: ID do utilizador que criou
   * - user: Objeto User completo (nome, role)
   * - createdAt: Timestamp de criação
   * - updatedAt: Timestamp última modificação
   * 
   * EXEMPLO:
   * {
   *   id: "cm5abc123...",
   *   type: "LINE",
   *   content: { x1: 100, y1: 50, x2: 200, y2: 150, color: "#FF0000", strokeWidth: 2 },
   *   machineId: "cm5xyz...",
   *   userId: "cm5user...",
   *   user: { id: "...", name: "João Silva", role: "ENGINEER" },
   *   createdAt: "2026-01-15T10:30:00Z",
   *   updatedAt: "2026-01-15T10:30:00Z"
   * }
   */
  annotations: Annotation[];
  
  /**
   * isLoading: Flag de carregamento
   * 
   * true: Está a buscar anotações do backend
   * false: Não está a carregar
   * 
   * USADO PARA:
   * - Mostrar spinner no UI
   * - Desabilitar botões durante carregamento
   * - Evitar múltiplas requisições simultâneas
   */
  isLoading: boolean;
  
  /**
   * error: Mensagem de erro (se houver)
   * 
   * null: Sem erros
   * string: Mensagem de erro para mostrar ao utilizador
   * 
   * EXEMPLOS:
   * - "Failed to fetch annotations"
   * - "Network error"
   * - "Unauthorized"
   */
  error: string | null;
  
  // ==========================================
  // AÇÕES
  // ==========================================
  
  /**
   * fetchAnnotations: Recolhe as anotações de uma máquina
   * 
   * @param machineId - UUID da máquina
   * @returns Promise<void> - Assíncrono, não retorna valor
   * 
   * QUANDO CHAMADO:
   * - Ao abrir tab Anotações no MachineDetail
   * - Ao mudar de máquina
   * - Após criar/editar anotação (refresh)
   */
  fetchAnnotations: (machineId: string) => Promise<void>;
  
  /**
   * addAnnotation: Adicionar anotação ao array local
   * 
   * @param annotation - Objeto Annotation completo
   * 
   * QUANDO CHAMADO:
   * - WebSocket recebe evento 'annotation:created'
   * - Após criar anotação localmente (optimistic update)
   * - Ao sincronizar anotações offline
   * 
   * IMPORTANTE:
   * Não faz POST ao backend! Apenas atualiza estado local.
   * O POST é feito no AnnotationCanvas antes de chamar isto.
   */
  addAnnotation: (annotation: Annotation) => void;
  
  /**
   * updateAnnotation: Atualizar anotação existente
   * 
   * @param id - UUID da anotação a atualizar
   * @param annotation - Objeto Annotation com novos dados
   * 
   * QUANDO CHAMADO:
   * - WebSocket recebe evento 'annotation:updated'
   * - User move ou redimensiona forma no canvas
   * - User muda cor ou espessura de forma existente
   */
  updateAnnotation: (id: string, annotation: Annotation) => void;
  
  /**
   * removeAnnotation: Remover anotação do array
   * 
   * @param id - UUID da anotação a remover
   * 
   * QUANDO CHAMADO:
   * - WebSocket recebe evento 'annotation:deleted'
   * - User clica "Apagar" em forma selecionada
   * - Botão "Limpar Minhas" ou "Limpar Todas"
   */
  removeAnnotation: (id: string) => void;
  
  /**
   * saveAnnotationOffline: Salvar anotação no IndexedDB
   * 
   * @param annotation - Dados da anotação (pode não ter id ainda)
   * @returns Promise<void> - Assíncrono
   * 
   * QUANDO CHAMADO:
   * - User cria anotação mas está offline
   * - Salva localmente para não perder
   * - Adiciona à fila de sincronização
   * - Quando voltar online, sincroniza automaticamente
   */
  saveAnnotationOffline: (annotation: any) => Promise<void>;
}

/**
 * CRIAÇÃO DO STORE
 * 
 * useAnnotationStore é o hook React que será usado nos componentes.
 * 
 * SINTAXE ZUSTAND:
 * create<Type>((set, get) => ({ ... }))
 * 
 * - set: Função para atualizar estado
 * - get: Função para ler estado atual
 * 
 * EXEMPLO DE USO:
 * const { annotations, fetchAnnotations } = useAnnotationStore()
 */
export const useAnnotationStore = create<AnnotationStore>((set, get) => ({
  
  // ==========================================
  // ESTADO INICIAL
  // ==========================================
  
  /**
   * Estado inicial do store quando aplicação inicia
   */
  annotations: [],      // Array vazio - sem anotações carregadas
  isLoading: false,     // Não está a carregar
  error: null,          // Sem erros

  // ==========================================
  // AÇÃO: fetchAnnotations
  // ==========================================
  /**
   * Busca todas as anotações de uma máquina específica
   * 
   * ESTRATÉGIA DE 2 NÍVEIS:
   * 1. Tentar buscar do backend via API
   * 2. Se falhar, buscar do IndexedDB (offline)
   * 
   * FLUXO DETALHADO:
   * 
   * 1. Iniciar loading state
   * 2. Limpar erros anteriores
   * 3. Fazer GET /annotations/machine/:machineId
   * 4. Se sucesso:
   *    a) Salvar anotações no estado
   *    b) isLoading = false
   * 5. Se falhar (catch):
   *    a) Servidor offline? Erro de rede?
   *    b) Tentar buscar de IndexedDB
   *    c) Carregar anotações locais (se existirem)
   *    d) isLoading = false
   * 
   * EXEMPLO DE RESPOSTA DA API:
   * [
   *   {
   *     id: "cm5...",
   *     type: "LINE",
   *     content: { x1: 10, y1: 20, x2: 100, y2: 80, color: "#FF0000", strokeWidth: 2 },
   *     machineId: "cm5xyz...",
   *     userId: "cm5user...",
   *     user: { id: "...", name: "João", role: "ENGINEER" },
   *     createdAt: "2026-01-15T10:30:00Z"
   *   },
   *   { ... },
   *   { ... }
   * ]
   */
  fetchAnnotations: async (machineId: string) => {
    // PASSO 1: Iniciar loading
    // set() atualiza estado do Zustand
    // Múltiplos campos podem ser atualizados simultaneamente
    set({ 
      isLoading: true,   // Mostrar spinner no UI
      error: null        // Limpar erros de tentativas anteriores
    });
    
    try {
      // PASSO 2: Tentar buscar do backend
      // annotationsApi.getByMachine() faz GET /annotations/machine/:machineId
      // Retorna Promise<AxiosResponse> com array de anotações
      const response = await annotationsApi.getByMachine(machineId);
      
      // PASSO 3: Sucesso! Salvar no estado
      // response.data contém array de Annotation objects
      set({ 
        annotations: response.data,  // Substituir array completo
        isLoading: false              // Terminar loading
      });
      
      console.log('✅ Anotações carregadas da API:', response.data.length);
      
    } catch (error) {
      // PASSO 4: Falhou! Tentar IndexedDB
      console.warn('⚠️  API falhou, tentando IndexedDB...', error);
      
      try {
        // Buscar anotações salvas localmente
        // IndexedDB é banco de dados no navegador
        // Permite app funcionar offline
        const offlineAnnotations = await indexedDBService.getAnnotationsByMachine(machineId);
        
        // Cast para tipo correto (TypeScript)
        // IndexedDB retorna 'any', forçamos para Annotation[]
        set({ 
          annotations: offlineAnnotations as Annotation[],
          isLoading: false 
        });
        
        console.log('✅ Anotações carregadas do IndexedDB:', offlineAnnotations.length);
        
      } catch (dbError) {
        // Nem API nem IndexedDB funcionaram
        // Deixar array vazio
        console.error('❌ Erro ao buscar de IndexedDB:', dbError);
        set({ 
          annotations: [],
          isLoading: false,
          error: 'Não foi possível carregar anotações'
        });
      }
    }
  },

  // ==========================================
  // AÇÃO: addAnnotation
  // ==========================================
  /**
   * Adiciona nova anotação ao array local
   * 
   * @param annotation - Objeto Annotation completo
   * 
   * IMPORTANTE - NÃO FAZ POST!
   * Esta função apenas atualiza estado local.
   * O POST ao backend deve ser feito ANTES de chamar isto.
   * 
   * QUANDO USAR:
   * 1. Optimistic Update: Adicionar localmente antes de confirmar com backend
   * 2. WebSocket Event: Outro user criou anotação, adicionar à nossa lista
   * 3. Offline Sync: Sincronizar anotações criadas offline
   * 
   * FLUXO TÍPICO:
   * 1. User desenha forma no canvas
   * 2. AnnotationCanvas:
   *    a) POST /annotations (salvar no backend)
   *    b) socket.emit('annotation:create') (notificar outros users)
   *    c) addAnnotation(annotation) (atualizar UI local)
   * 3. Outros users:
   *    a) Recebem via WebSocket
   *    b) addAnnotation(annotation) (atualizar UI deles)
   * 
   * SPREAD OPERATOR [...array, item]:
   * - Cria NOVO array (não muta o existente)
   * - Copia todos os elementos do array original
   * - Adiciona novo item no final
   * - Zustand detecta mudança e re-renderiza componentes
   * 
   * EXEMPLO:
   * Estado atual: [annotationA, annotationB]
   * Chamar: addAnnotation(annotationC)
   * Novo estado: [annotationA, annotationB, annotationC]
   */
  addAnnotation: (annotation) => {
    // set() com função callback
    // Função recebe 'state' atual como parâmetro
    // Retorna novo estado (partial update)
    set((state) => ({
      annotations: [...state.annotations, annotation],
      // Spread operator: Copia array existente + adiciona novo
      // É imutável: Não modifica array original
      // Zustand compara referências para detectar mudanças
    }));
    
    // Log para debugging
    console.log('➕ Anotação adicionada:', annotation.type, annotation.id);
  },

  // ==========================================
  // AÇÃO: updateAnnotation
  // ==========================================
  /**
   * Atualiza anotação existente no array
   * 
   * @param id - UUID da anotação a atualizar
   * @param annotation - Objeto Annotation com TODOS os campos (novo estado completo)
   * 
   * QUANDO USAR:
   * - User move forma no canvas (modo edição)
   * - User redimensiona forma
   * - User muda cor ou espessura de forma existente
   * - WebSocket recebe evento 'annotation:updated' de outro user
   * 
   * MÉTODO .map():
   * Array.map() itera sobre cada elemento e retorna novo array
   * - Para cada anotação (a):
   *   - Se a.id === id → Substituir por 'annotation' (novo)
   *   - Senão → Manter anotação original (a)
   * 
   * TERNÁRIO (condição ? seVerdadeiro : seFalso):
   * a.id === id ? annotation : a
   * 
   * Se ID corresponde: Usar nova anotação
   * Se não: Manter original
   * 
   * EXEMPLO:
   * Estado atual:
   * [
   *   { id: "1", type: "LINE", content: { x1: 10, ... } },
   *   { id: "2", type: "CIRCLE", content: { cx: 50, ... } },
   *   { id: "3", type: "RECTANGLE", ... }
   * ]
   * 
   * Chamar: updateAnnotation("2", { id: "2", type: "CIRCLE", content: { cx: 100, ... } })
   * 
   * Novo estado:
   * [
   *   { id: "1", ... },  // Inalterado
   *   { id: "2", type: "CIRCLE", content: { cx: 100, ... } },  // ATUALIZADO
   *   { id: "3", ... }   // Inalterado
   * ]
   */
  updateAnnotation: (id, annotation) => {
    set((state) => ({
      annotations: state.annotations.map((a) =>
        // Para CADA anotação no array:
        // Verificar se é a que queremos atualizar
        a.id === id 
          ? annotation  // SIM: Substituir por nova versão
          : a           // NÃO: Manter original
      ),
    }));
    
    console.log('🔄 Anotação atualizada:', id);
  },

  // ==========================================
  // AÇÃO: removeAnnotation
  // ==========================================
  /**
   * Remove anotação do array
   * 
   * @param id - UUID da anotação a remover
   * 
   * QUANDO USAR:
   * - User seleciona forma e pressiona DELETE
   * - User clica botão "Apagar" em forma selecionada
   * - Botão "Limpar Minhas Anotações"
   * - Botão "Limpar Todas Anotações" (ADMIN)
   * - WebSocket recebe evento 'annotation:deleted'
   * 
   * MÉTODO .filter():
   * Array.filter() cria novo array com elementos que passam teste
   * - Interage sobre cada anotação (a)
   * - Testa condição: a.id !== id
   * - Se TRUE: Incluir no novo array
   * - Se FALSE: Excluir (filtrar fora)
   * 
   * LÓGICA:
   * Queremos MANTER todas anotações EXCETO a com id especificado
   * a.id !== id significa "manter se ID for diferente"
   * 
   * EXEMPLO:
   * Estado atual:
   * [
   *   { id: "1", ... },
   *   { id: "2", ... },  ← Queremos remover esta
   *   { id: "3", ... }
   * ]
   * 
   * Chamar: removeAnnotation("2")
   * 
   * filter() processa:
   * - { id: "1" } → "1" !== "2" ? TRUE → MANTÉM
   * - { id: "2" } → "2" !== "2" ? FALSE → REMOVE
   * - { id: "3" } → "3" !== "2" ? TRUE → MANTÉM
   * 
   * Novo estado:
   * [
   *   { id: "1", ... },
   *   { id: "3", ... }
   * ]
   */
  removeAnnotation: (id) => {
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
      // filter() retorna novo array SEM elemento com id especificado
      // !== significa "diferente de"
      // Mantém todos EXCETO o que tem este id
    }));
    
    console.log('🗑️  Anotação removida:', id);
  },

  // ==========================================
  // AÇÃO: saveAnnotationOffline
  // ==========================================
  /**
   * Salva anotação localmente quando offline
   * 
   * @param annotation - Dados da anotação (pode não ter id ainda)
   * @returns Promise<void> - Assíncrono, não retorna valor
   * 
   * QUANDO USAR:
   * - User cria anotação mas backend está offline
   * - Não é possível fazer POST /annotations
   * - Salvar localmente para não perder dados
   * - Sincronizar depois quando voltar online
   * 
   * FLUXO COMPLETO:
   * 
   * 1. User desenha forma no canvas
   * 2. Tentar POST /annotations
   * 3. Falha! (offline)
   * 4. saveAnnotationOffline(annotation):
   *    a) Salvar em IndexedDB
   *    b) Adicionar à fila de sincronização
   * 5. Quando voltar online:
   *    a) useOfflineSync() detecta conexão
   *    b) Processa fila de sincronização
   *    c) Para cada item pendente:
   *       - POST /annotations
   *       - Se sucesso: Remove da fila
   *       - Se falha: Mantém na fila
   * 
   * INDEXEDDB:
   * Base de dados no navegador (não volátil)
   * - Persiste mesmo após fechar navegador
   * - Maior capacidade que localStorage (50MB+)
   * - API assíncrona (Promises)
   * - Permite queries complexas
   * 
   * PENDING SYNC:
   * Fila de operações pendentes de sincronização
   * Estrutura:
   * {
   *   id: "annotation-1705512345678",  // ID temporário único
   *   type: "annotation",               // Tipo de operação
   *   action: "create",                 // create | update | delete
   *   data: { ... },                    // Dados da anotação
   *   timestamp: 1705512345678          // Quando foi criada
   * }
   * 
   * Date.now():
   * Retorna timestamp atual em milissegundos desde 1970
   * Usado para IDs únicos e ordenação
   */
  saveAnnotationOffline: async (annotation) => {
    // PASSO 1: Salvar anotação em IndexedDB
    // Persiste dados localmente
    await indexedDBService.saveAnnotation(annotation);
    console.log('💾 Anotação salva offline:', annotation);
    
    // PASSO 2: Adicionar à fila de sincronização
    // Quando voltar online, este item será processado
    await indexedDBService.addPendingSync({
      id: `annotation-${Date.now()}`,  // ID único temporário
      type: 'annotation',                // Tipo de dados
      action: 'create',                  // Operação a realizar
      data: annotation,                  // Payload completo
      timestamp: Date.now(),             // Quando foi criado
    });
    console.log('📋 Anotação adicionada à fila de sincronização');
    
    // NOTA: Sincronização real acontece em useOfflineSync hook
    // Este hook roda em background e processa fila automaticamente
  },
}));

/**
 * ============================================
 * ESTRUTURA DE DADOS - Annotation
 * ============================================
 * 
 * DEFINIÇÃO COMPLETA (de types/index.ts):
 * 
 * interface Annotation {
 *   id: string                    // UUID gerado pelo backend
 *   type: AnnotationType          // Tipo de forma
 *   content: any                  // JSON com propriedades específicas
 *   machineId: string             // FK para Machine
 *   userId: string                // FK para User (quem criou)
 *   user: User                    // Objeto User completo (JOIN)
 *   createdAt: Date               // Timestamp criação
 *   updatedAt: Date               // Timestamp última modificação
 * }
 * 
 * enum AnnotationType {
 *   LINE = "LINE"
 *   ARROW = "ARROW"
 *   RECTANGLE = "RECTANGLE"
 *   CIRCLE = "CIRCLE"
 *   TEXT = "TEXT"
 * }
 * 
 * CONTENT POR TIPO:
 * 
 * LINE / ARROW:
 * {
 *   x1: number,           // Ponto inicial X
 *   y1: number,           // Ponto inicial Y
 *   x2: number,           // Ponto final X
 *   y2: number,           // Ponto final Y
 *   color: string,        // Hex color (ex: "#FF0000")
 *   strokeWidth: number   // Espessura (1-5)
 * }
 * 
 * RECTANGLE:
 * {
 *   x: number,            // Canto superior esquerdo X
 *   y: number,            // Canto superior esquerdo Y
 *   width: number,        // Largura
 *   height: number,       // Altura
 *   color: string,
 *   strokeWidth: number
 * }
 * 
 * CIRCLE:
 * {
 *   cx: number,           // Centro X
 *   cy: number,           // Centro Y
 *   radius: number,       // Raio
 *   color: string,
 *   strokeWidth: number
 * }
 * 
 * TEXT:
 * {
 *   x: number,            // Posição X
 *   y: number,            // Posição Y
 *   text: string,         // Conteúdo do texto
 *   color: string,
 *   fontSize: number      // Tamanho da fonte (px)
 * }
 */

/**
 * ============================================
 * FLUXO COMPLETO - Criar Anotação
 * ============================================
 * 
 * CENÁRIO: User desenha linha vermelha sobre esquema técnico
 * 
 * === NO BROWSER DO USER ===
 * 
 * 1. AnnotationCanvas mounted, canvas renderizado
 * 2. User seleciona ferramenta "LINE" no Toolbar
 * 3. User clica e arrasta no canvas:
 *    a) mouseDown → Capturar posição inicial (100, 50)
 *    b) mouseMove → Atualizar posição final (200, 150)
 *    c) mouseUp → Finalizar forma
 * 
 * 4. handleMouseUp():
 *    ```typescript
 *    const annotationData = {
 *      type: 'LINE',
 *      content: {
 *        x1: 100, y1: 50,
 *        x2: 200, y2: 150,
 *        color: '#FF0000',
 *        strokeWidth: 2
 *      },
 *      machineId: currentMachine.id,
 *      userId: currentUser.id
 *    }
 *    ```
 * 
 * 5. Tentar salvar no backend:
 *    ```typescript
 *    try {
 *      const response = await annotationsApi.create(annotationData)
 *      const savedAnnotation = response.data
 *      
 *      // Optimistic update local
 *      addAnnotation(savedAnnotation)
 *      
 *      // Notificar outros users
 *      socket.emit('annotation:create', savedAnnotation)
 *      
 *    } catch (error) {
 *      // Offline! Salvar localmente
 *      await saveAnnotationOffline(annotationData)
 *      addAnnotation({ ...annotationData, id: `temp-${Date.now()}` })
 *    }
 *    ```
 * 
 * === NO SERVIDOR ===
 * 
 * 6. Backend recebe POST /annotations
 * 7. AnnotationsController valida dados
 * 8. AnnotationsService:
 *    ```typescript
 *    const annotation = await prisma.annotation.create({
 *      data: {
 *        type: data.type,
 *        content: data.content,  // Armazena como JSON
 *        machineId: data.machineId,
 *        userId: data.userId
 *      },
 *      include: { user: true }  // JOIN com User
 *    })
 *    ```
 * 9. Gera UUID: "cm5abc123xyz..."
 * 10. AnnotationsGateway broadcast via WebSocket:
 *     ```typescript
 *     server.to(`machine:${machineId}`).emit('annotation:created', annotation)
 *     ```
 * 
 * === OUTROS BROWSERS (Users B, C, D) ===
 * 
 * 11. useWebSocket() hook recebe evento
 * 12. ```typescript
 *     socket.on('annotation:created', (annotation) => {
 *       addAnnotation(annotation)
 *     })
 *     ```
 * 13. addAnnotation() atualiza estado
 * 14. AnnotationCanvas re-renderiza
 * 15. Linha vermelha aparece instantaneamente
 * 
 * LATÊNCIA TOTAL: ~50-100ms do mouseUp até outros verem
 */

/**
 * ============================================
 * INTEGRAÇÃO COM OUTROS COMPONENTES
 * ============================================
 * 
 * QUEM USA ESTE STORE:
 * 
 * 1. AnnotationCanvas.tsx:
 *    ```typescript
 *    const { 
 *      annotations, 
 *      fetchAnnotations, 
 *      addAnnotation,
 *      updateAnnotation,
 *      removeAnnotation 
 *    } = useAnnotationStore()
 *    
 *    useEffect(() => {
 *      fetchAnnotations(machineId)
 *    }, [machineId])
 *    
 *    // Desenhar todas as anotações
 *    annotations.forEach(ann => drawShape(ctx, ann))
 *    ```
 * 
 * 2. Toolbar.tsx:
 *    ```typescript
 *    const { removeAnnotation } = useAnnotationStore()
 *    
 *    const handleClearAll = async () => {
 *      await annotationsApi.deleteAll(machineId)
 *      // Backend apaga e emite WebSocket
 *      // Este componente recebe evento e chama removeAnnotation()
 *    }
 *    ```
 * 
 * 3. useWebSocket.ts:
 *    ```typescript
 *    const { addAnnotation, updateAnnotation, removeAnnotation } = useAnnotationStore()
 *    
 *    socket.on('annotation:created', addAnnotation)
 *    socket.on('annotation:updated', (data) => {
 *      updateAnnotation(data.id, data.annotation)
 *    })
 *    socket.on('annotation:deleted', (data) => {
 *      removeAnnotation(data.id)
 *    })
 *    ```
 * 
 * 4. useOfflineSync.ts:
 *    ```typescript
 *    const syncAnnotations = async () => {
 *      const pending = await indexedDBService.getPendingSync()
 *      for (const item of pending.filter(i => i.type === 'annotation')) {
 *        await annotationsApi.create(item.data)
 *        await indexedDBService.removePendingSync(item.id)
 *      }
 *    }
 *    ```
 */

/**
 * ============================================
 * COMPARAÇÃO: addAnnotation vs saveAnnotationOffline
 * ============================================
 * 
 * addAnnotation():
 * - Atualiza APENAS estado local (Zustand)
 * - Não comunica com backend
 * - Não salva em IndexedDB
 * - Usado APÓS backend já confirmou
 * - Rápido (síncrono)
 * - Para optimistic updates e WebSocket events
 * 
 * saveAnnotationOffline():
 * - Salva em IndexedDB (persistente)
 * - Adiciona à fila de sincronização
 * - Não atualiza estado Zustand
 * - Usado quando backend OFFLINE
 * - Assíncrono (retorna Promise)
 * - Para garantir não perder dados
 * 
 * FLUXO ONLINE:
 * POST /annotations → addAnnotation()
 * 
 * FLUXO OFFLINE:
 * saveAnnotationOffline() → Quando online → POST /annotations → addAnnotation()
 */