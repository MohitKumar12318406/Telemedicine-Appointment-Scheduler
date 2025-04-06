import axios from 'axios';

// Healthwise API Configuration
const API_BASE_URL = 'https://api.healthwise.org/v1';
const API_KEY = process.env.VITE_HEALTHWISE_API_KEY || '';

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
  severity?: 'mild' | 'moderate' | 'severe';
  duration?: string;
  frequency?: string;
  associatedSymptoms?: number[];
  bodyPart?: string;
  category?: string;
  isEmergency?: boolean;
  onset?: 'sudden' | 'gradual';
  triggers?: string[];
  relievingFactors?: string[];
  aggravatingFactors?: string[];
  associatedConditions?: string[];
  warningSigns?: string[];
  selfCareTips?: string[];
  whenToSeekHelp?: string[];
  diagnosticTests?: string[];
  commonCauses?: string[];
  ageGroups?: string[];
  genderPreference?: 'male' | 'female' | 'both';
  seasonalPreference?: string[];
  timeOfDay?: string[];
  relatedBodySystems?: string[];
  painCharacteristics?: {
    type?: 'sharp' | 'dull' | 'burning' | 'throbbing' | 'cramping' | 'aching';
    location?: string;
    radiation?: string;
    intensity?: number;
  };
}

export interface Disease {
  id: number;
  name: string;
  description: string;
  commonSymptoms: number[];
  recommendedSpecialization: number;
  severity: 'mild' | 'moderate' | 'severe';
  treatmentOptions: string[];
  preventionTips: string[];
  recoveryTime: string;
  contagious: boolean;
  riskFactors: string[];
  complications?: string[];
  prognosis?: string;
  stages?: {
    name: string;
    description: string;
    symptoms: string[];
    treatments: string[];
  }[];
  diagnosticCriteria?: {
    tests: string[];
    criteria: string[];
    differentialDiagnosis: string[];
  };
  lifestyleModifications?: string[];
  dietaryRecommendations?: string[];
  exerciseGuidelines?: string[];
  followUpSchedule?: string[];
  supportGroups?: string[];
  researchUpdates?: string;
  alternativeTreatments?: string[];
  pregnancyConsiderations?: string;
  pediatricConsiderations?: string;
  geriatricConsiderations?: string;
  geneticFactors?: string[];
  environmentalFactors?: string[];
  occupationalFactors?: string[];
}

