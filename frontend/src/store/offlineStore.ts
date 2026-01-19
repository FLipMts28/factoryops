/**
 * ============================================
 * OFFLINE STORE - Gestão de Modo Offline
 * ============================================
 * 
 * Este store gere o estado de conectividade da aplicação.
 * Permite que a app funcione mesmo sem conexão ao servidor.
 * 
 * RESPONSABILIDADES:
 * - Detectar se aplicação está online ou offline
 * - Contar operações pendentes de sincronização
 * - Fornecer estado para UI mostrar indicadores
 * - Trabalhar em conjunto com IndexedDB e offlineSync hook
 * 
 * O QUE É MODO OFFLINE?
 * 
 * Aplicação tradicional (sem offline):
 * - User perde internet
 * - App para de funcionar
 * - Dados perdidos
 * - User frustrado ❌
 * 
 * Aplicação com offline (esta):
 * - User perde internet
 * - App continua funcionando
 * - Dados salvos localmente
 * - Sincroniza quando voltar online ✅
 * 
 * TECNOLOGIAS USADAS:
 * - navigator.onLine: API do navegador para detectar conexão
 * - IndexedDB: Base de dados no navegador (persistente)
 * - Event listeners: online/offline events
 * - Zustand: Estado global da conectividade
 * 
 * FLUXO COMPLETO:
 * 
 * CENÁRIO 1: User fica offline
 * 1. navigator.onLine muda para false
 * 2. Event listener 'offline' dispara
 * 3. setOnlineStatus(false)
 * 4. UI mostra indicador "Offline"
 * 5. Operações (create machine, annotate, chat) salvam em IndexedDB
 * 6. pendingSyncCount aumenta
 * 7. Badge mostra "3 pendentes"
 * 
 * CENÁRIO 2: User volta online
 * 1. navigator.onLine muda para true
 * 2. Event listener 'online' dispara
 * 3. setOnlineStatus(true)
 * 4. useOfflineSync hook detecta
 * 5. Processa fila de sincronização
 * 6. Para cada item pendente:
 *    - Tenta fazer POST/PUT/DELETE ao servidor
 *    - Se sucesso: Remove da fila, decrementPendingSync()
 *    - Se falha: Mantém na fila
 * 7. pendingSyncCount volta a 0
 * 8. UI mostra "Online"
 * 
 * INTEGRAÇÃO COM OUTROS COMPONENTES:
 * - useOfflineSync hook: Sincroniza dados
 * - IndexedDB service: Armazena dados locais
 * - Navbar: Mostra indicador online/offline
 * - Todos os stores: Salvam offline quando necessário
 */

// Importar Zustand para gestão de estado
import { create } from 'zustand';

/**
 * INTERFACE OfflineStore
 * 
 * Define estrutura do store de offline.
 * Simples mas crítico para UX da aplicação.
 */
interface OfflineStore {
  // ==========================================
  // ESTADO
  // ==========================================
  
  /**
   * isOnline: Flag de conectividade
   * 
   * true: Aplicação conectada ao servidor
   * false: Aplicação offline (sem internet ou servidor down)
   * 
   * INICIALIZAÇÃO:
   * navigator.onLine - API do navegador
   * 
   * IMPORTANTE:
   * navigator.onLine não é 100% confiável!
   * - Pode retornar true mesmo se servidor offline
   * - Apenas detecta se há conexão de rede
   * - Não garante que servidor responde
   * 
   * SOLUÇÃO ROBUSTA:
   * Combinar navigator.onLine + tentativas de API
   * Se fetch falhar → Considerar offline
   */
  isOnline: boolean;
  
  /**
   * pendingSyncCount: Número de operações pendentes
   * 
   * Contador de itens na fila de sincronização.
   * Cada operação offline adiciona à fila.
   * 
   * EXEMPLOS DE OPERAÇÕES PENDENTES:
   * - Criar máquina (POST /machines)
   * - Criar anotação (POST /annotations)
   * - Enviar mensagem (POST /chat/messages)
   * - Atualizar máquina (PATCH /machines/:id)
   * - Apagar anotação (DELETE /annotations/:id)
   * 
   * VALOR:
   * 0: Nada pendente, tudo sincronizado
   * 1-10: Poucas operações pendentes
   * 10+: Muitas operações pendentes
   * 
   * UI:
   * Badge no Navbar: "⚠️ Offline - 5 pendentes"
   */
  pendingSyncCount: number;
  
  // ==========================================
  // AÇÕES
  // ==========================================
  
