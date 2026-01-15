import { useState, useEffect, useRef } from 'react';
import { Machine } from '../../types';
import { MachineStatusBadge } from './MachineStatusBadge';
import { useTheme } from '../../context/ThemeContext';

interface MachineSearchProps {
  machines: Machine[];
  onMachineSelect: (machine: Machine) => void;
}

export const MachineSearch = ({ machines, onMachineSelect }: MachineSearchProps) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar máquinas baseado na pesquisa
  const filteredMachines = searchTerm.trim()
    ? machines.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index quando filtro muda
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSelectMachine = (machine: Machine) => {
    onMachineSelect(machine);
    setSearchTerm('');
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredMachines.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredMachines.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredMachines.length) {
          handleSelectMachine(filteredMachines[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSearchTerm('');
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar equipamento por nome ou código..."
          className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-400'
          }`}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className={`absolute inset-y-0 right-0 pr-4 flex items-center ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredMachines.length > 0 && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-lg shadow-2xl border overflow-hidden max-h-96 overflow-y-auto ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className={`px-4 py-2 border-b ${
            theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-xs font-semibold uppercase ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filteredMachines.length} {filteredMachines.length === 1 ? 'resultado' : 'resultados'}
            </p>
          </div>
          {filteredMachines.map((machine, index) => (
            <button
              key={machine.id}
              onClick={() => handleSelectMachine(machine)}
              className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                index === highlightedIndex
                  ? theme === 'dark'
                    ? 'bg-blue-900/30'
                    : 'bg-blue-50'
                  : theme === 'dark'
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {machine.name}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {machine.code}
                  </div>
                </div>
              </div>
              <MachineStatusBadge status={machine.status} />
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions && searchTerm.trim() && filteredMachines.length === 0 && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-lg shadow-2xl border p-6 text-center ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <svg
            className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Nenhum equipamento encontrado
          </p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            Tente pesquisar por outro nome ou código
          </p>
        </div>
      )}

      {/* Keyboard Hints */}
      {showSuggestions && filteredMachines.length > 0 && (
        <div className={`mt-2 flex items-center justify-center space-x-4 text-xs ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
        }`}>
          <span className="flex items-center space-x-1">
            <kbd className={`px-2 py-1 rounded ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>↑↓</kbd>
            <span>navegar</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className={`px-2 py-1 rounded ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>Enter</kbd>
            <span>selecionar</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className={`px-2 py-1 rounded ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>Esc</kbd>
            <span>fechar</span>
          </span>
        </div>
      )}
    </div>
  );
};