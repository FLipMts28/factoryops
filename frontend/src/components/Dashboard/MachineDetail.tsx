import { Machine } from '../../types';
import { MachineStatusBadge } from './MachineStatusBadge';
import { AnnotationCanvas } from '../Canvas/AnnotationCanvas';
import { ChatPanel } from '../Chat/ChatPanel';
import { DocumentUpload } from '../Documents/DocumentUpload';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface MachineDetailProps {
  machine: Machine;
  onBack: () => void;
  onDelete?: (machineId: string) => void;
}

export const MachineDetail = ({ machine, onBack, onDelete }: MachineDetailProps) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'canvas' | 'chat' | 'documents'>('canvas');

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmMessage = `Tem certeza que deseja apagar "${machine.name}"?\n\nEsta ação não pode ser desfeita e irá remover:\n- Todas as anotações\n- Todas as mensagens do chat\n- Todos os documentos\n\nDigite o código do equipamento (${machine.code}) para confirmar:`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput === machine.code) {
      try {
        await onDelete(machine.id);
      } catch (error) {
        alert('Erro ao apagar equipamento. Tente novamente.');
      }
    } else if (userInput !== null) {
      alert('Código incorreto. Equipamento não foi apagado.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header - inline styles para GARANTIR texto branco */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              style={{ color: '#dbeafe' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Voltar</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <MachineStatusBadge status={machine.status} size="lg" />
              
              {/* Botão Delete */}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
                  title="Apagar Equipamento"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Apagar</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 style={{ color: '#ffffff' }} className="text-3xl font-bold">{machine.name}</h2>
            <p style={{ color: '#dbeafe' }} className="mt-1">Código: {machine.code}</p>
          </div>

          {/* Tabs - fundo escuro com texto branco */}
          <div className="mt-6">
            <div style={{ background: 'linear-gradient(to right, #1f2937, #111827)', borderColor: '#374151' }} className="rounded-xl border p-1.5 inline-flex">
              <button
                onClick={() => setActiveTab('canvas')}
                style={{ color: '#ffffff' }}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'canvas'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-900/50'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Anotações</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                style={{ color: '#ffffff' }}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-900/50'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Chat</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                style={{ color: '#ffffff' }}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'documents'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-900/50'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Documentos</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'canvas' && <AnnotationCanvas machine={machine} />}
      {activeTab === 'chat' && <ChatPanel machineId={machine.id} />}
      {activeTab === 'documents' && <DocumentUpload machine={machine} />}
    </div>
  );
};