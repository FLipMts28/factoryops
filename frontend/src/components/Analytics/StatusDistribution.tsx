// frontend/src/components/Analytics/StatusDistribution.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MachineStatus } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface StatusDistributionProps {
  data: Array<{ status: MachineStatus; count: number }>;
  dark?: boolean;
}

export const StatusDistribution = ({ data, dark = false }: StatusDistributionProps) => {
  const { theme } = useTheme();
  
  const COLORS = {
    NORMAL: '#34d399',
    WARNING: '#fbbf24',
    FAILURE: '#f87171',
    MAINTENANCE: '#60a5fa',
  };

  const chartData = data.map(item => ({
    name: item.status,
    value: item.count,
    color: COLORS[item.status],
  }));

  // Custom label adaptado ao tema
  const renderCustomLabel = ({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={theme === 'dark' ? '#ffffff' : '#1f2937'}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`rounded-xl border p-6 shadow-xl transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-dark border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-xl font-bold mb-4 flex items-center ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {dark && <div className="w-1 h-6 bg-yellow-500 mr-3 rounded-full"></div>}
        Distribuição de Status
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: theme === 'dark' ? '#ffffff' : '#1f2937'
            }}
            itemStyle={{
              color: theme === 'dark' ? '#ffffff' : '#1f2937'
            }}
            labelStyle={{
              color: theme === 'dark' ? '#ffffff' : '#1f2937',
              fontWeight: 'bold'
            }}
          />
          <Legend 
            wrapperStyle={{ 
              color: theme === 'dark' ? '#ffffff' : '#1f2937'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};