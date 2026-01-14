// frontend/src/utils/analytics.ts
import { Machine, MachineStatus } from '../types';
import { MachineMetrics, OEEData } from '../types/analytics';

export const calculateOEE = (
  availability: number,
  performance: number,
  quality: number
): number => {
  return (availability / 100) * (performance / 100) * (quality / 100) * 100;
};

export const calculateAvailability = (
  uptime: number,
  plannedProductionTime: number
): number => {
  if (plannedProductionTime === 0) return 0;
  return (uptime / plannedProductionTime) * 100;
};

export const calculateMTBF = (
  totalUptime: number,
  numberOfFailures: number
): number => {
  if (numberOfFailures === 0) return totalUptime;
  return totalUptime / numberOfFailures;
};

export const calculateMTTR = (
  totalDowntime: number,
  numberOfFailures: number
): number => {
  if (numberOfFailures === 0) return 0;
  return totalDowntime / numberOfFailures;
};

export const getMachineStatusColor = (status: MachineStatus): string => {
  const colors = {
    NORMAL: '#10b981',
    WARNING: '#f59e0b',
    FAILURE: '#ef4444',
    MAINTENANCE: '#3b82f6',
  };
  return colors[status] || '#6b7280';
};

export const getStatusPercentage = (machines: Machine[], status: MachineStatus): number => {
  if (machines.length === 0) return 0;
  const count = machines.filter(m => m.status === status).length;
  return (count / machines.length) * 100;
};

// Mock data generator for realistic metrics
export const generateMockMetrics = (
  machineId: string, 
  machineName: string,
  dateRange?: { start: Date; end: Date }
): MachineMetrics => {
  // Calcular número de dias no período
  const days = dateRange 
    ? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    : 7;
  
  // Ajustar métricas baseado no período (períodos mais longos = mais variação)
  const periodFactor = Math.min(days / 7, 2); // máximo 2x de variação
  
  // Base seed para consistência (mesma máquina = mesmos valores base)
  const seed = machineId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, index: number = 0) => {
    const x = Math.sin(seed + index) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };
  
  const availability = 75 + random(0, 20, 1) * periodFactor; // 75-95%
  const performance = 80 + random(0, 15, 2); // 80-95%
  const quality = 95 + random(0, 4, 3); // 95-99%
  
  // Períodos mais longos = mais downtime e falhas
  const totalDowntime = random(0, 120, 4) * periodFactor; // minutos
  const failureCount = Math.floor(random(0, 5, 5) * periodFactor);
  
  return {
    machineId,
    machineName,
    availability: Math.min(availability, 99),
    performance: Math.min(performance, 99),
    quality: Math.min(quality, 99.9),
    oee: calculateOEE(
      Math.min(availability, 99), 
      Math.min(performance, 99), 
      Math.min(quality, 99.9)
    ),
    mtbf: 20 + random(0, 180, 6), // 20-200 hours (valores mais realistas)
    mttr: 2 + random(0, 8, 7), // 2-10 hours
    totalDowntime,
    failureCount,
  };
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals);
};