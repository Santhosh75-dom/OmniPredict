import React from 'react';
import { BrainCircuit, Activity, UserCheck } from 'lucide-react';
import { patientDatabase } from '../data/patientData';

export default function Header({ activeTab, setActiveTab, selectedPatientId, setSelectedPatientId }) {
  const activePatient = patientDatabase[selectedPatientId];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none">OmniPredict</span>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-100">
                v2.5 SPA
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              In-Silico Oncology Triage Platform
            </p>
          </div>
        </div>

        {/* Global Patient Selector Dropdown */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-700">Active Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="BR-9942">Patient BR-9942 (High Risk / Triple-Neg)</option>
            <option value="BR-1102">Patient BR-1102 (Low Risk / Luminal A)</option>
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                activeTab === 'chart'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. EHR Chart
            </button>
            <button
              onClick={() => setActiveTab('triage')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                activeTab === 'triage'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Triage Engine
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                activeTab === 'simulation'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Pathology Spatial XAI
            </button>
            <button
              onClick={() => setActiveTab('tumorboard')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                activeTab === 'tumorboard'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4. Tumor Board Sign-Off
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
