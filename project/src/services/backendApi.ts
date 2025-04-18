import { DoctorLocationData } from './googleApi';

const API_BASE_URL = 'http://localhost:3001/api'; // Update this with your actual backend URL

export interface ChatResponse {
  message: string;
  options?: string[];
  doctors?: DoctorLocationData[];
  nextStep?: 'initial' | 'patient-info' | 'symptoms-selection' | 'other-issues' | 'specialization' | 'doctor' | 'date' | 'time' | 'contact-info' | 'confirmation';
}

export const sendChatMessage = async (message: string, currentStep: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        currentStep,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred while sending your message');
    }
  }
};

export const searchDoctors = async (specialization: string, latitude: number, longitude: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        specialization,
        latitude,
        longitude,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to search doctors');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching doctors:', error);
    throw error;
  }
};

export const getDoctorDetails = async (placeId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${placeId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get doctor details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting doctor details:', error);
    throw error;
  }
}; 