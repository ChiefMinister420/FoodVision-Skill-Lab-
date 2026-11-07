import React, { useState } from 'react';
import { Layers, Cpu, ArrowRight, Eye, Code, Zap, Calculator } from 'lucide-react';

interface ArchitectureStudioProps {
  onViewSourceCode: (path: string) => void;
}

export const ArchitectureStudio: React.FC<ArchitectureStudioProps> = ({ onViewSourceCode }) => {
  const [selectedBlock, setSelectedBlock] = useState<'b1' | 'b2' | 'b3' | 'b4' | 'se'>('b2');

  // Interactive Receptive Field Calculator State
  const [calcKernel, setCalcKernel] = useState<number>(3);
  const [calcStride, setCalcStride] = useState<number>(1);
  const [calcDilation, setCalcDilation] = useState<number>(2);
  const [calcDepth, setCalcDepth] = useState<number>(4);

  // Theoretical receptive field computation
  const effectiveKernel = calcKernel + (calcKernel - 1) * (calcDilation - 1);
  const calculatedRF = 1 + calcDepth * (effectiveKernel - 1) * calcStride;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
          Deep Convolutional Network Mechanics · Multi-Branch Receptive Fields
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
          Multi-Scale CNN Architecture Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-3xl">
          Food items possess textural and semantic hierarchies across distinct spatial frequencies. The Multi-Scale Food CNN branches into 4 parallel convolutional receptive fields combined with Channel Attention (SE-Net) to concurrently resolve micro-crispiness, ingredient cuts, and plating context.
        </p>
      </div>

      {/* Main Architecture Flow Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>End-to-End Computational Pipeline</span>
          </h2>
          <button
            onClick={() => onViewSourceCode('model/multiscale_cnn.py')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Inspect multiscale_cnn.py</span>
          </button>
        </div>

        {/* Pipeline Stage Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
          {/* Stage 0: Input */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Input Layer</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">RGB Tensor</div>
              <div className="text-[11px] font-mono text-cyan-400 mt-0.5 tabular-nums">224 × 224 × 3</div>
            </div>
            <div className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-900">
              Normalized ImageNet mean/std
            </div>
          </div>

          {/* Stage 1: Stem */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Stem Reducer</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">Conv7×7 + MaxPool</div>
              <div className="text-[11px] font-mono text-cyan-400 mt-0.5 tabular-nums">56 × 56 × 64</div>
            </div>
            <div className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-900">
              Stride 4 downsampling
            </div>
          </div>

          {/* Stage 2: MS-Block Stage 1 & 2 */}
          <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-800/50 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase">Stage 1–2 (Micro)</div>
              <div className="text-xs font-semibold text-white mt-1">MS-Inception × 4</div>
              <div className="text-[11px] font-mono text-cyan-300 mt-0.5 tabular-nums">28 × 28 × 128</div>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-cyan-900/40">
              Surface crispiness & grain
            </div>
          </div>

          {/* Stage 3: MS-Block Stage 3 */}
          <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-800/50 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-amber-400 uppercase">Stage 3 (Meso)</div>
              <div className="text-xs font-semibold text-white mt-1">MS-Inception × 2</div>
              <div className="text-[11px] font-mono text-amber-300 mt-0.5 tabular-nums">14 × 14 × 256</div>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-amber-900/40">
              Ingredient boundaries
            </div>
          </div>

          {/* Stage 4: MS-Block Stage 4 */}
          <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-800/50 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-purple-400 uppercase">Stage 4 (Macro)</div>
              <div className="text-xs font-semibold text-white mt-1">MS-Inception + SE</div>
              <div className="text-[11px] font-mono text-purple-300 mt-0.5 tabular-nums">7 × 7 × 512</div>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-purple-900/40">
              Global plating context
            </div>
          </div>

          {/* Stage 5: Multi-Head Classifier */}
          <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-800/50 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase">Multi-Task Heads</div>
              <div className="text-xs font-semibold text-white mt-1">6 Linear Heads</div>
              <div className="text-[11px] font-mono text-emerald-300 mt-0.5 tabular-nums">31 Sigmoid Logits</div>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-emerald-900/40">
              Asymmetric Loss (ASL)
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive: Multi-Scale Inception Block & SE-Net */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Parallel Branch Schematic */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Multi-Scale Inception Block Architecture</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Click branch to inspect details
            </span>
          </div>

          {/* Branch Selector buttons */}
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedBlock('b1')}
              className={`p-2 rounded transition-all cursor-pointer text-center ${
                selectedBlock === 'b1'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1×1 Conv
            </button>
            <button
              onClick={() => setSelectedBlock('b2')}
              className={`p-2 rounded transition-all cursor-pointer text-center ${
                selectedBlock === 'b2'
                  ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3×3 Micro
            </button>
            <button
              onClick={() => setSelectedBlock('b3')}
              className={`p-2 rounded transition-all cursor-pointer text-center ${
                selectedBlock === 'b3'
                  ? 'bg-amber-950 text-amber-300 font-semibold border border-amber-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual 3×3 Meso
            </button>
            <button
              onClick={() => setSelectedBlock('b4')}
              className={`p-2 rounded transition-all cursor-pointer text-center ${
                selectedBlock === 'b4'
                  ? 'bg-purple-950 text-purple-300 font-semibold border border-purple-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dilated Macro
            </button>
            <button
              onClick={() => setSelectedBlock('se')}
              className={`p-2 rounded transition-all cursor-pointer text-center ${
                selectedBlock === 'se'
                  ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SE-Net
            </button>
          </div>

          {/* Interactive Block Detail View */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            {selectedBlock === 'b1' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">Branch 1: Pointwise 1×1 Projection</span>
                  <span className="text-slate-500">Channels: C_in → C_out / 4</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Acts as a linear combination of cross-channel information without spatial mixing. Probes the dominant chromatic spectrum (e.g. golden-fried amber, chlorophyll green, tomato crimson) and compresses channel dimensionality before deeper convolutions.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  nn.Conv2d(in_channels, branch_channels, kernel_size=1, bias=False)
                </div>
              </div>
            )}

            {selectedBlock === 'b2' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">Branch 2: Micro-Scale 3×3 High-Pass Filter</span>
                  <span className="text-slate-500">Theoretical RF: 3×3 px</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dedicated to microscopic high-spatial-frequency surface phenomena. Captures batter aeration bubbles, panko crust roughness, cracked sesame seeds, char blisters on pizza rims, and dried herb particulates. Essential for predicting attributes like <em>Crispy</em>, <em>Flaky</em>, and <em>Seared</em>.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  nn.Sequential(Conv1x1, Conv3x3(padding=1))
                </div>
              </div>
            )}

            {selectedBlock === 'b3' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold">Branch 3: Meso-Scale Stacked Dual 3×3 (5×5 Equivalent)</span>
                  <span className="text-slate-500">Theoretical RF: 5×5 px</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Two stacked 3×3 convolutions provide an effective 5×5 receptive field with 28% fewer parameters than a single 5×5 kernel. Specializes in recognizing individual food components: sliced cuts of meat, noodle meshes, chopped broccoli florets, and melted mozzarella islands.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  nn.Sequential(Conv1x1, Conv3x3(pad=1), Conv3x3(pad=1))
                </div>
              </div>
            )}

            {selectedBlock === 'b4' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-400 font-bold">Branch 4: Macro-Scale Atrous / Dilated 3×3 (r=2)</span>
                  <span className="text-slate-500">Theoretical RF: 7×7 to 15×15 px</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dilated (atrous) convolutions insert holes into filter weights, expanding the spatial receptive field exponentially without downsampling the resolution. Enables the network to capture global dish geometry, bowl depth, and sauce pooling without losing fine coordinate precision.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  nn.Sequential(Conv1x1, Conv3x3(padding=2, dilation=2))
                </div>
              </div>
            )}

            {selectedBlock === 'se' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-rose-400 font-bold">Channel Attention (SE-Block) Recalibration</span>
                  <span className="text-slate-500">Reduction Ratio: r = 16</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Because different foods require different scale balances (a smooth soup prioritizes macro-context, while a fried snack prioritizes micro-textures), Squeeze-and-Excitation dynamically computes channel-wise attention weights s = σ(W₂ · δ(W₁ · z)) to emphasize the most informative scales.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  x * sigmoid(fc2(relu(fc1(adaptive_avg_pool2d(x)))))
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Receptive Field Mathematical Calculator */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Receptive Field (RF) Math Tool</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Interactive Simulator
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Theoretical receptive field size $RF_l$ determines how much of the original food photograph contributes to an activation unit at layer $l$:
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 text-center">
            RF_l = RF_{`{l-1}`} + (k_l - 1) × ∏ s_i
          </div>

          {/* Calculator Sliders */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Kernel Size (k):</span>
                <span className="text-cyan-400 font-bold">{calcKernel} × {calcKernel}</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="2"
                value={calcKernel}
                onChange={(e) => setCalcKernel(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Dilation Rate (r):</span>
                <span className="text-cyan-400 font-bold">{calcDilation} (k_eff = {effectiveKernel})</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={calcDilation}
                onChange={(e) => setCalcDilation(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Stacked Layers Depth (L):</span>
                <span className="text-cyan-400 font-bold">{calcDepth} layers</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={calcDepth}
                onChange={(e) => setCalcDepth(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Computed Output Display */}
          <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/40 space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Computed Receptive Field:</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-cyan-400 tabular-nums">
                {calculatedRF} × {calculatedRF}
              </span>
              <span className="text-xs font-mono text-slate-400">pixels in 224×224 input</span>
            </div>
            <div className="text-xs text-slate-400 pt-1 border-t border-slate-900">
              {calculatedRF <= 9 && '⚡ Optimal for Micro-Scale (Crispiness, seed texture, grill lines)'}
              {calculatedRF > 9 && calculatedRF <= 35 && '🥘 Optimal for Meso-Scale (Ingredient chunks, meat slices, noodles)'}
              {calculatedRF > 35 && '🍽️ Optimal for Macro-Scale (Full dish geometry, bowl arrangement)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
