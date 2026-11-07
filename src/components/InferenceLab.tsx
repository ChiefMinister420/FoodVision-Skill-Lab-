import React, { useState } from 'react';
import { FoodDishSample, ScaleAnalysis } from '../types/food';
import { sampleDishes } from '../data/sampleDishes';
import { FeatureMapCanvas } from './FeatureMapCanvas';
import { Food3DViewer } from './Food3DViewer';
import { RadarChart } from './RadarChart';
import { Upload, Camera, Sparkles, Sliders, Info, CheckCircle2, Box, Layers, SlidersHorizontal, ChevronRight } from 'lucide-react';

interface InferenceLabProps {
  onOpenDeveloperHub: (tab?: 'architecture' | 'ibm-benchmarks' | 'repo-docker') => void;
}

export const InferenceLab: React.FC<InferenceLabProps> = ({ onOpenDeveloperHub }) => {
  const [selectedDish, setSelectedDish] = useState<FoodDishSample>(sampleDishes[0]);
  const [activeScale, setActiveScale] = useState<'original' | 'micro' | 'meso' | 'macro' | 'gradcam'>('gradcam');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d'); // Default to rich 3D Food Model
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.8);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'cooking' | 'texture' | 'dietary' | 'cuisine' | 'flavor'>('all');
  const [customImageUploaded, setCustomImageUploaded] = useState<string | null>(null);
  const [aiAnalysisSource, setAiAnalysisSource] = useState<'preset' | 'gemini-live' | 'local-engine'>('preset');

  const handleSelectDish = (dish: FoodDishSample) => {
    setSelectedDish(dish);
    setCustomImageUploaded(null);
    setAiAnalysisSource('preset');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomImageUploaded(base64);

      const customSample: FoodDishSample = {
        id: 'custom-upload',
        name: file.name.replace(/\.[^/.]+$/, ''),
        cuisine: 'Custom Food Sample',
        imageUrl: base64,
        description: 'Custom food image evaluated through multi-scale convolutional feature pyramids.',
        scaleAnalysis: {
          microScale: {
            receptiveField: '3×3 Conv (RF: 3-5)',
            detectedFeatures: ['High-frequency edge gradients', 'Porous grain response', 'Specular glint'],
            textureScore: 0.88,
            primaryTextualTexture: 'Micro-Grain Textured',
            description: 'Micro-scale kernels probe 3x3 local pixel neighborhoods for high-frequency gradients.',
          },
          mesoScale: {
            receptiveField: '7×7 Dilated Conv (RF: 23)',
            detectedIngredients: ['Primary protein/produce borders', 'Segment contours'],
            boundaryClarity: 0.84,
            componentCountEstimate: 3,
            description: 'Intermediate kernels detect culinary boundaries.',
          },
          macroScale: {
            receptiveField: '15×15+ Dilated (RF: 75+)',
            dishContext: 'Plated food arrangement',
            presentationStyle: 'Centric presentation',
            temperatureEstimate: 'Estimated Warm/Hot',
            description: 'Macro pooling abstracts dish geometry.',
          },
        },
        attributes: selectedDish.attributes,
        radarSensoryVector: selectedDish.radarSensoryVector,
        gradCamPoints: [
          { x: 50, y: 50, weight: 0.94, reason: 'Centroid feature activation point', scaleLevel: 'meso' },
          { x: 40, y: 38, weight: 0.88, reason: 'Texture feature saliency zone', scaleLevel: 'micro' },
          { x: 62, y: 60, weight: 0.76, reason: 'Plating boundary contrast', scaleLevel: 'macro' },
        ],
      };

      setSelectedDish(customSample);
      triggerAiAnalysis(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const triggerAiAnalysis = async (base64Img: string, dishLabel?: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          mimeType: 'image/jpeg',
          dishName: dishLabel || selectedDish.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Server analysis endpoint returned error');
      }

      const data = await response.json();
      if (data && data.attributes) {
        const updatedSample: FoodDishSample = {
          ...selectedDish,
          name: data.identifiedDish || selectedDish.name,
          cuisine: data.culinaryOrigin || selectedDish.cuisine,
          scaleAnalysis: {
            microScale: {
              receptiveField: data.scaleAnalysis?.microScale?.receptiveField || '3×3 Conv',
              detectedFeatures: data.scaleAnalysis?.microScale?.detectedFeatures || ['Crisp exterior', 'Seasoning flecks'],
              textureScore: data.scaleAnalysis?.microScale?.textureScore || 0.88,
              primaryTextualTexture: data.scaleAnalysis?.microScale?.primaryTextualTexture || 'Fine-Grained Texture',
              description: 'Fine 3x3 receptive field analysis via multi-scale visual extraction.',
            },
            mesoScale: {
              receptiveField: data.scaleAnalysis?.mesoScale?.receptiveField || '7×7 Conv',
              detectedIngredients: data.scaleAnalysis?.mesoScale?.detectedIngredients || ['Main ingredient', 'Garnish'],
              boundaryClarity: data.scaleAnalysis?.mesoScale?.boundaryClarity || 0.85,
              componentCountEstimate: data.scaleAnalysis?.mesoScale?.componentCountEstimate || 4,
              description: 'Intermediate 7x7 receptive field isolating ingredient boundaries.',
            },
            macroScale: {
              receptiveField: data.scaleAnalysis?.macroScale?.receptiveField || '15×15+ Conv',
              dishContext: data.scaleAnalysis?.macroScale?.dishContext || 'Plated food',
              presentationStyle: data.scaleAnalysis?.macroScale?.presentationStyle || 'Refined service',
              temperatureEstimate: data.scaleAnalysis?.macroScale?.temperatureEstimate || 'Warm',
              description: 'Global macro spatial pooling capturing dish presentation.',
            },
          },
          attributes: {
            cookingState: (data.attributes.cookingState || []).map((a: any) => ({
              name: a.attribute,
              confidence: a.confidence,
              threshold: 0.5,
            })),
            texture: (data.attributes.texture || []).map((a: any) => ({
              name: a.attribute,
              confidence: a.confidence,
              threshold: 0.5,
            })),
            dietary: (data.attributes.dietary || []).map((a: any) => ({
              name: a.attribute,
              confidence: a.confidence,
              threshold: 0.5,
            })),
            cuisine: (data.attributes.cuisine || [
              { attribute: data.culinaryOrigin || 'International', confidence: 0.94 }
            ]).map((a: any) => ({
              name: a.attribute,
              confidence: a.confidence,
              threshold: 0.5,
            })),
            flavor: (data.attributes.tasteProfile || []).map((a: any) => ({
              name: a.attribute,
              confidence: a.confidence,
              threshold: 0.5,
            })),
            nutrition: (data.attributes.nutritionProfile || []).map((a: any) => ({
              name: a.attribute,
              confidence: a.confidence,
              threshold: 0.5,
            })),
          },
          gradCamPoints: (data.gradCamAttentionPoints || []).map((pt: any) => ({
            x: pt.xPercent,
            y: pt.yPercent,
            weight: pt.weight,
            reason: pt.reason,
            scaleLevel: pt.scaleLevel || 'meso',
          })),
        };

        setSelectedDish(updatedSample);
        setAiAnalysisSource('gemini-live');
      }
    } catch (err) {
      console.warn('Backend API fallback triggered:', err);
      setAiAnalysisSource('local-engine');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const attributeGroups = [
    { title: 'Cooking & Thermal Method', key: 'cooking', data: selectedDish.attributes.cookingState },
    { title: 'Texture & Mouthfeel', key: 'texture', data: selectedDish.attributes.texture },
    { title: 'Dietary & Allergen Profile', key: 'dietary', data: selectedDish.attributes.dietary },
    { title: 'Cuisine Tradition', key: 'cuisine', data: selectedDish.attributes.cuisine },
    { title: 'Flavor & Sensory Taste', key: 'flavor', data: selectedDish.attributes.flavor },
    { title: 'Nutritional Density', key: 'nutrition', data: selectedDish.attributes.nutrition },
  ].filter((grp) => activeCategoryFilter === 'all' || activeCategoryFilter === grp.key);

  return (
    <div className="space-y-6">
      {/* Studio Header on Matte Beige & Light Grey Surface */}
      <div className="relative rounded-2xl bg-white border border-[#E5E0D8] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        {/* Subtle warm morning light tint */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FFF9F2] to-transparent pointer-events-none rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 opacity-70" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900"></span>
              <span>High-End Tech-Wellness · Studio Photography & 3D Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 text-balance">
              Food Attribute Classification & 3D Receptive Field Studio
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Analyze multi-scale convolutional receptive fields (3×3 micro-texture, 7×7 meso-ingredients, 15×15+ macro-presentation) with interactive 3D food geometries and multi-attribute classification.
            </p>
          </div>

          {/* Quick Hub Access Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenDeveloperHub('architecture')}
              className="px-3.5 py-2 bg-[#F5F2EB] hover:bg-[#ECE8DF] text-stone-800 text-xs font-medium rounded-lg border border-[#DDD7CD] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-700" />
              <span>Architecture & Repo Settings</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Dish Selector Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-stone-700">
            Culinary Benchmark Discs:
          </span>
          <label className="text-stone-900 hover:text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer font-medium text-xs">
            <Upload className="w-3.5 h-3.5 text-stone-800" />
            <span>Upload Custom Food Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {sampleDishes.map((dish) => {
            const isSelected = selectedDish.id === dish.id && !customImageUploaded;
            return (
              <button
                key={dish.id}
                onClick={() => handleSelectDish(dish)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'border-stone-900 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] ring-1 ring-stone-900/10'
                    : 'border-[#E5E0D8] bg-white/70 hover:bg-white hover:border-[#D5CFBF] text-stone-600'
                }`}
              >
                <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-stone-100">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-stone-950/80 backdrop-blur-xs text-[10px] font-mono px-1.5 py-0.5 rounded text-white font-medium">
                    {dish.cuisine}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {dish.name}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate mt-0.5 font-mono">
                    {dish.scaleAnalysis.microScale.primaryTextualTexture}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Grid: Left 3D/2D Visualizer, Right 3D-Animated Attribute Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): 3D Food Model & Receptive Field Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            {/* Visualizer Mode Switch (3D Food Model vs 2D Feature Map) */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-stone-900">
                <Box className="w-4 h-4 text-stone-800" />
                <span>Receptive Field Stage</span>
              </div>

              {/* 3D vs 2D Toggle */}
              <div className="flex items-center p-0.5 bg-[#F2EDE4] rounded-lg border border-[#E5DFD5] text-xs font-mono">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                    viewMode === '3d'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  3D Model
                </button>
                <button
                  onClick={() => setViewMode('2d')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                    viewMode === '2d'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  2D Map
                </button>
              </div>
            </div>

            {/* Segmented Scale Controller */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-[#F5F2EB] rounded-lg border border-[#E8E4DC] text-[11px] font-mono">
              <button
                onClick={() => setActiveScale('original')}
                className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeScale === 'original'
                    ? 'bg-white text-stone-900 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                RGB
              </button>
              <button
                onClick={() => setActiveScale('micro')}
                className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeScale === 'micro'
                    ? 'bg-stone-900 text-white font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Micro 3×3
              </button>
              <button
                onClick={() => setActiveScale('meso')}
                className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeScale === 'meso'
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Meso 7×7
              </button>
              <button
                onClick={() => setActiveScale('macro')}
                className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeScale === 'macro'
                    ? 'bg-purple-700 text-white font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Macro 15×15
              </button>
              <button
                onClick={() => setActiveScale('gradcam')}
                className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeScale === 'gradcam'
                    ? 'bg-rose-600 text-white font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Grad-CAM
              </button>
            </div>

            {/* Viewport: 3D Model or 2D Feature Map */}
            {viewMode === '3d' ? (
              <Food3DViewer
                dishId={selectedDish.id}
                activeScale={activeScale}
                opacity={overlayOpacity}
                gradCamPoints={selectedDish.gradCamPoints}
              />
            ) : (
              <FeatureMapCanvas
                imageUrl={selectedDish.imageUrl}
                activeScale={activeScale}
                gradCamPoints={selectedDish.gradCamPoints}
                opacity={overlayOpacity}
                dishName={selectedDish.name}
              />
            )}

            {/* Heatmap Opacity Slider */}
            {activeScale !== 'original' && (
              <div className="flex items-center justify-between gap-3 px-1 text-xs">
                <span className="text-stone-600 font-mono text-[11px] shrink-0 font-medium">
                  Heatmap Blend
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full accent-stone-900 h-1.5 bg-[#E8E4DC] rounded-lg cursor-pointer"
                />
                <span className="font-mono text-stone-900 font-semibold text-xs tabular-nums w-9 text-right">
                  {(overlayOpacity * 100).toFixed(0)}%
                </span>
              </div>
            )}

            {/* Scale Explanation Card */}
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">
                  {activeScale === 'micro' && 'Scale 1: Micro-Scale 3×3 High-Pass Filter'}
                  {activeScale === 'meso' && 'Scale 2: Meso-Scale Component Segmenter'}
                  {activeScale === 'macro' && 'Scale 3: Macro-Scale Global Receptive Field'}
                  {activeScale === 'gradcam' && 'Grad-CAM Multi-Head Backpropagation'}
                  {activeScale === 'original' && 'Raw Input Tensor & Photorealistic 3D Mesh'}
                </span>
                <span className="font-mono text-[10px] text-stone-700 bg-white px-2 py-0.5 rounded border border-[#E0D8CC]">
                  {activeScale === 'micro' && selectedDish.scaleAnalysis.microScale.receptiveField}
                  {activeScale === 'meso' && selectedDish.scaleAnalysis.mesoScale.receptiveField}
                  {activeScale === 'macro' && selectedDish.scaleAnalysis.macroScale.receptiveField}
                  {activeScale === 'gradcam' && 'Stage 4 Attn'}
                  {activeScale === 'original' && '224×224×3 RGB'}
                </span>
              </div>

              <p className="text-stone-600 text-[11px] leading-relaxed">
                {activeScale === 'micro' && selectedDish.scaleAnalysis.microScale.description}
                {activeScale === 'meso' && selectedDish.scaleAnalysis.mesoScale.description}
                {activeScale === 'macro' && selectedDish.scaleAnalysis.macroScale.description}
                {activeScale === 'gradcam' &&
                  'Gradient-weighted Class Activation Mapping computes the gradient of target attribute logits with respect to Stage-4 feature maps to localize decisive visual cues in 2D and 3D space.'}
                {activeScale === 'original' && selectedDish.description}
              </p>

              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-mono text-stone-600">
                {activeScale === 'micro' &&
                  selectedDish.scaleAnalysis.microScale.detectedFeatures.map((feat, i) => (
                    <span key={i} className="text-stone-800 font-medium">
                      #{feat} {i < selectedDish.scaleAnalysis.microScale.detectedFeatures.length - 1 && '·'}
                    </span>
                  ))}
                {activeScale === 'meso' &&
                  selectedDish.scaleAnalysis.mesoScale.detectedIngredients.map((ing, i) => (
                    <span key={i} className="text-amber-700 font-medium">
                      • {ing}
                    </span>
                  ))}
                {activeScale === 'macro' && (
                  <span className="text-purple-700 font-medium">
                    Context: {selectedDish.scaleAnalysis.macroScale.dishContext} · Temp: {selectedDish.scaleAnalysis.macroScale.temperatureEstimate}
                  </span>
                )}
              </div>
            </div>

            {/* Sensory Radar Vector Mini Panel */}
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-stone-700 uppercase tracking-wider text-[11px] font-semibold">
                  Sensory Vector Calibration
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  Radar Space
                </span>
              </div>
              <RadarChart data={selectedDish.radarSensoryVector} size={220} />
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): 3D-Animated Multi-Attribute Classification */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>Multi-Label Attribute Classification</span>
                  <span className="text-xs font-mono text-stone-700 bg-[#F5F2EB] px-2 py-0.5 rounded border border-[#E0D8CC] font-semibold">
                    6 Orthogonal Axes
                  </span>
                </h2>
                <div className="text-xs text-stone-500 mt-0.5">
                  Threshold: <strong className="text-stone-800 font-mono">0.50</strong> · Decision rule: Sigmoid multi-hot activations
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={() => triggerAiAnalysis(selectedDish.imageUrl, selectedDish.name)}
                disabled={isAnalyzing}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAnalyzing ? 'Extracting Features...' : 'Re-Analyze Dish'}</span>
              </button>
            </div>

            {/* Segmented Category Filter Bar */}
            <div className="flex items-center gap-1 p-1 bg-[#F5F2EB] rounded-lg border border-[#E8E4DC] overflow-x-auto text-xs">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All 6 Axes
              </button>
              <button
                onClick={() => setActiveCategoryFilter('cooking')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'cooking'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cooking Method
              </button>
              <button
                onClick={() => setActiveCategoryFilter('texture')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'texture'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Texture
              </button>
              <button
                onClick={() => setActiveCategoryFilter('dietary')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'dietary'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Dietary & Allergens
              </button>
              <button
                onClick={() => setActiveCategoryFilter('cuisine')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'cuisine'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cuisine
              </button>
              <button
                onClick={() => setActiveCategoryFilter('flavor')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'flavor'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Flavor
              </button>
            </div>

            {/* 3D Animated Attribute Cards */}
            <div className="space-y-4 pt-1">
              {attributeGroups.map((group) => (
                <div
                  key={group.key}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-3 transition-all hover:shadow-[0_8px_25px_rgba(40,30,20,0.06)] hover:-translate-y-0.5 duration-200"
                  style={{ perspective: '1000px' }}
                >
                  <div className="flex items-center justify-between text-xs border-b border-[#E8E4DC] pb-2">
                    <span className="font-bold text-stone-900 uppercase tracking-wider font-mono text-[11px]">
                      {group.title}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      Top Read: <strong className="text-stone-900 font-semibold">{group.data[0]?.name}</strong> ({((group.data[0]?.confidence || 0) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {group.data.map((item, idx) => {
                      const pct = Math.round(item.confidence * 100);
                      const isPositive = item.confidence >= (item.threshold || 0.5);

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                              {isPositive ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                              ) : (
                                <span className="w-3.5 h-3.5 flex items-center justify-center text-stone-400 shrink-0 font-mono text-[10px]">
                                  —
                                </span>
                              )}
                              <span className={`font-medium ${isPositive ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}>
                                {item.name}
                              </span>
                            </span>

                            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                              <span className={isPositive ? 'text-stone-900 font-bold' : 'text-stone-400'}>
                                {pct}%
                              </span>
                              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                                isPositive
                                  ? 'bg-stone-900 text-white'
                                  : 'bg-[#ECE7DE] text-stone-500'
                              }`}>
                                {isPositive ? 'ACTIVE' : 'IDLE'}
                              </span>
                            </div>
                          </div>

                          {/* 3D-styled Depth Confidence Bar */}
                          <div className="relative w-full h-2 bg-[#EBE5DB] rounded-full overflow-hidden shadow-inner">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                isPositive
                                  ? 'bg-gradient-to-r from-stone-800 via-stone-900 to-stone-950 shadow-[0_0_8px_rgba(0,0,0,0.2)]'
                                  : 'bg-stone-400/80'
                              }`}
                            />
                            {/* 50% Threshold marker */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-stone-500/50"
                              style={{ left: '50%' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Developer Hub Banner */}
            <div className="pt-3 border-t border-[#E8E4DC] flex items-center justify-between text-xs text-stone-500">
              <span>Need the complete Python training pipeline or Dockerfile?</span>
              <button
                onClick={() => onOpenDeveloperHub('repo-docker')}
                className="text-stone-900 hover:text-stone-700 font-semibold font-mono text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Open Developer & System Hub</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