  /**
   * setOnlineStatus: Define estado de conectividade
   * 
   * @param status - true = online, false = offline
   * 
   * QUANDO CHAMADO:
   * - Event listener 'online' → setOnlineStatus(true)
   * - Event listener 'offline' → setOnlineStatus(false)
   * - Fetch error → setOnlineStatus(false)
   * - Fetch success → setOnlineStatus(true)
   */
  setOnlineStatus: (status: boolean) => void;
  
  /**
   * setPendingSyncCount: Define contador de pendentes
   * 
   * @param count - Número de itens pendentes
   * 
   * QUANDO CHAMADO:
   * - Ao carregar aplicação (buscar de IndexedDB)
   * - Após sincronização completa
   * - Quando user limpa fila manualmente
   */
  setPendingSyncCount: (count: number) => void;
  
  /**
   * incrementPendingSync: Adiciona 1 ao contador
   * 
   * QUANDO CHAMADO:
   * - User cria item offline
   * - Item adicionado à fila de sincronização
   * - Badge atualiza: "3" → "4"
   */
  incrementPendingSync: () => void;
  
  /**
   * decrementPendingSync: Subtrai 1 do contador
   * 
   * QUANDO CHAMADO:
   * - Item sincronizado com sucesso
   * - Item removido da fila
   * - Badge atualiza: "4" → "3"
   * 
   * PROTEÇÃO:
   * Math.max(0, count - 1) garante nunca ficar negativo
   */
  decrementPendingSync: () => void;
}

/**
 * CRIAÇÃO DO STORE
 * 
 * create<OfflineStore>((set) => ({ ... }))
 * 
 * NOTA: Não usa 'get' neste store
 * Todas as ações são simples updates
 */
