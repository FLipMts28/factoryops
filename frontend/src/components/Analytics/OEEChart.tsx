// frontend/src/components/Analytics/OEEChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeSeriesData } from '../../types/analytics';
import { format } from 'date-fns';

interface OEEChartProps {
  data: TimeSeriesData[];
  title?: string;
  dark?: boolean;
}

export const OEEChart = ({ data, title = 'OEE nas Últimas 24h', dark = false }: OEEChartProps) => {
  const chartData = data.map(item => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    oee: item.value,
  }));

  const gridColor = dark ? '#374151' : '#e5e7eb';
  const axisColor = dark ? '#9ca3af' : '#6b7280';

  return (
    <div className="bg-gradient-dark rounded-xl border border-gray-700 p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        {dark && <div className="w-1 h-6 bg-blue-500 mr-3 rounded-full"></div>}
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: axisColor }}
            stroke={axisColor}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: axisColor }}
            stroke={axisColor}
            label={{ 
              value: 'OEE (%)', 
              angle: -90, 
              position: 'insideLeft',
              fill: axisColor
            }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
          <Legend wrapperStyle={{ color: axisColor }} />
          <Line 
            type="monotone" 
            dataKey="oee" 
            stroke="#60a5fa"
            strokeWidth={3}
            dot={false}
            name="OEE"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};