// frontend/src/components/Analytics/StatusDistribution.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MachineStatus } from '../../types';

interface StatusDistributionProps {
  data: Array<{ status: MachineStatus; count: number }>;
  dark?: boolean;
}

export const StatusDistribution = ({ data, dark = false }: StatusDistributionProps) => {
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

  return (
    <div className="bg-gradient-dark rounded-xl border border-gray-700 p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        {dark && <div className="w-1 h-6 bg-yellow-500 mr-3 rounded-full"></div>}
        Distribuição de Status
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
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
              backgroundColor: '#1e293b',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
          <Legend 
            wrapperStyle={{ 
              color: '#9ca3af'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};