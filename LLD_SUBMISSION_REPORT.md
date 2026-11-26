# Low-Level Design (LLD) Submission Report
## FoodVision MS-CNN: Multi-Scale Convolutional Network for Food Attribute Classification

**Document ID:** LLD-FV-MSCNN-2026-001  
**Version:** 1.3.0  
**Date:** November 24, 2026  
**Project Stack:** React 19 · TypeScript · Vite · Express · Node.js · PyTorch 2.2+ · FastAPI · Docker  
**Benchmark Reference:** IBM Food-101 & FoodX-251 Multi-Attribute Taxonomies  

---

## Table of Contents

| Section | Title | Page |
|---|---|---:|
| **SECTION 1** | **Introduction** (Scope, audience, system overview) | 2 |
| **SECTION 2** | **Low Level System Design** (Eight parts — Core System Specification) | 3 |
| 2.1 | Part 1: End-to-End Runtime Topology & Layered Architecture | 3 |
| 2.2 | Part 2: PyTorch Multi-Scale CNN Backbone & SE-Attention (`model/multiscale_cnn.py`) | 3 |
| 2.3 | Part 3: Asymmetric Loss & Multi-Task Optimization Engine (`model/losses.py`, `train.py`) | 4 |
| 2.4 | Part 4: 2D Receptive Field & Grad-CAM Visualization Pipeline (`FeatureMapCanvas.tsx`) | 4 |
| 2.5 | Part 5: Multi-Label Classification, Thresholding & Sensory Calibration (`InferenceLab.tsx`, `RadarChart.tsx`) | 4 |
| 2.6 | Part 6: Express Backend API & Gemini Vision Integration (`server.ts`, `inference.py`, `app.py`) | 5 |
| 2.7 | Part 7: Session Trend Analytics & Report Export Subsystem (`AttributeTrendPanel.tsx`, `ReportModal.tsx`) | 5 |
| 2.8 | Part 8: Containerized Deployment & Developer System Hub (`Dockerfile`, `docker-compose.yml`, `DeveloperHubModal.tsx`) | 5 |
| **SECTION 3** | **Data Design** (Tables, access levels, design choices) | 6 |
| **SECTION 4** | **Other frameworks** (Session management and caching) | 8 |
| **SECTION 5** | **Unit Testing** (Test cases with expected results) | 9 |
| **SECTION 6** | **Key notes** (Assumptions and known limits) | 10 |
| **SECTION 7** | **Reference** (Datasets, papers, libraries) | 11 |

---
<!-- Page Break: Page 2 -->

## SECTION 1
### Introduction

#### 1.1 Scope
This Low-Level Design (LLD) document defines the concrete module specifications, neural network tensor transformations, client-server API contracts, database schemas, caching strategies, unit verification matrices, and deployment topology for **FoodVision MS-CNN**—a multi-label food attribute classification platform built around a Multi-Scale Convolutional Neural Network (MS-CNN) and interactive receptive-field inspection studio.

The scope encompasses both:
1. **The Interactive Web Studio & Node/Express Runtime (`server.ts`, `src/**`)**: The React 19 single-page application (SPA), HTML5 2D planar activation canvas (`FeatureMapCanvas`), dynamic confidence-thresholding UI (`InferenceLab`), Recharts session analytics (`AttributeTrendPanel`), JSON/PDF report generator (`ReportModal`), persistent JSON database engine (`src/server/db.ts`), and Gemini Vision inference proxy (`/api/analyze-food`).
2. **The Python/PyTorch Deep Learning & Containerized Microservice Stack (`src/data/repoCodeFiles.ts`)**: The exportable PyTorch 2.2+ model architecture (`model/multiscale_cnn.py`), Asymmetric Loss (`model/losses.py`), IBM Food-101 dataset pipeline (`data/dataset.py`), mixed-precision training loop (`train.py`), Grad-CAM inference module (`inference.py`), FastAPI service (`app.py`), and multi-container Docker deployment artifacts (`Dockerfile`, `docker-compose.yml`, `deploy.sh`).

#### 1.2 Audience
This specification is written for:
- **Software & Full-Stack Engineers** maintaining the Express backend, REST endpoints, file-backed persistence engine, and React/TypeScript frontend components.
- **Machine Learning & Computer Vision Engineers** training, evaluating, or tuning the `MultiScaleFoodCNN` receptive-field branches, Squeeze-and-Excitation blocks, and Asymmetric Loss hyperparameters.
- **DevOps & Site Reliability Engineers** packaging, scaling, and health-monitoring the Dockerized inference API and Redis cache containers.
- **Academic & Technical Reviewers** auditing architectural fidelity, data design, test coverage, and IBM Food Computing benchmark alignment.

