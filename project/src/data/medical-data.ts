// Medical data for the telemedicine application

import { Specialization, Symptom, Disease, Doctor } from '../services/api';

export const SPECIALIZATIONS: Specialization[] = [
  {
    id: 1,
    name: 'Cardiology',
    description: 'Heart and cardiovascular system specialist',
    commonConditions: ['Heart disease', 'High blood pressure', 'Arrhythmia']
  },
  {
    id: 2,
    name: 'Dermatology',
    description: 'Skin, hair, and nail specialist',
    commonConditions: ['Acne', 'Eczema', 'Psoriasis']
  },
  {
    id: 3,
    name: 'Pediatrics',
    description: 'Children\'s health specialist',
    commonConditions: ['Common cold', 'Fever', 'Childhood diseases']
  },
  {
    id: 4,
    name: 'Orthopedics',
    description: 'Bones and joints specialist',
    commonConditions: ['Arthritis', 'Back pain', 'Joint pain']
  },
  {
    id: 5,
    name: 'Neurology',
    description: 'Brain and nervous system specialist',
    commonConditions: ['Headaches', 'Migraines', 'Dizziness']
  },
  {
    id: 6,
    name: 'Psychiatry',
    description: 'Mental health specialist',
    commonConditions: ['Anxiety', 'Depression', 'Insomnia']
  },
  {
    id: 7,
    name: 'ENT',
    description: 'Ear, Nose, and Throat specialist',
    commonConditions: ['Sore throat', 'Ear infections', 'Sinus issues']
  },
  {
    id: 8,
    name: 'Gastroenterology',
    description: 'Digestive system specialist',
    commonConditions: ['Stomach pain', 'Digestive issues', 'Nausea']
  }
];

export const SYMPTOMS: Symptom[] = [
  {
    id: 1,
    name: 'Chest Pain',
    description: 'Pain or discomfort in the chest area',
    relatedSpecializations: [1] // Cardiology
  },
  {
    id: 2,
    name: 'Skin Rash',
    description: 'Red, itchy, or inflamed skin',
    relatedSpecializations: [2] // Dermatology
  },
  {
    id: 3,
    name: 'Fever',
    description: 'Elevated body temperature',
    relatedSpecializations: [3] // Pediatrics
  },
  {
    id: 4,
    name: 'Headache',
    description: 'Pain in the head or neck area',
    relatedSpecializations: [5] // Neurology
  },
  {
    id: 5,
    name: 'Joint Pain',
    description: 'Pain in joints or bones',
    relatedSpecializations: [4] // Orthopedics
  },
  {
    id: 6,
    name: 'Anxiety',
    description: 'Feelings of worry or unease',
    relatedSpecializations: [6] // Psychiatry
  },
  {
    id: 7,
    name: 'Sore Throat',
    description: 'Pain or irritation in the throat',
    relatedSpecializations: [7] // ENT
  },
  {
    id: 8,
    name: 'Stomach Pain',
    description: 'Pain or discomfort in the abdomen',
    relatedSpecializations: [8] // Gastroenterology
  }
];

