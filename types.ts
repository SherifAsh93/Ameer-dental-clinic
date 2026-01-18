
export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  status: string;
  occupation: string;
  address: string;
  createdAt: string;
  dob?: string;
  totalPrice: number;
  paidAmount: number;
  condPressure: boolean;
  condDiabetes: boolean;
  condStomach: boolean;
  condRheumatic: boolean;
  condHepatitis: boolean;
  condPregnancy: boolean;
  allergyAntibiotics: boolean;
  allergyAnesthesia: boolean;
  heartProblems: boolean;
  kidneyProblems: boolean;
  liverProblems: boolean;
  regularTreatment: boolean;
  medPressure: boolean;
  medDiabetes: boolean;
  medThinners: boolean;
  otherMedsText: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dateTime: string;
  duration: number;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
  notes?: string;
}
