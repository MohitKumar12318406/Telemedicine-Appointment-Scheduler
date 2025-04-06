import axios from 'axios';

// You can use a medical API like ApiMedic or similar
const API_BASE_URL = 'YOUR_API_ENDPOINT';
const API_KEY = 'YOUR_API_KEY';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export interface Symptom {
  id: number;
  name: string;
  description: string;
  relatedSpecializations?: number[];
}

export interface Disease {
  id: number;
  name: string;
  description: string;
  commonSymptoms: number[];
  recommendedSpecialization: number;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: number;
  qualifications: string[];
  experience: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  education: string[];
  certifications: string[];
  specialties: string[];
  gender: 'male' | 'female' | 'other';
  imageUrl?: string;
  bio: string;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  consultationFee: number;
  virtualConsultationAvailable: boolean;
  inPersonConsultationAvailable: boolean;
}

export interface Specialization {
  id: number;
  name: string;
  description: string;
  commonConditions: string[];
}

export const medicalApi = {
  // Get list of all symptoms
  getSymptoms: async (): Promise<Symptom[]> => {
    const response = await api.get<Symptom[]>('/symptoms');
    return response.data;
  },

  // Get diseases based on symptoms
  getDiseases: async (symptomIds: number[]): Promise<Disease[]> => {
    const response = await api.get<Disease[]>('/diagnosis', {
      params: { symptoms: symptomIds.join(',') }
    });
    return response.data;
  },

  // Get all specializations
  getSpecializations: async (): Promise<Specialization[]> => {
    const response = await api.get<Specialization[]>('/specializations');
    return response.data;
  },

  // Get doctors by specialization with filters
  getDoctors: async (
    specializationId: number, 
    filters?: {
      gender?: 'male' | 'female' | 'other';
      minRating?: number;
      maxConsultationFee?: number;
      virtualOnly?: boolean;
      inPersonOnly?: boolean;
      language?: string;
    }
  ): Promise<Doctor[]> => {
    const response = await api.get<Doctor[]>(`/doctors`, {
      params: { 
        specialization: specializationId,
        ...filters
      }
    });
    return response.data;
  },

  // Get available time slots for a doctor
  getAvailableSlots: async (doctorId: number, date: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/availability`, {
      params: { doctorId, date }
    });
    return response.data;
  },
  
  // Get doctor details by ID
  getDoctorDetails: async (doctorId: number): Promise<Doctor> => {
    const response = await api.get<Doctor>(`/doctors/${doctorId}`);
    return response.data;
  },
  
  // Get doctor reviews
  getDoctorReviews: async (doctorId: number): Promise<{
    id: number;
    patientName: string;
    rating: number;
    comment: string;
    date: string;
  }[]> => {
    const response = await api.get<{
      id: number;
      patientName: string;
      rating: number;
      comment: string;
      date: string;
    }[]>(`/doctors/${doctorId}/reviews`);
    return response.data;
  },
  
  // Book an appointment
  bookAppointment: async (appointmentData: {
    doctorId: number;
    patientName: string;
    patientAge: number;
    patientGender?: 'male' | 'female' | 'other';
    date: string;
    time: string;
    symptoms: number[];
    contactNumber: string;
    email: string;
    consultationType: 'virtual' | 'in-person';
    notes?: string;
  }): Promise<{
    appointmentId: string;
    confirmationCode: string;
    details: {
      doctorName: string;
      specialization: string;
      date: string;
      time: string;
      consultationType: 'virtual' | 'in-person';
      meetingLink?: string;
      location?: string;
    };
  }> => {
    const response = await api.post<{
      appointmentId: string;
      confirmationCode: string;
      details: {
        doctorName: string;
        specialization: string;
        date: string;
        time: string;
        consultationType: 'virtual' | 'in-person';
        meetingLink?: string;
        location?: string;
      };
    }>('/appointments', appointmentData);
    return response.data;
  }
}; 