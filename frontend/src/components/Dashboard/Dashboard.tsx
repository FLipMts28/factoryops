import { useEffect, useState } from 'react';
import { useMachineStore } from '../../store/machineStore';
import { useUserStore } from '../../store/userStore';
import { ProductionLineCard } from './ProductionLineCard';
import { MachineDetail } from './MachineDetail';
import { MachineSearch } from './MachineSearch';
import { AddMachineModel } from './AddMachineModel';
import { Machine } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export const Dashboard = () => {
  const { theme } = useTheme();
  const { currentUser } = useUserStore();
  const { machines, productionLines, fetchMachines, fetchProductionLines, addMachine, isLoading } = useMachineStore();
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  const canAddMachine = currentUser?.role === 'ADMIN' || currentUser?.role === 'ENGINEER';

  useEffect(() => {
    fetchMachines();
    fetchProductionLines();
  }, []);

  // Inicializar todas as linhas como expandidas
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    productionLines.forEach(line => {
      initialState[line.id] = true;
    });
    setExpandedLines(initialState);
  }, [productionLines]);

  const handleDeleteMachine = async (machineId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/machines/${machineId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Equipamento apagado com sucesso');
        // Voltar ao dashboard
        setSelectedMachine(null);
        // Recarregar máquinas
        fetchMachines();
      } else {
        throw new Error('Erro ao apagar equipamento');
      }
    } catch (error) {
      console.error('❌ Erro ao apagar:', error);
      throw error;
    }
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    productionLines.forEach(line => {
      allExpanded[line.id] = true;
    });
    setExpandedLines(allExpanded);
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    productionLines.forEach(line => {
      allCollapsed[line.id] = false;
    });
    setExpandedLines(allCollapsed);
  };

  const handleToggleLine = (lineId: string) => {
    setExpandedLines(prev => ({
      ...prev,
      [lineId]: !prev[lineId]
    }));
  };

  const handleAddMachine = async (machineData: any) => {
    try {
      // Criar máquina SEM o ID (backend vai gerar)
      const newMachine: Machine = {
        id: '', // Será preenchido pelo backend
        name: machineData.name,
        code: machineData.code,
        status: machineData.status,
        productionLineId: machineData.productionLineId,
        schemaImageUrl: machineData.schemaImageUrl || '',
      };
      
      // Adicionar ao store (faz POST à API)
      const savedMachine = await addMachine(newMachine);
      
      console.log('Máquina salva com sucesso:', savedMachine);
      alert(`Máquina "${savedMachine.name}" adicionada com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao adicionar máquina:', error);
      alert(`Erro ao adicionar máquina: ${error.response?.data?.message || error.message}`);
    }
  };

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
        onDelete={canAddMachine ? handleDeleteMachine : undefined}
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

      {/* Search Bar */}
      <div className="flex justify-center">
        <MachineSearch 
          machines={machines}
          onMachineSelect={setSelectedMachine}
        />
      </div>

      {/* Action Bar - Botões de controlo */}
      {productionLines.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExpandAll}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Expandir Tudo</span>
            </button>
            <button
              onClick={handleCollapseAll}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Recolher Tudo</span>
            </button>
          </div>

          {/* Botão Adicionar Equipamento - apenas para Admin/Engineer */}
          {canAddMachine && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 !text-white font-semibold rounded-lg shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Adicionar Equipamento</span>
            </button>
          )}
        </div>
      )}

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
            isExpanded={expandedLines[line.id] ?? true}
            onToggleExpand={() => handleToggleLine(line.id)}
          />
        ))}
      </div>

      {/* Modal de Adicionar Equipamento */}
      <AddMachineModel
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        productionLines={productionLines}
        onAddMachine={handleAddMachine}
      />

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