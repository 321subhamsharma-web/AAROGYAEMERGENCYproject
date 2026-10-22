import { EmergencyCase } from './types';

const STORAGE_KEY = 'aarogya_emergency_cases';

export const isDemoMode = (): boolean => {
  try {
    const env = (import.meta as any).env || {};
    return !env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY;
  } catch {
    return true;
  }
};

export const generateAccessToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateCaseId = (): string => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `HN-2026-${num}`;
};

export const getCases = (): EmergencyCase[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCases = (cases: EmergencyCase[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
};

export const addCase = (newCase: EmergencyCase): void => {
  const cases = getCases();
  cases.push(newCase);
  saveCases(cases);
};

export const updateCase = (id: string, updates: Record<string, any>): void => {
  const cases = getCases();
  const idx = cases.findIndex(c => c.id === id);
  if (idx !== -1) {
    const updated = { ...cases[idx], ...updates, updatedAt: new Date().toISOString() };
    // Remove undefined values
    const keys = Object.keys(updated) as (keyof EmergencyCase)[];
    keys.forEach(key => {
      if ((updated as any)[key] === undefined) {
        delete (updated as any)[key];
      }
    });
    cases[idx] = updated as EmergencyCase;
    saveCases(cases);
  }
};

export const deleteCase = (id: string): void => {
  const cases = getCases().filter(c => c.id !== id);
  saveCases(cases);
};

export const getCaseById = (id: string): EmergencyCase | undefined => {
  return getCases().find(c => c.id === id);
};

export const getCaseByToken = (token: string): EmergencyCase | undefined => {
  return getCases().find(c => c.accessToken === token);
};

export const seedDemoData = (): void => {
  const existing = getCases();
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const demoCases: EmergencyCase[] = [
    {
      id: 'HN-2026-001',
      accessToken: generateAccessToken(),
      createdAt: now,
      updatedAt: now,
      status: 'Verified',
      verificationTimestamp: now,
      verifiedBy: 'Paramedic Singh',
      patientLabel: 'Unknown Male',
      age: '55',
      sex: 'Male',
      category: 'Cardiac',
      location: 'NH-48, Near Cyber City, Gurugram',
      chiefComplaint: 'Heavy crushing chest pain, radiating down left arm. Lightheaded and cold sweats.',
      reportedSymptoms: 'Chest pain, left arm radiation, diaphoresis, lightheadedness, nausea',
      symptomOnset: 'Approximately 45 minutes ago',
      medicalHistory: 'Type 2 Diabetes, Hypertension',
      allergies: 'Unknown / Unconfirmed',
      currentMedications: 'Metformin 500mg, Amlodipine 5mg',
      vitals: { bp: '90/60', hr: '112', rr: '22', spo2: '91', temp: '98.4°F', gcs: '15' },
      interventionsPerformed: 'Aspirin 325mg chewed, Nitroglycerin 0.4mg SL x1, IV access established, Oxygen 4L via nasal cannula',
      interventionTime: '14:35',
      additionalNotes: 'Patient appears anxious, pale, diaphoretic. 12-lead ECG shows ST elevation in leads II, III, aVF.',
      originalTranscript: '55-year-old male found clutching chest on roadside near Cyber City. Reports crushing chest pain radiating to left arm for about 45 minutes. Cold sweats, feeling lightheaded. History of diabetes and hypertension. BP 90/60, heart rate 112, breathing fast at 22, oxygen saturation 91 percent. Gave aspirin and nitroglycerin sublingually. Started IV, put on oxygen at 4 liters. ECG shows inferior STEMI. Allergies unknown. On metformin and amlodipine.',
      aiGeneratedDraft: '⚠️ AI Draft — Verification Required\n\nPATIENT: Unknown Male, 55 years, Male\nCATEGORY: Cardiac Emergency\nLOCATION: NH-48, Near Cyber City, Gurugram\n\nCHIEF COMPLAINT: Heavy crushing chest pain radiating down left arm with lightheadedness and cold sweats. Onset ~45 min ago.\n\nSYMPTOMS: Chest pain, left arm radiation, diaphoresis, lightheadedness, nausea\n\nVITALS: BP 90/60 mmHg | HR 112 bpm | RR 22 bpm | SpO2 91% | Temp 98.4°F | GCS 15\n\nMEDICAL HISTORY: Type 2 Diabetes, Hypertension\nMEDICATIONS: Metformin 500mg, Amlodipine 5mg\nALLERGIES: Unknown / Unconfirmed\n\nINTERVENTIONS: Aspirin 325mg PO, Nitroglycerin 0.4mg SL x1, IV access, O2 4L NC\nECG: ST elevation in leads II, III, aVF (Inferior STEMI)\n\nNOTES: Patient anxious, pale, diaphoretic. High suspicion for acute myocardial infarction.',
      verifiedHandoverSummary: '55M cardiac emergency: crushing chest pain with left arm radiation x45min. Vitals unstable (BP 90/60, HR 112, SpO2 91%). ECG confirms inferior STEMI. Aspirin + NTG given, IV/O2 established. Allergies unknown. Immediate cath lab activation recommended.'
    },
    {
      id: 'HN-2026-002',
      accessToken: generateAccessToken(),
      createdAt: now,
      updatedAt: now,
      status: 'Draft',
      patientLabel: 'Priya Sharma',
      age: '28',
      sex: 'Female',
      category: 'Respiratory',
      location: 'Sector 56, Residential Complex',
      chiefComplaint: 'Severe shortness of breath, wheezing, unable to speak in full sentences',
      reportedSymptoms: 'Dyspnea, wheezing, accessory muscle use, anxiety',
      symptomOnset: '20 minutes ago after exposure to dust',
      medicalHistory: 'Bronchial Asthma since childhood',
      allergies: 'Penicillin, Dust mites',
      currentMedications: 'Salbutamol inhaler PRN, Montelukast 10mg nightly',
      vitals: { bp: '130/85', hr: '128', rr: '32', spo2: '88', temp: '98.8°F', gcs: '15' },
      interventionsPerformed: 'Salbutamol nebulization x2, IV Hydrocortisone 200mg, Oxygen 6L via face mask',
      interventionTime: '15:10',
      additionalNotes: 'Patient sitting upright, tripod position. Audible wheeze. Speaking in single words only.',
      originalTranscript: '28-year-old female, known asthma patient. Found gasping for air at home in Sector 56. Severe breathlessness started 20 minutes back after cleaning dusty area. Wheezing loud. Can barely talk. BP 130/85, pulse 128, respiratory rate 32, sats dropped to 88 percent. Allergic to penicillin and dust mites. Gave two rounds of salbutamol nebulization, IV hydrocortisone 200mg, oxygen at 6 liters. Still struggling.',
      aiGeneratedDraft: '',
      verifiedHandoverSummary: ''
    },
    {
      id: 'HN-2026-003',
      accessToken: generateAccessToken(),
      createdAt: now,
      updatedAt: now,
      status: 'Awaiting Verification',
      patientLabel: 'Rajesh Kumar',
      age: '42',
      sex: 'Male',
      category: 'Trauma',
      location: 'Industrial Area, Phase 3',
      chiefComplaint: 'Fall from height approximately 10 feet. Head injury with loss of consciousness.',
      reportedSymptoms: 'Head trauma, brief LOC, vomiting, confusion',
      symptomOnset: 'Approximately 30 minutes ago',
      medicalHistory: 'None known',
      allergies: 'Unknown / Unconfirmed',
      currentMedications: 'Unknown / Unconfirmed',
      vitals: { bp: '140/90', hr: '98', rr: '18', spo2: '96', temp: '98.6°F', gcs: '13' },
      interventionsPerformed: 'Cervical spine immobilization, head dressing applied, IV access, Tranexamic acid 1g IV',
      interventionTime: '15:45',
      additionalNotes: 'GCS E3V4M6. Pupils equal and reactive. Bleeding from left temporal area controlled.',
      originalTranscript: '42-year-old male fell from scaffold about 10 feet at industrial site. Hit head on concrete. Was unconscious for maybe 2 minutes. Now confused, vomiting once. GCS 13. BP 140/90, pulse 98, sats 96. Laceration on left temple, bleeding controlled with pressure dressing. C-spine immobilized. Gave TXA 1 gram IV. No known allergies or medical history. Needs CT head urgently.',
      aiGeneratedDraft: '⚠️ AI Draft — Verification Required\n\nPATIENT: Rajesh Kumar, 42 years, Male\nCATEGORY: Trauma — Head Injury\nLOCATION: Industrial Area, Phase 3\n\nCHIEF COMPLAINT: Fall from ~10 feet with head impact on concrete. Brief LOC (~2 min).\n\nSYMPTOMS: Head trauma, confusion, vomiting x1\n\nVITALS: BP 140/90 mmHg | HR 98 bpm | RR 18 bpm | SpO2 96% | Temp 98.6°F | GCS 13 (E3V4M6)\n\nMEDICAL HISTORY: None known\nALLERGIES: Unknown / Unconfirmed\nMEDICATIONS: Unknown / Unconfirmed\n\nINTERVENTIONS: C-spine immobilization, pressure dressing (L temporal), IV access, TXA 1g IV\n\nEXAM: Pupils equal & reactive. L temporal laceration — bleeding controlled.\n\nURGENT: CT Head required. Monitor for deterioration.',
      verifiedHandoverSummary: ''
    }
  ];

  saveCases(demoCases);
};

// Deterministic AI Engine - parses crude text into structured clinical data
export const deterministicAIEngine = (transcript: string, existingCase: Partial<EmergencyCase>): Partial<EmergencyCase> => {
  const text = transcript.toLowerCase();
  const result: Partial<EmergencyCase> = {};

  // Extract vitals
  const bpMatch = text.match(/bp\s*[:\-]?\s*(\d{2,3}\/\d{2,3})/i) || text.match(/blood pressure\s*[:\-]?\s*(\d{2,3}\/\d{2,3})/i);
  if (bpMatch) result.vitals = { ...existingCase.vitals!, bp: bpMatch[1] };

  const hrMatch = text.match(/(?:heart rate|pulse|hr)\s*[:\-]?\s*(\d{2,3})/i);
  if (hrMatch) result.vitals = { ...existingCase.vitals!, hr: hrMatch[1] };

  const rrMatch = text.match(/(?:respiratory rate|rr|breathing)\s*[:\-]?\s*(\d{1,2})/i);
  if (rrMatch) result.vitals = { ...existingCase.vitals!, rr: rrMatch[1] };

  const spo2Match = text.match(/(?:spo2|sats|saturation|oxygen)\s*[:\-]?\s*(\d{2,3})\s*%?/i);
  if (spo2Match) result.vitals = { ...existingCase.vitals!, spo2: spo2Match[1] };

  const tempMatch = text.match(/(?:temp|temperature)\s*[:\-]?\s*(\d{2,3}\.?\d*)\s*°?\s*(f|c)?/i);
  if (tempMatch) result.vitals = { ...existingCase.vitals!, temp: `${tempMatch[1]}°${(tempMatch[2] || 'F').toUpperCase()}` };

  const gcsMatch = text.match(/gcs\s*[:\-]?\s*(\d{1,2})/i);
  if (gcsMatch) result.vitals = { ...existingCase.vitals!, gcs: gcsMatch[1] };

  // Extract age
  const ageMatch = text.match(/(\d{1,3})[- ]?year[- ]?old/i);
  if (ageMatch) result.age = ageMatch[1];

  // Extract sex
  if (/\b(male|man|he|him)\b/i.test(text) && !/\bfemale\b/i.test(text)) result.sex = 'Male';
  else if (/\b(female|woman|she|her)\b/i.test(text)) result.sex = 'Female';

  // Detect category
  if (/chest pain|cardiac|heart|stemi|ecg|mi\b/i.test(text)) result.category = 'Cardiac';
  else if (/breath|asthma|wheez|respiratory|dyspnea|sob/i.test(text)) result.category = 'Respiratory';
  else if (/seizure|stroke|loc|conscious|head injury|neuro/i.test(text)) result.category = 'Neurological';
  else if (/overdose|poison|intoxication|drug/i.test(text)) result.category = 'Overdose';
  else if (/fall|fracture|bleed|trauma|accident|injury/i.test(text)) result.category = 'Trauma';

  // Extract allergies
  if (/allerg/i.test(text)) {
    const allergyMatch = text.match(/allergi(?:es|c to|ed to)?\s*[:\-]?\s*([^.,\n]+)/i);
    if (allergyMatch) result.allergies = allergyMatch[1].trim();
  }

  // Generate structured draft
  const patientInfo = `${result.age || existingCase.age || 'Unknown'}-year-old ${result.sex || existingCase.sex || 'Unknown'}`;
  const category = result.category || existingCase.category || 'Unknown';

  const draft = `⚠️ AI Draft — Verification Required

PATIENT: ${existingCase.patientLabel || 'Unknown'}, ${patientInfo}
CATEGORY: ${category}
${existingCase.location ? `LOCATION: ${existingCase.location}` : ''}

CHIEF COMPLAINT: ${existingCase.chiefComplaint || 'Extracted from transcript — requires verification'}

SYMPTOMS: ${existingCase.reportedSymptoms || 'See transcript below'}

VITALS: BP ${result.vitals?.bp || existingCase.vitals?.bp || '---'} mmHg | HR ${result.vitals?.hr || existingCase.vitals?.hr || '---'} bpm | RR ${result.vitals?.rr || existingCase.vitals?.rr || '---'} bpm | SpO2 ${result.vitals?.spo2 || existingCase.vitals?.spo2 || '---'}% | Temp ${result.vitals?.temp || existingCase.vitals?.temp || '---'} | GCS ${result.vitals?.gcs || existingCase.vitals?.gcs || '---'}

MEDICAL HISTORY: ${existingCase.medicalHistory || 'Unknown / Unconfirmed'}
MEDICATIONS: ${existingCase.currentMedications || 'Unknown / Unconfirmed'}
ALLERGIES: ${result.allergies || existingCase.allergies || 'Unknown / Unconfirmed'}

INTERVENTIONS: ${existingCase.interventionsPerformed || 'See transcript'}

ORIGINAL TRANSCRIPT:
"${transcript}"`;

  result.aiGeneratedDraft = draft;
  result.originalTranscript = transcript;

  return result;
};
