import { GOOGLE_API_KEY } from '../config/google';

// Interface for doctor location data
export interface DoctorLocationData {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  qualifications: string[];
  experience: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  bio: string;
  consultationFee: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  photos?: string[];
}

// Interface for nearby doctors search results
export interface NearbyDoctorsResult {
  doctors: DoctorLocationData[];
  nextPageToken?: string;
}

const API_BASE_URL = 'http://localhost:3000/api'; // Update this with your actual backend URL

// Validation functions
const validateCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

const validateRadius = (radius: number): boolean => {
  return radius > 0 && radius <= 50000; // Max 50km radius
};

const validateSpecialization = (specialization: string): boolean => {
  return specialization.length > 0 && specialization.length <= 100;
};

const validateDoctorData = (data: DoctorLocationData): boolean => {
  return (
    data.name.length > 0 &&
    data.address.length > 0 &&
    validateCoordinates(data.latitude, data.longitude) &&
    Array.isArray(data.qualifications) &&
    data.qualifications.length > 0 &&
    typeof data.experience === 'string' &&
    data.experience.length > 0 &&
    Array.isArray(data.languages) &&
    data.languages.length > 0 &&
    typeof data.rating === 'number' &&
    data.rating >= 0 &&
    data.rating <= 5 &&
    typeof data.reviewCount === 'number' &&
    data.reviewCount >= 0 &&
    typeof data.bio === 'string' &&
    data.bio.length > 0 &&
    typeof data.consultationFee === 'number' &&
    data.consultationFee >= 0 &&
    (!data.phoneNumber || /^\+?[\d\s-()]{10,}$/.test(data.phoneNumber)) &&
    (!data.website || /^https?:\/\/.+/.test(data.website))
  );
};

// Function to search for doctors by specialization and location
export const searchDoctorsByLocation = async (
  specialization: string,
  latitude: number,
  longitude: number,
  radius: number = 5000 // Default 5km radius
): Promise<NearbyDoctorsResult> => {
  // Validate input parameters
  if (!validateSpecialization(specialization)) {
    throw new Error('Invalid specialization format');
  }
  if (!validateCoordinates(latitude, longitude)) {
    throw new Error('Invalid coordinates');
  }
  if (!validateRadius(radius)) {
    throw new Error('Invalid search radius');
  }

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
        radius
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to search for doctors');
    }

    const data = await response.json();
    
    // Validate the response data
    if (!Array.isArray(data.doctors)) {
      throw new Error('Invalid response format');
    }

    // Filter out invalid doctor data
    const validDoctors = data.doctors.filter(validateDoctorData);
    
    if (validDoctors.length === 0) {
      throw new Error('No valid doctors found');
    }

    return {
      doctors: validDoctors,
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    console.error('Error searching for doctors:', error);
    // Return static data as fallback with validation
    const fallbackData: DoctorLocationData = {
      placeId: 'static-1',
      name: 'Dr. John Smith',
      address: '123 Medical Center, City',
      latitude: latitude + 0.01,
      longitude: longitude + 0.01,
      qualifications: ['MD', 'MBBS', 'MRCP'],
      experience: '15 years',
      languages: ['English', 'Spanish'],
      rating: 4.5,
      reviewCount: 100,
      bio: 'Experienced physician specializing in general medicine with a focus on preventive care.',
      consultationFee: 150,
      phoneNumber: '+1 (555) 123-4567',
      website: 'https://example.com',
      openingHours: [
        'Monday: 9:00 AM – 5:00 PM',
        'Tuesday: 9:00 AM – 5:00 PM',
        'Wednesday: 9:00 AM – 5:00 PM',
        'Thursday: 9:00 AM – 5:00 PM',
        'Friday: 9:00 AM – 5:00 PM'
      ]
    };

    if (!validateDoctorData(fallbackData)) {
      throw new Error('Invalid fallback data');
    }

    return {
      doctors: [fallbackData]
    };
  }
};

// Function to get detailed information about a specific place
export const getPlaceDetails = async (placeId: string): Promise<DoctorLocationData> => {
  // Validate placeId
  if (!placeId || placeId.length === 0) {
    throw new Error('Invalid place ID');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${placeId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get doctor details');
    }

    const data = await response.json();
    
    // Validate the response data
    if (!validateDoctorData(data)) {
      throw new Error('Invalid doctor data received');
    }

    return data;
  } catch (error) {
    console.error('Error getting doctor details:', error);
    // Return static data as fallback with validation
    const fallbackData: DoctorLocationData = {
      placeId: 'static-1',
      name: 'Dr. John Smith',
      address: '123 Medical Center, City',
      latitude: 40.7128,
      longitude: -74.0060,
      qualifications: ['MD', 'MBBS', 'MRCP'],
      experience: '15 years',
      languages: ['English', 'Spanish'],
      rating: 4.5,
      reviewCount: 100,
      bio: 'Experienced physician specializing in general medicine with a focus on preventive care.',
      consultationFee: 150,
      phoneNumber: '+1 (555) 123-4567',
      website: 'https://example.com',
      openingHours: [
        'Monday: 9:00 AM – 5:00 PM',
        'Tuesday: 9:00 AM – 5:00 PM',
        'Wednesday: 9:00 AM – 5:00 PM',
        'Thursday: 9:00 AM – 5:00 PM',
        'Friday: 9:00 AM – 5:00 PM'
      ]
    };

    if (!validateDoctorData(fallbackData)) {
      throw new Error('Invalid fallback data');
    }

    return fallbackData;
  }
};

// Function to get user's current location
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Validate coordinates before returning
        if (!validateCoordinates(latitude, longitude)) {
          reject(new Error('Invalid coordinates received from browser'));
          return;
        }

        resolve({ latitude, longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        // Fallback to a default location (New York City) with validation
        const fallbackLocation = {
          latitude: 40.7128,
          longitude: -74.0060
        };

        if (!validateCoordinates(fallbackLocation.latitude, fallbackLocation.longitude)) {
          reject(new Error('Invalid fallback coordinates'));
          return;
        }

        resolve(fallbackLocation);
      }
    );
  });
}; 