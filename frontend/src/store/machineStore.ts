import { create } from 'zustand';
import { Machine, ProductionLine } from '../types';
import { machinesApi, productionLinesApi } from '../services/api';

interface MachineStore {
  machines: Machine[];
  productionLines: ProductionLine[];
  selectedMachine: Machine | null;
  isLoading: boolean;
  error: string | null;
  
  fetchMachines: () => Promise<void>;
  fetchProductionLines: () => Promise<void>;
  setSelectedMachine: (machine: Machine | null) => void;
  updateMachineStatus: (machineId: string, machine: Machine) => void;
  addMachine: (machine: Machine) => Promise<Machine>;
}

export const useMachineStore = create<MachineStore>((set, get) => ({
  machines: [],
  productionLines: [],
  selectedMachine: null,
  isLoading: false,
  error: null,

  fetchMachines: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await machinesApi.getAll();
      set({ machines: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch machines', isLoading: false });
    }
  },

  fetchProductionLines: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productionLinesApi.getAll();
      set({ productionLines: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch production lines', isLoading: false });
    }
  },

  setSelectedMachine: (machine) => {
    set({ selectedMachine: machine });
  },

  updateMachineStatus: (machineId, updatedMachine) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? updatedMachine : m
      ),
      selectedMachine:
        state.selectedMachine?.id === machineId
          ? updatedMachine
          : state.selectedMachine,
    }));
  },

  addMachine: async (machine) => {
    try {
      // Fazer POST à API para salvar na BD
      const response = await machinesApi.create({
        name: machine.name,
        code: machine.code,
        status: machine.status,
        productionLineId: machine.productionLineId,
        schemaImageUrl: machine.schemaImageUrl,
      });
      
      // Adicionar a máquina retornada pelo backend ao state
      set((state) => ({
        machines: [...state.machines, response.data],
      }));
      
      return response.data;
    } catch (error) {
      console.error('Failed to create machine:', error);
      throw error;
    }
  },
}));