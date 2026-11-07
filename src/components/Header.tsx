import React from 'react';
import { SlidersHorizontal, Download, Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  onOpenDeveloperHub: (tab?: 'architecture' | 'ibm-benchmarks' | 'repo-docker') => void;
  onDownloadZip: () => void;
  isDownloadingZip?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDeveloperHub,
  onDownloadZip,
  isDownloadingZip,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-[#E8E4DC] bg-white/95 sticky top-0 z-40 backdrop-blur-md shadow-[0_2px_12px_-3px_rgba(40,30,20,0.03)]">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <a
          href="/"
          onClick={(e) => e.preventDefault()}
          className="text-base font-bold tracking-tight text-stone-900 flex items-center gap-2 hover:text-stone-700 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-stone-900 inline-block"></span>
          <span>FoodVision MS-CNN</span>
        </a>
        <span className="hidden sm:inline-block text-xs font-mono text-stone-600 font-medium">v1.2</span>
      </div>

      {/* Zone 2: 4 clean single-line informational badges / direct feature links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
        <span className="text-stone-500 font-mono text-[11px]">
          Multi-Scale Receptive Fields (3×3 · 7×7 · 15×15+)
        </span>
        <span aria-hidden="true" className="text-stone-300">·</span>
        <span className="text-stone-500 font-mono text-[11px]">
          IBM Food-101 Benchmark
        </span>
        <span aria-hidden="true" className="text-stone-300">·</span>
        <span className="text-stone-500 font-mono text-[11px]">
          Asymmetric Loss (ASL)
        </span>
      </nav>

      {/* Zone 3: Settings/Developer Hub button & Download Zip */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* The requested button to hide Architecture, Repository, Docker under settings/hub */}
        <button
          onClick={() => onOpenDeveloperHub('architecture')}
          className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-[#F5F2EB] hover:bg-[#EFECE6] border border-[#E0D8CC] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
          title="Open Architecture, IBM Benchmarks, and Repository Files"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
          <span>Developer & System Hub</span>
        </button>

        <button
          onClick={onDownloadZip}
          disabled={isDownloadingZip}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDownloadingZip ? 'Archiving...' : 'Download Code (.zip)'}</span>
        </button>
      </div>
    </header>
  );
};