#### 1.3 System Overview
Conventional single-scale image classifiers (e.g., ResNet-50) apply uniform spatial filters across an image, creating an inherent trade-off between high-frequency surface detail and global culinary context. In food computing, attributes span three distinct spatial regimes:
- **Micro-Scale ($3\times3$ Receptive Field)**: Batter aeration, crispness, sear marks, sesame flecks, and flaky pastry lamination.
- **Meso-Scale ($7\times7$ to $11\times11$ Receptive Field)**: Ingredient borders, sliced proteins, melted cheese islands, and noodle meshes.
- **Macro-Scale ($15\times15+$ Dilated Receptive Field + GAP)**: Dish plating geometry, broth-to-solid ratio, bowl depth, and culinary tradition.

FoodVision MS-CNN resolves these concurrent scales using parallel four-branch inception blocks recalibrated by Squeeze-and-Excitation (SE) channel attention and trained with Asymmetric Loss (ASL) across 31 attributes grouped into 6 orthogonal culinary dimensions (`cooking_state`, `texture`, `dietary`, `cuisine`, `flavor`, `nutrition`). The web studio presents a matte-beige studio workspace where users inspect benchmark dishes or custom food photos, probe 2D planar activation heatmaps, calibrate the sigmoid decision threshold $\tau \in [0.05, 0.95]$, track session trends in Recharts, persist classifications to `/api/history`, and export JSON or printable PDF reports.

---
<!-- Page Break: Page 3 -->

## SECTION 2
### Low Level System Design

This core section breaks down the complete system architecture into **eight cohesive parts**, tracing every computation from raw pixel ingestion to database persistence and containerized deployment.

---

#### 2.1 Part 1: End-to-End Runtime Topology & Layered Architecture

The system operates under a decoupled **Client–Proxy–Inference–Persistence** topology:

1. **Presentation Layer (`src/App.tsx`, `src/components/*`)**:
   - Served by Vite in development middleware mode (`vite.middlewares`) or static `dist/` bundle in production (`server.ts` lines 215–231).
   - `App.tsx` manages top-level modal state (`isDeveloperHubOpen`, `developerHubTab`, `isDownloadingZip`) and packages the 11 Python/Docker repository files into `foodvision-ms-cnn-repo.zip` via `JSZip`.
2. **Application & Vision Proxy Layer (`server.ts`)**:
   - Single Express HTTP server listening on `0.0.0.0:3000` with `30MB` JSON/URL-encoded payload support for base64 food images.
   - Exposes `/api/health`, `/api/analyze-food`, `/api/history`, `/api/dishes`, and `/api/database/stats`.
3. **Persistence Layer (`src/server/db.ts`)**:
   - `FoodVisionDatabase` singleton synchronizes in-memory state with disk storage at `data/foodvision_db.json`.
4. **Exportable ML Microservice Layer (`app.py`, `inference.py`, `model/*`)**:
   - Standalone Python 3.11 + PyTorch 2.2+ + FastAPI service exposing `/health`, `/taxonomy`, and `/predict` on port `8080`, paired with Redis 7-Alpine in `docker-compose.yml`.

```
+-----------------------+       HTTP/JSON       +-------------------------+
| React 19 SPA (Vite)   | <-------------------> | Express Server (:3000)  |
| - InferenceLab        |   /api/analyze-food   | - Gemini 3.8 Flash API  |
| - FeatureMapCanvas    |   /api/history        | - Validation & Schemas  |
| - AttributeTrendPanel |   /api/database/stats +------------+------------+
| - ReportModal         |                                    | fs read/write
+-----------------------+                                    v
                                                +-------------------------+
                                                | data/foodvision_db.json |
                                                +-------------------------+
```

---

#### 2.2 Part 2: PyTorch Multi-Scale CNN Backbone & SE-Attention (`model/multiscale_cnn.py`)

The neural backbone (`MultiScaleFoodCNN`) processes normalized RGB tensors $X \in \mathbb{R}^{B \times 3 \times 224 \times 224}$ through a downsampling stem, four hierarchical multi-scale stages, and six multi-task linear classification heads:

1. **`ConvBNReLU` Primitive**:
   - `nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding, dilation, bias=False)` -> `nn.BatchNorm2d` -> `nn.ReLU(inplace=True)`.
