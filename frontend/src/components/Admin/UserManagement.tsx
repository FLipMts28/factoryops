import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { usersApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagement = ({ isOpen, onClose }: UserManagementProps) => {
  const { theme } = useTheme();
  const { currentUser } = useUserStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: 'OPERATOR',
    password: '',
  });

  const canManageUsers = currentUser?.role === 'ADMIN' || currentUser?.role === 'ENGINEER';

  useEffect(() => {
    if (isOpen && canManageUsers) {
      fetchUsers();
    }
  }, [isOpen, canManageUsers]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
      alert('Erro ao carregar utilizadores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.username || !formData.name || !formData.password) {
      alert('Preencha todos os campos');
      return;
    }

    if (formData.password.length < 6) {
      alert('A password deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      await usersApi.create({
        username: formData.username,
        name: formData.name,
        role: formData.role,
        password: formData.password,
      });
      
      setFormData({ username: '', name: '', role: 'OPERATOR', password: '' });
      setIsAddingUser(false);
      alert('Utilizador criado com sucesso!');
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao criar utilizador:', error);
      alert(`Erro ao criar utilizador: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const updateData: any = {
      name: formData.name,
      role: formData.role,
    };

    if (formData.password) {
      if (formData.password.length < 6) {
        alert('A password deve ter pelo menos 6 caracteres');
        return;
      }
      updateData.password = formData.password;
    }

    try {
      await usersApi.update(editingUser.id, updateData);
      
      setEditingUser(null);
      setFormData({ username: '', name: '', role: 'OPERATOR', password: '' });
      alert('Utilizador atualizado com sucesso!');
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar utilizador:', error);
      alert(`Erro ao atualizar utilizador: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('Não pode eliminar o seu próprio utilizador!');
      return;
    }

    if (!confirm('Tem certeza que deseja eliminar este utilizador?')) return;
    
    try {
      await usersApi.delete(userId);
      alert('Utilizador eliminado com sucesso!');
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao eliminar utilizador:', error);
      alert(`Erro ao eliminar utilizador: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      role: user.role,
      password: '',
    });
    setIsAddingUser(false);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setIsAddingUser(false);
    setFormData({ username: '', name: '', role: 'OPERATOR', password: '' });
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, { light: string; dark: string }> = {
      OPERATOR: {
        light: 'bg-green-100 text-green-800 border-green-300',
        dark: 'bg-green-900/30 text-green-300 border-green-700',
      },
      MAINTENANCE: {
        light: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        dark: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      },
      ENGINEER: {
        light: 'bg-blue-100 text-blue-800 border-blue-300',
        dark: 'bg-blue-900/30 text-blue-300 border-blue-700',
      },
      ADMIN: {
        light: 'bg-purple-100 text-purple-800 border-purple-300',
        dark: 'bg-purple-900/30 text-purple-300 border-purple-700',
      },
    };
    const colorSet = colors[role] || colors.OPERATOR;
    return theme === 'dark' ? colorSet.dark : colorSet.light;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        {/* Header com texto SEMPRE branco */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <svg className="w-8 h-8 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold !text-white">Gestão de Utilizadores</h2>
                <p className="text-sm !text-blue-100">Gerir acessos e permissões do sistema</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="!text-white/80 hover:!text-white hover:bg-white/10 rounded-lg p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!canManageUsers ? (
            <div className={`border rounded-xl p-8 text-center ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-700'
                : 'bg-red-50 border-red-300'
            }`}>
              <svg className={`w-16 h-16 mx-auto mb-4 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Acesso Negado</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Apenas Administradores e Engenheiros podem gerir utilizadores.
              </p>
            </div>
          ) : (
            <>
              {/* Add User Button */}
              {!isAddingUser && !editingUser && (
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="mb-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 !text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Adicionar Novo Utilizador</span>
                </button>
              )}

              {/* Add/Edit Form */}
              {(isAddingUser || editingUser) && (
                <div className={`border rounded-xl p-6 mb-6 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Username *</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={!!editingUser}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50'
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                        }`}
                        placeholder="ex: joao.silva"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Nome Completo *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="ex: João Silva"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Função</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="OPERATOR">Operador</option>
                        <option value="MAINTENANCE">Manutenção</option>
                        <option value="ENGINEER">Engenheiro</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Password {editingUser ? '(deixar vazio para não alterar)' : '*'}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingUser ? handleUpdateUser : handleAddUser}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-white font-semibold rounded-lg transition-all shadow-lg"
                    >
                      {editingUser ? 'Atualizar' : 'Criar'} Utilizador
                    </button>
                  </div>
                </div>
              )}

              {/* Users List */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    A carregar utilizadores...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`border-2 rounded-xl p-5 transition-all hover:shadow-lg ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500'
                          : 'bg-white border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center !text-white font-bold text-lg shadow-lg">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className={`font-bold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {user.name}
                            </h4>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleEditClick(user)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            theme === 'dark'
                              ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-300'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          }`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            user.id === currentUser?.id
                              ? theme === 'dark'
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : theme === 'dark'
                                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300'
                                : 'bg-red-100 hover:bg-red-200 text-red-700'
                          }`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && users.length === 0 && (
                <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                  theme === 'dark'
                    ? 'border-gray-700 text-gray-400'
                    : 'border-gray-300 text-gray-600'
                }`}>
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>Nenhum utilizador encontrado</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};