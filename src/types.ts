export interface EmergencyCase {
  id: string;
  accessToken: string;
  createdAt: string;
  updatedAt: string;
  status: 'Draft' | 'Awaiting Verification' | 'Verified';
  verificationTimestamp?: string;
  verifiedBy?: string;

  // Demographics
  patientLabel: string;
  age: string;
  sex: 'Male' | 'Female' | 'Other' | 'Unknown';
  category: 'Trauma' | 'Cardiac' | 'Respiratory' | 'Neurological' | 'Overdose' | 'Other';
  location?: string;

  // Clinical Profile
  chiefComplaint: string;
  reportedSymptoms: string;
  symptomOnset: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;

  // Vital Signs
  vitals: {
    bp: string;
    hr: string;
    rr: string;
    spo2: string;
    temp: string;
    gcs: string;
  };

  // Interventions
  interventionsPerformed: string;
  interventionTime?: string;
  additionalNotes?: string;

  // AI Scribe Outputs
  originalTranscript: string;
  aiGeneratedDraft?: string;
  verifiedHandoverSummary?: string;
}

export type PageView =
  | 'landing'
  | 'dashboard'
  | 'create-case'
  | 'scribe'
  | 'verification'
  | 'qr-display'
  | 'doctor-view'
  | 'roadmap';
