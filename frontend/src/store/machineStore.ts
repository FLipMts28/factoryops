/**
 * ============================================
 * MACHINE STORE - Gestão de Máquinas e Linhas de Produção
 * ============================================
 * 
 * Este store gere todo o estado relacionado com máquinas e linhas de produção.
 * É o coração da aplicação, mantendo os dados das 375 máquinas.
 * 
 * RESPONSABILIDADES:
 * - Procurar e armazenar lista de máquinas do backend
 * - Procurar e armazenar linhas de produção
 * - Gerir máquina selecionada (para vista de detalhes)
 * - Atualizar estado de máquinas em tempo real (via WebSocket)
 * - Adicionar novas máquinas
 * - Gerir estados de loading e erros
 * 
 * INTEGRAÇÃO COM BACKEND:
 * - GET /machines - Procurar todas as máquinas
 * - GET /production-lines - Procurar linhas de produção
 * - POST /machines - Criar nova máquina
 * - WebSocket events - Atualizações em tempo real
 */

// Importar Zustand para criação do store
import { create } from 'zustand';

// Importar tipos TypeScript para type safety
import { Machine, ProductionLine } from '../types';

// Importar serviços API para comunicação com backend
import { machinesApi, productionLinesApi } from '../services/api';

/**
 * INTERFACE MachineStore
 * 
 * Define a estrutura completa do store de máquinas
 * Todas as propriedades e métodos disponíveis
 */
interface MachineStore {
  // ==========================================
  // ESTADO
  // ==========================================
  
  machines: Machine[];                    // Array de todas as máquinas (375 máquinas)
  productionLines: ProductionLine[];      // Array de linhas de produção (15 linhas)
  selectedMachine: Machine | null;        // Máquina atualmente selecionada (para MachineDetail)
  isLoading: boolean;                     // Flag de carregamento (mostrar spinner)
  error: string | null;                   // Mensagem de erro (se houver)
  
  // ==========================================
  // AÇÕES
  // ==========================================
  
  fetchMachines: () => Promise<void>;                              // Procurar máquinas do backend
  fetchProductionLines: () => Promise<void>;                       // Procurar linhas de produção
  setSelectedMachine: (machine: Machine | null) => void;           // Selecionar máquina
  updateMachineStatus: (machineId: string, machine: Machine) => void;  // Atualizar máquina
  addMachine: (machine: Machine) => Promise<Machine>;              // Adicionar nova máquina
}

/**
 * CRIAÇÃO DO STORE
 * 
 * useMachineStore é o hook usado nos componentes React
 * Permite ler estado e executar ações
 * 
 * EXEMPLO DE USO:
 * const { machines, fetchMachines } = useMachineStore();
 * useEffect(() => { fetchMachines(); }, []);
 */