export const useOfflineStore = create<OfflineStore>((set) => ({
  
  // ==========================================
  // ESTADO INICIAL
  // ==========================================
  
  /**
   * isOnline: Inicializar com estado do navegador
   * 
   * navigator.onLine:
   * - API nativa do JavaScript
   * - Retorna boolean
   * - Disponível em todos os navegadores modernos
   * 
   * VALORES:
   * true: Navegador detecta conexão de rede
   * false: Sem conexão de rede (WiFi/Ethernet desligado)
   * 
   * LIMITAÇÃO:
   * Não detecta se servidor específico está acessível
   * Apenas se há conexão à internet em geral
   * 
   * EXEMPLO:
   * WiFi ligado mas servidor localhost:3001 offline
   * → navigator.onLine = true (incorreto!)
   * → Precisamos detectar via tentativas de fetch
   */
  isOnline: navigator.onLine,
  
  /**
   * pendingSyncCount: Inicializar com 0
   * 
   * Ao iniciar app, assumimos 0 pendentes.
   * useOfflineSync hook vai buscar valor real de IndexedDB
   * e chamar setPendingSyncCount(realCount)
   */
  pendingSyncCount: 0,

  // ==========================================
  // AÇÃO: setOnlineStatus
  // ==========================================
  /**
   * Define se aplicação está online ou offline
   * 
   * @param status - true = online, false = offline
   * 
   * SIDE EFFECTS NO UI:
   * - Navbar muda ícone: ☁️ vs ⚠️
   * - Cor muda: Verde vs Vermelho/Amarelo
   * - Texto: "Online" vs "Offline - X pendentes"
   * 
   * SIDE EFFECTS NO COMPORTAMENTO:
   * - Se offline: Operações salvam em IndexedDB
   * - Se online: Operações vão direto ao servidor
   * 
   * FLUXO TÍPICO:
   * 
   * 1. User perde WiFi
   * 2. window dispara event 'offline'
   * 3. Event listener chama setOnlineStatus(false)
   * 4. isOnline muda para false
   * 5. Componentes re-renderizam (Zustand notifica)
   * 6. UI atualiza indicadores
   * 7. Próxima operação vai para IndexedDB
   * 
   * 8. User liga WiFi
   * 9. window dispara event 'online'
   * 10. Event listener chama setOnlineStatus(true)
   * 11. isOnline muda para true
   * 12. useOfflineSync detecta e sincroniza
   */
  setOnlineStatus: (status) => {
    // Atualizar estado
    set({ isOnline: status });
    
    // Log para debugging
    console.log(status ? '🟢 Aplicação ONLINE' : '🔴 Aplicação OFFLINE');
  },

  // ==========================================
  // AÇÃO: setPendingSyncCount
  // ==========================================
  /**
   * Define número de operações pendentes
   * 
   * @param count - Quantidade de itens na fila
   * 
   * QUANDO USAR:
   * - Ao iniciar app: Buscar de IndexedDB
   * - Após sincronização em lote
   * - Ao limpar fila manualmente
   * 
   * EXEMPLO:
   * ```typescript
   * useEffect(() => {
   *   const loadPendingCount = async () => {
   *     const pending = await indexedDBService.getPendingSync()
   *     setPendingSyncCount(pending.length)
   *   }
   *   loadPendingCount()
   * }, [])
   * ```
   * 
   * VALIDAÇÃO:
   * Não há validação aqui (trust the caller)
   * Poderia adicionar: count = Math.max(0, count)
   */
  setPendingSyncCount: (count) => {
    set({ pendingSyncCount: count });
    
    console.log('📊 Pendentes de sincronização:', count);
  },

  // ==========================================
  // AÇÃO: incrementPendingSync
  // ==========================================
  /**
   * Incrementa contador de pendentes em 1
   * 
   * QUANDO CHAMAR:
   * Logo após adicionar item à fila de sincronização
   * 
   * FLUXO TÍPICO:
   * 
   * User está offline e cria máquina:
   * 1. handleSubmit() no AddMachineModal
   * 2. try { await machinesApi.create(data) }
   * 3. catch: Falhou! Backend offline
   * 4. await indexedDBService.saveMachine(data)
   * 5. await indexedDBService.addPendingSync({
   *      id: `machine-${Date.now()}`,
   *      type: 'machine',
   *      action: 'create',
   *      data: data
   *    })
   * 6. incrementPendingSync() ← AQUI
   * 7. Badge: "2" → "3"
   * 
   * IMPLEMENTAÇÃO:
   * set((state) => ({ ... }))
   * 
   * Usa função callback para acessar estado atual
   * state.pendingSyncCount tem valor antes do update
   * Retorna novo objeto com valor incrementado
   * 
   * IMUTABILIDADE:
   * Não faz state.pendingSyncCount++
   * Cria novo objeto { pendingSyncCount: old + 1 }
   * Zustand detecta mudança e notifica subscritores
   */
  incrementPendingSync: () => {
    set((state) => ({ 
      pendingSyncCount: state.pendingSyncCount + 1 
    }));
    
    // Log útil para debugging
    // Mostra que contador aumentou
    console.log('➕ Item adicionado à fila de sincronização');
  },

  // ==========================================
  // AÇÃO: decrementPendingSync
  // ==========================================
  /**
   * Decrementa contador de pendentes em 1
   * 
   * QUANDO CHAMAR:
   * Logo após sincronizar item com sucesso
   * 
   * FLUXO TÍPICO:
   * 
   * User volta online:
   * 1. useOfflineSync detecta isOnline = true
   * 2. const pending = await indexedDBService.getPendingSync()
   * 3. for (const item of pending) {
   *      try {
   *        await syncItem(item)  // POST/PUT/DELETE ao servidor
   *        await indexedDBService.removePendingSync(item.id)
   *        decrementPendingSync() ← AQUI
   *      } catch { continue }
   *    }
   * 4. Badge: "3" → "2" → "1" → "0"
   * 5. Quando chega a 0: "✅ Tudo sincronizado!"
   * 
   * PROTEÇÃO: Math.max(0, count - 1)
   * 
   * Garante contador nunca fica negativo.
   * 
   * POR QUÊ?
   * Se houver bug e decrementPendingSync() for chamado demais:
   * - Sem proteção: -1, -2, -3 (inválido!)
   * - Com proteção: 0, 0, 0 (para em 0)
   * 
   * EXEMPLO:
   * count = 1
   * 1 - 1 = 0  ✅
   * Math.max(0, 0) = 0
   * 
   * count = 0 (já está em 0, mas decrementamos por engano)
   * 0 - 1 = -1  ❌
   * Math.max(0, -1) = 0  ✅ (corrigido!)
   */
  decrementPendingSync: () => {
    set((state) => ({
      // Math.max retorna o maior valor entre os dois
      // Garante mínimo de 0
      pendingSyncCount: Math.max(0, state.pendingSyncCount - 1),
    }));
    
    console.log('➖ Item sincronizado com sucesso');
  },
}));

