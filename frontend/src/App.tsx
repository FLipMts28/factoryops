// frontend/src/App.tsx
import { useEffect, useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { Login } from './components/Auth';
import { useMachineStore } from './store/machineStore';
import { useUserStore } from './store/userStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useOfflineSync } from './hooks/useOfflineSync';
import { ThemeProvider, useTheme } from './context/ThemeContext';

type View = 'operations' | 'analytics';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('analytics');
  const { theme } = useTheme();
  const { connect, disconnect } = useWebSocket();
  const { syncOfflineData } = useOfflineSync();
  const fetchMachines = useMachineStore((state) => state.fetchMachines);
  const fetchProductionLines = useMachineStore((state) => state.fetchProductionLines);
  const { fetchUsers, loadLastUser, isAuthenticated } = useUserStore();

  // Tentar carregar último user ao iniciar (apenas uma vez)
  useEffect(() => {
    loadLastUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMachines();
      fetchProductionLines();
      fetchUsers();
      connect();
      syncOfflineData();

      return () => {
        disconnect();
      };
    }
  }, [isAuthenticated]);

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <Login/>;
  }

  return (
    <MainLayout>
      {/* Seletor de Vista - inline styles para GARANTIR texto branco */}
      <div className="mb-6">
        <div 
          style={{ 
            background: 'linear-gradient(to right, #1f2937, #111827)',
            borderColor: '#374151'
          }}
          className="backdrop-blur-sm rounded-xl shadow-2xl border p-1.5 inline-flex"
        >
          {/* Tab Análise */}
          <button
            onClick={() => setCurrentView('analytics')}
            style={{ color: '#ffffff' }}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              currentView === 'analytics'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-900/50 scale-105'
                : 'hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Análise</span>
            </div>
          </button>
          
          {/* Tab Operações */}
          <button
            onClick={() => setCurrentView('operations')}
            style={{ color: '#ffffff' }}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              currentView === 'operations'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-900/50 scale-105'
                : 'hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>Operações</span>
            </div>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="fade-in">
        {currentView === 'analytics' ? <AnalyticsDashboard /> : <Dashboard />}
      </div>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;