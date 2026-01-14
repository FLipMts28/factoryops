// frontend/src/components/Canvas/Toolbar.tsx
import { AnnotationType } from '../../types';

interface ToolbarProps {
  selectedTool: AnnotationType;
  onToolChange: (tool: AnnotationType) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onAddText: () => void;
}

const tools = [
  { type: AnnotationType.LINE, label: 'Linha', icon: '📏' },
  { type: AnnotationType.RECTANGLE, label: 'Retângulo', icon: '▭' },
  { type: AnnotationType.CIRCLE, label: 'Círculo', icon: '○' },
];

const colors = [
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Amarelo' },
  { value: '#000000', label: 'Preto' },
];

export const Toolbar = ({
  selectedTool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onAddText,
}: ToolbarProps) => {
  return (
    <div className="flex items-center space-x-6 p-4 bg-gray-100 rounded-lg">
      {/* Tools */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-gray-700">Ferramenta:</span>
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onToolChange(tool.type)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTool === tool.type
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
            title={tool.label}
          >
            <span className="text-lg">{tool.icon}</span>
          </button>
        ))}
        <button
          onClick={onAddText}
          className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-200 transition-colors"
          title="Texto"
        >
          <span className="text-lg">T</span>
        </button>
      </div>

      {/* Colors */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-gray-700">Cor:</span>
        {colors.map((c) => (
          <button
            key={c.value}
            onClick={() => onColorChange(c.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              color === c.value ? 'border-gray-900 scale-110' : 'border-gray-300'
            }`}
            style={{ backgroundColor: c.value }}
            title={c.label}
          />
        ))}
      </div>

      {/* Stroke Width */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-gray-700">Espessura:</span>
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-sm text-gray-600 w-6">{strokeWidth}</span>
      </div>
    </div>
  );
};