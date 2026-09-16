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
import asyncio
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Configure Gemini API safely
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai = None
if GEMINI_API_KEY and GEMINI_API_KEY != "mock_key_or_user_key":
    try:
        import google.generativeai as genai_module
        genai_module.configure(api_key=GEMINI_API_KEY)
        genai = genai_module
        logger.info("✅ Gemini API configured successfully with live key")
    except Exception as e:
        logger.warning(f"⚠️ Failed to configure Gemini API: {e}")
else:
    logger.info("ℹ️ Running in Demo/Fallback mode (No valid GEMINI_API_KEY set)")

app = FastAPI(
    title="OmniPredict - NAC Triage Engine",
    description="Multimodal fusion of H&E biopsies + clinical data for NAC resistance prediction",
    version="1.0.0"
)

# ============ CORS Configuration ============
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
    age: int = 61
    er_status: str = "Negative"
    pr_status: str = "Negative"
    her2_status: str = "Positive"
    ki67_percentage: float = 85.0
    tumor_size_cm: float = 3.2
    grade: int = 3
    lymph_node_status: str = "Positive"

# ============ Hardcoded Mock Results ============

MOCK_RESULT_HIGH_RISK = {
    "status": "mock_fallback",
    "nac_resistance_score": 0.88,
    "confidence": 0.92,
    "recommendation": "High Resistance. Route to Direct Surgery.",
    "clinical_reasoning": (
        "Prediction driven by high stromal density and aggressive mitotic rate in the visual assay, "
        "compounded by the patient's Triple-Negative/HER2+ status and high Ki-67 proliferation index (85%). "
        "NAC is statistically unlikely to achieve Pathological Complete Response."
    ),
    "key_findings": [
        "Dense stromal infiltration",
        "High cellularity with grade 3 atypia",
        "HER2+ phenotype with critical Ki-67 (85%)",
        "Positive lymph node involvement",
        "Poor tubule formation (<10%)"
    ],
    "anatomical_zones": {
        "stromal_density": "High",
        "nuclear_atypia": "High (Grade 3)",
        "mitotic_rate": "High (>20/10 HPF)",
        "tubule_formation": "Poor (<10%)"
    }
}

MOCK_RESULT_LOW_RISK = {
    "status": "mock_fallback",
    "nac_resistance_score": 0.28,
    "confidence": 0.89,
    "recommendation": "Proceed with NAC",
    "clinical_reasoning": (
        "Well-differentiated tumor with low-grade nuclear atypia on H&E. Favorable response profile "
        "associated with low Ki-67 index (18%) and preserved glandular tubule architecture. "
        "Patient is a strong candidate for neoadjuvant anthracycline-based therapy."
    ),
    "key_findings": [
        "Low-grade morphology",
        "Well-formed tubule structures (>75%)",
        "Low Ki-67 proliferation index (18%)",
        "Minimal stromal invasion",
        "Lymph node negative"
    ],
    "anatomical_zones": {
        "stromal_density": "Low-Moderate",
        "nuclear_atypia": "Low (Grade 1)",
        "mitotic_rate": "Low (<10/10 HPF)",
        "tubule_formation": "Well-formed (>75%)"
    }
}

# ============ Core Gemini Inference ============

