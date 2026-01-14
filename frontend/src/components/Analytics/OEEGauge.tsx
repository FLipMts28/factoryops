// frontend/src/components/Analytics/OEEGauge.tsx
interface OEEGaugeProps {
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}

export const OEEGauge = ({ value, label, size = 'md', dark = false }: OEEGaugeProps) => {
  const sizeClasses = {
    sm: { container: 'w-24 h-24', text: 'text-xl', padding: 'p-2' },
    md: { container: 'w-32 h-32', text: 'text-2xl', padding: 'p-3' },
    lg: { container: 'w-40 h-40', text: 'text-3xl', padding: 'p-4' },
  };

  const getColor = (val: number): string => {
    if (val >= 85) return '#34d399';
    if (val >= 70) return '#fbbf24';
    return '#f87171';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const bgColor = '#374151';

  return (
    <div className="flex flex-col items-center">
      {/* Adicionar padding para a sombra não ser cortada */}
      <div className={`relative ${sizeClasses[size].container} ${sizeClasses[size].padding}`}>
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r="42%"
            stroke={bgColor}
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle - SEM sombra branca */}
          <circle
              cx="50%"
              cy="50%"
              r="42%"
              stroke={getColor(value)}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              style={{
                filter: `drop-shadow(0 0 6px ${getColor(value)}40)`
              }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${sizeClasses[size].text} text-white`}>
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">%</span>
        </div>
      </div>
      <p className="text-sm font-medium mt-3 text-white">{label}</p>
    </div>
  );
};