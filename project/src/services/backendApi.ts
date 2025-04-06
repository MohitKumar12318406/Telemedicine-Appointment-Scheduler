import { DoctorLocationData } from './googleApi';

const API_BASE_URL = 'http://localhost:3000/api'; // Update this with your actual backend URL

export interface ChatResponse {
  message: string;
  options?: string[];
  doctors?: DoctorLocationData[];
  nextStep?: 'specialization' | 'doctor' | 'time';
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
      throw new Error('Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
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