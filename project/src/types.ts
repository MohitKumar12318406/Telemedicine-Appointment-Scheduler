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
  id?: string;
  date?: Date;
  time?: string;
  doctorId?: string;
  doctorName?: string;
  specializationId?: number;
  specialization?: string;
  patientName?: string;
  symptoms?: any[];
  contactNumber?: string;
  email?: string;
  confirmed?: boolean;
}

export interface ChatState {
  currentStep: 'initial' | 'patient-info' | 'symptoms-selection' | 'specialization' | 'doctor' | 'date' | 'time' | 'contact-info' | 'confirmation';
  messages: Message[];
  appointment: Partial<Appointment>;
  availableSymptoms?: any[];
  availableDoctors?: any[];
  suggestedSpecializations?: any[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}