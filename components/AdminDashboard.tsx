import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Edit2, Check, X, Loader2, CreditCard, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';
import { getAllUsers, updateUserCredits } from '../services/databaseService';

interface AdminDashboardProps {
  currentUser: UserType;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create User State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCredits, setNewCredits] = useState(10);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState<number>(0);

  const loadUsers = async () => {
    setLoading(true);
    const fetchedUsers = await getAllUsers();
    setUsers(fetchedUsers);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMessage(null);

    const result = await authService.registerUserByAdmin(newEmail, newPassword, newName, newCredits);

    if (result.success) {
      setCreateMessage({ type: 'success', text: result.message });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewCredits(10);
      loadUsers(); // Refresh list
      setTimeout(() => setShowCreateModal(false), 2000);
    } else {
      setCreateMessage({ type: 'error', text: result.message });
    }
    setCreateLoading(false);
  };

  const startEditing = (user: UserType) => {
    setEditingUserId(user.uid || null);
    setEditCredits(user.maxCredits || 0);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
  };

  const saveCredits = async (uid: string) => {
    if (!uid) return;
    try {
        await updateUserCredits(uid, editCredits);
        setUsers(users.map(u => u.uid === uid ? { ...u, maxCredits: editCredits } : u));
        setEditingUserId(null);
    } catch (error) {
        alert("Erro ao atualizar créditos");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-300">Olá, {currentUser.name}</span>
             <button onClick={onLogout} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors">
               Sair
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Usuários</h2>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
                <Plus className="w-5 h-5" /> Novo Usuário
            </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Usuário</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Email</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Uso / Limite</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                           <tr>
                               <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                   <div className="flex justify-center items-center gap-2">
                                       <Loader2 className="animate-spin w-5 h-5" /> Carregando usuários...
                                   </div>
                               </td>
                           </tr>
                        ) : users.length === 0 ? (
                           <tr>
                               <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td>
                           </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {user.isAdmin ? <Shield size={14} /> : <User size={14} />}
                                            </div>
                                            <span className="font-medium text-slate-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{user.username}</td>
                                    <td className="px-6 py-4">
                                        {editingUserId === user.uid ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={editCredits}
                                                    onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className={`${(user.usageCount || 0) >= (user.maxCredits || 0) ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                                                    {user.usageCount}
                                                </span>
                                                <span className="text-slate-400">/</span>
                                                <span className="text-slate-900 font-medium">{user.maxCredits}</span>
                                                <span className="text-xs text-slate-400">créditos</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isAdmin ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Ativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingUserId === user.uid ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => saveCredits(user.uid!)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={18} /></button>
                                                <button onClick={cancelEditing} className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={18} /></button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => startEditing(user)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Editar Créditos"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </main>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h3 className="font-bold text-white">Adicionar Usuário</h3>
                    <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    {createMessage && (
                        <div className={`p-3 rounded-lg text-sm border ${createMessage.type === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
                            {createMessage.type === 'error' && (
                                <div className="flex items-center gap-2 mb-1 font-bold">
                                    <AlertTriangle size={16} /> Atenção
                                </div>
                            )}
                            {createMessage.text}
                        </div>
                    )}

                    <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg text-xs text-blue-300 mb-2">
                        <strong>Dica:</strong> Se receber "Rate Limit", desative <em>Confirm Email</em> no Supabase.
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
                        <input 
                            type="text" required
                            value={newName} onChange={e => setNewName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                            placeholder="Nome Completo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input 
                            type="email" required
                            value={newEmail} onChange={e => setNewEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Senha Provisória</label>
                        <input 
                            type="text" required
                            value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Créditos Iniciais</label>
                        <div className="flex items-center gap-2">
                             <input 
                                type="number" required min="0"
                                value={newCredits} onChange={e => setNewCredits(parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                            />
                            <CreditCard className="text-slate-500" />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={createLoading}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-transparent"
                    >
                        {createLoading ? <Loader2 className="animate-spin" /> : 'Criar Usuário'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};