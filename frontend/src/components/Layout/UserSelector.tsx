import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { useTheme } from '../../context/ThemeContext';

export const UserSelector = () => {
  const { currentUser, users, setCurrentUser, fetchUsers, logout } = useUserStore();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelect = (user: any) => {
    setCurrentUser(user);
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-gray-800' 
            : 'hover:bg-gray-100'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-sm font-semibold !text-white">
            {currentUser?.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </span>
        </div>
        <div className="text-left hidden md:block">
          <div className={`text-sm font-medium ${theme === 'dark' ? '!text-white' : 'text-gray-900'}`}>
            {currentUser?.name}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentUser?.role}
          </div>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-2xl border py-2 z-50 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className={`px-4 py-2 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <p className={`text-xs font-semibold uppercase ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Selecionar Utilizador
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  currentUser?.id === user.id 
                    ? theme === 'dark' 
                      ? 'bg-blue-900/30' 
                      : 'bg-blue-50'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.role === 'OPERATOR' ? 'bg-green-100 text-green-700' :
                    user.role === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700' :
                    user.role === 'ENGINEER' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    <span className="text-sm font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? '!text-white' : 'text-gray-900'
                    }`}>
                      {user.name}
                    </div>
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {user.role}
                    </div>
                  </div>
                  {currentUser?.id === user.id && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className={`border-t mt-2 pt-2 px-2 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-red-900/30 text-red-400'
                  : 'hover:bg-red-50 text-red-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Terminar Sessão</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};