export const useMachineStore = create<MachineStore>((set, get) => ({
  
  // ==========================================
  // ESTADO INICIAL
  // ==========================================
  
  machines: [],              // Sem máquinas inicialmente (serão carregadas)
  productionLines: [],       // Sem linhas inicialmente
  selectedMachine: null,     // Nenhuma máquina selecionada
  isLoading: false,          // Não está carregando
  error: null,               // Sem erros

  // ==========================================
  // AÇÃO: fetchMachines
  // ==========================================
  /**
   * Busca todas as máquinas do backend
   * 
   * FLUXO:
   * 1. Define isLoading = true (mostrar spinner)
   * 2. Faz requisição GET /machines
   * 3. Se sucesso, salva máquinas no estado
   * 4. Se erro, salva mensagem de erro
   * 5. Define isLoading = false (esconder spinner)
   * 
   * CHAMADO:
   * - Ao iniciar aplicação (Dashboard useEffect)
   * - Após criar/apagar máquina
   * - Quando user clica "Refresh"
   * 
   * ASSÍNCRONO: Usa async/await para esperar resposta do servidor
   */
  fetchMachines: async () => {
    // Iniciar loading state
    set({ isLoading: true, error: null });
    
    try {
      // Fazer requisição HTTP GET ao backend
      // machinesApi.getAll() retorna Promise<AxiosResponse>
      const response = await machinesApi.getAll();
      
      // Sucesso! Salvar máquinas no estado
      // response.data contém array de máquinas
      set({ 
        machines: response.data,  // Atualizar array de máquinas
        isLoading: false          // Terminar loading
      });
      
      console.log('✅ Máquinas carregadas:', response.data.length);
      
    } catch (error) {
      // Erro ao Procurar (servidor offline, erro de rede, etc)
      console.error('❌ Erro ao Procurar máquinas:', error);
      
      set({ 
        error: 'Failed to fetch machines',  // Mensagem de erro
        isLoading: false                    // Terminar loading
      });
    }
  },

  // ==========================================
  // AÇÃO: fetchProductionLines
  // ==========================================
  /**
   * Busca todas as linhas de produção do backend
   * 
   * Similar a fetchMachines mas para linhas de produção
   * Linhas são usadas para organizar máquinas no dashboard
   * 
   * ESTRUTURA:
   * - Cada linha tem: id, name, description
   * - Máquinas pertencem a uma linha (productionLineId)
   * - Dashboard agrupa máquinas por linha
   */
  fetchProductionLines: async () => {
    // Iniciar loading
    set({ isLoading: true, error: null });
    
    try {
      // GET /production-lines
      const response = await productionLinesApi.getAll();
      
      // Salvar linhas no estado
      set({ 
        productionLines: response.data, 
        isLoading: false 
      });
      
      console.log('✅ Linhas de produção carregadas:', response.data.length);
      
    } catch (error) {
      console.error('❌ Erro ao Procurar linhas:', error);
      
      set({ 
        error: 'Failed to fetch production lines', 
        isLoading: false 
      });
    }
  },

  // ==========================================
  // AÇÃO: setSelectedMachine
  // ==========================================
  /**
   * Define qual máquina está selecionada
   * 
   * @param machine - Machine object ou null
   * 
   * QUANDO USADA:
   * - User clica numa máquina no dashboard → abre MachineDetail
   * - User clica "Voltar" → passa null → volta ao dashboard
   * 
   * COMPONENTES QUE USAM:
   * - Dashboard: setSelectedMachine(machine) ao clicar
   * - MachineDetail: setSelectedMachine(null) ao voltar
   */
  setSelectedMachine: (machine) => {
    set({ selectedMachine: machine });
    
    if (machine) {
      console.log('📍 Máquina selecionada:', machine.name);
    } else {
      console.log('📍 Voltou ao dashboard');
    }
  },

  // ==========================================
  // AÇÃO: updateMachineStatus
  // ==========================================
  /**
   * Atualiza uma máquina no estado
   * 
   * @param machineId - ID da máquina a atualizar
   * @param updatedMachine - Objeto Machine com novos dados
   * 
   * QUANDO USADA:
   * - WebSocket recebe evento 'machine:status-changed'
   * - Backend notifica mudança de estado (NORMAL → WARNING)
   * - Frontend atualiza localmente SEM fazer nova request
   * 
   * IMPORTANTE:
   * - Atualiza tanto o array machines[] quanto selectedMachine
   * - Se máquina atualizada está selecionada, atualiza também
   * - Isto mantém UI sincronizada em tempo real
   * 
   * EXEMPLO:
   * WebSocket recebe: { machineId: "123", status: "WARNING" }
   * updateMachineStatus("123", { ...machine, status: "WARNING" })
   * → UI atualiza cor de VERDE para AMARELO instantaneamente
   */
  updateMachineStatus: (machineId, updatedMachine) => {
    set((state) => ({
      // Atualizar no array de máquinas
      // .map() cria novo array substituindo máquina com ID correspondente
      machines: state.machines.map((m) =>
        m.id === machineId ? updatedMachine : m
      ),
      
      // Atualizar selectedMachine se for a mesma
      // Usa ternário: se ID corresponde → usar updatedMachine, senão → manter atual
      selectedMachine:
        state.selectedMachine?.id === machineId
          ? updatedMachine
          : state.selectedMachine,
    }));
    
    console.log('🔄 Máquina atualizada:', updatedMachine.name, '→', updatedMachine.status);
  },

  // ==========================================
  // AÇÃO: addMachine
  // ==========================================
  /**
   * Adiciona nova máquina ao sistema
   * 
   * @param machine - Dados da nova máquina
   * @returns Promise<Machine> - Máquina criada com ID do backend
   * 
   * FLUXO COMPLETO:
   * 1. User preenche formulário AddMachineModal
   * 2. User clica "Salvar"
   * 3. Frontend chama addMachine(machineData)
   * 4. Faz POST /machines para backend
   * 5. Backend salva na BD e retorna máquina com ID
   * 6. Frontend adiciona ao array machines[]
   * 7. UI atualiza automaticamente (Zustand notifica componentes)
   * 
   * MODO OFFLINE:
   * - Se backend offline, pode criar com ID temporário
   * - Sincroniza quando voltar online
   * - Ver offlineStore.ts para detalhes
   * 
   * VALIDAÇÃO:
   * - Código único (verificado no backend)
   * - Nome obrigatório
   * - Linha de produção válida
   */
  addMachine: async (machine) => {
    try {
      console.log('➕ Criando nova máquina:', machine.name);
      
      // Fazer POST à API para salvar na BD
      // Enviamos apenas os campos necessários
      const response = await machinesApi.create({
        name: machine.name,                    // Nome da máquina
        code: machine.code,                    // Código único
        status: machine.status,                // Estado inicial (geralmente NORMAL)
        productionLineId: machine.productionLineId,  // ID da linha
        schemaImageUrl: machine.schemaImageUrl,      // URL do esquema (opcional)
      });
      
      // Backend retorna máquina completa com:
      // - ID gerado (UUID)
      // - Timestamps (createdAt, updatedAt)
      // - Relação com ProductionLine
      const createdMachine = response.data;
      
      // Adicionar ao estado local
      // Usa spread operator para criar novo array
      set((state) => ({
        machines: [...state.machines, createdMachine],
      }));
      
      console.log('✅ Máquina criada com sucesso:', createdMachine.id);
      
      // Retornar máquina criada
      // Útil para o componente que chamou (ex: fechar modal)
      return createdMachine;
      
    } catch (error) {
      // Erro ao criar (código duplicado, validação falhou, etc)
      console.error('❌ Erro ao criar máquina:', error);
      
      // Re-throw error para componente tratar
      // Componente pode mostrar mensagem de erro ao user
      throw error;
    }
  },
}));