/**
 * ============================================
 * COMO USAR ESTE STORE
 * ============================================
 * 
 * EXEMPLO 1: Event Listeners para Online/Offline
 * 
 * ```typescript
 * // App.tsx ou layout principal
 * import { useOfflineStore } from './store/offlineStore'
 * 
 * function App() {
 *   const { setOnlineStatus } = useOfflineStore()
 *   
 *   useEffect(() => {
 *     // Definir listeners globais
 *     const handleOnline = () => {
 *       console.log('🌐 Internet restaurada')
 *       setOnlineStatus(true)
 *     }
 *     
 *     const handleOffline = () => {
 *       console.log('📡 Sem internet')
 *       setOnlineStatus(false)
 *     }
 *     
 *     // Registrar event listeners
 *     window.addEventListener('online', handleOnline)
 *     window.addEventListener('offline', handleOffline)
 *     
 *     // Cleanup ao desmontar
 *     return () => {
 *       window.removeEventListener('online', handleOnline)
 *       window.removeEventListener('offline', handleOffline)
 *     }
 *   }, [])
 * }
 * ```
 * 
 * EXEMPLO 2: Indicador no Navbar
 * 
 * ```typescript
 * // Navbar.tsx
 * import { useOfflineStore } from '../store/offlineStore'
 * 
 * function Navbar() {
 *   const { isOnline, pendingSyncCount } = useOfflineStore()
 *   
 *   return (
 *     <nav>
 *       <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
 *         {isOnline ? (
 *           <>
 *             <span>☁️</span>
 *             <span>Online</span>
 *           </>
 *         ) : (
 *           <>
 *             <span>⚠️</span>
 *             <span>Offline</span>
 *             {pendingSyncCount > 0 && (
 *               <span className="badge">{pendingSyncCount} pendentes</span>
 *             )}
 *           </>
 *         )}
 *       </div>
 *     </nav>
 *   )
 * }
 * ```
 * 
 * EXEMPLO 3: Salvar Offline
 * 
 * ```typescript
 * // AddMachineModal.tsx
 * import { useOfflineStore } from '../store/offlineStore'
 * import { indexedDBService } from '../services/indexedDB'
 * 
 * function AddMachineModal() {
 *   const { isOnline, incrementPendingSync } = useOfflineStore()
 *   
 *   const handleSubmit = async (machineData) => {
 *     if (isOnline) {
 *       // ONLINE: Enviar direto ao servidor
 *       try {
 *         const response = await machinesApi.create(machineData)
 *         alert('Máquina criada!')
 *         return response.data
 *       } catch (error) {
 *         // Falhou mesmo estando "online"
 *         // Servidor pode estar offline
 *         console.error('Erro ao criar:', error)
 *         // Tentar salvar offline
 *       }
 *     }
 *     
 *     // OFFLINE: Salvar localmente
 *     console.log('💾 Salvando máquina offline...')
 *     
 *     // Gerar ID temporário
 *     const tempId = `temp-${Date.now()}`
 *     const machineWithId = { ...machineData, id: tempId }
 *     
 *     // Salvar em IndexedDB
 *     await indexedDBService.saveMachine(machineWithId)
 *     
 *     // Adicionar à fila de sincronização
 *     await indexedDBService.addPendingSync({
 *       id: `machine-${Date.now()}`,
 *       type: 'machine',
 *       action: 'create',
 *       data: machineData,
 *       timestamp: Date.now()
 *     })
 *     
 *     // Incrementar contador
 *     incrementPendingSync()
 *     
 *     alert('Máquina salva offline. Sincronizará quando online.')
 *     return machineWithId
 *   }
 * }
 * ```
 * 
 * EXEMPLO 4: Hook de Sincronização
 * 
 * ```typescript
 * // hooks/useOfflineSync.ts
 * import { useEffect } from 'react'
 * import { useOfflineStore } from '../store/offlineStore'
 * import { indexedDBService } from '../services/indexedDB'
 * 
 * export const useOfflineSync = () => {
 *   const { 
 *     isOnline, 
 *     pendingSyncCount,
 *     setPendingSyncCount, 
 *     decrementPendingSync 
 *   } = useOfflineStore()
 *   
 *   // Ao iniciar, carregar contador real
 *   useEffect(() => {
 *     const loadPendingCount = async () => {
 *       const pending = await indexedDBService.getPendingSync()
 *       setPendingSyncCount(pending.length)
 *     }
 *     loadPendingCount()
 *   }, [])
 *   
 *   // Quando voltar online, sincronizar
 *   useEffect(() => {
 *     if (!isOnline || pendingSyncCount === 0) return
 *     
 *     const syncPending = async () => {
 *       console.log('🔄 Sincronizando', pendingSyncCount, 'itens...')
 *       
 *       const pending = await indexedDBService.getPendingSync()
 *       
 *       for (const item of pending) {
 *         try {
 *           // Sincronizar baseado no tipo
 *           switch(item.type) {
 *             case 'machine':
 *               await machinesApi.create(item.data)
 *               break
 *             case 'annotation':
 *               await annotationsApi.create(item.data)
 *               break
 *             case 'message':
 *               await chatApi.sendMessage(item.data)
 *               break
 *           }
 *           
 *           // Sucesso! Remover da fila
 *           await indexedDBService.removePendingSync(item.id)
 *           decrementPendingSync()
 *           
 *         } catch (error) {
 *           console.error('Erro ao sincronizar item:', item.id, error)
 *           // Manter na fila, tentar depois
 *         }
 *       }
 *       
 *       console.log('✅ Sincronização completa!')
 *     }
 *     
 *     syncPending()
 *   }, [isOnline, pendingSyncCount])
 * }
 * ```
 */

