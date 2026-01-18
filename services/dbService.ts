
import { Patient, Appointment, Payment } from '../types';
import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_J1TXbPaNdu8t@ep-gentle-sunset-addn36oj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

const ensureSchema = async () => {
  try {
    await sql`CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      age INTEGER DEFAULT 0,
      gender TEXT DEFAULT 'Male',
      occupation TEXT,
      address TEXT,
      cond_pressure BOOLEAN DEFAULT false,
      cond_diabetes BOOLEAN DEFAULT false,
      cond_stomach BOOLEAN DEFAULT false,
      cond_rheumatic BOOLEAN DEFAULT false,
      cond_hepatitis BOOLEAN DEFAULT false,
      cond_pregnancy BOOLEAN DEFAULT false,
      allergy_antibiotics BOOLEAN DEFAULT false,
      allergy_anesthesia BOOLEAN DEFAULT false,
      heart_problems BOOLEAN DEFAULT false,
      kidney_problems BOOLEAN DEFAULT false,
      liver_problems BOOLEAN DEFAULT false,
      regular_treatment BOOLEAN DEFAULT false,
      med_pressure BOOLEAN DEFAULT false,
      med_diabetes BOOLEAN DEFAULT false,
      med_thinners BOOLEAN DEFAULT false,
      other_meds_text TEXT,
      total_price NUMERIC DEFAULT 0,
      paid_amount NUMERIC DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    await sql`CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    )`;

    await sql`CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT,
      date_time TIMESTAMP NOT NULL,
      duration INTEGER DEFAULT 30,
      reason TEXT,
      status TEXT DEFAULT 'Scheduled',
      notes TEXT
    )`;
  } catch (e) {
    console.error('Neon DB Schema Error:', e);
  }
};

ensureSchema();

export const dbService = {
  getPatients: async (): Promise<Patient[]> => {
    try {
      const result = await sql`SELECT * FROM patients ORDER BY created_at DESC`;
      return result.map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        age: Number(row.age) || 0,
        gender: row.gender || 'Male',
        status: 'Active',
        occupation: row.occupation || '',
        address: row.address || '',
        createdAt: new Date(row.created_at || new Date()).toISOString(),
        totalPrice: Number(row.total_price) || 0,
        paidAmount: Number(row.paid_amount) || 0,
        condPressure: !!row.cond_pressure,
        condDiabetes: !!row.cond_diabetes,
        condStomach: !!row.cond_stomach,
        condRheumatic: !!row.cond_rheumatic,
        condHepatitis: !!row.cond_hepatitis,
        condPregnancy: !!row.cond_pregnancy,
        allergyAntibiotics: !!row.allergy_antibiotics,
        allergyAnesthesia: !!row.allergy_anesthesia,
        heartProblems: !!row.heart_problems,
        kidneyProblems: !!row.kidney_problems,
        liverProblems: !!row.liver_problems,
        regularTreatment: !!row.regular_treatment,
        medPressure: !!row.med_pressure,
        medDiabetes: !!row.med_diabetes,
        medThinners: !!row.med_thinners,
        otherMedsText: row.other_meds_text || ''
      }));
    } catch (error) {
      console.error('Fetch Patients Error:', error);
      return [];
    }
  },

  addPatient: async (patient: Omit<Patient, 'id' | 'createdAt' | 'paidAmount'>): Promise<Patient> => {
    const id = 'P-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    await sql`
      INSERT INTO patients (
        id, name, phone, age, gender, occupation, address,
        cond_pressure, cond_diabetes, cond_stomach, cond_rheumatic, cond_hepatitis, cond_pregnancy,
        allergy_antibiotics, allergy_anesthesia, heart_problems, kidney_problems, liver_problems, regular_treatment,
        med_pressure, med_diabetes, med_thinners, other_meds_text, total_price, paid_amount
      ) VALUES (
        ${id}, ${patient.name}, ${patient.phone}, ${patient.age}, ${patient.gender}, ${patient.occupation}, ${patient.address},
        ${patient.condPressure}, ${patient.condDiabetes}, ${patient.condStomach}, ${patient.condRheumatic}, ${patient.condHepatitis}, ${patient.condPregnancy},
        ${patient.allergyAntibiotics}, ${patient.allergyAnesthesia}, ${patient.heartProblems}, ${patient.kidneyProblems}, ${patient.liverProblems}, ${patient.regularTreatment},
        ${patient.medPressure}, ${patient.medDiabetes}, ${patient.medThinners}, ${patient.otherMedsText}, ${patient.totalPrice || 0}, 0
      )
    `;
    return { ...patient, id, createdAt: new Date().toISOString(), paidAmount: 0 };
  },

  updatePatient: async (id: string, patient: Partial<Patient>): Promise<void> => {
    await sql`
      UPDATE patients SET
        name = COALESCE(${patient.name}, name),
        phone = COALESCE(${patient.phone}, phone),
        age = COALESCE(${patient.age}, age),
        gender = COALESCE(${patient.gender}, gender),
        cond_pressure = COALESCE(${patient.condPressure}, cond_pressure),
        cond_diabetes = COALESCE(${patient.condDiabetes}, cond_diabetes),
        cond_stomach = COALESCE(${patient.condStomach}, cond_stomach),
        cond_rheumatic = COALESCE(${patient.condRheumatic}, cond_rheumatic),
        cond_hepatitis = COALESCE(${patient.condHepatitis}, cond_hepatitis),
        cond_pregnancy = COALESCE(${patient.condPregnancy}, cond_pregnancy),
        allergy_antibiotics = COALESCE(${patient.allergyAntibiotics}, allergy_antibiotics),
        allergy_anesthesia = COALESCE(${patient.allergyAnesthesia}, allergy_anesthesia),
        heart_problems = COALESCE(${patient.heartProblems}, heart_problems),
        kidney_problems = COALESCE(${patient.kidneyProblems}, kidney_problems),
        other_meds_text = COALESCE(${patient.otherMedsText}, other_meds_text)
      WHERE id = ${id}
    `;
  },

  deletePatient: async (patientId: string): Promise<void> => {
    await sql`DELETE FROM appointments WHERE patient_id = ${patientId}`;
    await sql`DELETE FROM payments WHERE patient_id = ${patientId}`;
    await sql`DELETE FROM patients WHERE id = ${patientId}`;
  },

  updatePatientFinance: async (patientId: string, totalPrice: number): Promise<void> => {
    await sql`UPDATE patients SET total_price = ${totalPrice} WHERE id = ${patientId}`;
  },

  addPayment: async (payment: Omit<Payment, 'id' | 'date'>): Promise<void> => {
    const id = 'PAY-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    await sql`INSERT INTO payments (id, patient_id, amount, date, notes) VALUES (${id}, ${payment.patientId}, ${payment.amount}, NOW(), ${payment.notes || ''})`;
    await sql`UPDATE patients SET paid_amount = paid_amount + ${payment.amount} WHERE id = ${payment.patientId}`;
  },

  getPayments: async (patientId: string): Promise<Payment[]> => {
    const result = await sql`SELECT * FROM payments WHERE patient_id = ${patientId} ORDER BY date DESC`;
    return result.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      amount: Number(row.amount),
      date: new Date(row.date).toISOString(),
      notes: row.notes
    }));
  },

  getAllPayments: async (): Promise<any[]> => {
    const result = await sql`SELECT p.*, pt.name as patient_name FROM payments p JOIN patients pt ON p.patient_id = pt.id ORDER BY p.date DESC`;
    return result.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      amount: Number(row.amount),
      date: new Date(row.date).toISOString(),
      notes: row.notes
    }));
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const result = await sql`SELECT * FROM appointments ORDER BY date_time ASC`;
    return result.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      dateTime: new Date(row.date_time).toISOString(),
      duration: Number(row.duration) || 30,
      reason: row.reason || '',
      status: (row.status as any) || 'Scheduled',
      notes: row.notes || ''
    }));
  },

  addAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const id = 'A-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    await sql`INSERT INTO appointments (id, patient_id, patient_name, date_time, duration, reason, status, notes) VALUES (${id}, ${appointment.patientId}, ${appointment.patientName}, ${appointment.dateTime}, ${appointment.duration}, ${appointment.reason}, ${appointment.status}, ${appointment.notes || ''})`;
    return { ...appointment, id };
  },

  updateAppointment: async (id: string, appointment: Partial<Appointment>): Promise<void> => {
    await sql`
      UPDATE appointments SET
        date_time = COALESCE(${appointment.dateTime}, date_time),
        reason = COALESCE(${appointment.reason}, reason),
        notes = COALESCE(${appointment.notes}, notes)
      WHERE id = ${id}
    `;
  },

  updateAppointmentStatus: async (id: string, status: string): Promise<void> => {
    await sql`UPDATE appointments SET status = ${status} WHERE id = ${id}`;
  },

  deleteAppointment: async (id: string): Promise<void> => {
    await sql`DELETE FROM appointments WHERE id = ${id}`;
  },

  resetDatabase: async (): Promise<void> => {
    // Disabled for security as requested
    console.warn('Manual reset requested but UI access is disabled.');
  }
};
