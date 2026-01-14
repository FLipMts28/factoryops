// frontend/src/store/analyticsStore.ts
import { create } from 'zustand';
import { MachineMetrics, ProductionLineMetrics, TimeSeriesData } from '../types/analytics';
import { generateMockMetrics } from '../utils/analytics';

interface DateRange {
  start: Date;
  end: Date;
}

interface AnalyticsStore {
  dateRange: DateRange;
  selectedLineId: string | null;
  machineMetrics: MachineMetrics[];
  lineMetrics: ProductionLineMetrics[];
  timeSeriesData: TimeSeriesData[];
  isLoading: boolean;
  
  setDateRange: (range: DateRange) => void;
  setSelectedLine: (lineId: string | null) => void;
  fetchMachineMetrics: (machineId: string) => Promise<void>;
  fetchLineMetrics: (lineId: string) => Promise<void>;
  fetchTimeSeriesData: (machineId: string) => Promise<void>;
  generateMetricsForMachines: (machines: any[]) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  selectedLineId: null,
  machineMetrics: [],
  lineMetrics: [],
  timeSeriesData: [],
  isLoading: false,

  setDateRange: (range) => set({ dateRange: range }),
  
  setSelectedLine: (lineId) => set({ selectedLineId: lineId }),

  fetchMachineMetrics: async (machineId: string) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to fetch machine metrics:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLineMetrics: async (lineId: string) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to fetch line metrics:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTimeSeriesData: async (machineId: string) => {
    set({ isLoading: true });
    try {
      const { dateRange } = get();
      const data: TimeSeriesData[] = [];
      
      // Calcular número de pontos baseado no período
      const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const points = Math.min(days * 24, 168); // Máximo 7 dias de dados horários
      const interval = (dateRange.end.getTime() - dateRange.start.getTime()) / points;
      
      for (let i = 0; i <= points; i++) {
        const timestamp = new Date(dateRange.start.getTime() + i * interval);
        // Gerar valores com variação realista
        const baseValue = 70;
        const variation = Math.sin(i / 10) * 15 + Math.random() * 10;
        data.push({
          timestamp: timestamp.toISOString(),
          value: Math.max(40, Math.min(95, baseValue + variation)),
        });
      }
      
      set({ timeSeriesData: data });
    } catch (error) {
      console.error('Failed to fetch time series data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  generateMetricsForMachines: (machines) => {
    const { dateRange } = get();
    const metrics = machines.map(m => generateMockMetrics(m.id, m.name, dateRange));
    set({ machineMetrics: metrics });
  },
}));