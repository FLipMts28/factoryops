// frontend/src/components/Admin/UserManagement.tsx
import { useState } from 'react';
import { useUserStore } from '../../store/userStore';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  password?: string;
}

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagement = ({ isOpen, onClose }: UserManagementProps) => {
  const { users, setUsers, currentUser } = useUserStore();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: 'OPERATOR',
    password: '',
  });

  if (!isOpen) return null;

  const handleAddUser = () => {
    if (!formData.username || !formData.name || !formData.password) {
      alert('Preencha todos os campos');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: formData.username,
      name: formData.name,
      role: formData.role,
    };
    
    setUsers([...users, newUser]);
    
    const savedUsers = JSON.parse(localStorage.getItem('factoryops_users') || '[]');
    savedUsers.push({ ...newUser, password: formData.password });
    localStorage.setItem('factoryops_users', JSON.stringify(savedUsers));
    
    setFormData({ username: '', name: '', role: 'OPERATOR', password: '' });
    setIsAddingUser(false);
    alert('Utilizador criado com sucesso!');
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updatedUsers = users.map(u => 
      u.id === editingUser.id 
        ? { ...u, name: formData.name, role: formData.role }
        : u
    );
    
    setUsers(updatedUsers);
    
    const savedUsers = JSON.parse(localStorage.getItem('factoryops_users') || '[]');
    const updatedSaved = savedUsers.map((u: any) =>
      u.id === editingUser.id
        ? { ...u, name: formData.name, role: formData.role, password: formData.password || u.password }
        : u
    );
    localStorage.setItem('factoryops_users', JSON.stringify(updatedSaved));
    
    setEditingUser(null);
    setFormData({ username: '', name: '', role: 'OPERATOR', password: '' });
    alert('Utilizador atualizado com sucesso!');
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este utilizador?')) return;
    
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    
    const savedUsers = JSON.parse(localStorage.getItem('factoryops_users') || '[]');
    const updatedSaved = savedUsers.filter((u: any) => u.id !== userId);
    localStorage.setItem('factoryops_users', JSON.stringify(updatedSaved));
    
    alert('Utilizador eliminado com sucesso!');
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
    const colors: Record<string, string> = {
      OPERATOR: 'bg-green-100 text-green-800 border-green-300',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ENGINEER: 'bg-blue-100 text-blue-800 border-blue-300',
      ADMIN: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[role] || colors.OPERATOR;
  };

  const canManageUsers = currentUser?.role === 'ADMIN' || currentUser?.role === 'ENGINEER';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Gestão de Utilizadores</h2>
              <p className="text-sm text-blue-100">Gerir acessos e permissões</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!canManageUsers ? (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">Acesso Negado</h3>
              <p className="text-gray-300">Apenas Administradores e Engenheiros podem gerir utilizadores.</p>
            </div>
          ) : (
            <>
              {/* Add User Button */}
              {!isAddingUser && !editingUser && (
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="mb-6 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Adicionar Novo Utilizador</span>
                </button>
              )}

              {/* Add/Edit Form */}
              {(isAddingUser || editingUser) && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={!!editingUser}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        placeholder="ex: op.silva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="ex: João Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Função</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="OPERATOR">Operador</option>
                        <option value="MAINTENANCE">Manutenção</option>
                        <option value="ENGINEER">Engenheiro</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password {editingUser && '(deixar vazio para não alterar)'}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={editingUser ? handleUpdateUser : handleAddUser}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {editingUser ? 'Atualizar' : 'Criar'} Utilizador
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white mb-4">Utilizadores Registados ({users.length})</h3>
                
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          user.role === 'OPERATOR' ? 'bg-green-600' :
                          user.role === 'MAINTENANCE' ? 'bg-yellow-600' :
                          user.role === 'ENGINEER' ? 'bg-blue-600' :
                          'bg-purple-600'
                        }`}>
                          <span className="text-white font-bold text-lg">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-semibold">{user.name}</h4>
                          <p className="text-gray-400 text-sm">@{user.username}</p>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>

                        {currentUser?.id === user.id && (
                          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                            Ativo
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 border-t border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};