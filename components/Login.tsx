import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Loader2, KeyRound, Wrench, ArrowLeft, Briefcase } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
  mode: 'client' | 'admin';
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, mode, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isClient = mode === 'client';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      if (!result.success && result.message) {
        setError(result.message);
      }
      // Success is handled by the App's auth listener
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMasterAdmin = async () => {
    if(!confirm("Isso tentará criar o usuário 'adm@tri.app'. Continuar?")) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    const result = await authService.createMasterAdmin();
    
    // Always pre-fill credentials if successful or if user already exists
    if (result.success || result.message.includes("já existe")) {
        setSuccess(result.message);
        setEmail('adm@tri.app');
        setPassword('Antinella-03');
    } else {
        setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-10 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className={`${isClient ? 'bg-blue-600' : 'bg-slate-800'} p-8 text-center transition-colors duration-500 border-b border-slate-700`}>
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            {isClient ? <Briefcase className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isClient ? 'Área do Cliente' : 'Portal Administrativo'}
          </h2>
          <p className={`${isClient ? 'text-blue-100' : 'text-slate-400'} text-sm`}>
            {isClient ? 'Entre para gerenciar suas triagens' : 'Gerenciamento do Sistema'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20 text-center animate-fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 text-green-400 text-sm p-3 rounded-lg border border-green-500/20 text-center animate-fade-in">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500 shadow-sm focus:ring-opacity-50 border p-2.5 transition-colors ${isClient ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-slate-500 focus:ring-slate-500'}`}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500 shadow-sm focus:ring-opacity-50 border p-2.5 transition-colors ${isClient ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-slate-500 focus:ring-slate-500'}`}
                  placeholder="******"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md disabled:opacity-70 disabled:cursor-not-allowed ${isClient ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'}`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Entrar <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
        
        <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
           <div className="flex justify-center gap-2 mb-2">
                <Lock className="w-3 h-3 text-slate-500 mt-0.5" />
                <p className="text-xs text-slate-500">Ambiente seguro e monitorado.</p>
           </div>
           
           {/* Only show Admin Helper in Admin Mode */}
           {!isClient && (
             <button 
               type="button"
               onClick={handleCreateMasterAdmin}
               disabled={isLoading}
               className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 w-full mt-4 transition-colors border border-dashed border-slate-700 rounded p-1 hover:border-slate-500"
             >
               <Wrench size={10} />
               Criar/Configurar Admin (adm@tri.app)
             </button>
           )}
        </div>
      </div>
    </div>
  );
};