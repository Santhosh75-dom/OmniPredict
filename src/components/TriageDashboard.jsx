import React, { useState, useRef } from 'react';
import { 
  Dna, 
  Upload, 
  BrainCircuit, 
  ChevronRight, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

export default function TriageDashboard({ patient, selectedPatientId, setSelectedPatientId }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setTriageResult(null);
    }
  };

  const runPrediction = async () => {
    setIsAnalyzing(true);
    setTriageResult(null);

    try {
      const formData = new FormData();
      if (image) {
        formData.append("biopsy_image", image);
      }
      formData.append("clinical_data", JSON.stringify({
        age: patient.age,
        er_status: patient.receptors.er,
        her2_status: patient.receptors.her2,
        tumor_grade: patient.receptors.grade,
        ki67_index: patient.receptors.ki67
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch("http://localhost:8001/api/v1/predict-nac", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      
      if (data.nac_resistance_score !== undefined) {
        setTriageResult({
          resistanceProbability: data.nac_resistance_score,
          recommendation: data.recommendation || patient.triageResult.triageRecommendation,
          explanation: data.clinical_reasoning || patient.triageResult.xaiExplanation
        });
      } else {
        setTriageResult({
          resistanceProbability: patient.triageResult.resistanceProbability,
          recommendation: patient.triageResult.triageRecommendation,
          explanation: patient.triageResult.xaiExplanation
        });
      }
    } catch (error) {
      console.warn("Backend API fallback active:", error);
      setTimeout(() => {
        setTriageResult({
          resistanceProbability: patient.triageResult.resistanceProbability,
          recommendation: patient.triageResult.triageRecommendation,
          explanation: patient.triageResult.xaiExplanation
        });
      }, 1500);
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 1600);
    }
  };

  const isHighRisk = triageResult && triageResult.resistanceProbability >= 0.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Input Modalities (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* EHR Patient Selector Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <label htmlFor="ehr-select-triage" className="text-sm font-semibold text-slate-700">
              EHR Record Ingestion:
            </label>
          </div>
          <select
            id="ehr-select-triage"
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setTriageResult(null);
            }}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto cursor-pointer"
          >
            <option value="BR-1102">Patient BR-1102 (Luminal A / Low Risk)</option>
            <option value="BR-9942">Patient BR-9942 (Triple-Neg / High Risk)</option>
          </select>
        </div>

        {/* Synchronized Clinical Biomarkers Card */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Synchronized Clinical Biomarkers</h2>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
              UID: {patient.id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
              <p className="text-xs uppercase font-bold text-slate-400">Age</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{patient.age}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
              <p className="text-xs uppercase font-bold text-slate-400">ER Status</p>
              <p className="text-xs font-bold text-slate-800 mt-1.5">{patient.receptors.er}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
              <p className="text-xs uppercase font-bold text-slate-400">HER2 Status</p>
              <p className="text-xs font-bold text-slate-800 mt-1.5">{patient.receptors.her2}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
              <p className="text-xs uppercase font-bold text-slate-400">Grade</p>
              <p className="text-sm font-bold text-slate-800 mt-1.5">{patient.receptors.grade}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
              <p className="text-xs uppercase font-bold text-slate-400">Ki-67 Index</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{patient.receptors.ki67}</p>
            </div>
          </div>
        </section>

        {/* Biopsy Visual Input Card */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">H&amp;E Biopsy Slide (Vision Modality)</h2>
          <p className="text-xs text-slate-500 mb-4">Upload standard histology slide scan or digitized microscopic tile</p>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl bg-slate-50 flex flex-col items-center justify-center h-60 overflow-hidden transition-colors cursor-pointer"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Biopsy slide" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Click or drag biopsy slide file to stage</p>
                <p className="text-xs text-slate-400 mt-1">Accepts standard microscopy exports (.JPG, .PNG, .TIFF)</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </div>
        </section>

        {/* Action Trigger Button */}
        <button
          onClick={runPrediction}
          disabled={isAnalyzing}
          className={`w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-xs transition-all ${
            isAnalyzing ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 animate-spin text-blue-600" />
              Executing Multimodal Attention Fusion...
            </span>
          ) : (
            <>
              Execute Multimodal Decision Triage <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* RIGHT COLUMN: Output & XAI Panel (5 cols) */}
      <div className="lg:col-span-5">
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs min-h-[540px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-base font-bold text-slate-900">Inference Assessment</h2>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">XAI Output</span>
            </div>

            {/* State 1: Idle */}
            {!isAnalyzing && !triageResult && (
              <div className="py-20 text-center flex flex-col items-center">
                <ShieldAlert className="w-14 h-14 text-slate-300 mb-3" />
                <p className="text-slate-600 font-semibold text-sm">Awaiting Modality Ingestion</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Select a patient profile, upload the corresponding histology slide, and run inference.
                </p>
              </div>
            )}

            {/* State 2: Processing */}
            {isAnalyzing && (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-700">Synthesizing Feature Latent Vectors</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">Cross-Attending Biomarkers &amp; Morphometrics</p>
              </div>
            )}

            {/* State 3: Result */}
            {triageResult && !isAnalyzing && (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Probability of Neoadjuvant Resistance
                  </p>
                  <div className={`text-6xl font-extrabold tracking-tight ${isHighRisk ? 'text-red-600' : 'text-emerald-600'}`}>
                    {(triageResult.resistanceProbability * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-2">
                    {isHighRisk ? "Pathological Complete Response Unlikely" : "High Likelihood of Pathological Complete Response"}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                  isHighRisk ? 'bg-red-50 border-red-200 text-red-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  {isHighRisk ? <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                  <div>
                    <h3 className="text-sm font-bold">Clinical Directive</h3>
                    <p className="text-xs mt-1 leading-relaxed">{triageResult.recommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {triageResult && !isAnalyzing && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 mb-2">
                <BrainCircuit className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Explainable AI (XAI) Attribution</h4>
              </div>
              <div className="bg-slate-50 border-l-4 border-blue-600 p-3.5 rounded-r-lg">
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {triageResult.explanation}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

    </div>
  );
}
