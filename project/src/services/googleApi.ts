import { GOOGLE_API_KEY } from '../config/google';

// Interface for doctor location data
export interface DoctorLocationData {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  userRatingsTotal?: number;
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

// Function to search for doctors by specialization and location
export const searchDoctorsByLocation = async (
  specialization: string,
  latitude: number,
  longitude: number,
  radius: number = 5000, // Default 5km radius
  pageToken?: string
): Promise<NearbyDoctorsResult> => {
  try {
    const query = `${specialization} doctor`;
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    
    url.searchParams.append('key', GOOGLE_API_KEY);
    url.searchParams.append('location', `${latitude},${longitude}`);
    url.searchParams.append('radius', radius.toString());
    url.searchParams.append('keyword', query);
    url.searchParams.append('type', 'doctor');
    
    if (pageToken) {
      url.searchParams.append('pagetoken', pageToken);
    }
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    const doctors: DoctorLocationData[] = data.results.map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      photos: place.photos ? place.photos.map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
      ) : []
    }));
    
    return {
      doctors,
      nextPageToken: data.next_page_token
    };
  } catch (error) {
    console.error('Error searching for doctors:', error);
    throw error;
  }
};

// Function to get detailed information about a specific place
export const getPlaceDetails = async (placeId: string): Promise<DoctorLocationData> => {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    
    url.searchParams.append('key', GOOGLE_API_KEY);
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('fields', 'name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,website,opening_hours,photos');
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    const place = data.result;
    
    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      phoneNumber: place.formatted_phone_number,
      website: place.website,
      openingHours: place.opening_hours?.weekday_text,
      photos: place.photos ? place.photos.map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
      ) : []
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
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
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}; 