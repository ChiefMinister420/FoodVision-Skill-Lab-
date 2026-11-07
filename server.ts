import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google GenAI client if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health / Status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Multi-scale food attribute analysis
app.post('/api/analyze-food', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', dishName } = req.body;

    if (!imageBase64 && !dishName) {
      return res.status(400).json({ error: 'Either imageBase64 or dishName must be provided' });
    }

    if (!ai || !process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured on server',
        fallbackAvailable: true,
      });
    }

    // Call Gemini 3.8 Flash with structured schema
    const prompt = `Analyze this food dish image through the lens of a Multi-Scale Convolutional Neural Network (MS-CNN) for fine-grained Food Attribute Classification (inspired by IBM Food-101 and FoodX-251 multi-attribute taxonomies).
Assess features at three spatial scales:
1. Micro-scale (fine receptive field: 3x3 / high-resolution spatial maps): Surface textures, crispness, glaze, crust crackle, seed flecks, sear marks.
2. Meso-scale (intermediate receptive field: 7x7 / mid-level semantic maps): Ingredient boundaries, sliced cuts of protein, noodle or grain structure, vegetable chunks, cheese melting.
3. Macro-scale (coarse receptive field: 15x15+ / global pooled maps): Dish geometry, plating style, soup vs dry dish, color harmony, culinary tradition.

Return realistic confidence scores (0.0 to 1.0) for the multi-label food attribute categories.`;

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedDish: { type: Type.STRING },
            culinaryOrigin: { type: Type.STRING },
            scaleAnalysis: {
              type: Type.OBJECT,
              properties: {
                microScale: {
                  type: Type.OBJECT,
                  properties: {
                    receptiveField: { type: Type.STRING },
                    detectedFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                    textureScore: { type: Type.NUMBER },
                    primaryTextualTexture: { type: Type.STRING },
                  },
                  required: ['receptiveField', 'detectedFeatures', 'textureScore', 'primaryTextualTexture'],
                },
                mesoScale: {
                  type: Type.OBJECT,
                  properties: {
                    receptiveField: { type: Type.STRING },
                    detectedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    boundaryClarity: { type: Type.NUMBER },
                    componentCountEstimate: { type: Type.INTEGER },
                  },
                  required: ['receptiveField', 'detectedIngredients', 'boundaryClarity', 'componentCountEstimate'],
                },
                macroScale: {
                  type: Type.OBJECT,
                  properties: {
                    receptiveField: { type: Type.STRING },
                    dishContext: { type: Type.STRING },
                    presentationStyle: { type: Type.STRING },
                    temperatureEstimate: { type: Type.STRING },
                  },
                  required: ['receptiveField', 'dishContext', 'presentationStyle', 'temperatureEstimate'],
                },
              },
              required: ['microScale', 'mesoScale', 'macroScale'],
            },
            attributes: {
              type: Type.OBJECT,
              properties: {
                cookingState: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      attribute: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                    },
                    required: ['attribute', 'confidence'],
                  },
                },
                texture: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      attribute: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                    },
                    required: ['attribute', 'confidence'],
                  },
                },
                dietary: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      attribute: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                    },
                    required: ['attribute', 'confidence'],
                  },
                },
                tasteProfile: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      attribute: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                    },
                    required: ['attribute', 'confidence'],
                  },
                },
                nutritionProfile: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      attribute: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                    },
                    required: ['attribute', 'confidence'],
                  },
                },
              },
              required: ['cookingState', 'texture', 'dietary', 'tasteProfile', 'nutritionProfile'],
            },
            gradCamAttentionPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  xPercent: { type: Type.NUMBER },
                  yPercent: { type: Type.NUMBER },
                  weight: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                  scaleLevel: { type: Type.STRING },
                },
                required: ['xPercent', 'yPercent', 'weight', 'reason', 'scaleLevel'],
              },
            },
          },
          required: ['identifiedDish', 'culinaryOrigin', 'scaleAnalysis', 'attributes', 'gradCamAttentionPoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing food image:', err);
    return res.status(500).json({
      error: 'Failed to analyze food attributes with AI vision model',
      message: err.message || String(err),
    });
  }
});

// Setup dev server with Vite middlewares, or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodVision MS-CNN Server running on http://0.0.0.0:${PORT} [${isDev ? 'development' : 'production'}]`);
  });
}

startServer().catch((err) => {
  console.error('Server boot failed:', err);
  process.exit(1);
});
