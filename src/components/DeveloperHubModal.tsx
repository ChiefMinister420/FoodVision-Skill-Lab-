import React, { useState, useEffect } from 'react';
import { X, Cpu, Database, Terminal, Download, Code, Layers } from 'lucide-react';
import { ArchitectureStudio } from './ArchitectureStudio';
import { IbmDatasetStudio } from './IbmDatasetStudio';
import { GitHubRepoStudio } from './GitHubRepoStudio';

interface DeveloperHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'architecture' | 'ibm-benchmarks' | 'repo-docker';
  onDownloadZip: () => void;
  isDownloadingZip?: boolean;
}

export const DeveloperHubModal: React.FC<DeveloperHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'architecture',
  onDownloadZip,
  isDownloadingZip,
}) => {
  const [activeHubTab, setActiveHubTab] = useState<'architecture' | 'ibm-benchmarks' | 'repo-docker'>(initialTab);
  const [selectedRepoFile, setSelectedRepoFile] = useState<string>('model/multiscale_cnn.py');

  useEffect(() => {
    setActiveHubTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Dialog Window */}
      <div
        className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-[0_20px_60px_-15px_rgba(40,30,20,0.18)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8E4DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5F2EB] border border-[#E0D8CC] flex items-center justify-center text-stone-800">
              <Cpu className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-stone-900 font-heading flex items-center gap-2">
                <span>Developer & Technical Systems Hub</span>
                <span className="text-xs font-mono uppercase bg-[#F2EDE4] text-stone-700 px-2 py-0.5 rounded border border-[#E5DFD5]">
                  Python · PyTorch · Docker
                </span>
              </div>
              <div className="text-xs sm:text-sm text-stone-600">
                Inspect MS-CNN neural architecture, IBM Food-101 benchmarks, or view all GitHub repo files and Docker deployment scripts.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadZip}
              disabled={isDownloadingZip}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingZip ? 'Archiving...' : 'Download Code (.zip)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Close Dialog (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Segmented Navigation Bar */}
        <div className="px-6 py-2.5 bg-[#F5F2EB] border-b border-[#E8E4DC] flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveHubTab('architecture')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeHubTab === 'architecture'
                ? 'bg-white text-stone-900 shadow-xs border border-[#E0D8CC] font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-stone-700" />
            <span>MS-CNN Architecture Studio</span>
          </button>

          <button
            onClick={() => setActiveHubTab('ibm-benchmarks')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeHubTab === 'ibm-benchmarks'
                ? 'bg-white text-stone-900 shadow-xs border border-[#E0D8CC] font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-stone-700" />
            <span>IBM Public Benchmarks & Ablation</span>
          </button>

          <button
            onClick={() => setActiveHubTab('repo-docker')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeHubTab === 'repo-docker'
                ? 'bg-white text-stone-900 shadow-xs border border-[#E0D8CC] font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-stone-700" />
            <span>GitHub Repository & Docker</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5]">
          {activeHubTab === 'architecture' && (
            <ArchitectureStudio
              onViewSourceCode={(path) => {
                setSelectedRepoFile(path);
                setActiveHubTab('repo-docker');
              }}
            />
          )}

          {activeHubTab === 'ibm-benchmarks' && <IbmDatasetStudio />}

          {activeHubTab === 'repo-docker' && (
            <GitHubRepoStudio
              initialFile={selectedRepoFile}
              onDownloadZip={onDownloadZip}
              isDownloadingZip={isDownloadingZip}
            />
          )}
        </div>
      </div>
    </div>
  );
};
