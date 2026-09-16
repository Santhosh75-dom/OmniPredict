import React, { useState } from 'react';
import { 
  FileText, 
  Award, 
  Check, 
  FileCheck, 
  Printer, 
  Clock 
} from 'lucide-react';

export default function TumorBoardDashboard({ patient }) {
  const tbData = patient.tumorBoard;

  const [attestations, setAttestations] = useState(tbData.attestations);
  const [irbAgreed, setIrbAgreed] = useState(tbData.irbDefault);
  const [clinicianNotes, setClinicianNotes] = useState(tbData.notes);

  const toggleAttestation = (key) => {
    setAttestations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalApproved = Object.values(attestations).filter(Boolean).length;

  const handleGeneratePdf = () => {
    alert(`Generating official Tumor Board Clinical Order PDF (#TB-2025-${patient.id}.pdf)... Order dispatched to Hospital EHR & Surgical Scheduling.`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Case Summary Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
              Patient ID: {patient.id}
            </span>
            <span className="text-xs font-semibold text-slate-700">{patient.name} ({patient.subtitle})</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Session: Feb 16, 2025 &bull; 08:00 AM EST</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Tumor Classification
            </span>
            <span className="text-xs font-bold text-slate-900 block">{tbData.stage}</span>
            <span className="text-[11px] font-semibold text-blue-700 block mt-0.5">{patient.diagnosis}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Machine AI Assessment
            </span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-xl font-black ${patient.riskColor === 'red' ? 'text-red-600' : 'text-emerald-600'}`}>
                {(patient.triageResult.resistanceProbability * 100).toFixed(0)}%
              </span>
              <span className="text-xs font-semibold text-slate-700">Predicted Resistance</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${
              patient.riskColor === 'red'
                ? 'text-red-700 bg-red-50 border-red-100'
                : 'text-emerald-700 bg-emerald-50 border-emerald-100'
            }`}>
              {patient.riskCategory} Phenotype
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Triage Recommendation
            </span>
            <span className="text-xs font-bold text-slate-900 block">{patient.triageResult.triageRecommendation}</span>
          </div>
        </div>
      </section>

      {/* 2. MDT Clinical Review Panel */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            MDT Clinical Synthesis Note
          </h2>
        </div>

        <div className="bg-slate-50 border-l-4 border-blue-600 border-t border-r border-b border-slate-200 rounded-r-lg p-4">
          <p className="text-xs text-slate-800 leading-relaxed">
            "{patient.triageResult.xaiExplanation}"
          </p>
        </div>
      </section>

      {/* 3. Multi-Specialist Quorum Sign-Off */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Multi-Specialist Quorum Attestations
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-600">Quorum: 3/3 Specialists</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => toggleAttestation('medOnc')}
            className={`border rounded-xl p-4 transition-all cursor-pointer select-none space-y-3 ${
              attestations.medOnc ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Medical Oncology</span>
              <input type="checkbox" checked={attestations.medOnc} onChange={() => {}} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dr. A. Sharma, MD</h3>
              <p className="text-xs text-slate-500">Attending Medical Oncologist</p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded border ${
                attestations.medOnc ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {attestations.medOnc && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{attestations.medOnc ? 'Approved Divergence' : 'Pending Signature'}</span>
              </span>
            </div>
          </div>

          <div 
            onClick={() => toggleAttestation('surgOnc')}
            className={`border rounded-xl p-4 transition-all cursor-pointer select-none space-y-3 ${
              attestations.surgOnc ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Surgical Oncology</span>
              <input type="checkbox" checked={attestations.surgOnc} onChange={() => {}} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dr. M. Patel, MD, FACS</h3>
              <p className="text-xs text-slate-500">Chief of Surgical Oncology</p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded border ${
                attestations.surgOnc ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {attestations.surgOnc && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{attestations.surgOnc ? 'Scheduled for Primary Resection' : 'Pending Signature'}</span>
              </span>
            </div>
          </div>

          <div 
            onClick={() => toggleAttestation('pathologist')}
            className={`border rounded-xl p-4 transition-all cursor-pointer select-none space-y-3 ${
              attestations.pathologist ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Anatomic Pathology</span>
              <input type="checkbox" checked={attestations.pathologist} onChange={() => {}} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dr. K. Iyer, MD</h3>
              <p className="text-xs text-slate-500">Surgical Pathologist</p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded border ${
                attestations.pathologist ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {attestations.pathologist && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{attestations.pathologist ? 'Biopsy Verification Confirmed' : 'Pending Signature'}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Attestation & Electronic Signature */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Attestation &amp; Clinician Notes
          </h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Multidisciplinary Tumor Board Order Rationale:
          </label>
          <textarea
            rows={3}
            value={clinicianNotes}
            onChange={(e) => setClinicianNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex items-start space-x-3 pt-1">
          <input
            type="checkbox"
            id="irb-checkbox"
            checked={irbAgreed}
            onChange={(e) => setIrbAgreed(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5 cursor-pointer"
          />
          <label htmlFor="irb-checkbox" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
            I confirm this clinical decision is made in accordance with hospital institutional review board guidelines and CAP/ASCO 2024 compliance protocols.
          </label>
        </div>
      </section>

      {/* 5. Document Export & Action Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center space-x-2 ${
            totalApproved === 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${totalApproved === 3 ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
            <span>Consensus Status: {totalApproved === 3 ? 'Consensus Reached • 3/3 Attestations' : `${totalApproved}/3 Attestations Verified`}</span>
          </div>
        </div>

        <button
          onClick={handleGeneratePdf}
          disabled={!irbAgreed || totalApproved < 3}
          className={`w-full sm:w-auto font-bold px-6 py-3 rounded-lg shadow-xs transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer ${
            irbAgreed && totalApproved === 3 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Generate Tumor Board PDF Clinical Order</span>
        </button>
      </section>

    </div>
  );
}
