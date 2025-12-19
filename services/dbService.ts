
import { neon } from '@neondatabase/serverless';
import { Patient, Appointment, AppointmentStatus } from "../types";

const sql = neon("postgresql://neondb_owner:npg_J1TXbPaNdu8t@ep-gentle-sunset-addn36oj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require");

class DatabaseService {
  private initialized = false;

  constructor() {
    this.ensureTables();
  }

  private async ensureTables() {
    if (this.initialized) return;
    try {
      // Create Patients Table
      await sql`
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          dob TEXT,
          email TEXT,
          occupation TEXT,
          address TEXT,
          gender TEXT,
          medical_history JSONB DEFAULT '{}'::jsonb,
          chart JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // Create Appointments Table
      await sql`
        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
          patient_name TEXT,
          date_time TEXT NOT NULL,
          duration INTEGER,
          reason TEXT,
          status TEXT DEFAULT 'Scheduled',
          notes TEXT
        );
      `;
      
      this.initialized = true;
      console.log("Neon Tables Checked/Created Successfully");
    } catch (error) {
      console.error("Failed to initialize Neon tables:", error);
    }
  }

  async getPatients(): Promise<Patient[]> {
    await this.ensureTables();
    try {
      const rows = await sql`SELECT * FROM patients ORDER BY created_at DESC`;
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        dob: row.dob,
        email: row.email,
        occupation: row.occupation,
        address: row.address,
        gender: row.gender as any,
        ...row.medical_history,
        chart: row.chart,
        createdAt: row.created_at
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async savePatient(patient: Patient): Promise<void> {
    await this.ensureTables();
    const { id, name, phone, dob, email, occupation, address, gender, chart, ...history } = patient;
    
    try {
      await sql`
        INSERT INTO patients (id, name, phone, dob, email, occupation, address, gender, medical_history, chart)
        VALUES (${id}, ${name}, ${phone}, ${dob}, ${email}, ${occupation}, ${address}, ${gender}, ${JSON.stringify(history)}, ${JSON.stringify(chart)})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          dob = EXCLUDED.dob,
          email = EXCLUDED.email,
          occupation = EXCLUDED.occupation,
          address = EXCLUDED.address,
          gender = EXCLUDED.gender,
          medical_history = EXCLUDED.medical_history,
          chart = EXCLUDED.chart
      `;
    } catch (e) {
      console.error("Save Patient Error:", e);
      throw e;
    }
  }

  async deletePatient(id: string): Promise<void> {
    await sql`DELETE FROM patients WHERE id = ${id}`;
  }

  async getAppointments(): Promise<Appointment[]> {
    const rows = await sql`SELECT * FROM appointments ORDER BY date_time ASC`;
    return rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      dateTime: row.date_time,
      duration: row.duration,
      reason: row.reason,
      status: row.status as AppointmentStatus,
      notes: row.notes
    }));
  }

  async saveAppointment(app: Appointment): Promise<void> {
    await sql`
      INSERT INTO appointments (id, patient_id, patient_name, date_time, duration, reason, status, notes)
      VALUES (${app.id}, ${app.patientId}, ${app.patientName}, ${app.dateTime}, ${app.duration}, ${app.reason}, ${app.status}, ${app.notes || ''})
      ON CONFLICT (id) DO UPDATE SET
        date_time = EXCLUDED.date_time,
        status = EXCLUDED.status,
        reason = EXCLUDED.reason,
        notes = EXCLUDED.notes
    `;
  }

  async deleteAppointment(id: string): Promise<void> {
    await sql`DELETE FROM appointments WHERE id = ${id}`;
  }

  getNeonConfig() {
    return {
      connectionString: "Connected to Neon API",
      status: this.initialized ? 'Active (Live SQL)' : 'Initializing...',
      driver: 'Neon Serverless HTTP (Direct SQL)'
    };
  }
}

export const dbService = new DatabaseService();
