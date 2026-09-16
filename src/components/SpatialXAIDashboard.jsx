import React, { useState } from 'react';
import { Microscope, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SpatialXAIDashboard({ patient }) {
  const [viewMode, setViewMode] = useState('heatmap'); // 'raw' | 'heatmap'
  const spatial = patient.spatialXAI;

  return (
    <div className="space-y-6">
      
      {/* Sub-banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-900">Spatial Morphometry &amp; Treatment Pathway Decision Engine</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">Case #{patient.id} &bull; {patient.name} ({patient.subtitle})</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Spatial Analysis Active</span>
        </div>
      </div>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Panel 1: Spatial Attention / Grad-CAM (6 cols) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Microscope className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Deep Feature Localization (XAI)
                </h2>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 font-semibold rounded-md transition-all ${
                    viewMode === 'raw' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  [ Raw H&amp;E Slide ]
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`px-3 py-1 font-semibold rounded-md transition-all ${
                    viewMode === 'heatmap' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  [ Grad-CAM Attention Heatmap ]
                </button>
              </div>
            </div>

            {/* High-Res Pathology Slide Container with Grad-CAM Heatmap Overlay */}
            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner flex items-center justify-center group">
              
              {/* Real H&E Stained Biopsy Slide Photo */}
              <img
                src="/he_biopsy_spatial_slide.jpg"
                alt="Real H&E Biopsy Pathology Slide"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Grad-CAM Heatmap Overlay Layer */}
              {viewMode === 'heatmap' && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 500 350" preserveAspectRatio="none">
                    <defs>
                      <radialGradient id="gradCamHotPrimary" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.88" />
                        <stop offset="35%" stopColor="#f97316" stopOpacity="0.75" />
                        <stop offset="65%" stopColor="#eab308" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="gradCamHotSecondary" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                        <stop offset="40%" stopColor="#f97316" stopOpacity="0.7" />
                        <stop offset="70%" stopColor="#eab308" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Heatmap Hotspot 1: High Mitotic Cluster (Right Panel) */}
                    <ellipse cx="370" cy="180" rx="110" ry="120" fill="url(#gradCamHotPrimary)" />
                    
                    {/* Heatmap Hotspot 2: Dense Stroma-Tumor Interface (Left Panel) */}
                    <ellipse cx="140" cy="110" rx="95" ry="85" fill="url(#gradCamHotSecondary)" />

                    {/* Spatial Bounding Attention Focus Contour */}
                    <rect x="250" y="55" width="220" height="250" rx="14" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 4" />
                    <text x="260" y="80" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace" className="drop-shadow-md">
                      PRIMARY ATTENTION FOCUS ({spatial.focusPercentage}%)
                    </text>
                  </svg>
                </div>
              )}

              {/* Mode Badge Overlay */}
              <div className="absolute top-3 left-3 bg-slate-900/85 text-white font-mono text-[10px] px-2.5 py-1 rounded border border-slate-700 shadow-sm backdrop-blur-xs flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${viewMode === 'heatmap' ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`}></span>
                <span>{viewMode === 'heatmap' ? 'MODE: GRAD-CAM ATTENTION MAP (72% FOCUS)' : 'MODE: RAW H&E SLIDE (40x MAG)'}</span>
              </div>
            </div>

            {/* Spatial Annotation Callout Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Spatial Feature Attribution Callout</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                "{spatial.spatialCallout}"
              </p>
            </div>
          </div>
        </div>

        {/* Panel 2: Regimen Simulator (6 cols) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                In-Silico "What-If" Regimen Simulator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimated response rates across alternative front-line clinical strategies based on patient phenotype.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Protocol / Regimen</th>
                    <th className="p-3">Predicted Response</th>
                    <th className="p-3">Toxicity Profile</th>
                    <th className="p-3">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {spatial.regimens.map((r, idx) => (
                    <tr key={idx} className={r.badgeColor === 'emerald' ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'hover:bg-slate-50/50'}>
                      <td className="p-3 font-semibold text-slate-900">{r.name}</td>
                      <td className={`p-3 font-mono font-bold ${
                        r.pcrColor === 'emerald' ? 'text-emerald-700' : r.pcrColor === 'red' ? 'text-red-600' : 'text-blue-700'
                      }`}>
                        {r.pcrRate}
                      </td>
                      <td className="p-3 text-slate-600">{r.toxicity}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          r.badgeColor === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.badgeColor === 'red'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {r.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Clinical Pathway Rationale</h4>
                <p className="text-xs text-emerald-800 leading-relaxed mt-1 font-medium">
                  {patient.id === 'BR-9942' 
                    ? "Direct surgical resection avoids 90 days of futile cardiotoxic chemotherapy (AC-T), achieving primary surgical margin clearance."
                    : "Standard AC-T neoadjuvant chemotherapy yields high pCR rates (78%) for ER+ Luminal A phenotype; proceed with standard protocol."}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
