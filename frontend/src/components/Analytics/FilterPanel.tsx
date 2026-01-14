import { useState } from 'react';
import { ProductionLine } from '../../types';

interface DateRange {
  start: Date;
  end: Date;
}

interface FilterPanelProps {
  productionLines: ProductionLine[];
  selectedLineId: string | null;
  onLineChange: (lineId: string | null) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onExportReport: () => void;
}

export const FilterPanel = ({ 
  productionLines, 
  selectedLineId, 
  onLineChange,
  dateRange,
  onDateRangeChange,
  onExportReport
}: FilterPanelProps) => {
  const [periodType, setPeriodType] = useState('7days');

  const handlePeriodChange = (type: string) => {
    setPeriodType(type);
    const now = new Date();
    const end = new Date(); // Data final sempre é hoje
    let start: Date;

    switch (type) {
      case 'today':
        // Início do dia de hoje
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        // Início do dia de ontem
        start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        // Fim do dia de ontem
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case '7days':
        // Últimos 7 dias
        start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case '30days':
        // Últimos 30 dias
        start = new Date();
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
    }

    onDateRangeChange({ start, end });
  };

  return (
    <div className="bg-gradient-dark rounded-xl border border-gray-700 p-6 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Production Line Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📍 Linha de Produção
          </label>
          <select
            value={selectedLineId || ''}
            onChange={(e) => onLineChange(e.target.value || null)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as Linhas</option>
            {productionLines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📅 Período de Análise
          </label>
          <select
            value={periodType}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div className="flex items-end">
          <button 
            onClick={onExportReport}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 !text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>
      
      {/* Date Range Display */}
      <div className="mt-4 flex items-center text-sm text-gray-400">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Período: {dateRange.start.toLocaleDateString('pt-PT')} - {dateRange.end.toLocaleDateString('pt-PT')}
        </span>
      </div>
    </div>
  );
};