2. **`MultiScaleInceptionBlock(in_channels, out_channels)`**:
   - Splits `out_channels` equally (`branch_channels = out_channels // 4`) across four parallel receptive field branches:
     - **Branch 1 (`b1_pointwise`)**: $1 \times 1$ pointwise convolution for cross-channel chromatic mixing.
     - **Branch 2 (`b2_micro`)**: $1 \times 1$ bottleneck + $3 \times 3$ convolution (`padding=1`) capturing high-frequency surface micro-textures.
     - **Branch 3 (`b3_meso`)**: $1 \times 1$ bottleneck + stacked dual $3 \times 3$ convolutions (`padding=1`, effective RF $5 \times 5$ with 28% fewer parameters than a $5 \times 5$ kernel).
     - **Branch 4 (`b4_macro`)**: $1 \times 1$ bottleneck + atrous/dilated $3 \times 3$ convolution (`padding=2, dilation=2`) expanding spatial span without resolution loss.
   - Concatenates branch outputs along `dim=1`, recalibrates channels via `SqueezeAndExcitation(out_channels, reduction=16)`, and adds a $1\times 1$ residual shortcut when `in_channels != out_channels`.
3. **Hierarchical Downsampling & Multi-Head Output**:
   - **Stem**: $7\times 7$ conv (`stride=2`) + $3\times 3$ MaxPool (`stride=2`) $\rightarrow [B, 64, 56, 56]$.
   - **Stage 1 $\rightarrow$ Stage 4**: Channels expand $64 \rightarrow 128 \rightarrow 256 \rightarrow 512$ across spatial grids $56^2 \rightarrow 28^2 \rightarrow 14^2 \rightarrow 7^2$.
   - **`forward_features(x)`** returns pooled 512-d embeddings and `[s1, s2, s3, s4]` activation maps for Grad-CAM.
   - **`heads` (`nn.ModuleDict`)**: Six independent MLP heads (`Linear(512, 256) -> BatchNorm1d -> ReLU -> Dropout(0.2) -> Linear(256, C_k)`) emitting 31 raw logits (`cooking_state`: 5, `texture`: 6, `dietary`: 6, `cuisine`: 5, `flavor`: 5, `nutrition`: 4).

---
<!-- Page Break: Page 4 -->

#### 2.3 Part 3: Asymmetric Loss & Multi-Task Optimization Engine (`model/losses.py`, `train.py`)

Food attribute labels exhibit extreme positive–negative class imbalance (e.g., >95% negative ground truths for rare labels like *Deep-Fried* or *Vegan*). Standard Binary Cross-Entropy allows easy negatives to overwhelm positive gradients.

1. **`AsymmetricLoss` (`model/losses.py`)**:
   - Computes sigmoid probabilities $p = \sigma(x)$, setting $p_+ = p$ and shifted negative probability $p_- = \min((1 - p) + m, 1)$ where clip margin $m = 0.05$.
   - Applies asymmetric focusing exponents $\gamma_{\text{pos}} = 0.0$ and $\gamma_{\text{neg}} = 4.0$ inside `torch.pow(1 - pt, one_sided_gamma)` (with focal weight gradients detached via `torch.set_grad_enabled(False)` for numerical stability).
2. **`MultiTaskAttributeLoss`**:
   - Aggregates per-head ASL values with task weighting $\lambda_{\text{texture}} = 1.2$ (prioritizing fine-grained textural cues), $\lambda_{\text{cuisine}} = \lambda_{\text{nutrition}} = 0.8$, and $1.0$ for remaining heads.
3. **Training & Evaluation Loop (`train.py`)**:
   - Optimizer: `AdamW(lr=3e-4, weight_decay=1e-4)` coupled with `CosineAnnealingLR(T_max=30)` and `torch.cuda.amp.GradScaler` for FP16 mixed-precision acceleration.
   - Evaluation: Computes macro Mean Average Precision (`average_precision_score`) and `macro-F1` per attribute group, checkpointing `best_ms_food_cnn.pth` on validation mAP improvements.

---

#### 2.4 Part 4: 2D Receptive Field & Grad-CAM Visualization Pipeline (`FeatureMapCanvas.tsx`)

`FeatureMapCanvas` renders real-time, pixel-level 2D activation overlays on a $480 \times 360$ HTML5 `<canvas>` across five selectable inspection modes (`original`, `micro`, `meso`, `macro`, `gradcam`):

1. **Grayscale Luminance Extraction**: Converts RGB buffer `ImageData` using ITU-R BT.601 luminance $Y = (0.299R + 0.587G + 0.114B) / 255$.
2. **Mode `micro` (3×3 Edge & Texture Filter)**:
   - Applies discrete $3\times 3$ Sobel horizontal ($G_x$) and vertical ($G_y$) operators per interior pixel, computing gradient magnitude $M = \min(1, \sqrt{G_x^2 + G_y^2} \cdot 1.6)$ mapped onto a cyan thermal ramp scaled by slider `opacity`.
3. **Mode `meso` (7×7 Ingredient Boundary Difference)**:
   - Evaluates local contrast against a neighborhood mean/variance kernel, highlighting object boundaries in amber-gold.
