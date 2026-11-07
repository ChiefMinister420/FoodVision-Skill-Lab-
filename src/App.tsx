import React, { useState } from 'react';
import { Header } from './components/Header';
import { InferenceLab } from './components/InferenceLab';
import { DeveloperHubModal } from './components/DeveloperHubModal';
import { repoCodeFiles } from './data/repoCodeFiles';
import JSZip from 'jszip';

export default function App() {
  const [isDeveloperHubOpen, setIsDeveloperHubOpen] = useState(false);
  const [developerHubTab, setDeveloperHubTab] = useState<'architecture' | 'ibm-benchmarks' | 'repo-docker'>('architecture');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleOpenDeveloperHub = (tab: 'architecture' | 'ibm-benchmarks' | 'repo-docker' = 'architecture') => {
    setDeveloperHubTab(tab);
    setIsDeveloperHubOpen(true);
  };

  // Trigger full GitHub Repository ZIP generation and download
  const handleDownloadRepoZip = async () => {
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();

      // Add each repository file into the zip
      repoCodeFiles.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Generate the zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'foodvision-ms-cnn-repo.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create repo zip archive:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex flex-col font-sans selection:bg-stone-300 selection:text-stone-900 relative">
      {/* Subtle Studio Photography Texture Backdrop */}
      <div
        className="fixed inset-0 pointer-events-none opacity-15 mix-blend-multiply bg-cover bg-center"
        style={{ backgroundImage: `url('/src/assets/images/studio_beige_surface_1794019328567.jpg')` }}
      />

      {/* Top Bar with Hub Button */}
      <Header
        onOpenDeveloperHub={handleOpenDeveloperHub}
        onDownloadZip={handleDownloadRepoZip}
        isDownloadingZip={isDownloadingZip}
      />

      {/* Main Viewport Stage */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <InferenceLab onOpenDeveloperHub={handleOpenDeveloperHub} />
      </main>

      {/* Developer & System Hub Modal (hides Architecture, IBM Benchmarks, and GitHub Repo/Docker) */}
      <DeveloperHubModal
        isOpen={isDeveloperHubOpen}
        onClose={() => setIsDeveloperHubOpen(false)}
        initialTab={developerHubTab}
        onDownloadZip={handleDownloadRepoZip}
        isDownloadingZip={isDownloadingZip}
      />

      {/* Quiet Studio Footer */}
      <footer className="relative z-10 border-t border-[#E8E4DC] bg-white/80 backdrop-blur-xs py-5 px-6 text-xs text-stone-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-2 h-2 rounded-full bg-stone-900"></span>
            <span className="font-semibold text-stone-900">FoodVision</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Food Attribute Classification & Visual Feature Intelligence</span>
          </div>

          <div className="text-stone-500">
            Studio Photography & Visual Computing Environment
          </div>
        </div>
      </footer>
    </div>
  );
}
