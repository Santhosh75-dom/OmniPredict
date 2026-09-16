import React from 'react';
import { 
  User, 
  Dna, 
  Microscope, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  BrainCircuit
} from 'lucide-react';

export default function EHRDashboard({ patient, onImportToTriage }) {
  return (
    <div className="space-y-6">
      
      {/* Patient Master Demographic Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
              {patient.id === "BR-9942" ? "EV" : "SJ"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  MRN: {patient.mrn}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  patient.riskColor === 'red'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {patient.diagnosis}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <span><strong>Age:</strong> {patient.age}</span>
                <span>&bull;</span>
                <span><strong>Sex:</strong> {patient.sex}</span>
                <span>&bull;</span>
                <span><strong>Status:</strong> {patient.menopausal}</span>
                <span>&bull;</span>
                <span><strong>Performance:</strong> <span className="font-semibold text-slate-800">{patient.ecog}</span></span>
                <span>&bull;</span>
                <span><strong>PCP:</strong> {patient.pcp}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Fasting Blood Sugar</span>
              <span className="text-xs font-bold text-slate-800">{patient.fastingBloodSugar}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Cardiac LVEF</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {patient.lvef}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left Column (6 cols): Receptor Panel & Biopsy Timeline */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          
          {/* Hormone Receptor Panel Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Dna className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Hormone Receptor &amp; Genomic Profile
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">CAP/ASCO Verified</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Estrogen Receptor (ER)</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.receptors.er}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Progesterone Receptor (PR)</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.receptors.pr}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">HER2 Status</span>
                  <span className="text-xs font-bold text-blue-700 mt-0.5 block">{patient.receptors.her2}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Ki-67 Index</span>
                  <span className={`text-xs font-bold mt-0.5 block ${patient.riskColor === 'red' ? 'text-red-600' : 'text-emerald-700'}`}>
                    {patient.receptors.ki67}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Histological Grade</span>
                  <span className="text-xs font-bold text-amber-700 mt-0.5 block">{patient.receptors.grade}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Biopsy History Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Microscope className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Biopsy &amp; Procedure History
                </h2>
              </div>
              <span className="text-xs text-slate-500">{patient.biopsyHistory.length} Event Logged</span>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-1">
              {patient.biopsyHistory.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900">{item.procedure}</h3>
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {item.findings}
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px] text-slate-500">
                      <span>Site: <strong className="text-slate-700">{item.site}</strong></span>
                      <span>Tumor Size: <strong className="text-slate-900 font-mono">{item.tumorSize}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (6 cols): 60-Day Temporal Laboratory Trends */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  60-Day Temporal Laboratory Trends
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">3 Checkpoints (Day -60 &rarr; Day 0)</span>
            </div>

            <div className="space-y-4">
              {patient.labTrends.map((lab, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{lab.name}</h3>
                      <span className="text-[10px] text-slate-500">Ref Range: {lab.range}</span>
                    </div>
                    <div className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold border ${
                      lab.status === 'elevated'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      {lab.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                      {lab.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{lab.change}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-center">
                    {lab.checkpoints.map((cp, cIdx) => (
                      <div key={cIdx} className={`p-2 rounded border ${
                        cIdx === 2 && lab.status === 'elevated'
                          ? 'bg-red-100/50 border-red-200 text-red-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <span className="text-[10px] font-semibold text-slate-400 block">{cp.label}</span>
                        <span className="text-sm font-bold font-mono">{cp.value}</span>
                        <span className="text-[9px] text-slate-400 block">{lab.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Action Footer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-600">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Stage {patient.name} EHR State</h3>
            <p className="text-xs text-slate-500">Import longitudinal patient biomarkers into the deep attention fusion pipeline.</p>
          </div>
        </div>

        <button
          onClick={onImportToTriage}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-xs transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
        >
          <span>Import EHR State to Multimodal Triage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
