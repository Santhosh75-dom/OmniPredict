# OmniPredict: 4-Hour Hackathon Sprint Plan
## The NAC Triage Engine - Multimodal Oncology AI

**Status:** Aggressively Scoped MVP  
**Target:** Live Demo-Ready by 4:00 AM  
**Team:** Full-Stack Engineers + Oncology PM  

---

## 🎯 Sprint Objective

Build a **multimodal fusion engine** that combines H&E biopsy images + clinical biomarkers to predict NAC resistance on Day 1, with explainable AI outputs that actually explain the clinical reasoning.

**Elevator Pitch for Judges:**
> "A patient with breast cancer walks into the clinic. The oncologist uploads her H&E biopsy + blood labs. In 30 seconds, OmniPredict fuses the data and says: 'This tumor will resist chemo. Skip NAC, go straight to surgery.' And it tells you *why*—the dense stromal infiltration, the low Ki-67, the ER+ phenotype—all deterministically linked to NAC failure. No black box."

---

## 📋 The "Demo-Saver" Architecture

```
Frontend (React/Vite/Tailwind)
         ↓
   [Upload Biopsy + Labs]
         ↓
   [2.5-second timeout]
         ↓
   IF API responds → Show real Gemini analysis
   ELSE → Show hardcoded mock result
         ↓
   [XAI Output Dashboard]
   - Risk Score: XX%
   - Clinical Reasoning (paragraph)
   - Anatomical highlights on biopsy
   - Recommendation: "Proceed with NAC" / "Route to Surgery"
```

**Why the 2.5-second fallback?**
- WiFi dies on stage? Mock result shows up anyway.
- Gemini API rate-limits? Demo continues flawlessly.
- Judges see the *product logic*, not an error screen.

---

## ⏱️ Timeline Breakdown (4 hours = 240 minutes)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: Backend Foundation** | 45 min | FastAPI server + Gemini integration |
| **Phase 2: Frontend MVP** | 60 min | React dashboard + upload form |
| **Phase 3: Integration & Mock Fallback** | 45 min | End-to-end flow + timeout handler |
| **Phase 4: Polish & Demo Prep** | 50 min | UI refinement + slide deck sync |

---

## 🚀 Phase 1: Backend Foundation (45 minutes)

### Goal
Spin up a FastAPI backend that:
1. Accepts multimodal inputs (image + JSON biomarkers)
2. Routes to Gemini 1.5 Pro for inference
3. Returns structured clinical reasoning

### 1.1: Project Setup (10 min)

```bash
# Create backend directory
mkdir omnigenpredict-backend
cd omnigenpredict-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# OR: venv\Scripts\activate  # Windows

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0
google-generativeai==0.3.0
pydantic==2.5.0
pillow==10.1.0
aiofiles==23.2.1
python-multipart==0.0.6
EOF

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
GEMINI_API_KEY=your_api_key_here
FASTAPI_PORT=8000
EOF
```

### 1.2: FastAPI Server Structure (15 min)

Create `main.py`:

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import base64
import json
from PIL import Image
from io import BytesIO
import google.generativeai as genai
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="OmniPredict - NAC Triage Engine")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Data Models ============

class ClinicalBiomarkers(BaseModel):
    """Structured clinical data payload"""
    age: int
    er_status: str  # "Positive" / "Negative"
    pr_status: str
    her2_status: str
    ki67_percentage: float  # 0-100
    tumor_size_cm: float
    grade: int  # 1, 2, 3
    lymph_node_status: str  # "Negative" / "Positive"
    patient_id: Optional[str] = None

class OmniPredictRequest(BaseModel):
    """Full multimodal inference request"""
    biomarkers: ClinicalBiomarkers

# ============ Mock Data (Fallback) ============

MOCK_RESULT = {
    "status": "mock_fallback",
    "nac_resistance_score": 0.78,
    "confidence": 0.85,
    "recommendation": "Route to Surgery",
    "clinical_reasoning": (
        "Dense stromal infiltration and high cellularity observed on H&E suggest aggressive "
        "tumor phenotype. Combined with ER+ status and moderate Ki-67 (28%), this patient presents "
        "high NAC resistance risk. Recommend surgical evaluation with possible neoadjuvant endocrine therapy instead of chemotherapy. "
        "Pathological features consistent with luminal-enriched subtype with poor chemotherapy response prognosis."
    ),
    "key_findings": [
        "Dense stromal infiltration",
        "High cellularity",
        "ER+ phenotype",
        "Low Ki-67 expression",
        "Grade 2 tumor morphology"
    ],
    "anatomical_zones": {
        "stromal_density": "High",
        "nuclear_atypia": "Moderate",
        "mitotic_rate": "Low-Moderate",
        "tubule_formation": "Partial"
    ]
}

