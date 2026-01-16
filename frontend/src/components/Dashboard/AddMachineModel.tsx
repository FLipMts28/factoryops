import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ProductionLine, MachineStatus } from '../../types';

interface AddMachineModelProps {
  isOpen: boolean;
  onClose: () => void;
  productionLines: ProductionLine[];
  onAddMachine: (machineData: any) => void;
}

export const AddMachineModel = ({ isOpen, onClose, productionLines, onAddMachine }: AddMachineModelProps) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<'select' | 'existing' | 'new'>('select');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: MachineStatus.NORMAL,
    productionLineId: '',
    schemaImageUrl: '',
  });

  // Mock de equipamentos disponíveis na BD (em produção viria do backend)
  const availableMachines = [
    { 
      id: 'bd-1', 
      name: 'CNC Fresadora Industrial', 
      code: 'CNC-', 
      category: 'Fresagem',
      icon: 'drill' // Broca
    },
    { 
      id: 'bd-2', 
      name: 'Robô de Soldadura', 
      code: 'RS-', 
      category: 'Soldadura',
      icon: 'robot' // Robô
    },
    { 
      id: 'bd-3', 
      name: 'Prensa Hidráulica', 
      code: 'PH-', 
      category: 'Prensagem',
      icon: 'press' // Prensa
    },
    { 
      id: 'bd-4', 
      name: 'Torno CNC', 
      code: 'TC-', 
      category: 'Torneamento',
      icon: 'lathe' // Torno
    },
    { 
      id: 'bd-5', 
      name: 'Centro de Maquinagem', 
      code: 'CM-', 
      category: 'Maquinagem',
      icon: 'cog' // Engrenagem
    },
    { 
      id: 'bd-6', 
      name: 'Robô de Pintura', 
      code: 'RP-', 
      category: 'Pintura',
      icon: 'spray' // Spray
    },
    { 
      id: 'bd-7', 
      name: 'Linha de Montagem', 
      code: 'LM-', 
      category: 'Montagem',
      icon: 'assembly' // Linha de montagem
    },
    { 
      id: 'bd-8', 
      name: 'Estação de Controlo Qualidade', 
      code: 'QC-', 
      category: 'Qualidade',
      icon: 'check' // Verificação
    },
  ];

  // Função para renderizar ícone específico de cada equipamento
  const renderMachineIcon = (iconType: string) => {
    const iconClass = "w-6 h-6 !text-white";
    
    switch (iconType) {
      case 'drill': // CNC Fresadora
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
          </svg>
        );
      case 'robot': // Robô
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case 'press': // Prensa
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      case 'lathe': // Torno
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'cog': // Centro de Maquinagem
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'spray': // Robô de Pintura
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'assembly': // Linha de Montagem
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'check': // Controlo de Qualidade
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setFormData({
        name: '',
        code: '',
        status: MachineStatus.NORMAL,
        productionLineId: '',
        schemaImageUrl: '',
      });
    }
  }, [isOpen]);

  const handleSelectExisting = (machine: typeof availableMachines[0]) => {
    const nextNumber = Math.floor(Math.random() * 99) + 1;
    setFormData({
      ...formData,
      name: `${machine.name} ${nextNumber}`,
      code: `${machine.code}${String(nextNumber).padStart(3, '0')}`,
    });
    setStep('existing');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.productionLineId) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onAddMachine({
      ...formData,
      id: `new-${Date.now()}`,
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-3xl rounded-xl shadow-2xl border overflow-hidden ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold !text-white">Adicionar Equipamento</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Selecionar origem */}
          {step === 'select' && (
            <div className="space-y-4">
              <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Como deseja adicionar o equipamento?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opção 1: Da BD */}
                <button
                  onClick={() => setStep('existing')}
                  className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-blue-600 hover:bg-gray-700'
                      : 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Da Base de Dados
                    </h3>
                    <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Escolher equipamento já existente na base de dados
                    </p>
                  </div>
                </button>

                {/* Opção 2: Criar Novo */}
                <button
                  onClick={() => setStep('new')}
                  className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-green-600 hover:bg-gray-700'
                      : 'bg-green-50 border-green-400 hover:bg-green-100'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Criar Novo
                    </h3>
                    <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Criar equipamento personalizado com características próprias
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2a: Escolher da BD */}
          {step === 'existing' && formData.name === '' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Equipamentos Disponíveis
                </h3>
                <button
                  onClick={() => setStep('select')}
                  className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                >
                  ← Voltar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableMachines.map((machine) => (
                  <button
                    key={machine.id}
                    onClick={() => handleSelectExisting(machine)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600 hover:border-blue-500'
                        : 'bg-gray-50 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                        {renderMachineIcon(machine.icon)}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {machine.name}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {machine.category}
                        </p>
                      </div>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2b/3: Formulário */}
          {(step === 'new' || (step === 'existing' && formData.name !== '')) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {step === 'new' ? 'Novo Equipamento' : 'Configurar Equipamento'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, name: '', code: '' });
                    setStep('select');
                  }}
                  className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                >
                  ← Voltar
                </button>
              </div>

              {/* Nome */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nome do Equipamento *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400'
                  }`}
                  placeholder="Ex: CNC Fresadora 5"
                  required
                />
              </div>

              {/* Código */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400'
                  }`}
                  placeholder="Ex: CNC-005"
                  required
                />
              </div>

              {/* Linha de Produção */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Linha de Produção *
                </label>
                <select
                  value={formData.productionLineId}
                  onChange={(e) => setFormData({ ...formData, productionLineId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400'
                  }`}
                  required
                >
                  <option value="">Selecione uma linha</option>
                  {productionLines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Inicial */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status Inicial
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MachineStatus })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-400'
                  }`}
                >
                  <option value={MachineStatus.NORMAL}>Normal</option>
                  <option value={MachineStatus.WARNING}>Aviso</option>
                  <option value={MachineStatus.MAINTENANCE}>Manutenção</option>
                  <option value={MachineStatus.FAILURE}>Falha</option>
                </select>
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  Adicionar Equipamento
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};