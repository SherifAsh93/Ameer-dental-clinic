
export enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  IN_PROGRESS = 'In Progress'
}

export type ToothStatus = 'Healthy' | 'Decay' | 'Filled' | 'Missing' | 'Crowned' | 'Bridge' | 'Implant';

export interface ToothNote {
  id: string;
  status: ToothStatus;
  note: string;
  date: string;
}

export interface DentalChartData {
  [toothNumber: number]: ToothNote[];
}

// FIX: Added DiagnosisResult interface to resolve import errors in geminiService and AIConsultant
export interface DiagnosisResult {
  riskLevel: 'High' | 'Medium' | 'Low';
  analysis: string;
  suggestions: string[];
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  dob: string;
  email: string;
  occupation: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  
  // التاريخ الطبي (Medical History Checkboxes)
  medConditionHypertension: boolean;
  medConditionDiabetes: boolean;
  medConditionStomachUlcer: boolean;
  medConditionRheumaticFever: boolean;
  medConditionHepatitis: boolean;
  medConditionPregnancyLactation: boolean;
  
  // أسئلة عامة (General Questions Yes/No)
  hasAntibioticAllergy: boolean;
  hasLocalAnesthesiaAllergy: boolean;
  hasHeartProblems: boolean;
  hasKidneyProblems: boolean;
  hasLiverProblems: boolean;
  takesRegularMedication: boolean;
  
  // الأدوية الحالية (Current Medications)
  medicationPressure: boolean;
  medicationDiabetes: boolean;
  medicationBloodThinner: boolean;
  medicationOther: string;

  chart: DentalChartData;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dateTime: string;
  duration: number;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}
