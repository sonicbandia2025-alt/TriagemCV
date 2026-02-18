import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './Header';
import { JobForm } from './JobForm';
import { FileUpload } from './FileUpload';
import { AnalysisResultCard } from './AnalysisResultCard';
import { JobConfig, CandidateFile, AnalysisStatus, User, Recommendation } from '../types';
import { analyzeResumeWithGemini } from '../services/geminiService';
import { getUserData, incrementUserUsage, saveAnalysisResult } from '../services/databaseService';
import { Play, Loader2, Crown, RefreshCcw, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ClientDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

const getMimeType = (file: File): string => {
  if (file.type && file.type !== '') return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'application/pdf'; 
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ currentUser, onLogout }) => {
  const [jobConfig, setJobConfig] = useState<JobConfig>({ title: '', requirements: '' });
  const [files, setFiles] = useState<CandidateFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageCount, setUsageCount] = useState(currentUser.usageCount || 0);
  const [maxCredits, setMaxCredits] = useState(currentUser.maxCredits || 3);

  useEffect(() => {
    if (currentUser.uid) {
      getUserData(currentUser.uid).then(data => {
        if (data) {
          setUsageCount(data.usageCount || 0);
          setMaxCredits(data.maxCredits || 3);
        }
      });
    }
  }, [currentUser.uid]);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const processedFiles: CandidateFile[] = [];
    for (const file of newFiles) {
      try {
        const base64 = await fileToBase64(file);
        processedFiles.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          base64,
          mimeType: getMimeType(file),
          status: AnalysisStatus.IDLE
        });
      } catch (error) {
        console.error("Error processing file", file.name, error);
      }
    }
    setFiles(prev => [...prev, ...processedFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    if (confirm("Tem certeza que deseja limpar tudo?")) {
      setFiles([]);
      setJobConfig({ title: '', requirements: '' });
    }
  };

  const runAnalysis = async () => {
    if (!jobConfig.title.trim() || !jobConfig.requirements.trim()) {
      alert("Preencha o título e os requisitos da vaga.");
      return;
    }
    if (files.length === 0) {
      alert("Adicione currículos para analisar.");
      return;
    }

    const pendingFiles = files.filter(f => f.status === AnalysisStatus.IDLE || f.status === AnalysisStatus.ERROR);
    
    if (pendingFiles.length === 0) {
      alert("Todos os arquivos já foram processados.");
      return;
    }

    if (usageCount >= maxCredits) {
      alert("Limite de créditos atingido. Contate o administrador.");
      return;
    }

    setIsAnalyzing(true);
    let currentUsage = usageCount;

    for (const file of pendingFiles) {
      if (currentUsage >= maxCredits) {
        alert("Créditos esgotados durante o processamento.");
        break; 
      }

      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: AnalysisStatus.ANALYZING } : f));

      try {
        const result = await analyzeResumeWithGemini(
          file.base64,
          file.mimeType,
          jobConfig.title,
          jobConfig.requirements
        );

        // UPDATE UI IMMEDIATELY - No blocking by database
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: AnalysisStatus.COMPLETED, result } : f
        ));

        // Sync usage and result in background
        if (currentUser.uid) {
          saveAnalysisResult(currentUser.uid, file.file.name, jobConfig.title, result).catch(console.error);
          
          // Non-blocking credit decrement
          incrementUserUsage(currentUser.uid).then(newCount => {
            setUsageCount(newCount);
          }).catch(console.error);
          
          // Optimistic local update
          currentUsage++;
          setUsageCount(prev => prev + 1);
        }

      } catch (error: any) {
        console.error("Analysis failed for", file.file.name, error);
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: AnalysisStatus.ERROR, 
            errorMessage: error.message || "Erro desconhecido." 
          } : f
        ));
      }
    }

    setIsAnalyzing(false);
  };

  const completedCount = files.filter(f => f.status === AnalysisStatus.COMPLETED).length;
  const interviewCount = files.filter(f => f.result?.recommendation === Recommendation.INTERVIEW).length;
  const hasPending = files.some(f => f.status === AnalysisStatus.IDLE || f.status === AnalysisStatus.ERROR);

  return (
    <div className="min-h-screen bg-slate-950 pb-20 relative text-slate-200">
      <Header user={currentUser} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-8 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-blue-900/30 p-2 rounded-full text-blue-400">
               <Crown className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-sm font-semibold text-white">Seus Créditos</h3>
               <p className="text-xs text-slate-400">
                 {usageCount} utilizados de {maxCredits} disponíveis
               </p>
             </div>
          </div>
          <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
             <div 
               className={`h-full transition-all duration-500 ${usageCount >= maxCredits ? 'bg-red-500' : 'bg-blue-500'}`} 
               style={{ width: `${Math.min((usageCount / maxCredits) * 100, 100)}%` }}
             ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8 space-y-6">
            <JobForm config={jobConfig} onChange={setJobConfig} disabled={isAnalyzing} />
          </div>
          <div className="lg:col-span-4 flex flex-col h-full">
            <FileUpload files={files} onFilesAdded={handleFilesAdded} onRemoveFile={removeFile} disabled={isAnalyzing} />
          </div>
        </div>

        <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur border-y border-slate-800 py-4 mb-8">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Resultados da Triagem
                </h2>
                <span className="text-sm text-slate-400">
                  {completedCount} analisados • {interviewCount} aprovados
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {files.length > 0 && (
                  <button onClick={clearAll} disabled={isAnalyzing} className="px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-900/20 text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Limpar
                  </button>
                )}
                
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !hasPending || usageCount >= maxCredits}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold shadow-lg transition-all ${isAnalyzing || !hasPending || usageCount >= maxCredits ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95 shadow-blue-900/20'}`}
                >
                  {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</> : usageCount >= maxCredits ? <><AlertTriangle className="w-5 h-5" /> Sem Créditos</> : !hasPending && files.length > 0 ? <><CheckCircle2 className="w-5 h-5" /> Concluído</> : <><Play className="w-5 h-5 fill-current" /> Iniciar Triagem</>}
                </button>
              </div>
           </div>
        </div>

        <div className="space-y-4 min-h-[300px]">
          {files.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <RefreshCcw className="w-12 h-12 mb-4 opacity-20" />
                <p>Nenhuma análise iniciada.</p>
             </div>
          ) : (
            files.map(file => (
               <div key={file.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {file.status === AnalysisStatus.COMPLETED && <AnalysisResultCard candidate={file} />}
                  {file.status === AnalysisStatus.ANALYZING && (
                    <div className="bg-slate-900 border border-blue-900/30 p-6 rounded-xl flex items-center gap-4 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                       <Loader2 className="w-6 h-6 text-blue-500 animate-spin relative z-10" />
                       <div className="relative z-10">
                          <h4 className="text-white font-medium">Analisando {file.file.name}...</h4>
                          <p className="text-sm text-slate-400">Verificando requisitos e calculando match score.</p>
                       </div>
                    </div>
                  )}
                  {file.status === AnalysisStatus.ERROR && (
                    <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <AlertTriangle className="text-red-500" />
                          <div>
                            <p className="text-red-400 font-medium">{file.file.name} - Falha na análise</p>
                            <p className="text-xs text-red-500/70">{file.errorMessage}</p>
                          </div>
                       </div>
                       <button onClick={() => removeFile(file.id)} className="text-red-400 hover:text-white text-sm underline">Remover</button>
                    </div>
                  )}
                  {file.status === AnalysisStatus.IDLE && (
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex justify-between items-center opacity-60">
                       <span className="text-slate-400">{file.file.name}</span>
                       <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase tracking-wide">Pendente</span>
                    </div>
                  )}
               </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};