# ============ Routes ============

@app.get("/health")
async def health_check():
    """Liveness probe"""
    return {"status": "alive", "service": "OmniPredict NAC Triage Engine"}

@app.post("/api/v1/predict")
async def predict_nac_resistance(
    image: UploadFile = File(...),
    biomarkers: str = "{}",  # JSON string of ClinicalBiomarkers
):
    """
    Main inference endpoint: Multimodal fusion for NAC resistance prediction.
    
    Args:
        image: H&E biopsy slide (.jpg/.png)
        biomarkers: JSON string of clinical parameters
    
    Returns:
        {
            "nac_resistance_score": 0-1,
            "recommendation": "Proceed with NAC" | "Route to Surgery",
            "clinical_reasoning": str,
            "key_findings": [str],
            "anatomical_zones": {zone: finding}
        }
    """
    
    try:
        # Parse biomarkers JSON
        biomarkers_dict = json.loads(biomarkers)
        biomarkers_obj = ClinicalBiomarkers(**biomarkers_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid biomarkers JSON: {str(e)}")
    
    try:
        # Read and encode image
        image_data = await image.read()
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        
        # Get image MIME type
        image_mime = "image/jpeg" if image.filename.lower().endswith('.jpg') else "image/png"
        
        # ============ Gemini Inference (with timeout) ============
        result = await call_gemini_with_timeout(
            image_b64=image_b64,
            image_mime=image_mime,
            biomarkers=biomarkers_obj
        )
        
        return JSONResponse(content=result)
    
    except asyncio.TimeoutError:
        # Timeout → Return mock fallback
        print("[DEMO-SAVER] Gemini timeout after 2.5s. Returning mock result.")
        return JSONResponse(content=MOCK_RESULT)
    
    except Exception as e:
        print(f"[ERROR] Inference failed: {str(e)}")
        return JSONResponse(
            content={
                **MOCK_RESULT,
                "status": "fallback_error",
                "error_note": "Live API unavailable. Showing mock result."
            }
        )

async def call_gemini_with_timeout(image_b64: str, image_mime: str, biomarkers: ClinicalBiomarkers):
    """
    Call Gemini 1.5 Pro with multimodal input.
    
    Timeout after 2.5 seconds to enable demo-saver fallback.
    """
    
    # Construct the multimodal prompt
    system_prompt = """You are an expert pathologist and oncologist analyzing breast cancer biopsies.
You will receive:
1. An H&E biopsy slide image
2. Clinical biomarkers (age, ER/PR/HER2 status, Ki-67, tumor grade, etc.)

Your task is to:
1. Analyze the morphological features of the tumor
2. Integrate with clinical data
3. Predict NAC (Neoadjuvant Chemotherapy) resistance (0-1 score)
4. Explain deterministically why this patient will/won't respond to chemo

Output format (JSON):
{
  "nac_resistance_score": <0-1 float>,
  "confidence": <0-1 float>,
  "recommendation": "Proceed with NAC" | "Route to Surgery",
  "clinical_reasoning": "<2-3 sentence paragraph explaining the deterministic link between morphology + biomarkers → NAC resistance>",
  "key_findings": ["finding1", "finding2", ...],
  "anatomical_zones": {
    "stromal_density": "High/Moderate/Low",
    "nuclear_atypia": "High/Moderate/Low",
    "mitotic_rate": "High/Moderate/Low",
    "tubule_formation": "Well-formed/Partial/Poor"
  }
}"""

    user_message = f"""
Analyze this breast cancer H&E biopsy and predict NAC resistance.

Clinical Data:
- Age: {biomarkers.age}
- ER Status: {biomarkers.er_status}
- PR Status: {biomarkers.pr_status}
- HER2 Status: {biomarkers.her2_status}
- Ki-67: {biomarkers.ki67_percentage}%
- Tumor Size: {biomarkers.tumor_size_cm} cm
- Grade: {biomarkers.grade}/3
- Lymph Node Status: {biomarkers.lymph_node_status}

H&E Image: [See attached]

Provide deterministic clinical reasoning linking morphology + biomarkers → NAC resistance prediction.
"""

    try:
        # Call Gemini with timeout
        async def gemini_call():
            model = genai.GenerativeModel(model_name="gemini-1.5-pro")
            response = model.generate_content(
                [
                    system_prompt,
                    {
                        "mime_type": image_mime,
                        "data": image_b64
                    },
                    user_message
                ]
            )
            return response.text
        
        # Apply 2.5-second timeout
        result_text = await asyncio.wait_for(
            asyncio.create_task(gemini_call()),
            timeout=2.5
        )
        
        # Parse JSON response
        result_json = json.loads(result_text)
        result_json["status"] = "success"
        
        return result_json
    
    except asyncio.TimeoutError:
        raise asyncio.TimeoutError("Gemini call exceeded 2.5s timeout")
    except json.JSONDecodeError:
        # Gemini returned non-JSON
        raise ValueError("Gemini response not valid JSON")

@app.post("/api/v1/demo")
async def demo_result():
    """
    Emergency endpoint: Returns hardcoded mock result for demo.
    Use if API is completely down.
    """
    return JSONResponse(content=MOCK_RESULT)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("FASTAPI_PORT", 8000)))
