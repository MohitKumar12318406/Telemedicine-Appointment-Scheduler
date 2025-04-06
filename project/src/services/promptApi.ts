import axios from 'axios';

export interface Prompt {
  id: string;
  step: string;
  message: string;
  options?: string[];
}

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchPrompts = async (step: string): Promise<Prompt[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/prompts?step=${step}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prompts:', error);
    // Return fallback prompts if API fails
    return getFallbackPrompts(step);
  }
};

// Fallback prompts in case API is unavailable
const getFallbackPrompts = (step: string): Prompt[] => {
  switch (step) {
    case 'initial':
      return [{
        id: 'initial-1',
        step: 'initial',
        message: 'Hello! I\'m your telemedicine assistant. How can I help you today?',
        options: ['Book an appointment', 'Find a doctor', 'Get medical advice', 'Start from First']
      }];
    case 'patient-info':
      return [{
        id: 'patient-info-1',
        step: 'patient-info',
        message: 'Please enter your name:',
        options: ['Start from First']
      }];
    case 'symptoms-selection':
      return [{
        id: 'symptoms-1',
        step: 'symptoms-selection',
        message: 'Please select your symptoms:',
        options: ['Fever', 'Cough', 'Headache', 'Sore throat', 'Fatigue', 'Start from First']
      }];
    case 'specialization':
      return [{
        id: 'specialization-1',
        step: 'specialization',
        message: 'Please select a specialization:',
        options: ['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Start from First']
      }];
    case 'doctor':
      return [{
        id: 'doctor-1',
        step: 'doctor',
        message: 'Please select a doctor:',
        options: ['Dr. John Smith', 'Dr. Sarah Johnson', 'Dr. Michael Brown', 'Start from First']
      }];
    case 'date':
      return [{
        id: 'date-1',
        step: 'date',
        message: 'Please enter your preferred appointment date (YYYY-MM-DD):',
        options: ['Start from First']
      }];
    case 'contact-info':
      return [{
        id: 'contact-1',
        step: 'contact-info',
        message: 'Please enter your contact number:',
        options: ['Start from First']
      }];
    case 'confirmation':
      return [{
        id: 'confirmation-1',
        step: 'confirmation',
        message: 'Please enter your email address:',
        options: ['Start from First']
      }];
    default:
      return [{
        id: 'default-1',
        step: 'default',
        message: 'How can I help you?',
        options: ['Start from First']
      }];
  }
}; 