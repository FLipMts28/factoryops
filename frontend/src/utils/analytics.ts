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
export const generateMockMetrics = (machineId: string, machineName: string): MachineMetrics => {
  const availability = 75 + Math.random() * 20; // 75-95%
  const performance = 80 + Math.random() * 15; // 80-95%
  const quality = 95 + Math.random() * 4; // 95-99%
  
  return {
    machineId,
    machineName,
    availability,
    performance,
    quality,
    oee: calculateOEE(availability, performance, quality),
    mtbf: 100 + Math.random() * 150, // 100-250 hours
    mttr: 2 + Math.random() * 8, // 2-10 hours
    totalDowntime: Math.random() * 120, // 0-120 minutes
    failureCount: Math.floor(Math.random() * 5),
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