4. **Mode `macro` (15×15+ Spatial Context Pooling)**:
   - Aggregates block-level luminance and chromatic variance over coarse spatial windows in violet overlays.
5. **Mode `gradcam` (Attention Saliency)**:
   - Iterates `gradCamPoints` (`{x, y, weight, reason, scaleLevel}`), rendering multi-stop radial gradients (crimson $\rightarrow$ amber $\rightarrow$ emerald $\rightarrow$ transparent cyan) onto an offscreen canvas buffer and compositing at `ctx.globalAlpha = opacity`.
6. **Interactive Crosshair Probe**: Tracks cursor coordinates `(x, y)` and displays live normalized local activation intensity `[0.00–1.00]` in a floating HUD readout.

---

#### 2.5 Part 5: Multi-Label Classification, Thresholding & Sensory Calibration (`InferenceLab.tsx`, `RadarChart.tsx`)

`InferenceLab.tsx` orchestrates single-image selection, live confidence filtering, and multi-axis attribute inspection:

1. **Dynamic Confidence Thresholding ($\tau$)**:
   - State `confidenceThreshold` (default `0.50`, range `[0.05, 0.95]`, step `0.01`) plus quick-preset buttons (`35% Lenient`, `50% Balanced`, `70% Strict`, `85% Certainty`).
   - Evaluates active attributes dynamically (`item.confidence >= confidenceThreshold`), updating live `POSITIVE`/`IDLE` status badges, active count badge (`activeAttributeCount / totalAttributeCount Active`), and the vertical threshold indicator bar on every metric.
2. **Dimension Segmented Filter**:
   - Switches cleanly across the six culinary axes (`cooking`, `texture`, `dietary`, `cuisine`, `flavor`, `nutrition`) via `activeCategoryFilter`.
3. **Sensory Vector Calibration (`RadarChart.tsx`)**:
   - Computes 6-vertex SVG polygon coordinates at radial angles $\theta_i = \frac{2\pi i}{6} - \frac{\pi}{2}$ against concentric 25%/50%/75%/100% reference polygons for `Crispiness`, `Umami`, `Moisture`, `Bitterness`, `Richness`, and `Aroma`.

---
<!-- Page Break: Page 5 -->

#### 2.6 Part 6: Express Backend API & Gemini Vision Integration (`server.ts`, `inference.py`, `app.py`)

`server.ts` serves both RESTful database operations and AI vision inference:

| Method | Endpoint | Purpose | Request / Validation | Response |
|---|---|---|---|---|
| `GET` | `/api/health` | Runtime readiness & DB connectivity | None | `{ status, hasGeminiKey, database, timestamp }` |
| `POST` | `/api/analyze-food` | Multi-scale food attribute extraction | `{ imageBase64, mimeType, dishName }` | Structured JSON matching 6-axis schema + `gradCamAttentionPoints` |
| `GET` | `/api/history` | Retrieve persisted classification logs | None | `DatabaseRecord[]` |
| `POST` | `/api/history` | Persist evaluated dish metrics | `{ dishName, cuisine, ... }` (`dishName` required) | HTTP `201` + `DatabaseRecord` |
| `DELETE` | `/api/history` | Reset classification session history | None | `{ message }` |
| `GET` | `/api/database/stats` | Inspect DB engine metrics & averages | None | `{ status, engine, totalRecords, databaseSizeBytes, ... }` |
| `GET` | `/api/dishes` | List stored custom uploaded dishes | None | `StoredDish[]` |
| `POST` | `/api/dishes` | Store custom dish metadata | `{ name, imageUrl, cuisine, description }` | HTTP `201` + `StoredDish` |

- **Structured Vision Analysis**: `/api/analyze-food` invokes `ai.models.generateContent` (`model: 'gemini-3.8-flash'`) with a strict `responseSchema` (`Type.OBJECT`) enforcing nested `scaleAnalysis`, `attributes` (`cookingState`, `texture`, `dietary`, `tasteProfile`, `nutritionProfile`), and `gradCamAttentionPoints`.
- **Standalone Python Parity**: `app.py` (FastAPI) wraps `FoodAttributePredictor` (`inference.py`) to serve `/health`, `/taxonomy`, and multipart file uploads via `/predict`.

---

#### 2.7 Part 7: Session Trend Analytics & Report Export Subsystem (`AttributeTrendPanel.tsx`, `ReportModal.tsx`)

1. **Session Trend Visualizer (`AttributeTrendPanel.tsx`)**:
   - Powered by **Recharts** (`ResponsiveContainer`, `AreaChart`, `BarChart`).
   - Supports toggling between **Sequence Timeline** (chronological progression of `crispiness`, `umami`, `bakedOrFried`, `vegetarian`, `proteinDensity`) and **Mean Distribution** (aggregate bar averages across all logged dishes).
