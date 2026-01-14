// frontend/src/components/Analytics/DowntimeTable.tsx
import { format } from 'date-fns';
import { formatDuration } from '../../utils/analytics';

interface DowntimeEvent {
  id: string;
  machineName: string;
  startTime: Date;
  duration: number;
  reason: string;
  status: string;
}

interface DowntimeTableProps {
  events: DowntimeEvent[];
  dark?: boolean;
}

export const DowntimeTable = ({ events, dark = false }: DowntimeTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'IN_PROGRESS': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'PENDING': return 'bg-red-900/50 text-red-300 border-red-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="bg-gradient-dark rounded-xl shadow-xl border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white flex items-center">
          {dark && <div className="w-1 h-6 bg-red-500 mr-3 rounded-full"></div>}
          Eventos de Paragem
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Máquina</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Início</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Duração</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Razão</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white">{event.machineName}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {format(new Date(event.startTime), 'dd/MM HH:mm')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{formatDuration(event.duration)}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{event.reason}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};