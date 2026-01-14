import { useEffect, useState } from 'react';
import { useMachineStore } from '../../store/machineStore';
import { ProductionLineCard } from './ProductionLineCard';
import { MachineDetail } from './MachineDetail';
import { Machine } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export const Dashboard = () => {
  const { theme } = useTheme();
  const { machines, productionLines, fetchMachines, fetchProductionLines, isLoading } = useMachineStore();
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  useEffect(() => {
    fetchMachines();
    fetchProductionLines();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>A carregar...</div>
      </div>
    );
  }

  if (selectedMachine) {
    return (
      <MachineDetail 
        machine={selectedMachine} 
        onBack={() => setSelectedMachine(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - inline styles para GARANTIR texto branco */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 -mr-48 -mt-48"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl font-bold mb-2">Linhas de Produção</h1>
            <p style={{ color: '#dbeafe' }}>Gestão e monitorização de máquinas em tempo real</p>
          </div>
          <div className="text-right bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div style={{ color: '#ffffff' }} className="text-4xl font-bold">{machines.length}</div>
            <div style={{ color: '#dbeafe' }} className="text-sm">máquinas</div>
          </div>
        </div>
      </div>

      {productionLines.length === 0 && (
        <div className={`rounded-xl shadow-xl border p-8 text-center transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Nenhuma linha de produção encontrada
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {productionLines.map((line) => (
          <ProductionLineCard
            key={line.id}
            productionLine={line}
            machines={machines.filter(m => m.productionLineId === line.id)}
            onMachineClick={setSelectedMachine}
          />
        ))}
      </div>

      {machines.some(m => !m.productionLineId) && (
        <div className={`rounded-xl shadow-xl border p-6 transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Máquinas sem Linha
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.filter(m => !m.productionLineId).map((machine) => (
              <button
                key={machine.id}
                onClick={() => setSelectedMachine(machine)}
                className={`p-4 border rounded-lg hover:shadow-md hover:border-blue-500 transition-all text-left ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-gray-50 border-gray-200 hover:bg-white'
                }`}
              >
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {machine.name}
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {machine.code}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};