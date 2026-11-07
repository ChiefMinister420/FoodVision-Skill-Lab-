export interface AttributeItem {
  name: string;
  confidence: number;
  threshold?: number;
  description?: string;
}

export interface AttributeGroup {
  category: string;
  axis: 'cooking' | 'texture' | 'dietary' | 'cuisine' | 'flavor' | 'nutrition';
  attributes: AttributeItem[];
}

export interface ScaleAnalysis {
  microScale: {
    receptiveField: string; // e.g. "3x3 px (RF: 3-5)"
    detectedFeatures: string[];
    textureScore: number;
    primaryTextualTexture: string;
    description: string;
  };
  mesoScale: {
    receptiveField: string; // e.g. "7x7 - 11x11 px (RF: 15-27)"
    detectedIngredients: string[];
    boundaryClarity: number;
    componentCountEstimate: number;
    description: string;
  };
  macroScale: {
    receptiveField: string; // e.g. "15x15+ px (RF: 45-90+)"
    dishContext: string;
    presentationStyle: string;
    temperatureEstimate: string;
    description: string;
  };
}

export interface GradCamPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  weight: number; // 0.0 - 1.0
  reason: string;
  scaleLevel: 'micro' | 'meso' | 'macro';
}

export interface FoodDishSample {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string;
  description: string;
  scaleAnalysis: ScaleAnalysis;
  attributes: {
    cookingState: AttributeItem[];
    texture: AttributeItem[];
    dietary: AttributeItem[];
    cuisine: AttributeItem[];
    flavor: AttributeItem[];
    nutrition: AttributeItem[];
  };
  radarSensoryVector: {
    axis: string;
    value: number; // 0 - 100
  }[];
  gradCamPoints: GradCamPoint[];
}

export interface RepoFile {
  path: string;
  name: string;
  language: 'python' | 'dockerfile' | 'yaml' | 'markdown' | 'bash' | 'text';
  category: 'model' | 'training' | 'deployment' | 'docs' | 'api';
  description: string;
  content: string;
}
