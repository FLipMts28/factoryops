// frontend/src/components/Layout/Navbar.tsx
import { useState } from 'react';
import { useOfflineStore } from '../../store/offlineStore';
import { useUserStore } from '../../store/userStore';
import { useTheme } from '../../context/ThemeContext';
import { UserManagement } from '../Admin/UserManagement';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Navbar = () => {
  const { isOnline, pendingSyncCount } = useOfflineStore();
  const { currentUser, setCurrentUser } = useUserStore();
  const { theme } = useTheme();
  const [showUserManagement, setShowUserManagement] = useState(false);

  const canManageUsers = currentUser?.role === 'ADMIN' || currentUser?.role === 'ENGINEER';

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja terminar a sessão?')) {
      setCurrentUser(null);
      // Recarregar página - vai para login automaticamente
      window.location.reload();
    }
  };

  return (
    <>
      <nav className={`shadow-2xl border-b transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-r from-white via-gray-50 to-white border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    FactoryOps
                  </h1>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Industrial Analytics Platform
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* User Management Button */}
              {canManageUsers && (
                <button
                  onClick={() => setShowUserManagement(true)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                  title="Gestão de Utilizadores"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className={`text-sm font-medium hidden md:block ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Utilizadores
                  </span>
                </button>
              )}

              {/* Online/Offline Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-300'
              }`}>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'
                  }`}
                />
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Pending Sync Count */}
              {pendingSyncCount > 0 && (
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-2 rounded-full text-xs font-semibold flex items-center space-x-2 shadow-lg">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{pendingSyncCount} pendente{pendingSyncCount !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Current User Display with Logout */}
              {currentUser && (
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full grid place-items-center !text-white font-bold text-sm shadow-lg">
                      {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {currentUser.name}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {currentUser.role}
                      </p>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-lg transition-all border hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-red-900/20 border-red-700 hover:bg-red-900/40 text-red-400'
                        : 'bg-red-50 border-red-300 hover:bg-red-100 text-red-600'
                    }`}
                    title="Terminar Sessão"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* User Management Modal */}
      <UserManagement 
        isOpen={showUserManagement} 
        onClose={() => setShowUserManagement(false)} 
      />
    </>
  );
};