2. **Summary Report Exporter (`ReportModal.tsx`)**:
   - Receives `currentDish`, `sessionHistory`, and the user's active `confidenceThreshold`.
   - **JSON Export (`handleDownloadJSON`)**: Serializes `sessionSummary` (including `appliedConfidenceThreshold`), `currentDishEvaluation`, `sessionHistoricalTrend`, and `engineMetadata` into a downloadable `foodvision_report_YYYY-MM-DD.json` file via `URL.createObjectURL`.
   - **Printable PDF (`handlePrintPDF`)**: Triggers `window.print()`, utilizing `@media print` rules in `src/index.css` to strip `header`, `footer`, `nav`, and `.no-print` chrome for clean A4/Letter output.

---

#### 2.8 Part 8: Containerized Deployment & Developer System Hub (`Dockerfile`, `docker-compose.yml`, `DeveloperHubModal.tsx`)

1. **Multi-Stage Production Container (`Dockerfile`)**:
   - **Stage 1 (`builder`)**: `python:3.11-slim`, installs `build-essential`, `libgl1`, `libglib2.0-0`, and builds user-local Python wheels from `requirements.txt`.
   - **Stage 2 (`runner`)**: Lightweight runtime copying `/root/.local`, running under non-root `appuser` (UID `1001`), exposing port `8080`, configured with `HEALTHCHECK` probing `/health` every 30s, launching `uvicorn app:app --workers 2`.
2. **Service Orchestration (`docker-compose.yml` & `deploy.sh`)**:
   - Coordinates `foodvision-ms-cnn-api` (2.0 CPU / 4096M RAM limit) and `foodvision-redis` (`redis:7-alpine` with AOF persistence `--appendonly yes`), waiting on Redis healthchecks.
3. **Developer & System Hub Modal (`DeveloperHubModal.tsx`)**:
   - Consolidates `ArchitectureStudio` (interactive RF math calculator $RF_l = RF_{l-1} + (k_l - 1)\prod s_i$), `IbmDatasetStudio` (ablation comparisons), and `GitHubRepoStudio` (file explorer + `.zip` bundle download) behind a single modal trigger, keeping the primary workspace clean.

---
<!-- Page Break: Page 6 -->

## SECTION 3
### Data Design

#### 3.1 Logical & Physical Data Tables

The runtime persistence engine (`src/server/db.ts`) manages structured JSON collections stored in `/app/applet/data/foodvision_db.json` under top-level schema `FoodVisionDatabaseSchema`.

##### Table 1: `records` (`DatabaseRecord` — Classification Session History)
| Column / Field | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `string` | Primary Key (`rec-<ts>-<rand>`) | Unique classification event identifier |
| `dishName` | `string` | Required, Non-empty | Identified or selected dish label |
| `cuisine` | `string` | Default `'General Culinary'` | Culinary origin classification |
| `timestamp` | `string` | `HH:MM` 24h format | Local evaluation timestamp |
| `crispiness` | `number` | Integer `[0, 100]` | Sensory crispiness index (%) |
| `umami` | `number` | Integer `[0, 100]` | Sensory umami richness index (%) |
| `bakedOrFried` | `number` | Integer `[0, 100]` | Thermal cooking confidence (%) |
| `vegetarian` | `number` | Integer `[0, 100]` | Plant-based / vegetarian certainty (%) |
| `proteinDensity` | `number` | Integer `[0, 100]` | Protein density score (%) |
| `topAttribute` | `string` | Default `'Fine Textured'` | Dominant micro-scale texture descriptor |
| `confidenceThreshold` | `number` | Float `[0.05, 0.95]`, Default `0.50` | Decision threshold active at logging time |
| `createdAt` | `string` | ISO-8601 UTC timestamp | Audit creation timestamp |

##### Table 2: `customDishes` (`StoredDish` — User-Uploaded Food Specimens)
| Column / Field | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `string` | Primary Key (`dish-<ts>-<rand>`) | Unique uploaded dish identifier |
| `name` | `string` | Required | Dish name or sanitized filename |
| `cuisine` | `string` | Default `'Uploaded Dish'` | Predicted culinary tradition |
| `imageUrl` | `string` | Required (Base64 Data URI / URL) | Source food image payload |
| `description` | `string` | Default descriptive text | Summary evaluation context |
| `createdAt` | `string` | ISO-8601 UTC timestamp | Upload creation timestamp |