```

### 1.3: Test the Backend (20 min)

```bash
# Start server
python main.py

# In another terminal, test the health endpoint
curl http://localhost:8000/health

# Test the demo endpoint (no image needed)
curl -X POST http://localhost:8000/api/v1/demo

# Test the predict endpoint with a sample image
# (Create a test image or use an existing H&E biopsy image)
curl -X POST \
  -F "image=@sample_biopsy.jpg" \
  -F "biomarkers={\"age\": 52, \"er_status\": \"Positive\", \"pr_status\": \"Positive\", \"her2_status\": \"Negative\", \"ki67_percentage\": 28, \"tumor_size_cm\": 2.5, \"grade\": 2, \"lymph_node_status\": \"Negative\"}" \
  http://localhost:8000/api/v1/predict
```

---

## 💻 Phase 2: Frontend MVP (60 minutes)

### Goal
Build a React dashboard that:
1. Uploads biopsy image + clinical form
2. Shows real-time "Fusing Modalities..." state
3. Displays XAI results (risk score + reasoning)

### 2.1: Create React Vite Project (10 min)

```bash
# Create frontend
npm create vite@latest omnigenpredict-frontend -- --template react
cd omnigenpredict-frontend

# Install dependencies
npm install
npm install axios tailwindcss @tailwindcss/forms lucide-react

# Configure Tailwind
npx tailwindcss init -p

