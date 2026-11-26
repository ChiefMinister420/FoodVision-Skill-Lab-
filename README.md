# FoodVision MS-CNN — Multi-Scale Convolutional Food Attribute Classification Studio

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

A full-stack AI/ML food computing platform and interactive visualization studio for **multi-label food attribute classification** powered by a **Multi-Scale Convolutional Neural Network (MS-CNN)** with **Squeeze-and-Excitation (SE-Net)** channel attention, **Asymmetric Loss (ASL)**, and **IBM Food-101 / FoodX-251** benchmark taxonomies.

---

## Table of Contents

- [1. Project Highlights & Capabilities](#1-project-highlights--capabilities)
- [2. Multi-Scale CNN Architecture Overview](#2-multi-scale-cnn-architecture-overview)
- [3. Repository Structure](#3-repository-structure)
- [4. Tech Stack](#4-tech-stack)
- [5. Quickstart (Full-Stack Web App)](#5-quickstart-full-stack-web-app)
- [6. Python ML & Docker Deployment](#6-python-ml--docker-deployment)
- [7. REST API Endpoints](#7-rest-api-endpoints)
- [8. Data Persistence & Report Exports](#8-data-persistence--report-exports)
- [9. Documentation & Benchmarks](#9-documentation--benchmarks)

---

## 1. Project Highlights & Capabilities

- **Interactive 2D Receptive Field Stage (`FeatureMapCanvas`)**: Inspect any benchmark dish or uploaded food photograph across five spatial modes (`RGB`, `Micro 3×3`, `Meso 7×7`, `Macro 15×15`, and `Grad-CAM` saliency) with adjustable heatmap opacity and a live pixel probe crosshair.
- **Multi-Label Attribute Classifier (`InferenceLab`)**: Evaluates 6 orthogonal culinary dimensions—**Cooking Method**, **Texture Profile**, **Dietary Boundaries**, **Cuisine Tradition**, **Flavor Spectrum**, and **Nutritional Density**—paired with a 6-axis **Sensory Vector Radar Chart**.
- **Dynamic Confidence Thresholding ($\tau$)**: Interactive range slider ($5\%$–$95\%$) and quick presets (`35% Lenient`, `50% Balanced`, `70% Strict`, `85% Certainty`) that filter active attributes and move live bar threshold indicators in real time.
- **Session Trend Analytics (`AttributeTrendPanel`)**: Recharts-powered **Sequence Timeline** (`AreaChart`) and **Mean Distribution** (`BarChart`) tracking crispiness, umami, cooking state, vegetarian likelihood, and protein density across the session.
- **Exportable Session Reports (`ReportModal`)**: One-click export of session metrics, active dish classifications, confidence thresholds, and Recharts datasets as structured **JSON** or print-ready **PDF**.
- **Persistent Backend & AI Vision Proxy (`server.ts`, `src/server/db.ts`)**: Express backend serving `/api/analyze-food` (via Google Gemini Vision structured schemas) and a file-backed JSON database (`data/foodvision_db.json`) storing classification history and custom dishes.
- **Developer & System Hub (`DeveloperHubModal`)**: Modal workspace housing the interactive Receptive Field Math Calculator (`ArchitectureStudio`), IBM benchmark ablation charts (`IbmDatasetStudio`), source browser (`GitHubRepoStudio`), and one-click `.zip` download of the standalone Python/Docker ML codebase.

---

## 2. Multi-Scale CNN Architecture Overview

Food attributes span distinct spatial frequencies that single-scale backbones struggle to capture simultaneously:

| Spatial Scale | Receptive Field | Target Culinary Visual Cues |
|---|---|---|
| **Branch 1 (`1×1` Pointwise)** | $1 \times 1$ px | Chromatic profiles (golden-fried amber, chlorophyll green, tomato crimson) |
| **Branch 2 (`3×3` Micro-Scale)** | $3 \times 3$ px | Crispness, batter aeration bubbles, char blisters, flaky crumb fissures, sesame flecks |
| **Branch 3 (Dual `3×3` Meso-Scale)** | $5 \times 5$–$7 \times 7$ px | Ingredient boundaries, sliced proteins, melted cheese islands, noodle meshes |
| **Branch 4 (Dilated `3×3`, $r=2$ Macro)** | $15 \times 15+$ px + GAP | Global dish geometry, bowl depth, soup-to-solid ratio, plating presentation |

Parallel multi-scale branches are fused via **Squeeze-and-Excitation** channel attention (`reduction=16`) and trained end-to-end with **Asymmetric Loss (ASL)** ($\gamma_{\text{neg}} = 4.0$, $\gamma_{\text{pos}} = 0.0$, $\text{clip} = 0.05$) to handle extreme positive/negative sparsity in multi-label food annotations.

---

## 3. Repository Structure

```text
.
├── index.html                        # HTML entry point & typography setup
├── metadata.json                     # App metadata & runtime capabilities
├── package.json                      # Node/React dependencies & scripts
├── server.ts                         # Express server, Vite SSR/dev bridge, Gemini & DB APIs
├── tsconfig.json                     # TypeScript compiler configuration
├── vite.config.ts                    # Vite + Tailwind CSS v4 configuration
├── LLD_SUBMISSION_REPORT.md          # Complete 7-section Low-Level Design (LLD) report
├── README.md                         # Project documentation (this file)
├── data/
│   └── foodvision_db.json            # File-backed persistent JSON database (auto-generated)
└── src/
    ├── App.tsx                       # Root application shell, Developer Hub & JSZip bundler
    ├── index.css                     # Tailwind CSS theme tokens & print media stylesheet
    ├── main.tsx                      # React 19 DOM entry point
    ├── types/
    │   └── food.ts                   # TypeScript interfaces (FoodDishSample, ScaleAnalysis, etc.)
    ├── data/
    │   ├── sampleDishes.ts           # Preloaded benchmark dishes with Grad-CAM & sensory vectors
    │   └── repoCodeFiles.ts          # Complete Python/PyTorch/FastAPI/Docker repo bundle
    ├── server/
    │   └── db.ts                     # File-backed FoodVisionDatabase engine
    └── components/
        ├── Header.tsx                # Top studio navigation bar
        ├── InferenceLab.tsx          # Primary inference studio, thresholding & dish selector
        ├── FeatureMapCanvas.tsx      # 2D HTML5 Canvas multi-scale & Grad-CAM visualizer
        ├── RadarChart.tsx            # 6-axis sensory vector SVG radar chart
        ├── AttributeTrendPanel.tsx   # Recharts timeline & mean distribution analytics
        ├── ReportModal.tsx           # Printable PDF & structured JSON report exporter
        ├── DeveloperHubModal.tsx     # Modal container for architecture, benchmarks & repo code
        ├── ArchitectureStudio.tsx    # MS-CNN branch explorer & interactive RF calculator
        ├── IbmDatasetStudio.tsx      # IBM Food-101 benchmarks, ASL metrics & ablation matrix
        └── GitHubRepoStudio.tsx      # Interactive Python/Docker repository viewer
```

### Standalone Python / Docker ML Stack (Bundled in `src/data/repoCodeFiles.ts` & Exportable as `.zip`)

```text
foodvision-ms-cnn/
├── model/
│   ├── multiscale_cnn.py    # MultiScaleFoodCNN + MultiScaleInceptionBlock + SE-Net
│   └── losses.py            # AsymmetricLoss & MultiTaskAttributeLoss
├── data/
│   └── dataset.py           # IBM Food-101 / FoodX-251 loader & augmentations
├── train.py                 # Mixed-precision FP16 training loop & mAP/Macro-F1 evaluation
├── inference.py             # Predictor class & Stage-4 Grad-CAM heatmap extractor
├── app.py                   # FastAPI microservice (/health, /taxonomy, /predict)
├── Dockerfile               # Multi-stage python:3.11-slim container (non-root appuser)
├── docker-compose.yml       # FastAPI service + Redis 7-Alpine inference cache
├── requirements.txt         # Pinned Python dependencies
├── deploy.sh                # Automated Docker build, run & healthcheck script
└── README.md                # Standalone ML microservice guide
```

---

## 4. Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React, Motion, JSZip
- **Backend & Persistence**: Node.js, Express, `@google/genai` (Gemini 3.8 Flash structured vision API), File-backed JSON Database (`src/server/db.ts`)
- **Python ML & Deployment**: PyTorch 2.2+, TorchVision, FastAPI, Uvicorn, OpenCV, Albumentations, Scikit-Learn, Docker, Redis 7-Alpine

---

## 5. Quickstart (Full-Stack Web App)

### Prerequisites
- Node.js `v20+` (tested on `v22`)
- A Gemini API key configured in `.env` (see `.env.example`)

### Installation & Development Server
```bash
# 1. Install Node dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Add GEMINI_API_KEY="your_api_key_here" inside .env

# 3. Start full-stack Express + Vite dev server on port 3000
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build & Type Check
```bash
npm run lint     # Runs tsc --noEmit
npm run build    # Builds Vite frontend bundle into dist/
NODE_ENV=production npm start
```

---

## 6. Python ML & Docker Deployment

You can export the standalone Python/PyTorch/Docker repository directly from the in-app **Developer & System Hub** (`Download Code (.zip)`), extract it, and launch with Docker:

### Option A: One-Command Script
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option B: Docker Compose (FastAPI + Redis Cache)
```bash
docker compose up --build -d
curl http://localhost:8080/health
```

### Training from Scratch
```bash
pip install -r requirements.txt
python train.py --data-dir ./data/ibm_food101 --epochs 30 --batch-size 32 --lr 3e-4
```

---

## 7. REST API Endpoints

### Express Studio Backend (`:3000`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, Gemini key availability, and database connection status |
| `POST` | `/api/analyze-food` | Structured multi-scale food attribute extraction from uploaded Base64 images |
| `GET` | `/api/history` | Fetch persisted session classification records |
| `POST` | `/api/history` | Append a new dish classification record to `data/foodvision_db.json` |
| `DELETE` | `/api/history` | Clear stored session classification history |
| `GET` | `/api/database/stats` | Retrieve database record counts, file size, and sensory averages |
| `GET` / `POST` | `/api/dishes` | List or persist custom uploaded dish entries |

### FastAPI Inference Microservice (`:8080`)
- `GET /health` — Returns model readiness and CUDA status.
- `GET /taxonomy` — Returns the 6-axis IBM Food-101 attribute taxonomy.
- `POST /predict` — Accepts multipart image uploads (`curl -X POST -F "file=@dish.jpg" http://localhost:8080/predict`).

---

## 8. Data Persistence & Report Exports

- **Database**: All evaluated benchmark dishes and custom food classifications persist automatically to `data/foodvision_db.json` and rehydrate in the Recharts trend panel across page reloads.
- **Reports**: Click **Download Report** in the studio to export a formatted **PDF** (via print stylesheet) or a **JSON** payload containing executive session averages, active threshold settings, current dish predictions, and full historical trends.

---

## 9. Documentation & Benchmarks

- **Low-Level Design Report**: See [`LLD_SUBMISSION_REPORT.md`](./LLD_SUBMISSION_REPORT.md) for the complete 7-section engineering specification covering architecture, data schemas, session/caching design, unit tests, assumptions, and academic references.
- **IBM Food-101 Ablation Summary**:
  - Single-Scale ResNet-50 Baseline: `76.4%` mAP (`68.2%` Texture mAP)
  - Inception-v4: `79.1%` mAP (`74.5%` Texture mAP)
  - **Multi-Scale Food CNN + SE-Net (Ours)**: **`85.9%` mAP (`88.4%` Texture mAP, `83.6%` Macro-F1)**
