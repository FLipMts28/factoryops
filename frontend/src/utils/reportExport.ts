// frontend/src/utils/reportExport.ts
import { MachineMetrics } from '../types/analytics';

interface ReportData {
  dateRange: {
    start: Date;
    end: Date;
  };
  selectedLine: string | null;
  metrics: {
    averageOEE: number;
    averageAvailability: number;
    averagePerformance: number;
    averageQuality: number;
    averageMTBF: number;
    averageMTTR: number;
    totalDowntime: number;
    totalFailures: number;
    roi: number;
  };
  machineMetrics: MachineMetrics[];
  statusCounts: {
    normal: number;
    warning: number;
    failure: number;
    maintenance: number;
  };
}

export const generatePDFReport = async (data: ReportData): Promise<void> => {
  try {
    // Criar uma janela temporária para impressão
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Não foi possível abrir janela de impressão. Verifique se popups estão bloqueados.');
    }

    const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Análise - FactoryOps</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: #fff;
      color: #333;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .header h1 {
      color: #1e40af;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header p {
      color: #64748b;
      font-size: 16px;
    }
    
    .info-section {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #2563eb;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    
    .info-label {
      font-weight: 600;
      color: #475569;
    }
    
    .info-value {
      color: #0f172a;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    
    .metric-title {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .metric-value.good { color: #10b981; }
    .metric-value.warning { color: #f59e0b; }
    .metric-value.danger { color: #ef4444; }
    .metric-value.neutral { color: #6366f1; }
    
    .metric-unit {
      font-size: 18px;
      color: #94a3b8;
    }
    
    .table-container {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
    }
    
    thead {
      background: #1e40af;
      color: white;
    }
    
    th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    
    tbody tr:hover {
      background: #f8fafc;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-normal { background: #d1fae5; color: #065f46; }
    .status-warning { background: #fef3c7; color: #92400e; }
    .status-failure { background: #fee2e2; color: #991b1b; }
    .status-maintenance { background: #dbeafe; color: #1e40af; }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    
    .status-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .status-card {
      border: 2px solid;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    
    .status-card.normal { border-color: #10b981; }
    .status-card.warning { border-color: #f59e0b; }
    .status-card.failure { border-color: #ef4444; }
    .status-card.maintenance { border-color: #3b82f6; }
    
    .status-count {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .status-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .metric-card, .table-container {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório de Análise Industrial</h1>
    <p>FactoryOps - Plataforma de Análise e Monitorização</p>
  </div>

  <div class="info-section">
    <div class="info-row">
      <span class="info-label">📅 Período de Análise:</span>
      <span class="info-value">${data.dateRange.start.toLocaleDateString('pt-PT')} - ${data.dateRange.end.toLocaleDateString('pt-PT')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">🏭 Linha de Produção:</span>
      <span class="info-value">${data.selectedLine || 'Todas as Linhas'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">📄 Gerado em:</span>
      <span class="info-value">${new Date().toLocaleString('pt-PT')}</span>
    </div>
  </div>

  <h2 class="section-title">📈 Indicadores Principais (KPIs)</h2>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-title">OEE Global</div>
      <div class="metric-value ${data.metrics.averageOEE >= 85 ? 'good' : data.metrics.averageOEE >= 70 ? 'warning' : 'danger'}">
        ${data.metrics.averageOEE.toFixed(1)}<span class="metric-unit">%</span>
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">Disponibilidade</div>
      <div class="metric-value ${data.metrics.averageAvailability >= 85 ? 'good' : 'warning'}">
        ${data.metrics.averageAvailability.toFixed(1)}<span class="metric-unit">%</span>
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">Desempenho</div>
      <div class="metric-value ${data.metrics.averagePerformance >= 85 ? 'good' : 'warning'}">
        ${data.metrics.averagePerformance.toFixed(1)}<span class="metric-unit">%</span>
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">Qualidade</div>
      <div class="metric-value ${data.metrics.averageQuality >= 85 ? 'good' : 'warning'}">
        ${data.metrics.averageQuality.toFixed(1)}<span class="metric-unit">%</span>
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">MTBF Médio</div>
      <div class="metric-value neutral">
        ${data.metrics.averageMTBF.toFixed(1)}<span class="metric-unit">h</span>
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">MTTR Médio</div>
      <div class="metric-value warning">
        ${data.metrics.averageMTTR.toFixed(1)}<span class="metric-unit">h</span>
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">Total de Falhas</div>
      <div class="metric-value danger">
        ${data.metrics.totalFailures}
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">ROI Estimado</div>
      <div class="metric-value ${data.metrics.roi > 0 ? 'good' : 'danger'}">
        ${data.metrics.roi > 0 ? '+' : ''}${data.metrics.roi.toFixed(1)}<span class="metric-unit">%</span>
      </div>
    </div>
  </div>

  <h2 class="section-title">🎯 Estado das Máquinas</h2>
  <div class="status-summary">
    <div class="status-card normal">
      <div class="status-count" style="color: #10b981;">${data.statusCounts.normal}</div>
      <div class="status-label" style="color: #065f46;">Operacionais</div>
    </div>
    <div class="status-card warning">
      <div class="status-count" style="color: #f59e0b;">${data.statusCounts.warning}</div>
      <div class="status-label" style="color: #92400e;">Com Avisos</div>
    </div>
    <div class="status-card failure">
      <div class="status-count" style="color: #ef4444;">${data.statusCounts.failure}</div>
      <div class="status-label" style="color: #991b1b;">Em Falha</div>
    </div>
    <div class="status-card maintenance">
      <div class="status-count" style="color: #3b82f6;">${data.statusCounts.maintenance}</div>
      <div class="status-label" style="color: #1e40af;">Manutenção</div>
    </div>
  </div>

  <div class="table-container">
    <h2 class="section-title">🏭 Detalhes por Máquina (Top 20)</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Máquina</th>
          <th>OEE</th>
          <th>Disponibilidade</th>
          <th>Desempenho</th>
          <th>Qualidade</th>
          <th>MTBF</th>
          <th>MTTR</th>
        </tr>
      </thead>
      <tbody>
        ${data.machineMetrics
          .sort((a, b) => b.oee - a.oee)
          .slice(0, 20)
          .map((metric, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><strong>${metric.machineName}</strong></td>
              <td><span class="status-badge ${
                metric.oee >= 85 ? 'status-normal' : 
                metric.oee >= 70 ? 'status-warning' : 'status-failure'
              }">${metric.oee.toFixed(1)}%</span></td>
              <td>${metric.availability.toFixed(1)}%</td>
              <td>${metric.performance.toFixed(1)}%</td>
              <td>${metric.quality.toFixed(1)}%</td>
              <td>${metric.mtbf.toFixed(1)}h</td>
              <td>${metric.mttr.toFixed(1)}h</td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p><strong>FactoryOps</strong> - Industrial Analytics Platform</p>
    <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-PT')}</p>
  </div>

  <script>
    // Aguardar carregamento e imprimir automaticamente
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
    
    // Fechar após impressão (opcional)
    window.onafterprint = function() {
      setTimeout(function() {
        window.close();
      }, 1000);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    alert('Erro ao gerar relatório. Por favor, tente novamente.');
  }
};