export interface PatientInfo {
  id?: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  ageGroup: 'child' | 'adult' | 'elderly';
  ageGroupDetails?: {
    child?: {
      age: number;
      developmentalStage: 'infant' | 'toddler' | 'preschool' | 'school-age' | 'adolescent';
      guardianName?: string;
      guardianRelationship?: string;
      guardianPhone?: string;
      guardianEmail?: string;
      school?: string;
      pediatrician?: string;
      growthChart?: {
        height: number;
        weight: number;
        headCircumference?: number;
        date: string;
      }[];
      milestones?: {
        milestone: string;
        achievedDate: string;
        notes?: string;
      }[];
      immunizations?: {
        name: string;
        date: string;
        nextDueDate?: string;
        provider: string;
      }[];
    };
    adult?: {
      age: number;
      occupation?: string;
      workplace?: string;
      workHazards?: string[];
      stressLevel?: 'low' | 'moderate' | 'high';
      exerciseFrequency?: string;
      dietType?: string;
      alcoholConsumption?: string;
      smokingStatus?: 'never' | 'former' | 'current';
      reproductiveStatus?: {
        planningPregnancy?: boolean;
        contraception?: string;
        lastMenstrualPeriod?: string;
        pregnancyStatus?: string;
      };
    };
    elderly?: {
      age: number;
      livingArrangement: 'independent' | 'with family' | 'assisted living' | 'nursing home';
      caregiver?: {
        name: string;
        relationship: string;
        phone: string;
        hoursPerWeek?: number;
      };
      mobilityStatus: 'independent' | 'assisted' | 'wheelchair' | 'bedridden';
      fallRisk?: 'low' | 'moderate' | 'high';
      cognitiveStatus?: 'normal' | 'mild impairment' | 'moderate impairment' | 'severe impairment';
      sensoryStatus?: {
        vision: 'normal' | 'corrected' | 'impaired';
        hearing: 'normal' | 'corrected' | 'impaired';
      };
      advanceDirectives?: {
        livingWill?: boolean;
        healthcareProxy?: boolean;
        dnr?: boolean;
        documents?: string[];
      };
      geriatricAssessments?: {
        date: string;
        type: string;
        results: string;
        recommendations: string;
      }[];
    };
  };
  bloodGroup?: string;
  height?: number;
  weight?: number;
  allergies?: {
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
    onset: string;
    medications?: string[];
  }[];
  chronicConditions?: {
    condition: string;
    diagnosedDate: string;
    status: 'active' | 'remission' | 'controlled';
    medications: string[];
    lastCheckup: string;
    specialist?: string;
  }[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy: string;
    pharmacy: string;
    refillDate?: string;
    sideEffects?: string[];
    interactions?: string[];
  }[];
  familyHistory?: {
    condition: string;
    relation: string;
    ageAtDiagnosis?: number;
    status: 'active' | 'deceased' | 'resolved';
    notes?: string;
  }[];
  lifestyle?: {
    smoking: {
      status: 'never' | 'former' | 'current';
      packYears?: number;
      quitDate?: string;
    };
    alcohol: {
      status: 'never' | 'occasional' | 'regular';
      frequency?: string;
      unitsPerWeek?: number;
    };
    exercise: {
      frequency: 'sedentary' | 'light' | 'moderate' | 'active';
      type?: string[];
      duration?: string;
      intensity?: string;
    };
    diet: {
      type: string;
      restrictions?: string[];
      supplements?: string[];
      allergies?: string[];
    };
    sleep: {
      averageHours: number;
      quality: 'poor' | 'fair' | 'good';
      issues?: string[];
    };
    occupation?: {
      current: string;
      history: string[];
      hazards?: string[];
    };
    stress: {
      level: 'low' | 'moderate' | 'high';
      copingMechanisms?: string[];
    };
  };
  symptoms: {
    id: number;
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
    frequency: string;
    onset: string;
    triggers?: string[];
    relievingFactors?: string[];
    notes?: string;
    associatedSymptoms?: number[];
    impactOnDailyLife?: string;
    currentStatus?: 'active' | 'resolved' | 'worsening' | 'improving';
  }[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
    isHealthcareProxy?: boolean;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    startDate: string;
    endDate?: string;
    coverageType: string;
    copay?: number;
    deductible?: number;
    network?: string;
    preauthorizationRequired?: boolean;
  };
  vaccinations?: {
    name: string;
    date: string;
    provider: string;
    nextDueDate?: string;
    batchNumber?: string;
    reactions?: string;
  }[];
  surgeries?: {
    procedure: string;
    date: string;
    hospital: string;
    surgeon: string;
    complications?: string;
    followUp?: string;
  }[];
  dentalHistory?: {
    lastCheckup: string;
    issues: string[];
    treatments: string[];
    nextAppointment?: string;
  };
  mentalHealth?: {
    conditions: string[];
    treatments: string[];
    therapist?: string;
    medications: string[];
    lastAssessment?: string;
  };
  reproductiveHealth?: {
    menstrualHistory?: {
      regularity: string;
      lastPeriod?: string;
      cycleLength?: number;
      symptoms?: string[];
    };
    pregnancies?: {
      year: number;
      outcome: string;
      complications?: string;
    }[];
    contraception?: string;
  };
  socialHistory?: {
    maritalStatus: string;
    livingArrangement: string;
    dependents?: number;
    supportSystem?: string[];
    hobbies?: string[];
    travelHistory?: string[];
  };
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

export interface Appointment {
  id: string;
  doctorId: number;
  patientId: string;
  date: string;
  timeSlot: string;
  consultationType: 'virtual' | 'inPerson';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  symptoms: {
    id: number;
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
  }[];
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  prescription?: {
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[];
    instructions: string;
    validUntil: string;
  };
}

export const medicalApi = {
  // Get list of all symptoms
  getSymptoms: async (): Promise<Symptom[]> => {
    try {
      const response = await api.get<Symptom[]>('/symptoms');
      return response.data;
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      throw error;
    }
  },

  // Get symptoms by category
  getSymptomsByCategory: async (category: string): Promise<Symptom[]> => {
    try {
      const response = await api.get<Symptom[]>('/symptoms', {
        params: { category }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching symptoms by category:', error);
      throw error;
    }
  },

  // Get symptoms by body part
  getSymptomsByBodyPart: async (bodyPart: string): Promise<Symptom[]> => {
    try {
      const response = await api.get<Symptom[]>('/symptoms', {
        params: { bodyPart }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching symptoms by body part:', error);
      throw error;
    }
  },

  // Get symptoms by body system
  getSymptomsByBodySystem: async (bodySystem: string): Promise<Symptom[]> => {
    try {
      const response = await api.get<Symptom[]>('/symptoms', {
        params: { bodySystem }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching symptoms by body system:', error);
      throw error;
    }
  },

  // Get symptoms by age group
  getSymptomsByAgeGroup: async (ageGroup: string): Promise<Symptom[]> => {
    try {
      const response = await api.get<Symptom[]>('/symptoms', {
        params: { ageGroup }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching symptoms by age group:', error);
      throw error;
    }
  },

  // Get diseases based on symptoms
  getDiseases: async (symptomIds: number[]): Promise<Disease[]> => {
    try {
      const response = await api.get<Disease[]>('/diagnosis', {
        params: { 
          symptoms: symptomIds.join(','),
          includeDetails: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching diseases:', error);
      throw error;
    }
  },

  // Get diseases by body system
  getDiseasesByBodySystem: async (bodySystem: string): Promise<Disease[]> => {
    try {
      const response = await api.get<Disease[]>('/diseases', {
        params: { bodySystem }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching diseases by body system:', error);
      throw error;
    }
  },

  // Get all specializations
  getSpecializations: async (): Promise<Specialization[]> => {
    try {
      const response = await api.get<Specialization[]>('/specializations');
      return response.data;
    } catch (error) {
      console.error('Error fetching specializations:', error);
      throw error;
    }
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
    try {
      const response = await api.get<Doctor[]>('/doctors', {
        params: { 
          specialization: specializationId,
          ...filters,
          includeAvailability: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  // Get doctor details by ID
  getDoctorDetails: async (doctorId: number): Promise<Doctor> => {
    try {
      const response = await api.get<Doctor>(`/doctors/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      throw error;
    }
  },

  // Get doctor reviews
  getDoctorReviews: async (doctorId: number): Promise<{
    id: number;
    patientName: string;
    rating: number;
    comment: string;
    date: string;
  }[]> => {
    try {
      const response = await api.get(`/doctors/${doctorId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor reviews:', error);
      throw error;
    }
  },

  // Create or update patient profile
  savePatientProfile: async (patientInfo: PatientInfo): Promise<PatientInfo> => {
    try {
      if (patientInfo.id) {
        // Update existing patient
        const response = await api.put(`/patients/${patientInfo.id}`, patientInfo);
        return response.data;
      } else {
        // Create new patient
        const response = await api.post('/patients', patientInfo);
        return response.data;
      }
    } catch (error) {
      console.error('Error saving patient profile:', error);
      throw error;
    }
  },

  // Get patient profile
  getPatientProfile: async (patientId: string): Promise<PatientInfo> => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      throw error;
    }
  },

  // Get patient medical history
  getPatientMedicalHistory: async (patientId: string): Promise<{
    appointments: Appointment[];
    diagnoses: {
      date: string;
      condition: string;
      doctor: string;
      notes: string;
    }[];
    medications: {
      name: string;
      prescribedDate: string;
      endDate?: string;
      prescribedBy: string;
    }[];
    labResults: {
      date: string;
      testName: string;
      result: string;
      normalRange: string;
    }[];
  }> => {
    try {
      const response = await api.get(`/patients/${patientId}/medical-history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient medical history:', error);
      throw error;
    }
  },
  
  // Book an appointment
  bookAppointment: async (appointmentData: {
    doctorId: number;
    patientId: string;
    date: string;
    timeSlot: string;
    consultationType: 'virtual' | 'inPerson';
    symptoms: {
      id: number;
      name: string;
      severity: 'mild' | 'moderate' | 'severe';
    }[];
    notes?: string;
  }): Promise<{ appointmentId: string; confirmationCode: string }> => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  // Get doctor availability
  getDoctorAvailability: async (
    doctorId: number,
    date: string
  ): Promise<{ availableSlots: string[] }> => {
    try {
      const response = await api.get(`/doctors/${doctorId}/availability`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      throw error;
    }
  },

  // Get appointment details
  getAppointmentDetails: async (appointmentId: string): Promise<Appointment> => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      throw error;
    }
  },

  // Cancel or reschedule appointment
  updateAppointment: async (
    appointmentId: string,
    updateData: {
      status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
      date?: string;
      timeSlot?: string;
      notes?: string;
    }
  ): Promise<Appointment> => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Get patient's complete medical timeline
  getPatientTimeline: async (patientId: string): Promise<{
    date: string;
    type: 'appointment' | 'diagnosis' | 'medication' | 'lab' | 'procedure';
    description: string;
    provider?: string;
    location?: string;
    notes?: string;
    attachments?: string[];
  }[]> => {
    try {
      const response = await api.get(`/patients/${patientId}/timeline`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient timeline:', error);
      throw error;
    }
  },

  // Get patient's vital signs history
  getPatientVitals: async (patientId: string): Promise<{
    date: string;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
      pulse: number;
    };
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    notes?: string;
  }[]> => {
    try {
      const response = await api.get(`/patients/${patientId}/vitals`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient vitals:', error);
      throw error;
    }
  },

  // Update patient's vital signs
  updatePatientVitals: async (
    patientId: string,
    vitals: {
      bloodPressure?: {
        systolic: number;
        diastolic: number;
        pulse: number;
      };
      temperature?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      weight?: number;
      height?: number;
      notes?: string;
    }
  ): Promise<void> => {
    try {
      await api.post(`/patients/${patientId}/vitals`, vitals);
    } catch (error) {
      console.error('Error updating patient vitals:', error);
      throw error;
    }
  },

  // Get patient's immunization records
  getPatientImmunizations: async (patientId: string): Promise<{
    name: string;
    date: string;
    provider: string;
    nextDueDate?: string;
    batchNumber?: string;
    reactions?: string;
    notes?: string;
  }[]> => {
    try {
      const response = await api.get(`/patients/${patientId}/immunizations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient immunizations:', error);
      throw error;
    }
  },

  // Update patient's immunization records
  updatePatientImmunizations: async (
    patientId: string,
    immunizations: {
      name: string;
      date: string;
      provider: string;
      nextDueDate?: string;
      batchNumber?: string;
      reactions?: string;
      notes?: string;
    }[]
  ): Promise<void> => {
    try {
      await api.post(`/patients/${patientId}/immunizations`, { immunizations });
    } catch (error) {
      console.error('Error updating patient immunizations:', error);
      throw error;
    }
  },

  // Get age-specific health recommendations
  getAgeSpecificRecommendations: async (ageGroup: 'child' | 'adult' | 'elderly'): Promise<{
    screenings: {
      name: string;
      frequency: string;
      description: string;
      importance: 'low' | 'medium' | 'high';
    }[];
    vaccinations: {
      name: string;
      recommendedAge: string;
      description: string;
      importance: 'low' | 'medium' | 'high';
    }[];
    lifestyleRecommendations: string[];
    nutritionalGuidelines: string[];
    exerciseGuidelines: string[];
    preventiveMeasures: string[];
    commonHealthIssues: string[];
    resources: string[];
  }> => {
    try {
      const response = await api.get(`/age-specific-recommendations`, {
        params: { ageGroup }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching age-specific recommendations:', error);
      throw error;
    }
  },

  // Get age-specific symptoms
  getAgeSpecificSymptoms: async (ageGroup: 'child' | 'adult' | 'elderly'): Promise<Symptom[]> => {
    try {
      const response = await api.get<Symptom[]>('/symptoms', {
        params: { ageGroup }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching age-specific symptoms:', error);
      throw error;
    }
  },

  // Get age-specific diseases
  getAgeSpecificDiseases: async (ageGroup: 'child' | 'adult' | 'elderly'): Promise<Disease[]> => {
    try {
      const response = await api.get<Disease[]>('/diseases', {
        params: { ageGroup }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching age-specific diseases:', error);
      throw error;
    }
  },

  // Get developmental milestones for children
  getDevelopmentalMilestones: async (age: number): Promise<{
    category: string;
    milestones: {
      description: string;
      typicalAgeRange: string;
      importance: 'low' | 'medium' | 'high';
      redFlags?: string[];
    }[];
  }[]> => {
    try {
      const response = await api.get('/developmental-milestones', {
        params: { age }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching developmental milestones:', error);
      throw error;
    }
  },

  // Get geriatric assessments for elderly patients
  getGeriatricAssessments: async (): Promise<{
    name: string;
    description: string;
    purpose: string;
    frequency: string;
    components: string[];
    interpretation: string;
  }[]> => {
    try {
      const response = await api.get('/geriatric-assessments');
      return response.data;
    } catch (error) {
      console.error('Error fetching geriatric assessments:', error);
      throw error;
    }
  },

  // Get adult health screenings
  getAdultHealthScreenings: async (age: number, gender: string): Promise<{
    name: string;
    recommendedAge: string;
    frequency: string;
    description: string;
    importance: 'low' | 'medium' | 'high';
    preparation?: string;
  }[]> => {
    try {
      const response = await api.get('/adult-health-screenings', {
        params: { age, gender }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching adult health screenings:', error);
      throw error;
    }
  },
}; 