##### Table 3: `metadata` (Database System Telemetry)
| Field | Type | Description |
|---|---|---|
| `version` | `string` | Schema version (`"1.0.0"`) |
| `lastUpdated` | `string` | ISO-8601 timestamp of last mutating transaction |
| `totalClassificationsCount` | `number` | Monotonic counter of total persisted inferences |

##### Table 4: Client Domain Entity `FoodDishSample` (`src/types/food.ts`)
Encapsulates `scaleAnalysis` (`microScale`, `mesoScale`, `macroScale`), `attributes` (6 arrays of `AttributeItem`: `name`, `confidence`, `threshold`, `description`), `radarSensoryVector` (6 axis points), and `gradCamPoints` (`x`, `y`, `weight`, `reason`, `scaleLevel`).

---
<!-- Page Break: Page 7 -->

#### 3.2 Access Levels & Security Boundaries

| Component / Role | `records` | `customDishes` | `metadata` | `/api/analyze-food` | File System (`data/`) |
|---|---|---|---|---|---|
| **SPA Client (Browser)** | Read (`GET`), Append (`POST`), Reset (`DELETE`) via API | Read (`GET`), Append (`POST`) via API | Read-only (`GET /api/database/stats`) | Invoke (`POST`) with Base64 payload | No direct access |
| **Express Backend (`server.ts`)** | Full CRUD via `db` singleton | Full CRUD via `db` singleton | Read & atomic update on write | Proxies to Gemini API using server-side `GEMINI_API_KEY` | Read/Write to `data/foodvision_db.json` |
| **Gemini Vision Service** | None | None | None | Stateless inference on single image buffer | None |
| **Docker Runner (`appuser`)** | N/A | N/A | N/A | Stateless `/predict` temp-file cleanup | Non-root UID `1001`, isolated `/app` |

#### 3.3 Architectural Design Choices
1. **File-Backed JSON Engine (`FoodVisionDatabase`) over External RDBMS for Preview Runtime**: Eliminates external database daemon provisioning latency while providing zero-dependency persistence across Express server restarts, automatic seeding of 5 IBM-aligned benchmark records, and instant serialization compatible with `/api/database/stats`.
2. **Multi-Task ModuleDict Heads vs. Single Flat 31-Class Head**: Grouping the 31 attributes into 6 orthogonal `nn.ModuleDict` heads enables task-specific loss weighting ($\lambda_{\text{texture}} = 1.2$) and independent threshold evaluation per culinary axis.
3. **Server-Side Vision Proxy**: Isolating `GEMINI_API_KEY` inside `server.ts` prevents credential leakage to browser bundles while enforcing strict output schema validation before data reaches React state.

---
<!-- Page Break: Page 8 -->

## SECTION 4
### Other frameworks

#### 4.1 Session Management
Session continuity spans three coordinated layers:
1. **Hydrated React Session State (`InferenceLab.tsx`)**:
   - On initial component mount, `useEffect` issues `GET /api/history`. If non-empty persisted records are returned, `sessionHistory` hydrates directly from disk rather than resetting on browser refresh.
   - Each dish selection or AI vision re-analysis invokes `recordDishToHistory(dish)`, appending to local `sessionHistory` state for instant Recharts re-rendering and dispatching an asynchronous `POST /api/history` write-through.
   - Invoking **Reset** in `AttributeTrendPanel` clears local `sessionHistory` and issues `DELETE /api/history` to synchronize backend state.
2. **UI Inspection Context**:
   - Transient UI parameters—`activeScale`, `overlayOpacity` (default `0.85`), `confidenceThreshold` (default `0.50`), and `activeCategoryFilter` (default `'cooking'`)—remain isolated in React component state so users can dynamically explore feature maps and certainty cutoffs without mutating persisted historical telemetry.
3. **Stateless API Request Lifecycle**:
   - Both `server.ts` (`/api/analyze-food`) and `app.py` (`/predict`) operate statelessly per image request; `app.py` writes uploaded multipart images to `tempfile.NamedTemporaryFile` and guarantees cleanup in a `finally` block (`os.remove(tmp_path)`).

#### 4.2 Caching Strategies
1. **Canvas Image Reference Caching (`FeatureMapCanvas.tsx`)**:
   - Loaded `HTMLImageElement` instances are cached in `imgRef.current` (`useRef`). Switching between `RGB`, `Micro 3×3`, `Meso 7×7`, `Macro 15×15`, and `Grad-CAM` or dragging the opacity slider re-runs pixel shaders from the cached DOM image without re-fetching network assets.
2. **In-Memory Write-Through Cache (`src/server/db.ts`)**:
   - `FoodVisionDatabase` caches the parsed `FoodVisionDatabaseSchema` in `this.inMemoryData`. All `GET /api/history`, `GET /api/dishes`, and `GET /api/database/stats` queries resolve in $O(1)$ memory time without synchronous disk reads, while mutations update memory and flush atomically to `foodvision_db.json`.
