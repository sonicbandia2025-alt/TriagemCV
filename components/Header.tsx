import React from 'react';
import { Briefcase, UserCheck, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user?: User;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-900/20">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">TriagemCV</h1>
              <p className="text-xs text-slate-400 font-medium">Powered by Gemini AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            {/* User Profile Info */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                <div className="bg-blue-900/50 p-1 rounded-full">
                  <UserIcon className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-slate-200 font-semibold">{user.name}</span>
              </div>
            )}

            <div className="hidden md:flex h-6 w-px bg-slate-700 mx-2"></div>

            <div className="hidden md:flex items-center gap-1 hover:text-white transition-colors cursor-default">
              <Briefcase className="w-4 h-4" />
              <span>Recrutamento</span>
            </div>
            
            {onLogout && (
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors border border-transparent hover:border-red-900/30"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};