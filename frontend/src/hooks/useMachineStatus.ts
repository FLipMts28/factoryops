import { useEffect, useState } from 'react';
import { MachineStatus } from '../types';

interface StatusConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon: string;
}

const statusConfigs: Record<MachineStatus, StatusConfig> = {
  [MachineStatus.NORMAL]: {
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: 'Normal',
    icon: '✓',
  },
  [MachineStatus.WARNING]: {
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    label: 'Aviso',
    icon: '⚠',
  },
  [MachineStatus.FAILURE]: {
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'Falha',
    icon: '✕',
  },
  [MachineStatus.MAINTENANCE]: {
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'Manutenção',
    icon: '🔧',
  },
};

export const useMachineStatus = (status: MachineStatus) => {
  const [config, setConfig] = useState<StatusConfig>(statusConfigs[status]);

  useEffect(() => {
    setConfig(statusConfigs[status]);
  }, [status]);

  return config;
};
