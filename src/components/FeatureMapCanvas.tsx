import React, { useRef, useEffect, useState } from 'react';
import { GradCamPoint } from '../types/food';

interface FeatureMapCanvasProps {
  imageUrl: string;
  activeScale: 'original' | 'micro' | 'meso' | 'macro' | 'gradcam';
  gradCamPoints: GradCamPoint[];
  opacity: number; // 0 to 1
  dishName: string;
}

export const FeatureMapCanvas: React.FC<FeatureMapCanvasProps> = ({
  imageUrl,
  activeScale,
  gradCamPoints,
  opacity,
  dishName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; val: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load and cache image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      renderVisualizer();
    };
    img.onerror = () => {
      setImageLoaded(false);
    };
  }, [imageUrl]);

  // Re-render when scale mode, opacity, or image changes
  useEffect(() => {
    if (imageLoaded) {
      renderVisualizer();
    }
  }, [activeScale, opacity, imageLoaded, gradCamPoints]);

  const renderVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 480;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    // Draw base image
    ctx.drawImage(imgRef.current, 0, 0, width, height);

    if (activeScale === 'original') {
      return;
    }

    // Generate procedural CNN activation simulation based on true image pixels + scale level
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Create offscreen heatmap buffer
    const heatmapCanvas = document.createElement('canvas');
    heatmapCanvas.width = width;
    heatmapCanvas.height = height;
    const heatCtx = heatmapCanvas.getContext('2d');
    if (!heatCtx) return;

    if (activeScale === 'gradcam') {
      // Draw Grad-CAM radial gradients
      gradCamPoints.forEach((pt) => {
        const cx = (pt.x / 100) * width;
        const cy = (pt.y / 100) * height;
        const radius = Math.min(width, height) * (0.28 * pt.weight);

        const radial = heatCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        radial.addColorStop(0, `rgba(239, 68, 68, ${pt.weight * 0.95})`);     // Deep red hot spot
        radial.addColorStop(0.35, `rgba(245, 158, 11, ${pt.weight * 0.75})`); // Amber
        radial.addColorStop(0.7, `rgba(16, 185, 129, ${pt.weight * 0.4})`);   // Green
        radial.addColorStop(1, 'rgba(6, 182, 212, 0)');                        // Cyan falloff

        heatCtx.fillStyle = radial;
        heatCtx.beginPath();
        heatCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        heatCtx.fill();
      });

      // Composite over base image with selected opacity
      ctx.globalAlpha = opacity;
      ctx.drawImage(heatmapCanvas, 0, 0);
      ctx.globalAlpha = 1.0;
      return;
    }

    // Multi-Scale Receptive Field Activations (Micro, Meso, Macro)
    const grayData = new Float32Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      grayData[idx] = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255.0;
    }

    const outputData = ctx.createImageData(width, height);

    if (activeScale === 'micro') {
      // Scale 1: Micro-Scale High-Frequency Sobel / Laplacian Edge & Texture Filter (3x3 RF)
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const gx =
            -1 * grayData[(y - 1) * width + (x - 1)] + 1 * grayData[(y - 1) * width + (x + 1)] +
            -2 * grayData[y * width + (x - 1)] + 2 * grayData[y * width + (x + 1)] +
            -1 * grayData[(y + 1) * width + (x - 1)] + 1 * grayData[(y + 1) * width + (x + 1)];

          const gy =
            -1 * grayData[(y - 1) * width + (x - 1)] - 2 * grayData[(y - 1) * width + x] - 1 * grayData[(y - 1) * width + (x + 1)] +
             1 * grayData[(y + 1) * width + (x - 1)] + 2 * grayData[(y + 1) * width + x] + 1 * grayData[(y + 1) * width + (x + 1)];

          const edge = Math.min(1.0, Math.sqrt(gx * gx + gy * gy) * 2.2);

          // Turbo / Phosphor Cyan colormap
          const pixelIdx = idx * 4;
          outputData.data[pixelIdx] = Math.floor(edge * 34);     // R
          outputData.data[pixelIdx + 1] = Math.floor(edge * 211); // G (Cyan)
          outputData.data[pixelIdx + 2] = Math.floor(edge * 238); // B
          outputData.data[pixelIdx + 3] = Math.floor(edge * 255 * opacity);
        }
      }
    } else if (activeScale === 'meso') {
      // Scale 2: Meso-Scale Ingredient Boundary Segmenter (7x7 / 11x11 RF)
      const step = 4;
      for (let y = 2; y < height - 2; y++) {
        for (let x = 2; x < width - 2; x++) {
          const idx = y * width + x;
          let localVar = 0;
          const centerVal = grayData[idx];

          for (let dy = -2; dy <= 2; dy += 2) {
            for (let dx = -2; dx <= 2; dx += 2) {
              const diff = grayData[(y + dy) * width + (x + dx)] - centerVal;
              localVar += diff * diff;
            }
          }
          const mesoScore = Math.min(1.0, Math.sqrt(localVar / 9.0) * 3.5);

          const pixelIdx = idx * 4;
          // Amber / Gold feature activation
          outputData.data[pixelIdx] = Math.floor(mesoScore * 245);
          outputData.data[pixelIdx + 1] = Math.floor(mesoScore * 158);
          outputData.data[pixelIdx + 2] = Math.floor(mesoScore * 11);
          outputData.data[pixelIdx + 3] = Math.floor(mesoScore * 255 * opacity);
        }
      }
    } else if (activeScale === 'macro') {
      // Scale 3: Macro-Scale Global Dish Geometry & Pooling (15x15+ RF)
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radial = Math.max(0, 1.0 - (dist / maxDist) * 1.3);
          const macroScore = Math.min(1.0, (radial * 0.6 + grayData[idx] * 0.4) * 1.4);

          const pixelIdx = idx * 4;
          // Deep Violet / Magenta semantic map
          outputData.data[pixelIdx] = Math.floor(macroScore * 168);
          outputData.data[pixelIdx + 1] = Math.floor(macroScore * 85);
          outputData.data[pixelIdx + 2] = Math.floor(macroScore * 247);
          outputData.data[pixelIdx + 3] = Math.floor(macroScore * 220 * opacity);
        }
      }
    }

    // Blend activations over base photo
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    offCanvas.getContext('2d')?.putImageData(outputData, 0, 0);

    ctx.drawImage(offCanvas, 0, 0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const normVal = Math.round(((pixel[0] + pixel[1] + pixel[2]) / (3 * 255)) * 100);
      setHoverCoord({ x, y, val: normVal });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#E5E0D8] bg-[#F7F5F0] shadow-xs group">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverCoord(null)}
        className="w-full h-auto aspect-4/3 block object-cover cursor-crosshair"
      />

      {/* Floating HUD Telemetry Badge */}
      <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#E5E0D8] flex items-center gap-2 text-[11px] font-mono text-stone-700 shadow-xs">
        <span className="text-stone-900 font-bold uppercase">
          {activeScale === 'original' && 'RGB Input Tensor (224×224×3)'}
          {activeScale === 'micro' && 'Scale 1: Micro 3×3 Conv (Edges & Grain)'}
          {activeScale === 'meso' && 'Scale 2: Meso 7×7 Conv (Ingredients)'}
          {activeScale === 'macro' && 'Scale 3: Macro 15×15+ Conv (Dish Shape)'}
          {activeScale === 'gradcam' && 'Grad-CAM Class Attribution'}
        </span>
        {activeScale !== 'original' && (
          <>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-stone-500 tabular-nums">α: {Math.round(opacity * 100)}%</span>
          </>
        )}
      </div>

      {/* Crosshair probe readout */}
      {hoverCoord && (
        <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#E5E0D8] font-mono text-[10px] text-stone-600 shadow-xs flex items-center gap-2">
          <span>X: <strong className="text-stone-900 tabular-nums">{hoverCoord.x}</strong></span>
          <span>Y: <strong className="text-stone-900 tabular-nums">{hoverCoord.y}</strong></span>
          <span className="text-stone-900 font-semibold">Act: <strong className="tabular-nums">{hoverCoord.val}%</strong></span>
        </div>
      )}

      {/* Grad-CAM Pin Annotations */}
      {activeScale === 'gradcam' &&
        gradCamPoints.map((pt, idx) => (
          <div
            key={idx}
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center group"
          >
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-rose-600 text-[8px] font-bold text-white">
              {idx + 1}
            </div>
            <div className="hidden group-hover:block absolute top-5 bg-stone-900 text-white text-[10px] font-sans px-2 py-0.5 rounded shadow border border-stone-800 whitespace-nowrap z-20">
              {pt.reason} ({(pt.weight * 100).toFixed(0)}%)
            </div>
          </div>
        ))}
    </div>
  );
};
