import React, { useCallback } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X } from 'lucide-react';
import { CandidateFile, AnalysisStatus } from '../types';

interface FileUploadProps {
  files: CandidateFile[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesAdded, onRemoveFile, disabled }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 flex flex-col h-full">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-lg font-semibold text-white">
          2. Upload de Currículos
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Adicione PDFs ou imagens (PNG/JPG) dos currículos.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="relative group">
          <input
            type="file"
            multiple
            accept=".pdf,image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          />
          <div className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
            flex flex-col items-center justify-center gap-3
            ${disabled ? 'bg-slate-900 border-slate-800' : 'bg-slate-800/50 border-slate-700 group-hover:border-blue-500 group-hover:bg-slate-800'}
          `}>
            <div className="bg-slate-800 p-3 rounded-full shadow-sm border border-slate-700">
              <UploadCloud className={`w-6 h-6 ${disabled ? 'text-slate-600' : 'text-blue-500'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                Clique ou arraste arquivos aqui
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, PNG ou JPG (Max 5MB)
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg group hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${file.mimeType === 'application/pdf' ? 'bg-red-900/20 text-red-400' : 'bg-blue-900/20 text-blue-400'}`}>
                    {file.mimeType === 'application/pdf' ? <FileText size={18} /> : <ImageIcon size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.file.size / 1024).toFixed(0)} KB • {file.status === AnalysisStatus.COMPLETED ? 'Analisado' : file.status === AnalysisStatus.ANALYZING ? 'Analisando...' : 'Pendente'}
                    </p>
                  </div>
                </div>
                {!disabled && file.status !== AnalysisStatus.ANALYZING && (
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
                    title="Remover arquivo"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};