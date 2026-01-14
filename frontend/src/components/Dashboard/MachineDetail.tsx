import { Machine } from '../../types';
import { MachineStatusBadge } from './MachineStatusBadge';
import { AnnotationCanvas } from '../Canvas/AnnotationCanvas';
import { ChatPanel } from '../Chat/ChatPanel';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface MachineDetailProps {
  machine: Machine;
  onBack: () => void;
}

export const MachineDetail = ({ machine, onBack }: MachineDetailProps) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'canvas' | 'chat'>('canvas');

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
            <MachineStatusBadge status={machine.status} size="lg" />
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
                Canvas de Anotações
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
                Chat Operacional
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'canvas' && <AnnotationCanvas machine={machine} />}
      {activeTab === 'chat' && <ChatPanel machineId={machine.id} />}
    </div>
  );
};