export const DISEASES: Disease[] = [
  {
    id: 1,
    name: 'Hypertension',
    description: 'High blood pressure',
    commonSymptoms: [1],
    recommendedSpecialization: 1
  },
  {
    id: 2,
    name: 'Eczema',
    description: 'Chronic skin condition',
    commonSymptoms: [2],
    recommendedSpecialization: 2
  },
  {
    id: 3,
    name: 'Common Cold',
    description: 'Viral respiratory infection',
    commonSymptoms: [3],
    recommendedSpecialization: 3
  },
  {
    id: 4,
    name: 'Migraine',
    description: 'Severe headache condition',
    commonSymptoms: [4],
    recommendedSpecialization: 5
  },
  {
    id: 5,
    name: 'Arthritis',
    description: 'Joint inflammation',
    commonSymptoms: [5],
    recommendedSpecialization: 4
  },
  {
    id: 6,
    name: 'Anxiety Disorder',
    description: 'Mental health condition',
    commonSymptoms: [6],
    recommendedSpecialization: 6
  },
  {
    id: 7,
    name: 'Pharyngitis',
    description: 'Throat inflammation',
    commonSymptoms: [7],
    recommendedSpecialization: 7
  },
  {
    id: 8,
    name: 'Gastritis',
    description: 'Stomach inflammation',
    commonSymptoms: [8],
    recommendedSpecialization: 8
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialization: 1,
    qualifications: ['MD', 'Cardiology'],
    experience: '15 years',
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 120,
    education: ['Harvard Medical School'],
    certifications: ['Board Certified Cardiologist'],
    specialties: ['Interventional Cardiology'],
    gender: 'female',
    bio: 'Experienced cardiologist specializing in preventive care',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    },
    consultationFee: 150,
    virtualConsultationAvailable: true,
    inPersonConsultationAvailable: true
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialization: 2,
    qualifications: ['MD', 'Dermatology'],
    experience: '12 years',
    languages: ['English', 'Mandarin'],
    rating: 4.7,
    reviewCount: 95,
    education: ['Johns Hopkins University'],
    certifications: ['Board Certified Dermatologist'],
    specialties: ['Medical Dermatology'],
    gender: 'male',
    bio: 'Specialist in treating complex skin conditions',
    availability: {
      days: ['Tuesday', 'Thursday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
    },
    consultationFee: 130,
    virtualConsultationAvailable: true,
    inPersonConsultationAvailable: true
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialization: 3,
    qualifications: ['MD', 'Pediatrics'],
    experience: '10 years',
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 150,
    education: ['Stanford University'],
    certifications: ['Board Certified Pediatrician'],
    specialties: ['General Pediatrics'],
    gender: 'female',
    bio: 'Dedicated to providing comprehensive care for children',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
    },
    consultationFee: 120,
    virtualConsultationAvailable: true,
    inPersonConsultationAvailable: true
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialization: 4,
    qualifications: ['MD', 'Orthopedics'],
    experience: '18 years',
    languages: ['English'],
    rating: 4.8,
    reviewCount: 110,
    education: ['Mayo Clinic'],
    certifications: ['Board Certified Orthopedic Surgeon'],
    specialties: ['Sports Medicine'],
    gender: 'male',
    bio: 'Expert in treating sports-related injuries',
    availability: {
      days: ['Tuesday', 'Thursday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
    },
    consultationFee: 160,
    virtualConsultationAvailable: false,
    inPersonConsultationAvailable: true
  },
  {
    id: 5,
    name: 'Dr. Lisa Patel',
    specialization: 5,
    qualifications: ['MD', 'Neurology'],
    experience: '14 years',
    languages: ['English', 'Hindi'],
    rating: 4.7,
    reviewCount: 85,
    education: ['Yale University'],
    certifications: ['Board Certified Neurologist'],
    specialties: ['Headache Medicine'],
    gender: 'female',
    bio: 'Specialist in treating neurological disorders',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
    },
    consultationFee: 140,
    virtualConsultationAvailable: true,
    inPersonConsultationAvailable: true
  },
  {
    id: 6,
    name: 'Dr. Robert Taylor',
    specialization: 6,
    qualifications: ['MD', 'Psychiatry'],
    experience: '16 years',
    languages: ['English'],
    rating: 4.9,
    reviewCount: 130,
    education: ['Columbia University'],
    certifications: ['Board Certified Psychiatrist'],
    specialties: ['Anxiety and Depression'],
    gender: 'male',
    bio: 'Expert in treating mental health conditions',
    availability: {
      days: ['Tuesday', 'Thursday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
    },
    consultationFee: 150,
    virtualConsultationAvailable: true,
    inPersonConsultationAvailable: true
  },
  {
    id: 7,
    name: 'Dr. David Kim',
    specialization: 7,
    qualifications: ['MD', 'ENT'],
    experience: '13 years',
    languages: ['English', 'Korean'],
    rating: 4.8,
    reviewCount: 100,
    education: ['UCLA'],
    certifications: ['Board Certified ENT Specialist'],
    specialties: ['Otolaryngology'],
    gender: 'male',
    bio: 'Specialist in ear, nose, and throat conditions',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
    },
    consultationFee: 135,
    virtualConsultationAvailable: true,
    inPersonConsultationAvailable: true
  },
  {
    id: 8,
    name: 'Dr. Maria Garcia',
    specialization: 8,
    qualifications: ['MD', 'Gastroenterology'],
    experience: '15 years',
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 115,
    education: ['University of California, San Francisco'],
    certifications: ['Board Certified Gastroenterologist'],
    specialties: ['Digestive Disorders'],
    gender: 'female',
    bio: 'Expert in treating digestive system disorders',
    availability: {
      days: ['Tuesday', 'Thursday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
    },
    consultationFee: 145,
    virtualConsultationAvailable: true,
    inPersonConsultationAvailable: true
  }
]; 