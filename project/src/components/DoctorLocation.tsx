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
}

export const DoctorLocation: React.FC<DoctorLocationProps> = ({
  placeId,
  latitude,
  longitude,
  doctorName,
  specialization
}) => {
  const [doctorData, setDoctorData] = useState<DoctorLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(',')}&v=${GOOGLE_MAPS_CONFIG.version}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
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
            address: 'Address not available',
            latitude,
            longitude
          });
        }
      } catch (err) {
        console.error('Error fetching doctor data:', err);
        setError('Failed to load doctor information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (mapLoaded && (placeId || (latitude && longitude))) {
      fetchDoctorData();
    }
  }, [placeId, latitude, longitude, doctorName, mapLoaded]);

  useEffect(() => {
    if (mapLoaded && doctorData) {
      initMap();
    }
  }, [mapLoaded, doctorData]);

  const initMap = () => {
    if (!doctorData) return;
    
    const mapElement = document.getElementById('doctor-location-map');
    if (mapElement && window.google) {
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
      new window.google.maps.Marker({
        position: { lat: doctorData.latitude, lng: doctorData.longitude },
        map,
        title: doctorData.name,
        animation: window.google.maps.Animation.DROP
      });
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
      <div className="w-full p-4 text-center text-red-500">
        <p>{error}</p>
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
            
            {doctorData.rating && (
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                <span>{doctorData.rating} ({doctorData.userRatingsTotal} reviews)</span>
              </div>
            )}
            
            {doctorData.openingHours && doctorData.openingHours.length > 0 && (
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Opening Hours:</p>
                  <ul className="mt-1">
                    {doctorData.openingHours.map((hour, index) => (
                      <li key={index}>{hour}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {doctorData.photos && doctorData.photos.length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">Photos:</p>
              <div className="grid grid-cols-2 gap-2">
                {doctorData.photos.slice(0, 4).map((photo, index) => (
                  <img 
                    key={index} 
                    src={photo} 
                    alt={`${doctorData.name} photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 