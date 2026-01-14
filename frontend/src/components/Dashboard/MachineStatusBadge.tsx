import { MachineStatus } from '../../types';
import { useMachineStatus } from '../../hooks/useMachineStatus';

interface MachineStatusBadgeProps {
  status: MachineStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const MachineStatusBadge = ({ status, size = 'sm' }: MachineStatusBadgeProps) => {
  const config = useMachineStatus(status);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 ${config.bgColor} ${config.color} border ${config.borderColor} rounded-full font-semibold uppercase tracking-wide ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};