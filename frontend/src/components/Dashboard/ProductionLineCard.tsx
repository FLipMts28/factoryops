// frontend/src/components/Dashboard/ProductionLineCard.tsx
import { ProductionLine, Machine } from '../../types';
import { MachineStatusBadge } from './MachineStatusBadge';
import { useTheme } from '../../context/ThemeContext';

interface ProductionLineCardProps {
  productionLine: ProductionLine;
  machines: Machine[];
  onMachineClick: (machine: Machine) => void;
}

export const ProductionLineCard = ({ productionLine, machines, onMachineClick }: ProductionLineCardProps) => {
  const { theme } = useTheme();
  
  const statusCounts = machines.reduce((acc, machine) => {
    acc[machine.status] = (acc[machine.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`rounded-xl shadow-2xl overflow-hidden border transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50'
        : 'bg-white border-gray-200 hover:border-blue-400'
    }`}>
      {/* Header - inline styles para GARANTIR texto branco */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ color: '#ffffff' }} className="text-2xl font-bold">{productionLine.name}</h3>
            {productionLine.description && (
              <p style={{ color: '#dbeafe' }} className="mt-1">{productionLine.description}</p>
            )}
          </div>
          <div className="text-right bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div style={{ color: '#ffffff' }} className="text-4xl font-bold">{machines.length}</div>
            <div style={{ color: '#dbeafe' }} className="text-sm">máquinas</div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <span style={{ color: '#dbeafe' }} className="text-sm font-medium">{status}:</span>
              <span style={{ color: '#ffffff' }} className="font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Machines Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => (
            <button
              key={machine.id}
              onClick={() => onMachineClick(machine)}
              className={`p-4 border-2 rounded-lg transition-all text-left hover:scale-105 duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700 hover:shadow-lg hover:shadow-blue-900/20 hover:border-blue-500'
                  : 'bg-gray-50 border-gray-200 hover:shadow-lg hover:border-blue-400 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {machine.name}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {machine.code}
                  </p>
                </div>
                <MachineStatusBadge status={machine.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};