/**
 * ============================================
 * ESTRUTURA DE DADOS
 * ============================================
 * 
 * MACHINE:
 * {
 *   id: "cm5abc123...",              // UUID único
 *   name: "Injetora 3",              // Nome exibido
 *   code: "INJ-003",                 // Código único
 *   status: "NORMAL",                // NORMAL | WARNING | FAILURE | MAINTENANCE
 *   productionLineId: "cm5xyz...",   // FK para ProductionLine
 *   productionLine: {...},           // Objeto ProductionLine (incluído)
 *   schemaImageUrl: "/schemas/...",  // URL do esquema técnico
 *   createdAt: "2026-01-15T...",     // Timestamp criação
 *   updatedAt: "2026-01-15T...",     // Timestamp última atualização
 * }
 * 
 * PRODUCTION LINE:
 * {
 *   id: "cm5xyz...",
 *   name: "Linha de Montagem 1",
 *   description: "Linha principal...",
 *   machines: [...]  // Array de máquinas desta linha
 * }
 */

/**
 * ============================================
 * FLUXO DE DADOS TEMPO REAL
 * ============================================
 * 
 * CENÁRIO: Máquina muda de estado NORMAL → WARNING
 * 
 * 1. BACKEND:
 *    - Detecta mudança (sensor, simulação, user action)
 *    - Atualiza BD: UPDATE machines SET status = 'WARNING'
 *    - Emite WebSocket: socket.emit('machine:status-changed', {...})
 * 
 * 2. FRONTEND (todos os clientes conectados):
 *    - useWebSocket hook recebe evento
 *    - Chama updateMachineStatus(machineId, updatedData)
 *    - machineStore atualiza estado
 * 
 * 3. REACT:
 *    - Zustand notifica componentes que usam machines[]
 *    - Componentes re-renderizam
 *    - UI atualiza cor (verde → amarelo)
 * 
 * LATÊNCIA: < 100ms do servidor até UI
 * 
 * RESULTADO: Todos veem mudança simultaneamente!
 */

/**
 * ============================================
 * COMO USAR ESTE STORE
 * ============================================
 * 
 * EXEMPLO 1: Listar máquinas
 * 
 * function Dashboard() {
 *   const { machines, fetchMachines, isLoading } = useMachineStore();
 *   
 *   useEffect(() => {
 *     fetchMachines(); // Procurar ao montar componente
 *   }, []);
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return (
 *     <div>
 *       {machines.map(machine => (
 *         <MachineCard key={machine.id} machine={machine} />
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * 
 * EXEMPLO 2: Selecionar máquina
 * 
 * function MachineCard({ machine }) {
 *   const setSelectedMachine = useMachineStore(s => s.setSelectedMachine);
 *   
 *   return (
 *     <div onClick={() => setSelectedMachine(machine)}>
 *       {machine.name}
 *     </div>
 *   );
 * }
 * 
 * 
 * EXEMPLO 3: Adicionar máquina
 * 
 * function AddMachineForm() {
 *   const addMachine = useMachineStore(s => s.addMachine);
 *   
 *   const handleSubmit = async (data) => {
 *     try {
 *       const created = await addMachine(data);
 *       alert('Máquina criada: ' + created.id);
 *     } catch (error) {
 *       alert('Erro ao criar máquina');
 *     }
 *   };
 * }
 * 
 * 
 * EXEMPLO 4: Atualização em tempo real
 * 
 * function useWebSocket() {
 *   const updateMachineStatus = useMachineStore(s => s.updateMachineStatus);
 *   
 *   useEffect(() => {
 *     socket.on('machine:status-changed', (data) => {
 *       updateMachineStatus(data.machineId, data.machine);
 *     });
 *   }, []);
 * }
 */