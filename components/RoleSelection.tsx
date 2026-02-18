import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, ArrowRight, Briefcase, Settings, Save, Database, AlertCircle, HelpCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface RoleSelectionProps {
  onSelect: (role: 'client' | 'admin') => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Config Form State
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    // Pre-fill inputs if available
    setUrl(localStorage.getItem('sb_url') || '');
    setKey(localStorage.getItem('sb_key') || '');
  }, []);

  const handleSaveConfig = () => {
    if (!url || !key) return;
    localStorage.setItem('sb_url', url.trim());
    localStorage.setItem('sb_key', key.trim());
    window.location.reload(); // Reload to re-init Supabase client
  };

  const handleClearConfig = () => {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      
      {/* Config Button */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setShowConfig(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isConfigured 
              ? 'bg-white text-slate-500 hover:text-blue-600 border border-slate-200' 
              : 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
          }`}
        >
          <Settings size={16} />
          {isConfigured ? 'Configuração' : 'Configurar Conexão'}
        </button>
      </div>

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
            Conexão com banco de dados pendente
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl opacity-100 transition-opacity">
        {/* Client Card */}
        <button
          onClick={() => isConfigured ? onSelect('client') : setShowConfig(true)}
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
          <p className="text-slate-500 mb-8 flex-grow">
            Acesse a ferramenta de triagem para analisar currículos e gerenciar suas vagas.
          </p>
          
          <div className="flex items-center font-semibold text-blue-600 group-hover:gap-2 transition-all">
            Fazer Login <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        {/* Admin Card */}
        <button
          onClick={() => isConfigured ? onSelect('admin') : setShowConfig(true)}
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
          <p className="text-slate-500 mb-8 flex-grow">
            Área restrita para gestão de usuários, liberação de créditos e controle do sistema.
          </p>
          
          <div className="flex items-center font-semibold text-slate-700 group-hover:gap-2 transition-all">
            Acesso Admin <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </button>
      </div>
      
      <p className="mt-12 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} TriagemCV. Todos os direitos reservados.
      </p>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
             <div className="bg-slate-900 px-6 py-4 flex items-center gap-3 flex-shrink-0">
                <Database className="text-blue-400" />
                <h3 className="text-white font-bold text-lg">Configurar Banco de Dados</h3>
             </div>
             
             <div className="p-6 space-y-4 overflow-y-auto">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-900 mb-4">
                  <div className="flex items-start gap-2 mb-2">
                     <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                     <strong className="font-semibold">Onde encontrar os dados?</strong>
                  </div>
                  <ul className="list-decimal pl-5 space-y-1 text-blue-800">
                    <li>No painel do Supabase, abra o <strong>Menu</strong> (ícone ☰ se estiver no celular).</li>
                    <li>Vá em <strong>Settings</strong> (Ícone de Engrenagem ⚙️), geralmente no final do menu.</li>
                    <li>Selecione a opção <strong>API</strong>.</li>
                    <li>Copie a <strong>Project URL</strong> e a chave <strong>anon / public</strong>.</li>
                  </ul>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Project URL</label>
                   <input 
                      type="text" 
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://xyz.supabase.co"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">API Key (anon/public)</label>
                   <input 
                      type="password" 
                      value={key}
                      onChange={e => setKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                   />
                </div>

                <div className="pt-4 flex gap-3 flex-col sm:flex-row">
                   <button 
                      onClick={handleSaveConfig}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                   >
                      <Save size={18} /> Salvar e Conectar
                   </button>
                   
                   {isConfigured && (
                      <button 
                        onClick={handleClearConfig}
                        className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-center"
                      >
                        Limpar Dados
                      </button>
                   )}
                   
                   <button 
                      onClick={() => setShowConfig(false)}
                      className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-center"
                   >
                      Cancelar
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};