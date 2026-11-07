import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart2, History, RotateCcw, Activity } from 'lucide-react';

export interface SessionHistoryItem {
  timestamp: string;
  dishName: string;
  crispiness: number;
  umami: number;
  bakedOrFried: number;
  vegetarian: number;
  proteinDensity: number;
  topAttribute: string;
}

interface AttributeTrendPanelProps {
  sessionHistory: SessionHistoryItem[];
  onResetSession: () => void;
}

export const AttributeTrendPanel: React.FC<AttributeTrendPanelProps> = ({
  sessionHistory,
  onResetSession,
}) => {
  const [chartMode, setChartMode] = useState<'timeline' | 'distribution'>('timeline');

  // Compute aggregate statistics
  const totalAnalyzed = sessionHistory.length;
  const avgCrispiness = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.crispiness, 0) / totalAnalyzed)
    : 0;
  const avgUmami = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.umami, 0) / totalAnalyzed)
    : 0;
  const avgFriedOrBaked = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.bakedOrFried, 0) / totalAnalyzed)
    : 0;
  const avgVegetarian = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.vegetarian, 0) / totalAnalyzed)
    : 0;
  const avgProtein = totalAnalyzed > 0
    ? Math.round(sessionHistory.reduce((acc, curr) => acc + curr.proteinDensity, 0) / totalAnalyzed)
    : 0;

  // Aggregate distribution data for BarChart
  const distributionData = [
    { attribute: 'Crispy Texture', meanConfidence: avgCrispiness, fill: '#C26D43' },
    { attribute: 'Umami Richness', meanConfidence: avgUmami, fill: '#2A5C43' },
    { attribute: 'Cooked/Baked', meanConfidence: avgFriedOrBaked, fill: '#D97706' },
    { attribute: 'Plant / Veg', meanConfidence: avgVegetarian, fill: '#16A34A' },
    { attribute: 'Protein Density', meanConfidence: avgProtein, fill: '#2563EB' },
  ];

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
      {/* Header with Times New Roman Title and Bigger Text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E4DC] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-600 font-semibold mb-1">
            <TrendingUp className="w-4 h-4 text-stone-800" />
            <span>Session Intelligence · Recharts Visualizer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading tracking-tight">
            Historical Attribute Distribution & Trend Analysis
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
            Tracks multi-scale feature predictions across all food items evaluated during your active browser session.
          </p>
        </div>

        {/* Chart View Toggle & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-[#F5F2EB] rounded-xl border border-[#E0D8CC] text-xs font-mono">
            <button
              onClick={() => setChartMode('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium text-xs sm:text-sm ${
                chartMode === 'timeline'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sequence Timeline
            </button>
            <button
              onClick={() => setChartMode('distribution')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium text-xs sm:text-sm ${
                chartMode === 'distribution'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Mean Distribution
            </button>
          </div>

          <button
            onClick={onResetSession}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-[#F5F2EB] border border-[#E8E4DC] transition-colors cursor-pointer"
            title="Reset Session History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards with Bigger, Clearer Typography */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider font-semibold">
            Dishes Tested
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tabular-nums">
            {totalAnalyzed}
          </div>
          <div className="text-xs text-stone-500">Active session log</div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider font-semibold">
            Avg Crispiness
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#C26D43] font-mono tabular-nums">
            {avgCrispiness}%
          </div>
          <div className="text-xs text-stone-500">Micro-texture index</div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider font-semibold">
            Avg Umami
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2A5C43] font-mono tabular-nums">
            {avgUmami}%
          </div>
          <div className="text-xs text-stone-500">Sensory taste score</div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider font-semibold">
            Avg Cook State
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tabular-nums">
            {avgFriedOrBaked}%
          </div>
          <div className="text-xs text-stone-500">Fried / baked thermal</div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider font-semibold">
            Avg Protein
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700 font-mono tabular-nums">
            {avgProtein}%
          </div>
          <div className="text-xs text-stone-500">Macronutrient density</div>
        </div>
      </div>

      {/* Recharts Visualization Viewport */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-3">
        <div className="flex items-center justify-between text-sm font-semibold text-stone-800">
          <span className="font-heading text-base sm:text-lg">
            {chartMode === 'timeline'
              ? 'Multi-Scale Attribute Trajectory Across Analyzed Dishes'
              : 'Mean Confidence Distribution Across All Sample Tests'}
          </span>
          <span className="text-xs font-mono text-stone-500">
            {totalAnalyzed} Historical Samples
          </span>
        </div>

        <div className="h-72 sm:h-80 w-full pt-2">
          {chartMode === 'timeline' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sessionHistory}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCrisp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C26D43" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C26D43" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorUmami" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2A5C43" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2A5C43" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
                <XAxis
                  dataKey="dishName"
                  stroke="#78716C"
                  fontSize={12}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  stroke="#78716C"
                  fontSize={12}
                  domain={[0, 100]}
                  unit="%"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E0D8',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                  }}
                  formatter={(value: any) => [`${value}%`, '']}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }}
                />
                <Area
                  type="monotone"
                  dataKey="crispiness"
                  name="Crispy / Crunchy Texture"
                  stroke="#C26D43"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCrisp)"
                />
                <Area
                  type="monotone"
                  dataKey="umami"
                  name="Umami Savory Profile"
                  stroke="#2A5C43"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorUmami)"
                />
                <Area
                  type="monotone"
                  dataKey="bakedOrFried"
                  name="Cooked / Baked State"
                  stroke="#D97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCook)"
                />
                <Area
                  type="monotone"
                  dataKey="proteinDensity"
                  name="Protein Density"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProtein)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
                <XAxis
                  dataKey="attribute"
                  stroke="#78716C"
                  fontSize={12}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  stroke="#78716C"
                  fontSize={12}
                  domain={[0, 100]}
                  unit="%"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E0D8',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Mean Detection Rate']}
                />
                <Bar
                  dataKey="meanConfidence"
                  name="Mean Confidence"
                  radius={[8, 8, 0, 0]}
                  barSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