/**
 * ============================================
 * NAVEGADOR API: navigator.onLine
 * ============================================
 * 
 * PROPRIEDADE GLOBAL:
 * navigator.onLine: boolean
 * 
 * RETORNA:
 * true: Navegador tem conexão de rede
 * false: Navegador não tem conexão de rede
 * 
 * COMO FUNCIONA INTERNAMENTE:
 * - Browser verifica se interface de rede está ativa
 * - WiFi/Ethernet ligado → true
 * - Modo avião / WiFi desligado → false
 * 
 * LIMITAÇÕES (IMPORTANTE!):
 * 
 * 1. NÃO detecta se servidor específico está acessível
 *    - WiFi ligado mas servidor localhost:3001 offline
 *    - navigator.onLine = true (engana!)
 * 
 * 2. NÃO detecta qualidade de conexão
 *    - Conexão muito lenta
 *    - navigator.onLine = true (mas inutilizável)
 * 
 * 3. Pode ter falsos positivos
 *    - Conectado a WiFi sem internet
 *    - navigator.onLine = true (mas sem acesso real)
 * 
 * SOLUÇÃO ROBUSTA:
 * Combinar navigator.onLine + verificações de API
 * 
 * ```typescript
 * const checkOnlineStatus = async () => {
 *   // Check 1: Browser diz que está online?
 *   if (!navigator.onLine) {
 *     return false  // Definitivamente offline
 *   }
 *   
 *   // Check 2: Servidor responde?
 *   try {
 *     await fetch('/api/health', { method: 'HEAD' })
 *     return true  // Servidor acessível
 *   } catch {
 *     return false  // Servidor não responde
 *   }
 * }
 * ```
 * 
 * EVENTOS:
 * window.addEventListener('online', handler)
 * window.addEventListener('offline', handler)
 * 
 * BROWSER SUPPORT:
 * ✅ Chrome, Firefox, Safari, Edge
 * ✅ Mobile browsers
 * ✅ Desde IE9+
 */

/**
 * ============================================
 * INDEXEDDB - Armazenamento Local
 * ============================================
 * 
 * O QUE É?
 * Base de dados no navegador
 * - Persistente (não apaga ao fechar)
 * - Grande capacidade (~50MB+, pode ser GB)
 * - API assíncrona (Promises)
 * - Transações ACID
 * 
 * COMPARAÇÃO:
 * 
 * localStorage:
 * - Síncrono (bloqueia UI)
 * - Apenas strings
 * - ~5-10MB limite
 * - API simples
 * 
 * IndexedDB:
 * - Assíncrono (não bloqueia)
 * - Qualquer tipo (objects, arrays, blobs)
 * - ~50MB+ (ilimitado com permissão)
 * - API complexa
 * 
 * ESTRUTURA:
 * Database
 *   └─ Object Stores (como tabelas)
 *       ├─ machines
 *       ├─ annotations
 *       ├─ messages
 *       └─ pendingSync
 * 
 * EXEMPLO PENDING SYNC:
 * [
 *   {
 *     id: "machine-1705512345678",
 *     type: "machine",
 *     action: "create",
 *     data: { name: "Injetora 4", code: "INJ-004", ... },
 *     timestamp: 1705512345678
 *   },
 *   {
 *     id: "annotation-1705512567890",
 *     type: "annotation",
 *     action: "create",
 *     data: { type: "LINE", content: {...}, ... },
 *     timestamp: 1705512567890
 *   }
 * ]
 */
