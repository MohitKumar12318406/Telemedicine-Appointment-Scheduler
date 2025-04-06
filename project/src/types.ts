import { Doctor, Specialization } from './services/api';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
}

export interface Symptom {
  id: number;
  name: string;
  description: string;
  selected?: boolean;
}

export interface Appointment {
  id: string;
  date: Date;
  time?: string;
  doctorId: number;
  doctorName: string;
  specializationId: number;
  specialization: string;
  confirmed: boolean;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  symptoms: Symptom[];
  preliminaryDiagnosis?: string;
  notes?: string;
  contactNumber?: string;
  email?: string;
}

export interface ChatState {
  messages: Message[];
  currentStep: 
    | 'initial' 
    | 'patient-info'
    | 'symptoms-selection'
    | 'specialization'
    | 'doctor'
    | 'date'
    | 'time'
    | 'contact-info'
    | 'confirmation';
  appointment: Partial<Appointment>;
  availableSymptoms?: Symptom[];
  availableDoctors?: Doctor[];
  suggestedSpecializations?: Specialization[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}