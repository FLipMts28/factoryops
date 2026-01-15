import { useEffect, useState } from 'react';
import { useMachineStore } from '../../store/machineStore';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { OEEGauge } from './OEEGauge';
import { StatusDistribution } from './StatusDistribution';
import { OEEChart } from './OEEChart';
import { DowntimeTable } from './DowntimeTable';
import { FilterPanel } from './FilterPanel';
import { MachineStatus } from '../../types';
import { generatePDFReport } from '../../utils/reportExport';
import { useTheme } from '../../context/ThemeContext';

export const AnalyticsDashboard = () => {
  const { theme } = useTheme();
  const { machines, productionLines } = useMachineStore();
  const { 
    dateRange, 
    selectedLineId, 
    machineMetrics,
    timeSeriesData,
    fetchTimeSeriesData,
    generateMetricsForMachines,
    setSelectedLine,
    setDateRange
  } = useAnalyticsStore();

  useEffect(() => {
    if (machines.length > 0) {
      const filteredMachines = selectedLineId 
        ? machines.filter(m => m.productionLineId === selectedLineId)
        : machines;
      
      generateMetricsForMachines(filteredMachines);
      
      if (filteredMachines.length > 0) {
        fetchTimeSeriesData(filteredMachines[0].id);
      }
    }
  }, [machines, selectedLineId, dateRange]);

  const filteredMachines = selectedLineId 
    ? machines.filter(m => m.productionLineId === selectedLineId)
    : machines;

  const totalMachines = filteredMachines.length;
  const normalCount = filteredMachines.filter(m => m.status === MachineStatus.NORMAL).length;
  const warningCount = filteredMachines.filter(m => m.status === MachineStatus.WARNING).length;
  const failureCount = filteredMachines.filter(m => m.status === MachineStatus.FAILURE).length;
  const maintenanceCount = filteredMachines.filter(m => m.status === MachineStatus.MAINTENANCE).length;

  const averageOEE = machineMetrics.length > 0
    ? machineMetrics.reduce((sum, m) => sum + m.oee, 0) / machineMetrics.length
    : 0;

  const averageAvailability = machineMetrics.length > 0
    ? machineMetrics.reduce((sum, m) => sum + m.availability, 0) / machineMetrics.length
    : 0;

  const averagePerformance = machineMetrics.length > 0
    ? machineMetrics.reduce((sum, m) => sum + m.performance, 0) / machineMetrics.length
    : 0;

  const averageQuality = machineMetrics.length > 0
    ? machineMetrics.reduce((sum, m) => sum + m.quality, 0) / machineMetrics.length
    : 0;

  const totalDowntime = machineMetrics.reduce((sum, m) => sum + m.totalDowntime, 0);
  const totalFailures = machineMetrics.reduce((sum, m) => sum + m.failureCount, 0);

  const averageMTBF = machineMetrics.length > 0
    ? machineMetrics.reduce((sum, m) => sum + m.mtbf, 0) / machineMetrics.length
    : 0;

  const averageMTTR = machineMetrics.length > 0
    ? machineMetrics.reduce((sum, m) => sum + m.mttr, 0) / machineMetrics.length
    : 0;

  // Cálculos financeiros ajustados
  const estimatedRevenueLoss = totalDowntime * 50; // €50/hora de downtime (mais realista)
  const maintenanceCost = totalFailures * 1200; // €1200 por falha (mais realista)
  const potentialSavings = estimatedRevenueLoss * 0.25; // 25% de poupança potencial
  
  // Evitar divisão por zero e limitar ROI a valores realistas
  const roi = maintenanceCost > 0 
    ? Math.max(-100, Math.min(100, ((potentialSavings - maintenanceCost) / Math.max(maintenanceCost, 1)) * 100))
    : 0;

  const statusData = [
    { status: MachineStatus.NORMAL, count: normalCount },
    { status: MachineStatus.WARNING, count: warningCount },
    { status: MachineStatus.FAILURE, count: failureCount },
    { status: MachineStatus.MAINTENANCE, count: maintenanceCount },
  ];

  // Gerar eventos de paragem baseados nas máquinas filtradas
  const generateDowntimeEvents = () => {
    const events: Array<{
      id: string;
      machineName: string;
      startTime: Date;
      duration: number;
      reason: string;
      status: string;
    }> = [];
    const problemMachines = filteredMachines.filter(
      m => m.status === MachineStatus.FAILURE || m.status === MachineStatus.MAINTENANCE
    );

    // Pegar até 5 eventos de máquinas com problemas
    const selectedMachines = problemMachines.slice(0, 5);
    
    selectedMachines.forEach((machine, index) => {
      const hoursAgo = (index + 1) * 2; // 2h, 4h, 6h, etc
      const duration = 45 + Math.random() * 135; // 45-180 minutos
      
      const reasons: Record<MachineStatus, string[]> = {
        [MachineStatus.NORMAL]: [],
        [MachineStatus.WARNING]: [],
        [MachineStatus.FAILURE]: [
          'Falha no sensor de proximidade',
          'Erro de comunicação PLC',
          'Sobrecarga do motor principal',
          'Falha no sistema hidráulico',
          'Problema elétrico detectado',
        ],
        [MachineStatus.MAINTENANCE]: [
          'Manutenção preventiva programada',
          'Substituição de componente',
          'Lubrificação e ajustes',
          'Calibração de sensores',
          'Atualização de software',
        ],
      };

      const statusReasons = reasons[machine.status] || reasons[MachineStatus.FAILURE];
      const randomReason = statusReasons[Math.floor(Math.random() * statusReasons.length)];

      events.push({
        id: machine.id,
        machineName: machine.name,
        startTime: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
        duration: Math.round(duration),
        reason: randomReason,
        status: machine.status === MachineStatus.FAILURE ? 'IN_PROGRESS' : 'RESOLVED',
      });
    });

    return events;
  };

  const downtimeEvents = generateDowntimeEvents();

  const handleExportReport = async () => {
    try {
      await generatePDFReport({
        dateRange,
        selectedLine: selectedLineId,
        metrics: {
          averageOEE,
          averageAvailability,
          averagePerformance,
          averageQuality,
          averageMTBF,
          averageMTTR,
          totalDowntime,
          totalFailures,
          roi,
        },
        machineMetrics,
        statusCounts: {
          normal: normalCount,
          warning: warningCount,
          failure: failureCount,
          maintenance: maintenanceCount,
        },
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Verifique se popups estão habilitados.');
    }
  };

  return (
   <div className={`min-h-screen p-6 space-y-6 transition-colors duration-300 ${
      theme === 'dark' ? '' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50'
    }`}>
      {/* Header - inline styles para GARANTIR texto branco */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <h1 style={{ color: '#ffffff' }} className="text-4xl font-bold mb-2">Painel de Análise</h1>
          <p style={{ color: '#dbeafe' }}>Monitorização e análise de desempenho em tempo real</p>
        </div>
      </div>

      <FilterPanel 
        productionLines={productionLines}
        selectedLineId={selectedLineId}
        onLineChange={setSelectedLine}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExportReport={handleExportReport}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-xl p-6 shadow-xl border transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-dark border-gray-700 hover:border-blue-500'
            : 'bg-white border-gray-200 hover:border-blue-400'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>
              OEE Global
            </h3>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-5xl font-bold ${
              averageOEE >= 85 ? 'text-green-400' : 
              averageOEE >= 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {averageOEE.toFixed(1)}
            </span>
            <span className={`text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
          </div>
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Eficácia Global do Equipamento
          </p>
          <div className="mt-4 flex items-center text-green-400 text-sm font-semibold">
            <span>↑ 2.3%</span>
            <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>vs. período anterior</span>
          </div>
        </div>

        <div className={`rounded-xl p-6 shadow-xl border transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-dark border-gray-700 hover:border-cyan-500'
            : 'bg-white border-gray-200 hover:border-cyan-400'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>
              MTBF Médio
            </h3>
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-cyan-400">
              {averageMTBF.toFixed(0)}
            </span>
            <span className={`text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>h</span>
          </div>
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Tempo Médio Entre Falhas
          </p>
        </div>

        <div className={`rounded-xl p-6 shadow-xl border transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-dark border-gray-700 hover:border-yellow-500'
            : 'bg-white border-gray-200 hover:border-yellow-400'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>
              MTTR Médio
            </h3>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-yellow-400">
              {averageMTTR.toFixed(1)}
            </span>
            <span className={`text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>h</span>
          </div>
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Tempo Médio de Reparação
          </p>
        </div>

        <div className={`rounded-xl p-6 shadow-xl border transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-dark border-gray-700 hover:border-emerald-500'
            : 'bg-white border-gray-200 hover:border-emerald-400'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>
              ROI Estimado
            </h3>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-5xl font-bold ${roi > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {roi > 0 ? '+' : ''}{roi.toFixed(1)}
            </span>
            <span className={`text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
          </div>
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Retorno do Investimento
          </p>
          <div className={`mt-4 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Poupança potencial: €{potentialSavings.toFixed(0)}
          </div>
        </div>
      </div>

   <div className="bg-gradient-dark rounded-xl p-8 shadow-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <div className="w-1 h-8 bg-blue-500 mr-3 rounded-full"></div>
        Componentes OEE
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 py-4">
        <OEEGauge value={averageOEE} label="OEE Global" size="lg" dark />
        <OEEGauge value={averageAvailability} label="Disponibilidade" size="md" dark />
        <OEEGauge value={averagePerformance} label="Desempenho" size="md" dark />
        <OEEGauge value={averageQuality} label="Qualidade" size="md" dark />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <OEEChart data={timeSeriesData} dark />
      </div>
      <StatusDistribution data={statusData} dark />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-dark rounded-xl p-6 border-2 border-green-700/50 hover:border-green-500 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-green-300 uppercase">Operacionais</h3>
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-green-400">
            {normalCount}
          </div>
        </div>
        <p className="text-3xl font-bold text-green-400">{((normalCount / totalMachines) * 100).toFixed(1)}%</p>
        <p className="text-xs text-gray-400 mt-1">do total de máquinas</p>
      </div>

      <div className="bg-gradient-dark rounded-xl p-6 border-2 border-yellow-700/50 hover:border-yellow-500 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-yellow-300 uppercase">Com Avisos</h3>
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-yellow-400">
            {warningCount}
          </div>
        </div>
        <p className="text-3xl font-bold text-yellow-400">{((warningCount / totalMachines) * 100).toFixed(1)}%</p>
        <p className="text-xs text-gray-400 mt-1">requer atenção</p>
      </div>

      <div className="bg-gradient-dark rounded-xl p-6 border-2 border-red-700/50 hover:border-red-500 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-red-300 uppercase">Em Falha</h3>
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-red-400">
            {failureCount}
          </div>
        </div>
        <p className="text-3xl font-bold text-red-400">{((failureCount / totalMachines) * 100).toFixed(1)}%</p>
        <p className="text-xs text-gray-400 mt-1">urgente</p>
      </div>

      <div className="bg-gradient-dark rounded-xl p-6 border-2 border-blue-700/50 hover:border-blue-500 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-blue-300 uppercase">Manutenção</h3>
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-blue-400">
            {maintenanceCount}
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-400">{((maintenanceCount / totalMachines) * 100).toFixed(1)}%</p>
        <p className="text-xs text-gray-400 mt-1">planeada</p>
      </div>
    </div>

    <DowntimeTable events={downtimeEvents} dark />

    <div className="bg-gradient-dark rounded-xl shadow-xl border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white flex items-center">
          <div className="w-1 h-6 bg-yellow-500 mr-3 rounded-full"></div>
          Top 10 Máquinas por OEE
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Máquina</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">OEE</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Disponibilidade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Desempenho</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Qualidade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">MTBF</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">MTTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {machineMetrics
              .sort((a, b) => b.oee - a.oee)
              .slice(0, 10)
              .map((metric, index) => (
                <tr key={metric.machineId} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">{metric.machineName}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-bold ${
                      metric.oee >= 85 ? 'text-green-400' : 
                      metric.oee >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {metric.oee.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{metric.availability.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{metric.performance.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{metric.quality.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{metric.mtbf.toFixed(1)}h</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{metric.mttr.toFixed(1)}h</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};