import React, { useState } from 'react';
import { FoodDishSample } from '../types/food';
import { sampleDishes } from '../data/sampleDishes';
import { FeatureMapCanvas } from './FeatureMapCanvas';
import { RadarChart } from './RadarChart';
import { AttributeTrendPanel, SessionHistoryItem } from './AttributeTrendPanel';
import { ReportModal } from './ReportModal';
import { Upload, Sparkles, CheckCircle2, Layers, SlidersHorizontal, ChevronRight, FileDown } from 'lucide-react';

interface InferenceLabProps {
  onOpenDeveloperHub: (tab?: 'architecture' | 'ibm-benchmarks' | 'repo-docker') => void;
}

export const InferenceLab: React.FC<InferenceLabProps> = ({ onOpenDeveloperHub }) => {
  const [selectedDish, setSelectedDish] = useState<FoodDishSample>(sampleDishes[0]);
  const [activeScale, setActiveScale] = useState<'original' | 'micro' | 'meso' | 'macro' | 'gradcam'>('gradcam');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'cooking' | 'texture' | 'dietary' | 'cuisine' | 'flavor'>('all');
  const [customImageUploaded, setCustomImageUploaded] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Initial session history populated with diverse benchmark food detections
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([
    {
      timestamp: '10:14',
      dishName: 'Tempura Donburi',
      crispiness: 95,
      umami: 92,
      bakedOrFried: 96,
      vegetarian: 22,
      proteinDensity: 82,
      topAttribute: 'Crispy & Crunchy',
    },
    {
      timestamp: '10:18',
      dishName: 'Pizza Margherita',
      crispiness: 78,
      umami: 88,
      bakedOrFried: 98,
      vegetarian: 99,
      proteinDensity: 65,
      topAttribute: 'Chewy & Airy Dough',
    },
    {
      timestamp: '10:22',
      dishName: 'Kung Pao Chicken',
      crispiness: 85,
      umami: 96,
      bakedOrFried: 94,
      vegetarian: 2,
      proteinDensity: 92,
      topAttribute: 'Wok-Fried & Spicy',
    },
    {
      timestamp: '10:27',
      dishName: 'Greek Salad',
      crispiness: 92,
      umami: 62,
      bakedOrFried: 1,
      vegetarian: 99,
      proteinDensity: 45,
      topAttribute: 'Crisp & Raw Garden',
    },
    {
      timestamp: '10:31',
      dishName: 'French Croissant',
      crispiness: 98,
      umami: 45,
      bakedOrFried: 99,
      vegetarian: 98,
      proteinDensity: 45,
      topAttribute: 'Flaky & Laminated',
    },
  ]);

  const recordDishToHistory = (dish: FoodDishSample) => {
    const crisp = dish.radarSensoryVector.find((r) => r.axis === 'Crispiness')?.value || 80;
    const umamiVal = dish.radarSensoryVector.find((r) => r.axis === 'Umami')?.value || 85;
    const friedOrBaked = Math.round(
      ((dish.attributes.cookingState.find((c) => c.name.includes('Fried') || c.name.includes('Baked'))?.confidence || 0.8) * 100)
    );
    const veg = Math.round(
      ((dish.attributes.dietary.find((d) => d.name === 'Vegetarian')?.confidence || 0.5) * 100)
    );
    const protein = Math.round(
      ((dish.attributes.nutrition.find((n) => n.name.includes('Protein'))?.confidence || 0.7) * 100)
    );

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newEntry: SessionHistoryItem = {
      timestamp: timeStr,
      dishName: dish.name.split(' ').slice(0, 2).join(' '),
      crispiness: crisp,
      umami: umamiVal,
      bakedOrFried: friedOrBaked,
      vegetarian: veg,
      proteinDensity: protein,
      topAttribute: dish.scaleAnalysis.microScale.primaryTextualTexture,
    };

    setSessionHistory((prev) => [...prev, newEntry]);
  };

  const handleSelectDish = (dish: FoodDishSample) => {
    setSelectedDish(dish);
    setCustomImageUploaded(null);
    recordDishToHistory(dish);
  };

  const handleResetSession = () => {
    setSessionHistory([]);
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
        cuisine: 'Uploaded Food Sample',
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
            detectedIngredients: ['Primary produce/protein borders', 'Segment contours'],
            boundaryClarity: 0.84,
            componentCountEstimate: 3,
            description: 'Intermediate kernels isolate individual culinary boundaries.',
          },
          macroScale: {
            receptiveField: '15×15+ Dilated (RF: 75+)',
            dishContext: 'Plated food arrangement',
            presentationStyle: 'Centric presentation',
            temperatureEstimate: 'Estimated Warm/Ambient',
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
      recordDishToHistory(customSample);
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
        recordDishToHistory(updatedSample);
      }
    } catch (err) {
      console.warn('Backend API fallback triggered:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const attributeGroups = [
    { title: 'Cooking Method & Thermal State', key: 'cooking', data: selectedDish.attributes.cookingState },
    { title: 'Texture & Mouthfeel Profile', key: 'texture', data: selectedDish.attributes.texture },
    { title: 'Dietary & Allergen Boundaries', key: 'dietary', data: selectedDish.attributes.dietary },
    { title: 'Cuisine Culinary Tradition', key: 'cuisine', data: selectedDish.attributes.cuisine },
    { title: 'Flavor & Sensory Taste Spectrum', key: 'flavor', data: selectedDish.attributes.flavor },
    { title: 'Nutritional Density Profile', key: 'nutrition', data: selectedDish.attributes.nutrition },
  ].filter((grp) => activeCategoryFilter === 'all' || activeCategoryFilter === grp.key);

  return (
    <div className="space-y-8">
      {/* Studio Header on Matte Beige & Light Grey Surface */}
      <div className="relative rounded-2xl bg-white border border-[#E5E0D8] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        {/* Soft morning window light aura */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FFF8EE] to-transparent pointer-events-none rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-80" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-widest text-stone-600 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-900"></span>
              <span>Multi-Scale Convolutional Feature Intelligence · IBM Food Computing</span>
            </div>

            {/* Times New Roman Main Title */}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 font-heading text-balance leading-tight">
              Food Attribute Classification & Receptive Field Studio
            </h1>

            <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-2xl">
              Inspect multi-scale convolutional receptive fields (3×3 micro-texture, 7×7 meso-ingredients, 15×15+ macro-presentation) for high-accuracy food attribute prediction and session trend analysis.
            </p>
          </div>

          {/* Quick Hub Access & Download Report Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              <span>Download Report</span>
            </button>

            <button
              onClick={() => onOpenDeveloperHub('architecture')}
              className="px-4 py-2.5 bg-[#F5F2EB] hover:bg-[#ECE7DE] text-stone-900 text-sm font-semibold rounded-xl border border-[#DDD7CD] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-stone-800" />
              <span>Architecture & Code Hub</span>
              <ChevronRight className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Culinary Benchmark Discs Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-stone-700">
          <span className="font-heading uppercase tracking-wider text-base font-bold text-stone-900">
            Select Culinary Benchmark Dish:
          </span>
          <label className="text-stone-900 hover:text-stone-700 transition-colors flex items-center gap-2 cursor-pointer font-semibold text-sm">
            <Upload className="w-4 h-4 text-stone-800" />
            <span>Upload Custom Food Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {sampleDishes.map((dish) => {
            const isSelected = selectedDish.id === dish.id && !customImageUploaded;
            return (
              <button
                key={dish.id}
                onClick={() => handleSelectDish(dish)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2.5 ${
                  isSelected
                    ? 'border-stone-900 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-2 ring-stone-900/10'
                    : 'border-[#E5E0D8] bg-white/80 hover:bg-white hover:border-[#D5CFBF] text-stone-700 shadow-2xs'
                }`}
              >
                <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-stone-100">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-stone-950/85 backdrop-blur-xs text-xs font-mono px-2 py-0.5 rounded text-white font-semibold">
                    {dish.cuisine}
                  </div>
                </div>

                <div>
                  <div className="text-sm sm:text-base font-bold text-stone-900 truncate font-heading">
                    {dish.name}
                  </div>
                  <div className="text-xs text-stone-600 truncate mt-0.5 font-mono">
                    {dish.scaleAnalysis.microScale.primaryTextualTexture}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Grid: Left 2D Receptive Field Map, Right Multi-Attribute Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Pure 2D Planar Receptive Field Map */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-5 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-stone-900">
                <Layers className="w-5 h-5 text-stone-800" />
                <h3 className="font-heading text-lg sm:text-xl font-bold">
                  2D Receptive Field Stage
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500 font-semibold uppercase">
                Planar Activation
              </span>
            </div>

            {/* Segmented Scale Controller */}
            <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-[#F5F2EB] rounded-xl border border-[#E8E4DC] text-xs font-mono">
              <button
                onClick={() => setActiveScale('original')}
                className={`py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center text-xs sm:text-sm ${
                  activeScale === 'original'
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                RGB
              </button>
              <button
                onClick={() => setActiveScale('micro')}
                className={`py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center text-xs sm:text-sm ${
                  activeScale === 'micro'
                    ? 'bg-stone-900 text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Micro 3×3
              </button>
              <button
                onClick={() => setActiveScale('meso')}
                className={`py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center text-xs sm:text-sm ${
                  activeScale === 'meso'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Meso 7×7
              </button>
              <button
                onClick={() => setActiveScale('macro')}
                className={`py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center text-xs sm:text-sm ${
                  activeScale === 'macro'
                    ? 'bg-purple-700 text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Macro 15×15
              </button>
              <button
                onClick={() => setActiveScale('gradcam')}
                className={`py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center text-xs sm:text-sm ${
                  activeScale === 'gradcam'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Grad-CAM
              </button>
            </div>

            {/* 2D Feature Map Canvas */}
            <FeatureMapCanvas
              imageUrl={selectedDish.imageUrl}
              activeScale={activeScale}
              gradCamPoints={selectedDish.gradCamPoints}
              opacity={overlayOpacity}
              dishName={selectedDish.name}
            />

            {/* Heatmap Opacity Slider */}
            {activeScale !== 'original' && (
              <div className="flex items-center justify-between gap-3 px-1 text-sm">
                <span className="text-stone-700 font-mono text-xs sm:text-sm shrink-0 font-semibold">
                  Feature Heatmap Opacity
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full accent-stone-900 h-2 bg-[#E8E4DC] rounded-lg cursor-pointer"
                />
                <span className="font-mono text-stone-900 font-bold text-sm tabular-nums w-12 text-right">
                  {Math.round(overlayOpacity * 100)}%
                </span>
              </div>
            )}

            {/* Scale Explanation Card */}
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-sm sm:text-base font-heading">
                  {activeScale === 'micro' && 'Scale 1: Micro-Scale 3×3 High-Pass Filter'}
                  {activeScale === 'meso' && 'Scale 2: Meso-Scale Component Segmenter'}
                  {activeScale === 'macro' && 'Scale 3: Macro-Scale Global Receptive Field'}
                  {activeScale === 'gradcam' && 'Grad-CAM Multi-Head Backpropagation'}
                  {activeScale === 'original' && 'Raw Input Tensor (224×224×3 RGB)'}
                </h4>
                <span className="font-mono text-xs text-stone-700 bg-white px-2.5 py-1 rounded-md border border-[#E0D8CC] font-semibold">
                  {activeScale === 'micro' && selectedDish.scaleAnalysis.microScale.receptiveField}
                  {activeScale === 'meso' && selectedDish.scaleAnalysis.mesoScale.receptiveField}
                  {activeScale === 'macro' && selectedDish.scaleAnalysis.macroScale.receptiveField}
                  {activeScale === 'gradcam' && 'Stage 4 Attn'}
                  {activeScale === 'original' && '224×224 RGB'}
                </span>
              </div>

              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                {activeScale === 'micro' && selectedDish.scaleAnalysis.microScale.description}
                {activeScale === 'meso' && selectedDish.scaleAnalysis.mesoScale.description}
                {activeScale === 'macro' && selectedDish.scaleAnalysis.macroScale.description}
                {activeScale === 'gradcam' &&
                  'Gradient-weighted Class Activation Mapping computes the gradient of target attribute logits with respect to Stage-4 feature maps to localize decisive visual cues in 2D space.'}
                {activeScale === 'original' && selectedDish.description}
              </p>

              <div className="pt-1.5 flex flex-wrap gap-2 text-xs font-mono text-stone-600">
                {activeScale === 'micro' &&
                  selectedDish.scaleAnalysis.microScale.detectedFeatures.map((feat, i) => (
                    <span key={i} className="text-stone-900 font-semibold bg-white px-2 py-0.5 rounded border border-[#E5E0D8]">
                      #{feat}
                    </span>
                  ))}
                {activeScale === 'meso' &&
                  selectedDish.scaleAnalysis.mesoScale.detectedIngredients.map((ing, i) => (
                    <span key={i} className="text-amber-800 font-semibold bg-white px-2 py-0.5 rounded border border-[#E5E0D8]">
                      • {ing}
                    </span>
                  ))}
                {activeScale === 'macro' && (
                  <span className="text-purple-800 font-semibold bg-white px-2.5 py-1 rounded border border-[#E5E0D8]">
                    Context: {selectedDish.scaleAnalysis.macroScale.dishContext} · Temp: {selectedDish.scaleAnalysis.macroScale.temperatureEstimate}
                  </span>
                )}
              </div>
            </div>

            {/* Sensory Radar Vector Mini Panel */}
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading uppercase tracking-wider text-sm font-bold text-stone-900">
                  Sensory Vector Calibration
                </span>
                <span className="text-xs font-mono text-stone-500 font-medium">
                  Radar Space
                </span>
              </div>
              <RadarChart data={selectedDish.radarSensoryVector} size={240} />
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Multi-Attribute Predictions */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading flex items-center gap-2.5">
                  <span>Multi-Label Attribute Classification</span>
                  <span className="text-xs font-mono text-stone-800 bg-[#F5F2EB] px-2.5 py-1 rounded-md border border-[#E0D8CC] font-bold">
                    6 Orthogonal Axes
                  </span>
                </h3>
                <div className="text-xs sm:text-sm text-stone-600 mt-1">
                  Threshold: <strong className="text-stone-900 font-mono font-bold">0.50</strong> · Decision rule: Sigmoid multi-hot activations
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-2 bg-[#F5F2EB] hover:bg-[#ECE7DE] text-stone-900 text-xs sm:text-sm font-semibold rounded-xl border border-[#DDD7CD] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileDown className="w-3.5 h-3.5 text-stone-800" />
                  <span>Report</span>
                </button>

                <button
                  onClick={() => triggerAiAnalysis(selectedDish.imageUrl, selectedDish.name)}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isAnalyzing ? 'Extracting...' : 'Re-Analyze'}</span>
                </button>
              </div>
            </div>

            {/* Segmented Category Filter Bar */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#F5F2EB] rounded-xl border border-[#E8E4DC] overflow-x-auto text-xs sm:text-sm font-mono">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All 6 Axes
              </button>
              <button
                onClick={() => setActiveCategoryFilter('cooking')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'cooking'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cooking
              </button>
              <button
                onClick={() => setActiveCategoryFilter('texture')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'texture'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Texture
              </button>
              <button
                onClick={() => setActiveCategoryFilter('dietary')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'dietary'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Dietary
              </button>
              <button
                onClick={() => setActiveCategoryFilter('cuisine')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'cuisine'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cuisine
              </button>
              <button
                onClick={() => setActiveCategoryFilter('flavor')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'flavor'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Flavor
              </button>
            </div>

            {/* Attribute Groups with Proper Readable Spacing */}
            <div className="space-y-5 pt-1">
              {attributeGroups.map((group) => (
                <div
                  key={group.key}
                  className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-4 transition-all hover:shadow-[0_8px_25px_rgba(40,30,20,0.06)] duration-200"
                >
                  <div className="flex items-center justify-between text-sm border-b border-[#E8E4DC] pb-2.5">
                    <span className="font-heading uppercase tracking-wider text-base font-bold text-stone-900">
                      {group.title}
                    </span>
                    <span className="text-xs sm:text-sm font-mono text-stone-600 font-medium">
                      Top Read: <strong className="text-stone-900 font-bold">{group.data[0]?.name}</strong> ({((group.data[0]?.confidence || 0) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.data.map((item, idx) => {
                      const pct = Math.round(item.confidence * 100);
                      const isPositive = item.confidence >= (item.threshold || 0.5);

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm sm:text-base">
                            <span className="flex items-center gap-2">
                              {isPositive ? (
                                <CheckCircle2 className="w-4 h-4 text-stone-900 shrink-0" />
                              ) : (
                                <span className="w-4 h-4 flex items-center justify-center text-stone-400 shrink-0 font-mono text-xs">
                                  —
                                </span>
                              )}
                              <span className={`font-medium ${isPositive ? 'text-stone-950 font-bold' : 'text-stone-600'}`}>
                                {item.name}
                              </span>
                            </span>

                            <div className="flex items-center gap-2.5 font-mono text-sm sm:text-base tabular-nums">
                              <span className={isPositive ? 'text-stone-950 font-bold' : 'text-stone-500'}>
                                {pct}%
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                                isPositive
                                  ? 'bg-stone-900 text-white'
                                  : 'bg-[#ECE7DE] text-stone-600'
                              }`}>
                                {isPositive ? 'POSITIVE' : 'IDLE'}
                              </span>
                            </div>
                          </div>

                          {/* Confidence Bar */}
                          <div className="relative w-full h-2.5 bg-[#EBE5DB] rounded-full overflow-hidden shadow-inner">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                isPositive
                                  ? 'bg-gradient-to-r from-stone-800 via-stone-900 to-stone-950 shadow-[0_0_8px_rgba(0,0,0,0.25)]'
                                  : 'bg-stone-400/80'
                              }`}
                            />
                            {/* 50% Threshold marker */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-stone-500/60"
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

            {/* Note: The "Looking for the full PyTorch training loop or Dockerfile?" banner was completely removed per user request */}
          </div>
        </div>
      </div>

      {/* Recharts-based Historical Session Trend Analysis Panel */}
      <AttributeTrendPanel
        sessionHistory={sessionHistory}
        onResetSession={handleResetSession}
      />

      {/* Download Report Modal (Generates JSON or Print/PDF) */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentDish={selectedDish}
        sessionHistory={sessionHistory}
      />
    </div>
  );
};
