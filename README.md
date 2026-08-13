# 🏎️ AquaRace AI

> **AI-powered race-track condition detection, weather-whiplash analysis, trend monitoring, and tire-strategy recommendation.**

AquaRace AI is a full-stack motorsport intelligence dashboard designed to analyze racing-track surface conditions as **Dry, Damp, or Wet** from images and sampled video frames. The application combines **in-browser CLIP zero-shot vision inference**, a **FastAPI backend**, persistent telemetry/history, trend analysis, and a rule-based tire-strategy engine inside an immersive racing-inspired dashboard.

## 🌐 Live Demo

- **Frontend:** https://aquarace-ai.vercel.app
- **Backend:** https://aquarace-ai.onrender.com
- **Backend Health Check:** https://aquarace-ai.onrender.com/api/health
- **Repository:** https://github.com/Parvchaudhary040/aquarace-ai

> The backend is deployed on Render and the frontend is deployed on Vercel.

---

## 📸 Live Demo

<a href="https://aquarace-ai.vercel.app" target="_blank">
  <img src="/public/landingpage.png" alt="Preview" width="100%">
</a>

---


## ✨ Key Features

### 🖼️ AI Image Analysis

Upload a track image and AquaRace AI classifies the surface condition into:

- **Dry**
- **Damp**
- **Wet**

The vision pipeline returns:

- Predicted condition
- Confidence score
- Dry probability
- Damp probability
- Wet probability

### 🎥 AI Video Analysis

Upload a racing-track video and the frontend:

1. Loads the video locally in the browser.
2. Samples multiple timestamps.
3. Extracts frames sequentially.
4. Runs CLIP zero-shot classification on each frame.
5. Produces a condition sequence over time.
6. Applies frame stabilization to reduce single-frame classification flicker.
7. Sends the structured results to the backend.
8. Computes trend and strategy information.

The current implementation samples up to **16 frames**, targeting approximately one frame every 1.5 seconds.

### 📈 Track Trend Analysis

The trend engine evaluates the sequence of detected conditions and identifies whether the track is:

- **Stable**
- **Improving / Drying**
- **Deteriorating / Getting Wetter**

### 🛞 Tire Strategy Recommendation

AquaRace AI maps current conditions and trends to a prototype tire strategy:

| Track Condition | Typical Tire Strategy |
|---|---|
| Dry | Slick |
| Damp | Intermediate |
| Wet | Wet / Intermediate |
| Drying | Prepare for slick transition |

The strategy engine also reports urgency and reasoning.

### 🗃️ Analysis History

Analysis results are persisted in the backend database so previous track-condition observations can be retrieved and used by the dashboard.

### 🧠 Browser-Based AI Inference

Vision inference runs **inside the user's browser** using:

- `@huggingface/transformers`
- `Xenova/clip-vit-base-patch32`
- ONNX quantized inference

This architecture avoids sending image/video files to a server-side Hugging Face inference endpoint for the main vision workflow.

### 🎨 Immersive Dashboard

The frontend includes a motorsport-inspired dashboard with:

- Dark racing telemetry aesthetic
- Animated/3D visual elements
- Image and video analysis views
- Trend visualization
- Strategy panel
- Historical analysis
- Responsive interaction patterns

The dashboard is designed so the core application can remain usable even when advanced visual effects are unavailable.

---

# 🏗️ Architecture

```text
                         AQUARACE AI
                              │
              ┌───────────────┴───────────────┐
              │                               │
        React + Vite                     FastAPI
          Frontend                       Backend
              │                               │
              │                               ├── Health API
              │                               ├── History API
              │                               ├── Trend Engine
              │                               ├── Strategy Engine
              │                               └── SQLite/SQLAlchemy
              │
              ▼
      Transformers.js / CLIP
              │
              ├── Image inference
              │
              └── Video frame inference
              │
              ▼
       Dry / Damp / Wet
              │
              ▼
      Structured JSON result
              │
              ▼
        FastAPI Backend
              │
       ┌──────┴───────┐
       ▼              ▼
    History        Trend + Strategy
```

## Deployment Architecture

```text
User Browser
    │
    │ HTTPS
    ▼
Vercel — React/Vite Frontend
    │
    ├── Local CLIP inference
    │
    └── REST API requests
            │
            ▼
Render — FastAPI Backend
    │
    ├── Database
    ├── History
    ├── Trend analysis
    └── Tire strategy
```

---

# 🧰 Tech Stack

## Frontend