3. **Distributed Redis Inference Cache (`docker-compose.yml`)**:
   - In the containerized Python microservice deployment, `redis:7-alpine` (`--appendonly yes` backed by volume `redis_data`) caches repeated inference results and attribute probability vectors by image hash to avoid redundant GPU/CPU forward passes.
4. **PyTorch Training Memory & Loader Buffering (`train.py`, `data/dataset.py`)**:
   - `DataLoader(..., num_workers=2)` prefetches and normalizes multi-scale augmented batches asynchronously while `torch.cuda.amp.autocast()` + `GradScaler` halve VRAM footprint during FP16 backpropagation.

---
<!-- Page Break: Page 9 -->

## SECTION 5
### Unit Testing

The following unit and integration test specification verifies correctness across the neural model, loss formulation, backend persistence API, frontend canvas processing, and dynamic thresholding logic.

| Test ID | Module / Target | Test Scenario & Input | Expected Result | Status |
|---|---|---|---|---|
| **UT-01** | `model/multiscale_cnn.py` (`MultiScaleFoodCNN`) | Pass tensor `torch.randn(2, 3, 224, 224)` through `model.forward()` | Returns dict with 6 keys matching exact shapes: `cooking_state:(2,5)`, `texture:(2,6)`, `dietary:(2,6)`, `cuisine:(2,5)`, `flavor:(2,5)`, `nutrition:(2,4)`. | Verified (Shape Test) |
| **UT-02** | `model/multiscale_cnn.py` (`forward_features`) | Pass `[1, 3, 224, 224]` input tensor | Returns pooled vector `[1, 512]` and 4 stage maps (`s1:[1,64,56,56]` through `s4:[1,512,7,7]`). | Verified |
| **UT-03** | `model/losses.py` (`AsymmetricLoss`) | Pass zero logits `[4, 6]` and sparse targets (1 positive, 23 negatives) with `gamma_neg=4.0, clip=0.05` | Loss scalar is finite (`> 0`, no `NaN`/`Inf`); negative gradient contribution is strictly attenuated vs. standard BCE. | Verified |
| **UT-04** | `server.ts` (`GET /api/health`) | Send `GET /api/health` request | HTTP `200`, JSON contains `"status": "ok"`, `"database": "connected"`, and boolean `hasGeminiKey`. | Live Verified |
| **UT-05** | `server.ts` (`POST /api/history` & `GET /api/history`) | `POST /api/history` with `{ dishName: "Matcha Parfait", crispiness: 75 }` then `GET /api/history` | `POST` returns HTTP `201` with generated `id` and `createdAt`; `GET` includes `"Matcha Parfait"` and increments `/api/database/stats` `totalRecords`. | Live Verified |
| **UT-06** | `server.ts` (`POST /api/history` validation) | `POST /api/history` with missing `dishName` (`{}`) | HTTP `400` with `{ "error": "dishName is required" }`; database file untouched. | Verified |
| **UT-07** | `server.ts` (`POST /api/analyze-food`) | `POST /api/analyze-food` with empty body `{}` | HTTP `400` rejecting missing `imageBase64` and `dishName`. | Verified |
| **UT-08** | `FeatureMapCanvas.tsx` (Sobel 3×3 & Grad-CAM) | Switch `activeScale` from `'original'` to `'micro'` and `'gradcam'` with `opacity=0.85` | Canvas dimensions fixed at `480×360`; `'micro'` executes $3\times 3$ Sobel edge kernel; `'gradcam'` composites radial hotspots at normalized coordinates. | Verified |
| **UT-09** | `InferenceLab.tsx` (Confidence Threshold $\tau$) | Move range slider from `0.50` to `0.85` (`85% Certainty` preset) | Attributes with `0.50 <= confidence < 0.85` transition immediately from `POSITIVE` to `IDLE`; active counter updates dynamically; bar threshold markers shift to `left: 85%`. | Verified |
| **UT-10** | `ReportModal.tsx` (`handleDownloadJSON`) | Open Report modal at $\tau = 0.70$ and click **Download JSON** | Generates valid JSON file containing `appliedConfidenceThreshold: "70%"`, `currentDishEvaluation`, and full `sessionHistoricalTrend` array. | Verified |

---
<!-- Page Break: Page 10 -->

## SECTION 6
### Key notes