async def call_gemini_with_timeout(image_b64: str, image_mime: str, biomarkers: ClinicalBiomarkers):
    """
    Call Gemini API with multimodal vision + clinical data.
    Attempts live model generation with fast fallback.
    """
    if not genai:
        raise ValueError("Gemini API not configured")

    system_prompt = """You are an expert pathologist and oncologist analyzing breast cancer biopsies for Neoadjuvant Chemotherapy (NAC) triage.

You will receive:
1. An H&E biopsy slide image (or visual representation)
2. Clinical biomarkers (age, ER/PR/HER2 status, Ki-67, tumor grade, etc.)

Your task:
1. Analyze morphological features of the tumor
2. Integrate with clinical data
3. Predict NAC (Neoadjuvant Chemotherapy) resistance as a 0-1 score
4. Explain deterministically why this patient will/won't respond to chemo

**CRITICAL: Output ONLY valid JSON. No markdown syntax outside the JSON.**

Output format (strict JSON):
{
  "nac_resistance_score": <float between 0-1>,
  "confidence": <float between 0-1>,
  "recommendation": "<High Resistance. Route to Direct Surgery.|Proceed with NAC>",
  "clinical_reasoning": "<2-3 sentence clinical reasoning text linking morphology + biomarkers>",
  "key_findings": ["finding1", "finding2"],
  "anatomical_zones": {
    "stromal_density": "<High|Moderate|Low>",
    "nuclear_atypia": "<High|Moderate|Low>",
    "mitotic_rate": "<High|Moderate|Low>",
    "tubule_formation": "<Well-formed|Partial|Poor>"
  }
}
"""

    user_message = f"""
Analyze this breast cancer biopsy and predict NAC resistance.

Clinical Data:
- Age: {biomarkers.age} years
- ER Status: {biomarkers.er_status}
- HER2 Status: {biomarkers.her2_status}
- Ki-67 Index: {biomarkers.ki67_percentage}%
- Tumor Size: {biomarkers.tumor_size_cm} cm
- Grade: {biomarkers.grade}/3

Output ONLY valid JSON.
"""

    async def gemini_call():
        # Try available Gemini models
        model_names = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-pro"]
        last_err = None
        for name in model_names:
            try:
                model = genai.GenerativeModel(model_name=name)
                contents = [system_prompt]
                if image_b64:
                    contents.append({
                        "mime_type": image_mime,
                        "data": image_b64
                    })
                contents.append(user_message)
                response = model.generate_content(contents)
                if response and response.text:
                    return response.text
            except Exception as e:
                last_err = e
                logger.warning(f"Model {name} attempt error: {e}")
                continue
        raise last_err or RuntimeError("No Gemini model responded")

    logger.info("🔄 Invoking live Gemini API...")
    result_text = await asyncio.wait_for(
        asyncio.create_task(gemini_call()),
        timeout=3.5
    )
    
    logger.info("✅ Live Gemini response received")
    
    result_text = result_text.strip()
    if result_text.startswith('```json'):
        result_text = result_text[7:]
    if result_text.startswith('```'):
        result_text = result_text[3:]
    if result_text.endswith('```'):
        result_text = result_text[:-3]
    
    result_json = json.loads(result_text.strip())
    result_json["status"] = "success"
    return result_json

# ============ API Routes ============

@app.get("/health")
async def health_check():
    return {
        "status": "alive",
        "service": "OmniPredict NAC Triage Engine",
        "gemini_api_active": genai is not None,
        "version": "1.0.0"
    }

@app.post("/api/v1/predict-nac")
async def predict_nac_resistance(
    image: Optional[UploadFile] = File(None),
    biomarkers: str = ""
):
    try:
        if biomarkers:
            try:
                biomarkers_dict = json.loads(biomarkers)
            except Exception:
                biomarkers_dict = {}
        else:
            biomarkers_dict = {}

        biomarkers_obj = ClinicalBiomarkers(**biomarkers_dict)
        logger.info(f"📋 Biomarkers parsed: Age {biomarkers_obj.age}, ER {biomarkers_obj.er_status}, Ki-67 {biomarkers_obj.ki67_percentage}%")
        
    except Exception as e:
        logger.error(f"❌ Biomarkers parsing error: {str(e)}")
        biomarkers_obj = ClinicalBiomarkers()
    
    try:
        image_b64 = None
        image_mime = "image/png"
        if image:
            image_data = await image.read()
            image_b64 = base64.b64encode(image_data).decode('utf-8')
            image_mime = "image/jpeg" if (image.filename or "").lower().endswith(('.jpg', '.jpeg')) else "image/png"
            
        if genai:
            result = await call_gemini_with_timeout(
                image_b64=image_b64 or "",
                image_mime=image_mime,
                biomarkers=biomarkers_obj
            )
            return JSONResponse(content=result)
        else:
            raise ValueError("Gemini API key not configured")
            
    except Exception as e:
        logger.warning(f"[DEMO-SAVER] Live API fallback triggered: {e}")
        if biomarkers_obj.ki67_percentage >= 30 or biomarkers_obj.her2_status == "Positive":
            mock = MOCK_RESULT_HIGH_RISK
        else:
            mock = MOCK_RESULT_LOW_RISK
        return JSONResponse(content=mock)

@app.post("/api/v1/demo")
async def demo_result(high_risk: bool = True):
    mock = MOCK_RESULT_HIGH_RISK if high_risk else MOCK_RESULT_LOW_RISK
    return JSONResponse(content=mock)

@app.get("/api/v1/models")
async def list_models():
    return {
        "available_models": ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-pro"],
        "api_active": genai is not None
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("FASTAPI_PORT", 8001))
    print(f"🚀 Starting OmniPredict backend on http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
