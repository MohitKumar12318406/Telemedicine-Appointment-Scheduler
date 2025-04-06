import React, { useEffect, useState } from 'react';
import { GOOGLE_MAPS_CONFIG } from '../config/google';
import { DoctorLocationData, getPlaceDetails } from '../services/googleApi';
import { MapPin, Phone, Globe, Clock, Star } from 'lucide-react';

interface DoctorLocationProps {
  placeId?: string;
  latitude?: number;
  longitude?: number;
  doctorName: string;
  specialization: string;
  qualifications?: string[];
  experience?: string;
  languages?: string[];
  rating?: number;
  reviewCount?: number;
  bio?: string;
  consultationFee?: number;
}

export const DoctorLocation: React.FC<DoctorLocationProps> = ({
  placeId,
  latitude,
  longitude,
  doctorName,
  specialization,
  qualifications = [],
  experience = '',
  languages = [],
  rating = 0,
  reviewCount = 0,
  bio = '',
  consultationFee = 0
}) => {
  const [doctorData, setDoctorData] = useState<DoctorLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Check if API key is available
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      setError('Google Maps API key is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(',')}&v=${GOOGLE_MAPS_CONFIG.version}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your internet connection and API key.');
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (placeId) {
          // If we have a placeId, fetch detailed information
          const data = await getPlaceDetails(placeId);
          setDoctorData(data);
        } else if (latitude && longitude) {
          // If we only have coordinates, create a basic data object
          setDoctorData({
            placeId: '',
            name: doctorName,
            address: 'Location available on map',
            latitude,
            longitude,
            rating: rating,
            userRatingsTotal: reviewCount,
            phoneNumber: 'Contact through appointment system',
            website: '',
            openingHours: [
              'Monday - Friday: 9:00 AM - 5:00 PM',
              'Saturday: 9:00 AM - 1:00 PM',
              'Sunday: Closed'
            ]
          });
        } else {
          setError('Location information not available');
        }
      } catch (err) {
        console.error('Error fetching doctor data:', err);
        setError('Failed to load doctor information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (placeId || (latitude && longitude)) {
      fetchDoctorData();
    }
  }, [placeId, latitude, longitude, doctorName, rating, reviewCount]);

  useEffect(() => {
    if (mapLoaded && doctorData) {
      try {
        initMap();
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map. Please try again later.');
      }
    }
  }, [mapLoaded, doctorData]);

  const initMap = () => {
    if (!doctorData || !window.google) {
      setError('Map initialization failed. Please refresh the page.');
      return;
    }
    
    const mapElement = document.getElementById('doctor-location-map');
    if (!mapElement) {
      setError('Map container not found');
      return;
    }

    try {
      const map = new window.google.maps.Map(mapElement, {
        center: { lat: doctorData.latitude, lng: doctorData.longitude },
        zoom: 15,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add marker for doctor's location
      const marker = new window.google.maps.Marker({
        position: { lat: doctorData.latitude, lng: doctorData.longitude },
        map,
        title: doctorData.name,
        animation: window.google.maps.Animation.DROP
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-medium">${doctorData.name}</h3>
            <p class="text-sm text-gray-600">${doctorData.address}</p>
            ${doctorData.phoneNumber ? `<p class="text-sm mt-1">${doctorData.phoneNumber}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    } catch (err) {
      console.error('Error creating map:', err);
      setError('Failed to create map. Please check your API key and try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading doctor information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 text-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            {doctorData && (
              <>
                <strong>Doctor Information:</strong><br />
                Name: {doctorData.name}<br />
                Address: {doctorData.address}<br />
                {doctorData.phoneNumber && `Phone: ${doctorData.phoneNumber}`}
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return null;
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Doctor's Location</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <div 
            id="doctor-location-map" 
            className="w-full h-[300px] rounded-lg shadow-md"
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="font-medium text-lg mb-2">{doctorData.name}</h4>
          <p className="text-sm text-gray-600 mb-2">{specialization}</p>
          
          {bio && (
            <p className="text-sm text-gray-600 mb-4">{bio}</p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>{doctorData.address}</span>
            </div>
            
            {doctorData.phoneNumber && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 mr-2" />
                <span>{doctorData.phoneNumber}</span>
              </div>
            )}
            
            {doctorData.website && (
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-500 mr-2" />
                <a 
                  href={doctorData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
            
            {doctorData.openingHours && (
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Opening Hours:</p>
                  <ul className="mt-1">
                    {doctorData.openingHours.map((hours, index) => (
                      <li key={index}>{hours}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {qualifications.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Qualifications:</p>
                <ul className="mt-1">
                  {qualifications.map((qualification, index) => (
                    <li key={index}>{qualification}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {experience && (
              <div className="mt-2">
                <p className="font-medium">Experience:</p>
                <p>{experience}</p>
              </div>
            )}
            
            {languages.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Languages:</p>
                <p>{languages.join(', ')}</p>
              </div>
            )}
            
            {consultationFee > 0 && (
              <div className="mt-2">
                <p className="font-medium">Consultation Fee:</p>
                <p>${consultationFee}</p>
              </div>
            )}
            
            {doctorData.rating && (
              <div className="flex items-center mt-2">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                <span>
                  {doctorData.rating} ({doctorData.userRatingsTotal} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 