// frontend/src/types/analytics.ts

export interface MachineMetrics {
  machineId: string;
  machineName: string;
  availability: number; // %
  performance: number; // %
  quality: number; // %
  oee: number; // %
  mtbf: number; // Mean Time Between Failures (hours)
  mttr: number; // Mean Time To Repair (hours)
  totalDowntime: number; // minutes
  failureCount: number;
}

export interface ProductionLineMetrics {
  lineId: string;
  lineName: string;
  totalMachines: number;
  normalCount: number;
  warningCount: number;
  failureCount: number;
  maintenanceCount: number;
  averageOEE: number;
  totalDowntime: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  status?: string;
}

export interface DowntimeEvent {
  id: string;
  machineId: string;
  machineName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  reason: string;
  status: string;
}

export interface OEEData {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}
