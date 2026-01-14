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
      const data: TimeSeriesData[] = [];
      const now = new Date();
      
      for (let i = 24; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          timestamp: timestamp.toISOString(),
          value: 60 + Math.random() * 30,
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
    const metrics = machines.map(m => generateMockMetrics(m.id, m.name));
    set({ machineMetrics: metrics });
  },
}));