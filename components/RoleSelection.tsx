import React from 'react';
import { User, ShieldCheck, ArrowRight, Briefcase, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface RoleSelectionProps {
  onSelect: (role: 'client' | 'admin') => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  const isConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          TriagemCV Inteligente
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Selecione como deseja acessar a plataforma.
        </p>
        {!isConfigured && (
          <div className="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            Conexão com banco de dados pendente. Contate o administrador.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl opacity-100 transition-opacity">
        <button
          onClick={() => isConfigured && onSelect('client')}
          disabled={!isConfigured}
          className={`group relative bg-white p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 text-left flex flex-col h-full overflow-hidden
            ${isConfigured ? 'border-slate-100 hover:border-blue-500 shadow-sm cursor-pointer' : 'border-slate-100 opacity-60 cursor-not-allowed'}
          `}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <User size={120} />
          </div>
          <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <User className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sou Cliente</h2>
          <p className="text-slate-500 mb-8 flex-grow">Acesse a ferramenta de triagem para analisar currículos e gerenciar suas vagas.</p>
          <div className="flex items-center font-semibold text-blue-600 group-hover:gap-2 transition-all">
            Fazer Login <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        <button
          onClick={() => isConfigured && onSelect('admin')}
          disabled={!isConfigured}
          className={`group relative bg-white p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 text-left flex flex-col h-full overflow-hidden
             ${isConfigured ? 'border-slate-100 hover:border-slate-800 shadow-sm cursor-pointer' : 'border-slate-100 opacity-60 cursor-not-allowed'}
          `}
        >
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={120} />
          </div>
          <div className="bg-slate-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <ShieldCheck className="w-7 h-7 text-slate-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Administrador</h2>
          <p className="text-slate-500 mb-8 flex-grow">Área restrita para gestão de usuários, liberação de créditos e controle do sistema.</p>
          <div className="flex items-center font-semibold text-slate-700 group-hover:gap-2 transition-all">
            Acesso Admin <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </button>
      </div>
      <p className="mt-12 text-xs text-slate-400">&copy; {new Date().getFullYear()} TriagemCV. Todos os direitos reservados.</p>
    </div>
  );
};