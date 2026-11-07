import React, { useState } from 'react';
import { FoodDishSample } from '../types/food';
import { SessionHistoryItem } from './AttributeTrendPanel';
import { FileText, Download, Printer, X, CheckCircle2, TrendingUp, Sparkles, Clock, Calendar } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDish: FoodDishSample;
  sessionHistory: SessionHistoryItem[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  currentDish,
  sessionHistory,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Compute session statistics
  const totalAnalyzed = sessionHistory.length;
  const avgCrisp = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.crispiness, 0) / totalAnalyzed)
    : 0;
  const avgUmami = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.umami, 0) / totalAnalyzed)
    : 0;
  const avgCook = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.bakedOrFried, 0) / totalAnalyzed)
    : 0;
  const avgProtein = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.proteinDensity, 0) / totalAnalyzed)
    : 0;

  // JSON Download
  const handleDownloadJSON = () => {
    const reportData = {
      reportTitle: 'FoodVision MS-CNN Attribute Classification Report',
      generatedAt: now.toISOString(),
      sessionSummary: {
        totalDishesClassified: totalAnalyzed,
        averageCrispinessIndex: `${avgCrisp}%`,
        averageUmamiProfile: `${avgUmami}%`,
        averageCookingStateConfidence: `${avgCook}%`,
        averageProteinDensity: `${avgProtein}%`,
      },
      currentDishEvaluation: {
        name: currentDish.name,
        cuisine: currentDish.cuisine,
        scaleAnalysis: {
          microScale: currentDish.scaleAnalysis.microScale,
          mesoScale: currentDish.scaleAnalysis.mesoScale,
          macroScale: currentDish.scaleAnalysis.macroScale,
        },
        classifiedAttributes: {
          cookingState: currentDish.attributes.cookingState,
          texture: currentDish.attributes.texture,
          dietary: currentDish.attributes.dietary,
          cuisine: currentDish.attributes.cuisine,
          flavor: currentDish.attributes.flavor,
          nutrition: currentDish.attributes.nutrition,
        },
        sensoryRadarVector: currentDish.radarSensoryVector,
      },
      sessionHistoricalTrend: sessionHistory.map((item, index) => ({
        index: index + 1,
        timestamp: item.timestamp,
        dishName: item.dishName,
        crispiness: `${item.crispiness}%`,
        umami: `${item.umami}%`,
        bakedOrFried: `${item.bakedOrFried}%`,
        vegetarian: `${item.vegetarian}%`,
        proteinDensity: `${item.proteinDensity}%`,
        topDetectedFeature: item.topAttribute,
      })),
      engineMetadata: {
        architecture: 'Multi-Scale Convolutional Neural Network (MS-CNN)',
        lossFunction: 'Asymmetric Loss (ASL)',
        benchmarkReference: 'IBM Food-101 Attribute Taxonomy',
        version: '1.3.0',
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `foodvision_report_${now.toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('json');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Printable HTML / PDF trigger
  const handlePrintPDF = () => {
    window.print();
    setDownloadSuccess('pdf');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_20px_60px_-15px_rgba(40,30,20,0.18)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8E4DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] border border-[#E0D8CC] flex items-center justify-center text-stone-800">
              <FileText className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-heading">
                Food Classification Session Report
              </h2>
              <div className="text-xs text-stone-500 font-mono flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dateStr}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeStr}</span>
                </span>
                <span>·</span>
                <span>{totalAnalyzed} Samples Logged</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 bg-[#F5F2EB] hover:bg-[#ECE7DE] text-stone-900 rounded-xl text-xs sm:text-sm font-semibold border border-[#DDD7CD] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-stone-800" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Download Raw JSON Report"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Close Dialog (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-xs font-mono text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {downloadSuccess === 'json'
                  ? 'JSON report file generated and downloaded successfully.'
                  : 'Opening print dialog. Select "Save as PDF" in your print options.'}
              </span>
            </span>
          </div>
        )}

        {/* Scrollable Report Content Preview */}
        <div id="printable-report" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#FAF8F5]">
          {/* Executive Summary Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <div className="border-b border-[#E8E4DC] pb-3 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-stone-900">
                1. Executive Session Summary
              </h3>
              <span className="text-xs font-mono text-stone-500 font-semibold uppercase">
                Aggregated Metrics
              </span>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              This report captures fine-grained multi-scale attribute predictions from the current inspection session, utilizing the Multi-Scale Convolutional Neural Network (MS-CNN) architecture trained with Asymmetric Loss (ASL) and benchmarked against IBM Food-101 ontology.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                <div className="text-xs font-mono text-stone-500 font-semibold uppercase">Total Dishes</div>
                <div className="text-2xl font-bold text-stone-900 font-mono">{totalAnalyzed}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                <div className="text-xs font-mono text-stone-500 font-semibold uppercase">Avg Crispiness</div>
                <div className="text-2xl font-bold text-[#C26D43] font-mono">{avgCrisp}%</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                <div className="text-xs font-mono text-stone-500 font-semibold uppercase">Avg Umami</div>
                <div className="text-2xl font-bold text-[#2A5C43] font-mono">{avgUmami}%</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                <div className="text-xs font-mono text-stone-500 font-semibold uppercase">Avg Cook State</div>
                <div className="text-2xl font-bold text-amber-700 font-mono">{avgCook}%</div>
              </div>
            </div>
          </div>

          {/* Current Dish Evaluation Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <div className="border-b border-[#E8E4DC] pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-stone-900">
                  2. Active Dish Classification: {currentDish.name}
                </h3>
                <div className="text-xs font-mono text-stone-500 mt-0.5">
                  Origin: <strong className="text-stone-800">{currentDish.cuisine}</strong> · Receptive Field Focus: 3×3 (Micro) to 15×15+ (Macro)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-2">
                <div className="font-bold text-stone-900 text-sm font-heading">
                  Micro-Scale (3×3 Conv) Textures
                </div>
                <div className="text-stone-600 font-sans">
                  {currentDish.scaleAnalysis.microScale.primaryTextualTexture}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentDish.scaleAnalysis.microScale.detectedFeatures.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white border border-[#E0D8CC] text-stone-800">
                      #{f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-2">
                <div className="font-bold text-stone-900 text-sm font-heading">
                  Meso-Scale (7×7 Conv) Ingredients
                </div>
                <div className="text-stone-600 font-sans">
                  Boundary Clarity: {(currentDish.scaleAnalysis.mesoScale.boundaryClarity * 100).toFixed(0)}%
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentDish.scaleAnalysis.mesoScale.detectedIngredients.map((ing, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white border border-[#E0D8CC] text-stone-800">
                      • {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Predictions Table */}
            <div className="pt-2">
              <h4 className="text-sm font-bold text-stone-900 font-heading mb-2">
                Top Classified Attributes Across 6 Dimensions
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border border-[#E8E4DC] rounded-xl overflow-hidden">
                  <thead className="bg-[#F5F2EB] text-stone-700 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Dimension</th>
                      <th className="py-2.5 px-3">Top Detected Attribute</th>
                      <th className="py-2.5 px-3 text-right">Confidence</th>
                      <th className="py-2.5 px-3 text-right">Threshold</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DC] bg-white">
                    {[
                      { dim: 'Cooking State', item: currentDish.attributes.cookingState[0] },
                      { dim: 'Texture & Mouthfeel', item: currentDish.attributes.texture[0] },
                      { dim: 'Dietary & Allergen', item: currentDish.attributes.dietary[0] },
                      { dim: 'Cuisine Tradition', item: currentDish.attributes.cuisine[0] },
                      { dim: 'Flavor Profile', item: currentDish.attributes.flavor[0] },
                      { dim: 'Nutritional Density', item: currentDish.attributes.nutrition[0] },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="py-2.5 px-3 text-stone-600">{row.dim}</td>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">{row.item?.name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-stone-900 tabular-nums">
                          {Math.round((row.item?.confidence || 0) * 100)}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-stone-500 tabular-nums">0.50</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900 text-white">
                            POSITIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recharts Session Historical Trend Log Table */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <div className="border-b border-[#E8E4DC] pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-stone-900">
                  3. Historical Session Attribute Trajectory (Recharts Dataset)
                </h3>
                <div className="text-xs font-mono text-stone-500 mt-0.5">
                  Complete sequential log of items evaluated during this browser session
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-[#E8E4DC] rounded-xl overflow-hidden">
                <thead className="bg-[#F5F2EB] text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Dish Identifier</th>
                    <th className="py-2.5 px-3 text-right">Crispiness</th>
                    <th className="py-2.5 px-3 text-right">Umami</th>
                    <th className="py-2.5 px-3 text-right">Cooked</th>
                    <th className="py-2.5 px-3 text-right">Vegetarian</th>
                    <th className="py-2.5 px-3 text-right">Protein</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC] bg-white">
                  {sessionHistory.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 text-stone-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-stone-500">{entry.timestamp}</td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900 font-sans">
                        {entry.dishName}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#C26D43] font-bold tabular-nums">
                        {entry.crispiness}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#2A5C43] font-bold tabular-nums">
                        {entry.umami}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-700 font-bold tabular-nums">
                        {entry.bakedOrFried}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-800 font-bold tabular-nums">
                        {entry.vegetarian}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-700 font-bold tabular-nums">
                        {entry.proteinDensity}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