- **React 19**
- **Vite 8**
- **Tailwind CSS 4**
- **Three.js**
- **React Three Fiber**
- **@react-three/drei**
- **GSAP**
- **Lenis**
- **Recharts**
- **Lucide React**
- **Axios**
- **Transformers.js** (`@huggingface/transformers`)
- **ONNX / quantized CLIP model**

## Backend

- **Python**
- **FastAPI**
- **Uvicorn**
- **Pydantic**
- **SQLAlchemy**
- **SQLite / SQLAlchemy persistence**
- **OpenCV**
- **Pillow**
- **python-multipart**

## AI / ML

- **CLIP zero-shot image classification**
- Model: `Xenova/clip-vit-base-patch32`
- Browser-side inference using Transformers.js
- Dry/Damp/Wet classification
- Frame-by-frame video classification
- Probability aggregation
- Temporal frame stabilization

## Deployment

- **Vercel** — frontend
- **Render** — backend
- **GitHub** — source control

---

# 📁 Project Structure

```text
aquarace-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze.py
│   │   │   ├── history.py
│   │   │   ├── strategy.py
│   │   │   └── trend.py
│   │   │
│   │   ├── database/
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   │
│   │   ├── models/
│   │   │   └── schemas.py
│   │   │
│   │   ├── services/
│   │   │   ├── strategy_service.py
│   │   │   └── trend_service.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── visionService.js
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 🚀 Run Locally

## Prerequisites

Install:

- **Git**
- **Python 3.10+**
- **Node.js 20+ recommended**
- **npm**

A modern browser with WebAssembly support is recommended because CLIP inference runs in the browser.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Parvchaudhary040/aquarace-ai.git
cd aquarace-ai
```

---

# 🐍 Backend Setup

Open a terminal in the project root.

### Windows PowerShell

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, activate the environment from Command Prompt instead:

```cmd
venv\Scripts\activate
```

### macOS / Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Start the backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/api/health
```

FastAPI interactive documentation:

```text
http://127.0.0.1:8000/docs
```

---

# ⚛️ Frontend Setup

Open a **second terminal**.

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Then start Vite:

```bash
npm run dev
```

Open the local URL shown by Vite, normally:

```text
http://localhost:5173
```

> Restart the Vite development server after changing `VITE_API_URL` because Vite reads `VITE_*` variables during startup/build.

---

# 🔗 Local Frontend + Backend Flow

```text
http://localhost:5173
        │
        │ VITE_API_URL
        ▼
http://127.0.0.1:8000/api
```

The browser performs CLIP inference locally. The FastAPI backend receives structured analysis data and handles persistence, history, trend, and strategy functionality.

---

# 🔐 Environment Variables

## Frontend

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

For production:

```env
VITE_API_URL=https://aquarace-ai.onrender.com/api
```

## Backend

The current vision architecture does **not require an `HF_TOKEN` for the browser-based CLIP inference workflow**. The backend receives structured inference results from the frontend.

Never commit API keys, tokens, passwords, or private credentials to GitHub.

---

# 🔌 API Reference

All backend routes are mounted under `/api`.

## Health

```http
GET /api/health
```

Returns:

```json
{
  "status": "ok"
}
```

## Record Image Analysis

```http
POST /api/record-analysis
Content-Type: application/json
```

Example:

```json
{
  "filename": "track.png",
  "condition": "Damp",
  "confidence": 82.4,
  "dry_probability": 5.2,
  "damp_probability": 82.4,
  "wet_probability": 12.4
}
```

## Record Video Analysis

```http
POST /api/record-video
Content-Type: application/json
```

The request contains sampled frame results and the condition sequence. The backend persists frame records and computes trend and strategy information.

## History

```http
GET /api/history
```

Returns stored track-condition analysis records.

## Trend

```http
GET /api/trend
```

Returns current track-condition sequence and overall trend information.

## Strategy

```http
GET /api/strategy
```

Returns the current prototype tire-strategy recommendation.

---

# 🧠 How the AI Pipeline Works

## Image Pipeline

```text
Image File
   ↓
Browser
   ↓
Transformers.js
   ↓
Xenova/clip-vit-base-patch32
   ↓
Zero-shot classification
   ↓
Dry / Damp / Wet probabilities
   ↓
Top condition + confidence
   ↓
FastAPI persistence
```

The frontend uses complementary natural-language prompts for each class, including dry asphalt, damp asphalt, and wet surfaces with standing water/reflections. The scores for prompts belonging to each class are aggregated into the final Dry/Damp/Wet probabilities.

## Video Pipeline

```text
Video File
   ↓
Browser video decoder
   ↓
Sample timestamps
   ↓
Capture resized frame
   ↓
CLIP inference
   ↓
Probability result
   ↓
Next frame
   ↓
