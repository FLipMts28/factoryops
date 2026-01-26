import { useState, useEffect } from 'react';
import { Machine } from '../../types';

interface Downtime {
  id: string;
  machineId: string;
  reason: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  userId: string;
  userName?: string;
}

interface MachineDowntimeProps {
  machine: Machine;
}

const DOWNTIME_REASONS = [
  { value: 'BREAKDOWN', label: 'Avaria Mecânica', icon: '🔧' },
  { value: 'MAINTENANCE', label: 'Manutenção Preventiva', icon: '🛠️' },
  { value: 'SETUP', label: 'Setup/Mudança de Ferramenta', icon: '⚙️' },
  { value: 'NO_MATERIAL', label: 'Falta de Material', icon: '📦' },
  { value: 'NO_OPERATOR', label: 'Falta de Operador', icon: '👷' },
  { value: 'QUALITY_ISSUE', label: 'Problema de Qualidade', icon: '❌' },
  { value: 'ELECTRICAL', label: 'Problema Elétrico', icon: '⚡' },
  { value: 'OTHER', label: 'Outro', icon: '📝' },
];

export const MachineDowntime = ({ machine }: MachineDowntimeProps) => {
  const [downtimes, setDowntimes] = useState<Downtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    loadDowntimes();
  }, [machine.id]);

  const loadDowntimes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/downtimes/machine/${machine.id}`);
      if (response.ok) {
        const data = await response.json();
        setDowntimes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar paragens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !startTime) {
      alert('Preencha a razão e hora de início!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/downtimes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: machine.id,
          reason,
          startTime: new Date(startTime).toISOString(),
          endTime: endTime ? new Date(endTime).toISOString() : undefined,
          notes,
          userId: 'current-user-id', // TODO: Pegar do userStore
        }),
      });

      if (response.ok) {
        const newDowntime = await response.json();
        setDowntimes([newDowntime, ...downtimes]);
        
        // Resetar form
        setReason('');
        setNotes('');
        setStartTime('');
        setEndTime('');
        setShowForm(false);
        
        alert('✅ Paragem registada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao registar paragem:', error);
      alert('❌ Erro ao registar paragem');
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReasonLabel = (reason: string) => {
    const found = DOWNTIME_REASONS.find(r => r.value === reason);
    return found ? `${found.icon} ${found.label}` : reason;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              📊 Registo de Paragens
            </h3>
            <p className="text-red-100">
              Equipamento: {machine.name} ({machine.code})
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-white text-red-700 font-semibold rounded-lg hover:bg-red-50 transition-colors shadow-lg"
          >
            {showForm ? '❌ Cancelar' : '➕ Nova Paragem'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-300">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">
            Registar Nova Paragem
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Razão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razão da Paragem *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {DOWNTIME_REASONS.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Início *
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fim (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Descrição do problema, ações tomadas, etc..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                💾 Registar Paragem
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Paragens */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">
            Histórico de Paragens ({downtimes.length})
          </h4>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            Carregando paragens...
          </div>
        ) : downtimes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">📊 Nenhuma paragem registada</p>
            <p className="text-sm mt-2">Clique em "Nova Paragem" para adicionar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Razão
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Início
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Fim
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Duração
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Observações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {downtimes.map((dt) => (
                  <tr key={dt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {getReasonLabel(dt.reason)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(dt.startTime)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {dt.endTime ? formatDateTime(dt.endTime) : (
                        <span className="text-yellow-600 font-medium">Em curso</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {dt.duration ? formatDuration(dt.duration) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {dt.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