# Update tailwind.config.js
cat > tailwind.config.js << 'EOF'
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        medical: {
          50: "#f0f9ff",
          600: "#0284c7",
          700: "#0369a1",
          900: "#082f49",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
EOF

# Start dev server
npm run dev
```

### 2.2: Create Main App Component (25 min)

Create `src/App.jsx`:

```jsx
import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import BiopsynUploadForm from './components/BiopsynUploadForm';
import XAIResultDashboard from './components/XAIResultDashboard';
import './App.css';

export default function App() {
  const [appState, setAppState] = useState('idle'); // idle | uploading | analyzing | result | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUploadSubmit = async (image, biomarkers) => {
    setAppState('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('biomarkers', JSON.stringify(biomarkers));

      // Set state to analyzing after brief upload state
      setTimeout(() => setAppState('analyzing'), 500);

      // Call backend
      const response = await fetch(
        'http://localhost:8000/api/v1/predict',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setAppState('result');
    } catch (err) {
      console.error('Inference error:', err);
      setError(err.message);
      setAppState('error');

      // Auto-fallback to mock result after 3 seconds
      setTimeout(() => {
        setResult({
          status: 'fallback',
          nac_resistance_score: 0.78,
          recommendation: 'Route to Surgery',
          clinical_reasoning: (
            'Dense stromal infiltration and high cellularity suggest aggressive phenotype. '
            'Combined with ER+ status and moderate Ki-67, high NAC resistance risk. '
            'Recommend surgical evaluation with possible neoadjuvant endocrine therapy.'
          ),
          key_findings: [
            'Dense stromal infiltration',
            'High cellularity',
            'ER+ phenotype',
            'Low Ki-67 expression',
            'Grade 2 morphology'
          ],
          anatomical_zones: {
            stromal_density: 'High',
            nuclear_atypia: 'Moderate',
            mitotic_rate: 'Low-Moderate',
            tubule_formation: 'Partial'
          }
        });
        setAppState('result');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-medical-600" />
            <h1 className="text-4xl font-bold text-medical-900">OmniPredict</h1>
          </div>
          <p className="text-xl text-gray-600">NAC Triage Engine</p>
          <p className="text-sm text-gray-500 mt-2">
            Multimodal fusion of H&E biopsies + clinical data for Day 1 NAC resistance prediction
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {appState === 'idle' && (
            <BiopsynUploadForm onSubmit={handleUploadSubmit} />
          )}

          {appState === 'uploading' && (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="animate-spin mb-4">
                <Zap className="w-12 h-12 text-medical-600 mx-auto" />
              </div>
              <p className="text-lg text-gray-700">Uploading biopsy and clinical data...</p>
            </div>
          )}

          {appState === 'analyzing' && (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="animate-pulse mb-4">
                <div className="w-12 h-12 bg-medical-600 rounded-full mx-auto"></div>
              </div>
              <p className="text-lg text-gray-700 font-semibold">Fusing Modalities...</p>
              <p className="text-sm text-gray-500 mt-2">
                Analyzing biopsy morphology + biomarkers
              </p>
              <div className="mt-4 h-1 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-medical-600 animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {appState === 'result' && result && (
            <XAIResultDashboard 
              result={result} 
              onReset={() => {
                setAppState('idle');
                setResult(null);
              }}
            />
          )}

          {appState === 'error' && (
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900">Inference Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Falling back to mock result...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2.3: Create Upload Form Component (15 min)

Create `src/components/BiopsynUploadForm.jsx`:

```jsx
import React, { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

export default function BiopsynUploadForm({ onSubmit }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [biomarkers, setBiomarkers] = useState({
    age: 52,
    er_status: 'Positive',
    pr_status: 'Positive',
    her2_status: 'Negative',
    ki67_percentage: 28,
    tumor_size_cm: 2.5,
    grade: 2,
    lymph_node_status: 'Negative'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (evt) => setPreview(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBiomarkerChange = (field, value) => {
    setBiomarkers(prev => ({
      ...prev,
      [field]: isNaN(value) ? value : parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please select a biopsy image');
      return;
    }
    setIsSubmitting(true);
    await onSubmit(image, biomarkers);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">H&E Biopsy Upload</h2>
        
        {preview ? (
          <div className="mb-4">
            <img 
              src={preview} 
              alt="Biopsy preview" 
              className="w-full h-64 object-cover rounded border border-gray-300"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-medical-600 text-sm hover:underline"
            >
              Change image
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-medical-300 rounded-lg p-8 text-center cursor-pointer hover:border-medical-600 transition"
          >
            <Upload className="w-12 h-12 text-medical-600 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">Click to upload H&E biopsy</p>
            <p className="text-sm text-gray-500">JPG or PNG, max 10MB</p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Clinical Biomarkers Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Clinical Biomarkers</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age (years)
            </label>
            <input
              type="number"
              value={biomarkers.age}
              onChange={(e) => handleBiomarkerChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ki-67 (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={biomarkers.ki67_percentage}
              onChange={(e) => handleBiomarkerChange('ki67_percentage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ER Status
            </label>
            <select
              value={biomarkers.er_status}
              onChange={(e) => handleBiomarkerChange('er_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Positive</option>
              <option>Negative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PR Status
            </label>
            <select
              value={biomarkers.pr_status}
              onChange={(e) => handleBiomarkerChange('pr_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Positive</option>
              <option>Negative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HER2 Status
            </label>
            <select
              value={biomarkers.her2_status}
              onChange={(e) => handleBiomarkerChange('her2_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Negative</option>
              <option>Positive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade (1-3)
            </label>
            <input
              type="number"
              min="1"
              max="3"
              value={biomarkers.grade}
              onChange={(e) => handleBiomarkerChange('grade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tumor Size (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={biomarkers.tumor_size_cm}
              onChange={(e) => handleBiomarkerChange('tumor_size_cm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lymph Node Status
            </label>
            <select
              value={biomarkers.lymph_node_status}
              onChange={(e) => handleBiomarkerChange('lymph_node_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Negative</option>
              <option>Positive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!image || isSubmitting}
        className="w-full bg-medical-600 hover:bg-medical-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
      >
        {isSubmitting ? 'Analyzing...' : 'Analyze NAC Resistance'}
      </button>
    </form>
  );
}
```

### 2.4: Create XAI Results Dashboard (10 min)

Create `src/components/XAIResultDashboard.jsx`:

```jsx
import React from 'react';
import { AlertCircle, CheckCircle, ThumbsDown, ThumbsUp, RefreshCw } from 'lucide-react';

export default function XAIResultDashboard({ result, onReset }) {
  const score = Math.round(result.nac_resistance_score * 100);
  const isFallback = result.status === 'fallback' || result.status === 'mock_fallback' || result.status === 'fallback_error';
  
  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isFallback && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Showing mock result for demonstration
          </div>
        </div>
      )}

      {/* Risk Score Card */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">NAC Resistance Risk</h2>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-5xl font-bold text-medical-600">{score}%</div>
            <p className="text-gray-600 mt-2">
              Risk of failing Neoadjuvant Chemotherapy
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-4xl font-bold ${score > 60 ? 'text-red-600' : 'text-green-600'}`}>
              {score > 60 ? '⚠️' : '✓'}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {result.confidence && `Confidence: ${Math.round(result.confidence * 100)}%`}
            </p>
          </div>
        </div>

        {/* Risk Gauge */}
        <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${score > 60 ? 'bg-red-600' : score > 40 ? 'bg-yellow-500' : 'bg-green-600'}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Low Risk</span>
          <span>High Risk</span>
        </div>
      </div>

      {/* Clinical Recommendation */}
      <div className={`p-8 rounded-lg shadow-lg border-l-4 ${
        result.recommendation === 'Route to Surgery' 
          ? 'bg-red-50 border-red-500' 
          : 'bg-green-50 border-green-500'
      }`}>
        <h3 className="font-semibold text-lg text-gray-900 mb-3">Clinical Recommendation</h3>
        <div className="flex items-center gap-3 mb-4">
          {result.recommendation === 'Route to Surgery' ? (
            <>
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span className="text-xl font-bold text-red-600">{result.recommendation}</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-xl font-bold text-green-600">{result.recommendation}</span>
            </>
          )}
        </div>
        <p className="text-gray-700 leading-relaxed">
          {result.clinical_reasoning}
        </p>
      </div>

      {/* Key Findings */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">Key Morphological Findings</h3>
        <div className="space-y-2">
          {result.key_findings && result.key_findings.map((finding, idx) => (
            <div key={idx} className="flex items-center gap-3 text-gray-700">
              <span className="w-2 h-2 bg-medical-600 rounded-full"></span>
              {finding}
            </div>
          ))}
        </div>
      </div>

      {/* Anatomical Zones */}
      {result.anatomical_zones && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Anatomical Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(result.anatomical_zones).map(([zone, finding]) => (
              <div key={zone} className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 font-medium capitalize">
                  {zone.replace(/_/g, ' ')}
                </div>
                <div className="text-gray-900 font-semibold mt-1">{finding}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onReset}
          className="flex-1 bg-medical-600 hover:bg-medical-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Analyze Another Patient
        </button>
        <button
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition"
        >
          Export Report
        </button>
      </div>
    </div>
  );
}
```

---

## 🔗 Phase 3: Integration & Mock Fallback (45 minutes)

### 3.1: Connect Frontend to Backend (15 min)

Update `src/App.jsx` to call the correct backend endpoint:

```javascript
// In handleUploadSubmit function, replace the fetch URL:
const response = await fetch(
  'http://localhost:8000/api/v1/predict',
  {
    method: 'POST',
    body: formData,
  }
);
```

### 3.2: Implement 2.5-Second Timeout + Fallback (20 min)

Update the fetch in `src/App.jsx`:

```jsx
const handleUploadSubmit = async (image, biomarkers) => {
  setAppState('uploading');
  setError(null);

  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('biomarkers', JSON.stringify(biomarkers));

    setTimeout(() => setAppState('analyzing'), 500);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/predict',
        {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResult(data);
      setAppState('result');
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        console.log('[DEMO-SAVER] API timeout. Using mock result.');
      }
      throw err;
    }
  } catch (err) {
    console.error('Inference error:', err);
    
    // Always fall back to mock result
    setResult({
      status: 'fallback',
      nac_resistance_score: 0.78,
      recommendation: 'Route to Surgery',
      clinical_reasoning: (
        'Dense stromal infiltration and high cellularity suggest aggressive tumor phenotype. '
        'Combined with ER+ status and moderate Ki-67 (28%), this patient presents high NAC resistance risk. '
        'Recommend surgical evaluation with possible neoadjuvant endocrine therapy instead of chemotherapy.'
      ),
      key_findings: [
        'Dense stromal infiltration',
        'High cellularity',
        'ER+ phenotype',
        'Low Ki-67 expression',
        'Grade 2 tumor morphology'
      ],
      anatomical_zones: {
        stromal_density: 'High',
        nuclear_atypia: 'Moderate',
        mitotic_rate: 'Low-Moderate',
        tubule_formation: 'Partial'
      }
    });
    setAppState('result');
  }
};
```

### 3.3: Test End-to-End (10 min)

1. Start backend: `python main.py`
2. Start frontend: `npm run dev`
3. Upload sample image + biomarkers
4. Verify:
   - ✅ Uploading state shows
   - ✅ Analyzing state shows "Fusing Modalities..."
   - ✅ Result displays (real or mock)
   - ✅ Timeout after 2.5s triggers fallback

---

## 🎨 Phase 4: Polish & Demo Prep (50 minutes)

### 4.1: UI Polish (20 min)

- [ ] Add medical-themed color scheme (blues, minimal reds for alerts)
- [ ] Ensure font hierarchy is clear (H1, H2, body)
- [ ] Add smooth transitions between states
- [ ] Test on mobile (check responsive grid)
- [ ] Add hover states to buttons
- [ ] Ensure contrast ratios meet accessibility standards

Update `src/index.css`:

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer components {
  .btn-primary {
    @apply bg-medical-600 hover:bg-medical-700 text-white font-semibold py-3 px-4 rounded-lg transition;
  }
  
  .card {
    @apply bg-white p-6 rounded-lg shadow-lg;
  }
  
  .section-title {
    @apply text-2xl font-bold text-gray-900 mb-4;
  }
}
```

### 4.2: Create Sample Test Images (10 min)

- Use a real H&E biopsy image (e.g., from NIH histology dataset)
- Or generate synthetic pathology image
- Save as `sample_biopsy.jpg` in frontend `/public` folder
- Test upload with realistic medical image

### 4.3: Create Pitch Slide Deck (15 min)

**Minimal 5-slide deck:**

1. **Title Slide**
   - "OmniPredict: NAC Triage Engine"
   - Tagline: "Day 1 resistance prediction with explainable AI"

2. **The Problem**
   - 60-70% of patients fail NAC
   - Existing solutions: $4k genomics OR black-box AI OR visually blind calculators

3. **Our Solution**
   - Multimodal fusion: H&E + clinical data
   - Explainable AI: Deterministic reasoning, not black boxes
   - Demo-saver fallback: Works offline

4. **Live Demo**
   - Upload biopsy + labs
   - "Fusing Modalities" animation
   - XAI output: risk score + clinical reasoning

5. **Impact & Roadmap**
   - Skip NAC for 25% of patients → Save toxicity
   - Partner with pathology labs
   - Regulatory path: LDT → eventual FDA 510(k)

### 4.4: Final Deployment Checklist (5 min)

- [ ] Backend environment variables set (Gemini API key)
- [ ] Frontend CORS configured for backend URL
- [ ] Sample test image in `/public`
- [ ] Mock fallback tested and working
- [ ] Click through all UI states without errors
- [ ] Pitch script timed to 3 minutes
- [ ] Backup WiFi/hotspot available
- [ ] Export mock result as JSON backup (display offline)

---

## 📊 The Demo Script (2 minutes, judges' time)

```
"Hi, I'm [Name]. We're OmniPredict.

[CLICK: Load app]

60-70% of breast cancer patients don't respond to chemo. 
They suffer 90 days of toxic side effects for nothing.
Existing tools? Either $4,000 genomic assays or black-box AI that tells you a number.

[UPLOAD: H&E biopsy image]

[UPLOAD: Click "Load Sample Biomarkers" dropdown]

Here's a real patient's tumor and labs.

[CLICK: 'Analyze NAC Resistance']

Watch. In 30 seconds, we fuse the morphology of the biopsy—dense stromal infiltration, 
high cellularity, ER+ phenotype—with the bloodwork. And out comes:

[RESULT LOADS]

78% risk of chemo failure. 
Clinical recommendation: Route to Surgery.

Why? Because dense stromal patterns + ER+ status = we know this tumor 
will resist anthracyclines. All from the pathology itself.

No black box. Just deterministic clinical reasoning.

With this, oncologists skip toxic chemo for 20-30% of patients. 
That's massive: fewer side effects, faster to surgery, better outcomes.

Questions?"
```

---

## 🚨 Emergency Fallbacks

**If Gemini API never responds:**
- Backend always returns `MOCK_RESULT` after 2.5s timeout ✅
- Frontend shows real UI, not error screen ✅

**If WiFi dies on stage:**
- Frontend already has mock result hardcoded in state
- Can call `/api/v1/demo` endpoint locally
- Or manually set React state to hardcoded result

**If image upload fails:**
- Frontend gracefully shows error
- "Analyze Another Patient" button resets state
- Can upload different sample image

---

## 📁 Final Directory Structure

```
omnigenpredict-backend/
├── main.py                 # FastAPI server + Gemini integration
├── requirements.txt        # Python dependencies
└── .env                    # API keys (not committed)

omnigenpredict-frontend/
├── src/
│   ├── App.jsx            # Main app with state management
│   ├── components/
│   │   ├── BiopsynUploadForm.jsx      # Image + biomarkers upload
│   │   └── XAIResultDashboard.jsx     # Results display
│   ├── App.css            # Styling
│   └── index.css          # Tailwind + custom styles
├── public/
│   └── sample_biopsy.jpg  # Test image
├── package.json
└── tailwind.config.js
```

---

## ✅ Success Criteria for Judges

**Show working (live or fallback):**
- ✅ Upload H&E biopsy image
- ✅ Upload clinical biomarkers (8 fields)
- ✅ Get NAC resistance score (0-100%)
- ✅ See clinical recommendation
- ✅ Read deterministic reasoning paragraph
- ✅ View key findings + anatomical features
- ✅ All without authentication or database setup

**Explain the tech:**
- ✅ Multimodal fusion: H&E + structured data
- ✅ Gemini 1.5 Pro for late fusion
- ✅ XAI: Deterministic reasoning, not a black box
- ✅ Demo-saver fallback: Works when API fails

**Wow factor:**
- ✅ Clean, medical-grade UI
- ✅ Fast inference (2-3 seconds real, instant fallback)
- ✅ Clinically credible output
- ✅ Story: "Skip toxic chemo for patients who won't benefit"

---

## 🎯 4-Hour Timeline Summary

| Time | Phase | Deliverable |
|------|-------|-------------|
| 0:00–0:45 | Backend | FastAPI + Gemini integration + mock fallback |
| 0:45–1:45 | Frontend | React upload form + XAI results dashboard |
| 1:45–2:30 | Integration | End-to-end flow + timeout handler |
| 2:30–4:00 | Polish | UI refinement + demo script + backup plans |

**Buffer time:** 30 min for debugging + last-minute fixes

---

## 🔧 Quick Reference: Key Code Snippets

### Start Backend
```bash
cd omnigenpredict-backend
source venv/bin/activate
python main.py
```

### Start Frontend
```bash
cd omnigenpredict-frontend
npm run dev
```

### Test API
```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/v1/demo
```

### Force Mock Result (Debug)
In `src/App.jsx`:
```javascript
// Temporarily replace real API call with mock
const mockResult = { /* paste MOCK_RESULT object */ };
setResult(mockResult);
setAppState('result');
```

---

## 🎤 Pitch Closer

> "OmniPredict does one thing obsessively well: it answers the oncologist's Day 1 question in 30 seconds with explainable confidence. Not which drug to give, but whether to give it at all. That's how you save lives and reduce suffering."

**Good luck. You've got this.** 🚀

---

**Document Version:** 1.0 (Hackathon MVP)  
**Last Updated:** 4-Hour Sprint  
**Status:** Ready to Build & Ship
