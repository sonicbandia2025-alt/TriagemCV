import React from 'react';
import { JobConfig } from '../types';

interface JobFormProps {
  config: JobConfig;
  onChange: (newConfig: JobConfig) => void;
  disabled: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({ config, onChange, disabled }) => {
  const handleChange = (field: keyof JobConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 space-y-4">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          1. Configuração da Vaga
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Defina o perfil da vaga para que a IA possa avaliar os candidatos corretamente.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-300 mb-1">
            Título da Vaga
          </label>
          <input
            id="jobTitle"
            type="text"
            value={config.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={disabled}
            placeholder="Ex: Desenvolvedor Senior React"
            className="w-full rounded-lg bg-slate-800 border-slate-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm transition-colors placeholder-slate-500"
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-slate-300 mb-1">
            Requisitos e Descrição
          </label>
          <textarea
            id="requirements"
            rows={6}
            value={config.requirements}
            onChange={(e) => handleChange('requirements', e.target.value)}
            disabled={disabled}
            placeholder="Descreva as responsabilidades, habilidades necessárias (hard skills), habilidades desejadas (soft skills) e nível de experiência..."
            className="w-full rounded-lg bg-slate-800 border-slate-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm transition-colors resize-none placeholder-slate-500"
          />
          <p className="text-xs text-slate-500 mt-2 text-right">
            Quanto mais detalhado, melhor será a análise.
          </p>
        </div>
      </div>
    </div>
  );
};