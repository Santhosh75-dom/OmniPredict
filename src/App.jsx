import React, { useState } from 'react';
import Header from './components/Header';
import EHRDashboard from './components/EHRDashboard';
import TriageDashboard from './components/TriageDashboard';
import SpatialXAIDashboard from './components/SpatialXAIDashboard';
import TumorBoardDashboard from './components/TumorBoardDashboard';
import { patientDatabase } from './data/patientData';

export default function App() {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'triage' | 'simulation' | 'tumorboard'
  const [selectedPatientId, setSelectedPatientId] = useState('BR-9942');

  const currentPatient = patientDatabase[selectedPatientId] || patientDatabase['BR-9942'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      
      {/* Persistent Global Header & Patient Selector */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPatientId={selectedPatientId}
        setSelectedPatientId={setSelectedPatientId}
      />

      {/* Main Active Dashboard Component Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'chart' && (
          <EHRDashboard
            patient={currentPatient}
            onImportToTriage={() => setActiveTab('triage')}
          />
        )}

        {activeTab === 'triage' && (
          <TriageDashboard
            patient={currentPatient}
            selectedPatientId={selectedPatientId}
            setSelectedPatientId={setSelectedPatientId}
          />
        )}

        {activeTab === 'simulation' && (
          <SpatialXAIDashboard
            patient={currentPatient}
          />
        )}

        {activeTab === 'tumorboard' && (
          <TumorBoardDashboard
            patient={currentPatient}
          />
        )}
      </main>

      {/* Persistent Hospital Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
          <p>&copy; 2025 OmniPredict Oncology Triage SPA &bull; All 4 Modular Dashboards Active</p>
          <p className="font-mono text-[11px] text-slate-400 mt-1 sm:mt-0">HIPAA Compliant &bull; FHIR R4 Connected &bull; Zero Third-Party Lag</p>
        </div>
      </footer>

    </div>
  );
}