Temporal stabilization
   ↓
Condition sequence
   ↓
Backend
   ↓
Trend + Strategy
```

### Memory-conscious processing

The frontend intentionally:

- Loads the CLIP pipeline lazily.
- Reuses one classifier instance.
- Processes video frames sequentially.
- Resizes frames before inference.
- Releases temporary object URLs and canvases.
- Avoids running many frame inferences concurrently.

This is important for browser memory usage and for keeping the deployed backend lightweight.

---

# 📊 Trend Logic

The trend service evaluates the progression of track conditions over time.

```text
Dry → Dry → Dry
      ↓
   Stable
```

```text
Wet → Damp → Dry
       ↓
    Improving
    / Drying
```

```text
Dry → Damp → Wet
       ↓
  Deteriorating
```

The frontend also contains a local fallback trend/strategy calculation so video analysis can remain useful if backend persistence temporarily fails.

---

# 🛞 Strategy Logic

AquaRace AI is a prototype decision-support system rather than a real-world race-engineering authority.

Examples:

- **Dry:** recommend slick strategy.
- **Damp:** recommend intermediate tires when conditions remain damp.
- **Wet:** recommend wet/intermediate setup depending on the trend.
- **Drying:** prepare for a slick-tire transition.
- **Deteriorating:** increase urgency toward wet-weather strategy.

The recommendation is based on detected condition, trend, and condition sequence.

---

# 🖥️ Production Deployment

## Frontend — Vercel

Recommended settings:

```text
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Production environment variable:

```env
VITE_API_URL=https://aquarace-ai.onrender.com/api
```

After changing a Vercel environment variable, redeploy the frontend so the new value is included in the Vite production build.

## Backend — Render

Recommended configuration:

```text
Runtime: Python 3
Root Directory: backend
```

Install command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The backend enables CORS for local development origins and Vercel deployments.

---

# 🧪 Useful Development Commands

## Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Backend

```bash
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/api/health
```

---

# 🛠️ Troubleshooting

## Frontend cannot connect to backend

Check:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

For production:

```env
VITE_API_URL=https://aquarace-ai.onrender.com/api
```

Restart Vite after changing the variable.

## CORS error

Make sure the frontend origin is allowed by the FastAPI CORS middleware. The current backend accepts localhost/127.0.0.1 development origins and Vercel origins.

## AI model takes time on first use

The CLIP model is loaded lazily in the browser. The first image/video analysis can therefore take longer while the model is downloaded and initialized. Subsequent analyses reuse the loaded classifier during the browser session.

## WebGL / 3D rendering issue

The dashboard contains advanced Three.js/3D visual effects. If a browser/device cannot create a WebGL context, the application should use its lightweight visual fallback instead of preventing the main dashboard from working.

## Render service sleeps on free hosting

The Render free instance can spin down after inactivity. The first request after inactivity can therefore be slower than subsequent requests.

---

# 🔒 Security Notes

- Never commit `.env` files containing secrets.
- Never expose private API tokens through `VITE_*` variables because Vite embeds them into the client bundle.
- The current CLIP model is public and does not require an HF token in the browser workflow.
- Treat strategy recommendations as prototype decision support, not operational race-control instructions.

---

# 🚧 Limitations

- CLIP is a general-purpose vision-language model, not a track-condition model trained specifically on a professional motorsport dataset.
- Classification quality depends on image quality, lighting, camera angle, reflections, weather, and track context.
- Browser-based video inference depends on the user's CPU/GPU/browser performance.
- The tire strategy engine is rule-based and intended as a prototype.
- Free-tier hosting may introduce cold-start latency.

---

# 🔮 Future Improvements

Potential next steps:

- Fine-tune a dedicated racing-track condition classifier.
- Add weather and radar data integration.
- Add real-time camera/stream ingestion.
- Add track-sector level condition mapping.
- Add lap-time impact estimation.
- Add historical weather correlation.
- Add driver/team telemetry integration.
- Add WebSocket-based live telemetry.
- Add authentication and multi-team dashboards.
- Add automated model evaluation and confidence calibration.
- Add persistent PostgreSQL production storage.

---

# 👨‍💻 Project

**AquaRace AI**

Built as an AI-powered motorsport analytics and decision-support prototype combining computer vision, full-stack development, data persistence, visualization, and deployment.

**Author:** Parv Chaudhary

- GitHub: https://github.com/Parvchaudhary040
- Project: https://github.com/Parvchaudhary040/aquarace-ai

---

# 📄 License

No explicit open-source license is currently included in this repository. If you intend to distribute or accept contributions, add an appropriate `LICENSE` file.