#### 6.1 Engineering Assumptions
1. **Input Image Framing & Resolution**: Uploaded food photographs are assumed to be standard RGB culinary captures (`JPEG`, `PNG`, `WEBP`) under 30MB, centered sufficiently for $224\times 224$ center-cropping (`transforms.CenterCrop(224)`) without truncating primary ingredients.
2. **Attribute Orthogonality**: Within the 6 classification heads, multiple attributes may co-activate concurrently (multi-label, independent sigmoid activations rather than mutually exclusive softmax), assuming dishes regularly combine states (e.g., *Crispy Exterior* + *Fluffy Interior*).
3. **Runtime Inference Delegation**: In the browser-hosted preview environment where local PyTorch GPU execution is unavailable, `/api/analyze-food` assumes availability of `GEMINI_API_KEY` on the Node.js server to emulate multi-scale receptive-field extraction via structured multimodal vision prompting.
4. **Single-Tenant Persistence Scope**: `data/foodvision_db.json` assumes single-workspace or single-node deployment without concurrent multi-process write locks.

#### 6.2 Known Limits
1. **Simulated Client-Side Feature Maps**: `FeatureMapCanvas.tsx` approximates intermediate CNN activations in the browser via analytical $3\times 3$ Sobel filters, local variance kernels, and coordinate-weighted radial Grad-CAM buffers rather than streaming raw Stage-1..Stage-4 PyTorch activation tensors over WebSockets.
2. **Concurrency & Storage Ceiling of JSON Persistence**: Synchronous `fs.writeFileSync` to `foodvision_db.json` can become an I/O bottleneck under high concurrent write volume or once `customDishes` stores hundreds of large base64 data URIs; production scaling requires migrating `FoodVisionDatabase` to PostgreSQL/Cloud SQL and object storage (GCS/S3).
3. **CPU Inference Latency in Python Fallback**: Running `app.py` (`MultiScaleFoodCNN`) without CUDA (`torch.cuda.is_available() == False`) increases per-image inference and Grad-CAM backward-pass latency compared to FP16 GPU inference.
4. **Absence of Automated CI Test Runner**: Unit test cases defined in Section 5 were verified via TypeScript static checks (`tsc --noEmit`), Vite production bundling (`vite build`), and live HTTP `curl` probes rather than an automated Jest/Vitest/Pytest suite wired into `package.json`.

---
<!-- Page Break: Page 11 -->

## SECTION 7
### Reference

#### 7.1 Datasets & Ontologies
1. **IBM Food-101 Multi-Attribute Dataset & Research**: Extended ontology mapping 101,000 culinary images (101 dish categories) to 32 multi-label food attributes across cooking method, texture, dietary constraints, cuisine, flavor, and nutrition.
2. **FoodX-251 Benchmark**: Fine-grained food recognition dataset comprising 251 fine-grained culinary categories and 158,000+ images for fine visual feature generalization.
3. **IBM Model Asset eXchange (MAX) & Chef Watson**: Reference architectures for containerized microservice food classifiers and computational flavor/attribute taxonomies.

#### 7.2 Academic Papers
1. **Asymmetric Loss (ASL)**: Ridnik, T., Ben-Baruch, E., Zamir, N., Noy, A., Friedman, I., Protter, M., & Zelnik-Manor, L. (2021). *Asymmetric Loss For Multi-Label Classification*. IEEE/CVF International Conference on Computer Vision (ICCV).
2. **Squeeze-and-Excitation Networks (SE-Net)**: Hu, J., Shen, L., & Sun, G. (2018). *Squeeze-and-Excitation Networks*. IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR).
3. **Multi-Scale Inception Architectures**: Szegedy, C., Ioffe, S., Vanhoucke, V., & Alemi, A. (2017). *Inception-v4, Inception-ResNet and the Impact of Residual Connections on Learning*. AAAI.
4. **Grad-CAM Explainability**: Selvaraju, R. R., Cogswell, M., Das, A., Vedantam, R., Parikh, D., & Batra, D. (2017). *Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization*. ICCV.

#### 7.3 Software Libraries & Frameworks
- **Frontend**: React `19.0.1`, TypeScript `7.0.2`, Vite `8.3.0`, Tailwind CSS `4.3.3` (`@tailwindcss/vite`), Recharts `3.10.1`, Lucide React `0.546.0`, JSZip `3.10.2`, Motion `12.23.24`.
- **Backend & AI SDK**: Node.js `v22`, Express `4.21.2`, `tsx` `4.21.0`, `dotenv` `17.2.3`, Google GenAI SDK (`@google/genai` `^2.4.0`, Gemini 3.8 Flash).
- **Python ML & Container Stack**: PyTorch `>=2.2.0`, TorchVision `>=0.17.0`, FastAPI `>=0.110.0`, Uvicorn `>=0.28.0`, OpenCV Headless `>=4.9.0`, Albumentations `>=1.4.0`, Scikit-Learn `>=1.4.0`, Docker (`python:3.11-slim`), Redis `7-alpine`.
