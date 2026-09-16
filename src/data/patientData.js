export const patientDatabase = {
  "BR-1102": {
    id: "BR-1102",
    mrn: "#BR-1102",
    name: "Sarah Jenkins",
    subtitle: "Luminal A / Chemosensitive Phenotype",
    riskCategory: "Low Risk",
    riskColor: "emerald",
    age: 42,
    sex: "Female",
    menopausal: "Pre-Menopausal",
    ecog: "ECOG 0",
    pcp: "Dr. S. Nair, MD",
    diagnosis: "Invasive Ductal Carcinoma (cT1cN0M0)",
    fastingBloodSugar: "Normal (88 mg/dL)",
    lvef: "65% (Echo confirmed)",
    
    receptors: {
      er: "Positive (95%)",
      pr: "Positive (80%)",
      her2: "Negative (0)",
      ki67: "15% (Low Proliferation)",
      grade: "Grade 2 (Intermediate)"
    },
    
    biopsyHistory: [
      {
        date: "10 days ago (Feb 6, 2025)",
        procedure: "Ultrasound-Guided Core Biopsy",
        site: "Left Breast 2 o'clock",
        findings: "Invasive Ductal Carcinoma, Nottingham Grade 2. Low stromal infiltration.",
        tumorSize: "1.8 cm"
      }
    ],

    labTrends: [
      {
        name: "Absolute Neutrophil Count (ANC)",
        unit: "K/uL",
        range: "1.8 - 7.7 K/uL",
        status: "normal",
        checkpoints: [{ label: "Day -60", value: "4.5" }, { label: "Day -30", value: "4.3" }, { label: "Day 0", value: "4.2" }],
        trend: "stable",
        change: "Normal"
      },
      {
        name: "Serum Creatinine",
        unit: "mg/dL",
        range: "0.6 - 1.1 mg/dL",
        status: "normal",
        checkpoints: [{ label: "Day -60", value: "0.8" }, { label: "Day -30", value: "0.8" }, { label: "Day 0", value: "0.8" }],
        trend: "stable",
        change: "Normal"
      },
      {
        name: "Circulating Tumor Marker CA 15-3",
        unit: "U/mL",
        range: "< 30 U/mL",
        status: "normal",
        checkpoints: [{ label: "Day -60", value: "18" }, { label: "Day -30", value: "19" }, { label: "Day 0", value: "21" }],
        trend: "stable",
        change: "Normal"
      }
    ],

    triageResult: {
      resistanceProbability: 0.18,
      triageRecommendation: "Low Risk: Proceed with Standard Neoadjuvant Chemotherapy (NAC)",
      xaiExplanation: "High estrogen receptor expression combined with low Ki-67 proliferation (15%) indicates favorable chemosensitivity. Histological assay exhibits low stromal density and minimal cellular pleomorphism."
    },

    spatialXAI: {
      focusPercentage: 28,
      spatialCallout: "Model Attention: 28% localized focus on well-differentiated glandular tubules. Low stromal invasion score.",
      regimens: [
        {
          name: "AC-T (Standard Anthracycline NAC)",
          pcrRate: "78% pCR (Favorable)",
          pcrColor: "emerald",
          toxicity: "Standard Manageable",
          recommendation: "Recommended Primary Pathway",
          badgeColor: "emerald"
        },
        {
          name: "Direct Surgical Resection",
          pcrRate: "Secondary Option",
          pcrColor: "blue",
          toxicity: "Surgical Risk",
          recommendation: "Considred if Patient Prefers Immediate Surgery",
          badgeColor: "blue"
        },
        {
          name: "Carboplatin + Pembrolizumab",
          pcrRate: "62% pCR (Moderate)",
          pcrColor: "blue",
          toxicity: "Unnecessary Immune Toxicity",
          recommendation: "Not Indicated for Luminal A",
          badgeColor: "red"
        }
      ]
    },

    tumorBoard: {
      stage: "cT1cN0M0 Stage IA",
      notes: "Patient BR-1102 exhibits classic ER+ chemosensitive features. Proceeding with standard NAC protocol.",
      attestations: { medOnc: true, surgOnc: false, pathologist: true },
      irbDefault: true
    }
  },

  "BR-9942": {
    id: "BR-9942",
    mrn: "#BR-9942",
    name: "Eleanor Vance",
    subtitle: "Triple-Negative / High Risk Refractory Phenotype",
    riskCategory: "High Risk",
    riskColor: "red",
    age: 61,
    sex: "Female",
    menopausal: "Post-Menopausal",
    ecog: "ECOG 1",
    pcp: "Dr. R. Ramanathan, MD",
    diagnosis: "Invasive Ductal Carcinoma (cT2N1M0)",
    fastingBloodSugar: "Normal (94 mg/dL)",
    lvef: "62% (Echo confirmed)",
    
    receptors: {
      er: "Negative (0%)",
      pr: "Negative (0%)",
      her2: "3+ Positive (FISH confirmed)",
      ki67: "85% (High Proliferation)",
      grade: "Grade 3 (Poorly Differentiated)"
    },

    biopsyHistory: [
      {
        date: "14 days ago (Feb 2, 2025)",
        procedure: "Ultrasound-Guided Core Needle Biopsy",
        site: "Right Breast Upper Outer Quadrant",
        findings: "Histology confirmed Invasive Ductal Carcinoma (IDC), Nottingham Grade 3.",
        tumorSize: "3.4 cm"
      }
    ],

    labTrends: [
      {
        name: "Absolute Neutrophil Count (ANC)",
        unit: "K/uL",
        range: "1.8 - 7.7 K/uL",
        status: "normal",
        checkpoints: [{ label: "Day -60", value: "4.2" }, { label: "Day -30", value: "3.9" }, { label: "Day 0", value: "3.8" }],
        trend: "down",
        change: "-9.5%"
      },
      {
        name: "Serum Creatinine",
        unit: "mg/dL",
        range: "0.6 - 1.1 mg/dL",
        status: "normal",
        checkpoints: [{ label: "Day -60", value: "0.9" }, { label: "Day -30", value: "0.9" }, { label: "Day 0", value: "1.0" }],
        trend: "stable",
        change: "+0.1"
      },
      {
        name: "Circulating Tumor Marker CA 15-3",
        unit: "U/mL",
        range: "< 30 U/mL",
        status: "elevated",
        checkpoints: [{ label: "Day -60", value: "38" }, { label: "Day -30", value: "44" }, { label: "Day 0", value: "51" }],
        trend: "up",
        change: "+34.2%"
      }
    ],

    triageResult: {
      resistanceProbability: 0.88,
      triageRecommendation: "High Resistance Risk: Route to Direct Surgical Resection",
      xaiExplanation: "Prediction driven by pronounced stromal desmoplasia and high mitotic index on visual assay, compounded by negative ER status and elevated Ki-67 (85%). Fails threshold for anticipated pathological complete response."
    },

    spatialXAI: {
      focusPercentage: 72,
      spatialCallout: "Model Attention: 72% focus concentrated on dense stroma-tumor interface and cellular pleomorphism. Zero slide background artifact influence.",
      regimens: [
        {
          name: "AC-T (Standard Anthracycline NAC)",
          pcrRate: "12% pCR (Low)",
          pcrColor: "red",
          toxicity: "High Cardiotoxicity",
          recommendation: "Contraindicated / High Resistance",
          badgeColor: "red"
        },
        {
          name: "Direct Surgical Resection",
          pcrRate: "Primary Clear Margin",
          pcrColor: "emerald",
          toxicity: "Standard Surgical Risk",
          recommendation: "Recommended Primary Pathway",
          badgeColor: "emerald"
        },
        {
          name: "Carboplatin + Pembrolizumab",
          pcrRate: "54% pCR (Moderate)",
          pcrColor: "blue",
          toxicity: "Moderate Immune Toxicity",
          recommendation: "Secondary Trial Consideration",
          badgeColor: "blue"
        }
      ]
    },

    tumorBoard: {
      stage: "cT2N1M0 Stage IIB",
      notes: "Concur with AI-assisted triage findings. Chemotherapy risks outweigh anticipated pathological response. Patient consented for immediate surgical consult.",
      attestations: { medOnc: true, surgOnc: true, pathologist: true },
      irbDefault: true
    }
  }
};
