import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, FileText, User } from 'lucide-react';
import { CandidateFile, Recommendation, AnalysisStatus } from '../types';

interface AnalysisResultCardProps {
  candidate: CandidateFile;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ candidate }) => {
  const [expanded, setExpanded] = useState(false);

  // Safety check: Ensure result exists
  if (candidate.status !== AnalysisStatus.COMPLETED || !candidate.result) {
    return null;
  }

  // Destructure with default values to prevent crashes if AI omits fields
  const { 
    recommendation, 
    matchScore, 
    summary, 
    pros = [], 
    cons = [] 
  } = candidate.result;
  
  const isInterview = recommendation === Recommendation.INTERVIEW;

  return (
    <div className={`border rounded-xl bg-slate-900 shadow-sm transition-all duration-300 overflow-hidden ${expanded ? 'ring-2 ring-blue-900 border-blue-800' : 'border-slate-800'}`}>
      <div 
        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
           {/* Status Icon */}
          <div className={`p-2 rounded-full flex-shrink-0 ${isInterview ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
             {isInterview ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{candidate.file.name}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isInterview 
                  ? 'bg-green-900/30 text-green-400 border border-green-800' 
                  : 'bg-red-900/30 text-red-400 border border-red-800'
              }`}>
                {isInterview ? 'CHAMAR' : 'DESCARTAR'}
              </span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-1 mt-1">{summary}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 min-w-[140px]">
          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase font-semibold">Match Score</span>
            <div className={`text-xl font-bold ${
              matchScore >= 80 ? 'text-green-500' : matchScore >= 50 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {matchScore}%
            </div>
          </div>
          <div className="text-slate-500">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-800 bg-slate-950/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="text-sm font-semibold text-green-500 mb-2 flex items-center gap-2">
                 Pontos Fortes
              </h4>
              <ul className="space-y-1">
                {pros && pros.length > 0 ? (
                  pros.map((point, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-green-500/70 mt-1">•</span> {point}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500 italic">Nenhum ponto forte destacado.</li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
                 Pontos de Atenção
              </h4>
               <ul className="space-y-1">
                {cons && cons.length > 0 ? (
                  cons.map((point, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-red-500/70 mt-1">•</span> {point}
                    </li>
                  ))
                ) : (
                   <li className="text-sm text-slate-500 italic">Nenhum ponto de atenção destacado.</li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-sm font-semibold text-white mb-2">Resumo da Análise</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{summary || "Sem resumo disponível."}</p>
          </div>
        </div>
      )}
    </div>
  );
};