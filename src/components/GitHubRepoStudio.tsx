import React, { useState } from 'react';
import { RepoFile } from '../types/food';
import { repoCodeFiles } from '../data/repoCodeFiles';
import { FileCode, Folder, Copy, Check, Download, Terminal, Container, Server, ShieldCheck, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';

interface GitHubRepoStudioProps {
  initialFile?: string;
  onDownloadZip: () => void;
  isDownloadingZip?: boolean;
}

export const GitHubRepoStudio: React.FC<GitHubRepoStudioProps> = ({
  initialFile = 'model/multiscale_cnn.py',
  onDownloadZip,
  isDownloadingZip,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(initialFile);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [copiedDockerCmd, setCopiedDockerCmd] = useState<string | null>(null);

  const selectedFile = repoCodeFiles.find((f) => f.path === selectedFilePath) || repoCodeFiles[0];

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedDockerCmd(key);
    setTimeout(() => setCopiedDockerCmd(null), 2000);
  };

  const handleDownloadSingleFile = (file: RepoFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
            Production GitHub Repository · Containerized Deployment
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading text-balance">
            Python AI/ML Codebase & Docker Deployment Center
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
            Complete, production-grade PyTorch and FastAPI files formatted for immediate Git repository initialization or Docker container deployment on local GPUs, IBM Cloud, or AWS.
          </p>
        </div>

        {/* Big Download ZIP Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onDownloadZip}
            disabled={isDownloadingZip}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingZip ? 'Generating Archive...' : 'Download Full Repo (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Docker Deployment Guide Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Container className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Container Deployment Quickstart
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Multi-Stage Build · Non-Root AppUser · Healthcheck Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1: Docker Build */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">1. Build Image</span>
              <button
                onClick={() => handleCopyCommand('docker build -t foodvision-ms-cnn:latest .', 'build')}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
              >
                {copiedDockerCmd === 'build' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">{copiedDockerCmd === 'build' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-slate-900/90 p-2 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-nowrap">
              docker build -t foodvision-ms-cnn:latest .
            </div>
            <p className="text-[11px] text-slate-500">
              Builds optimized multi-stage Python 3.11 runner image with cached wheels.
            </p>
          </div>

          {/* Step 2: Docker Run */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">2. Run Container</span>
              <button
                onClick={() => handleCopyCommand('docker run -d -p 8080:8080 --name foodvision-api foodvision-ms-cnn:latest', 'run')}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
              >
                {copiedDockerCmd === 'run' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">{copiedDockerCmd === 'run' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-slate-900/90 p-2 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-nowrap">
              docker run -d -p 8080:8080 foodvision-ms-cnn:latest
            </div>
            <p className="text-[11px] text-slate-500">
              Starts FastAPI service on port 8080 with 2 worker processes.
            </p>
          </div>

          {/* Step 3: Test API with curl */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">3. Test Inference</span>
              <button
                onClick={() => handleCopyCommand('curl -X POST -F "file=@dish.jpg" http://localhost:8080/predict', 'curl')}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
              >
                {copiedDockerCmd === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">{copiedDockerCmd === 'curl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-slate-900/90 p-2 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-nowrap">
              curl -X POST -F "file=@dish.jpg" localhost:8080/predict
            </div>
            <p className="text-[11px] text-slate-500">
              Returns multi-attribute JSON probabilities with sub-second latency.
            </p>
          </div>
        </div>
      </div>

      {/* Main File Explorer & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Repository File Tree */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-mono text-slate-300 uppercase tracking-wider font-semibold text-[11px] flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              <span>Repository Tree</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {repoCodeFiles.length} files
            </span>
          </div>

          <div className="space-y-1">
            {repoCodeFiles.map((file) => {
              const isSelected = selectedFilePath === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 shrink-0">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Syntax-Structured Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {/* File Action Bar */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-white">
                {selectedFile.path}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                · {selectedFile.content.split('\n').length} lines
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(selectedFile.content)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedFile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                <span>{copiedFile ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={() => handleDownloadSingleFile(selectedFile)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 text-[11px] text-slate-400 font-sans">
            {selectedFile.description}
          </div>

          {/* Code Window with Line Numbers */}
          <div className="p-4 overflow-x-auto bg-slate-950/90 font-mono text-xs leading-relaxed max-h-[580px] overflow-y-auto">
            <pre className="text-slate-300">
              {selectedFile.content.split('\n').map((line, index) => (
                <div key={index} className="table-row">
                  <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px] tabular-nums w-8">
                    {index + 1}
                  </span>
                  <span className="table-cell whitespace-pre">
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
