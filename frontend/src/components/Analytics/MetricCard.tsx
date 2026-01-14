// frontend/src/components/Analytics/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: number;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  icon?: React.ReactNode;
}

export const MetricCard = ({ 
  title, 
  value, 
  unit, 
  subtitle, 
  trend, 
  color = 'blue',
  icon 
}: MetricCardProps) => {
  const colorClasses = {
    green: 'from-green-900/40 to-green-800/40 border-green-700/50',
    yellow: 'from-yellow-900/40 to-yellow-800/40 border-yellow-700/50',
    red: 'from-red-900/40 to-red-800/40 border-red-700/50',
    blue: 'from-blue-900/40 to-blue-800/40 border-blue-700/50',
    gray: 'from-gray-800/40 to-gray-900/40 border-gray-700/50',
  };

  const iconBg = {
    green: 'bg-green-500/20',
    yellow: 'bg-yellow-500/20',
    red: 'bg-red-500/20',
    blue: 'bg-blue-500/20',
    gray: 'bg-gray-500/20',
  };

  const iconColor = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    gray: 'text-gray-400',
  };

  const valueColor = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    gray: 'text-gray-300',
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <span className="text-green-400">↑</span>;
    if (trend < 0) return <span className="text-red-400">↓</span>;
    return <span className="text-gray-400">→</span>;
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-6 transition-all hover:shadow-lg hover:shadow-${color}-900/20 hover:scale-105 duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        {icon && (
          <div className={`w-10 h-10 ${iconBg[color]} rounded-lg flex items-center justify-center`}>
            <div className={iconColor[color]}>{icon}</div>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className={`text-4xl font-bold ${valueColor[color]}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-xl text-gray-500">{unit}</span>}
        {trend !== undefined && (
          <span className="text-sm ml-2 flex items-center space-x-1">
            {getTrendIcon()} 
            <span className="text-gray-400">{Math.abs(trend).toFixed(1)}%</span>
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
};