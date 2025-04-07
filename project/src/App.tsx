import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { DoctorLocation } from './components/DoctorLocation';
import { SPECIALIZATIONS, SYMPTOMS, DISEASES, DOCTORS } from './data/medical-data';
import { Specialization, Symptom, Disease, Doctor } from './services/api';
import { format } from 'date-fns';
import { getCurrentLocation, searchDoctorsByLocation } from './services/googleApi';
import { sendChatMessage, searchDoctors, getDoctorDetails, ChatResponse } from './services/backendApi';
import { Message, ChatState } from './types';
import { fetchPrompts } from './services/promptApi';

interface DoctorLocationData {
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
}

// Update the ChatState type to include the new step
export type ChatStep = 'initial' | 'patient-info' | 'symptoms-selection' | 'other-issues' | 'specialization' | 'doctor' | 'date' | 'time' | 'contact-info' | 'confirmation';

export default function App() {
  const [state, setState] = useState<ChatState>({
    currentStep: 'initial',
    messages: [],
    appointment: {},
    availableSymptoms: SYMPTOMS,
    availableDoctors: DOCTORS,
    suggestedSpecializations: SPECIALIZATIONS
  });

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorLocationData | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  useEffect(() => {
    // Get user's current location when the app starts
    const getUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    };

    getUserLocation();
  }, []);

  // Fetch prompts when step changes
  useEffect(() => {
    const loadPrompts = async () => {
      setLoading(true);
      try {
        const prompts = await fetchPrompts(state.currentStep);
        
        // Add the first prompt as a bot message
        if (prompts.length > 0) {
          const prompt = prompts[0];
          addMessage(prompt.message, 'bot', prompt.options);
        }
      } catch (error) {
        console.error('Error loading prompts:', error);
        // Fallback to default message
        addMessage('How can I help you today?', 'bot');
      } finally {
        setLoading(false);
      }
    };

    // Only load prompts for initial step or when moving to a new step
    if (state.currentStep === 'initial' || state.messages.length === 0) {
      loadPrompts();
    }
  }, [state.currentStep]);

  const addMessage = (content: string, role: 'user' | 'bot', options?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
      options
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  const handleUserMessage = async (message: string) => {
    addMessage(message, 'user');
    setLoading(true);

    // Check if user wants to start over or start from first
    if (message.toLowerCase() === 'start over' || message.toLowerCase() === 'start from first') {
      setState({
        currentStep: 'initial' as const,
        messages: [],
        appointment: {},
        availableSymptoms: SYMPTOMS,
        availableDoctors: DOCTORS,
        suggestedSpecializations: SPECIALIZATIONS
      });
      setLoading(false);
      return;
    }

    try {
      // Send message to backend API for processing
      const response = await sendChatMessage(message, state.currentStep);
      
      // Add bot response
      addMessage(response.message, 'bot', response.options);
      
      // Update step if provided
      if (response.nextStep) {
        setState(prev => ({ 
          ...prev, 
          currentStep: response.nextStep as ChatStep
        }));
      }
      
      // If doctors are returned, update the selected doctor
      if (response.doctors && response.doctors.length > 0) {
        setSelectedDoctor(response.doctors[0]);
      }
      
      // Update appointment data based on current step
      switch (state.currentStep) {
        case 'patient-info':
          if (/^[a-zA-Z\s]{2,50}$/.test(message)) {
            setState(prev => ({
              ...prev,
              appointment: { ...prev.appointment, patientName: message }
            }));
          }
          break;
          
        case 'symptoms-selection':
          const selectedSymptoms = SYMPTOMS.filter(symptom =>
            message.toLowerCase().includes(symptom.name.toLowerCase())
          );
          
          if (selectedSymptoms.length > 0) {
            setState(prev => ({
              ...prev,
              appointment: { 
                ...prev.appointment, 
                symptoms: selectedSymptoms
              }
            }));
          }
          break;
          
        case 'other-issues':
          // Store the custom symptoms description
          setState(prev => ({
            ...prev,
            appointment: { 
              ...prev.appointment, 
              customSymptoms: message
            }
          }));
          break;
          
        case 'specialization':
          const selectedSpec = SPECIALIZATIONS.find(s => s.name === message);
          
          if (selectedSpec) {
            setState(prev => ({
              ...prev,
              appointment: {
                ...prev.appointment,
                specializationId: selectedSpec.id,
                specialization: selectedSpec.name
              }
            }));
          }
          break;
          
        case 'doctor':
          if (selectedDoctor) {
            setState(prev => ({
              ...prev,
              appointment: { 
                ...prev.appointment, 
                doctorId: selectedDoctor.placeId || '',
                doctorName: selectedDoctor.name || ''
              }
            }));
          }
          break;
          
        case 'date':
          if (/^\d{4}-\d{2}-\d{2}$/.test(message)) {
            const date = new Date(message);
            if (!isNaN(date.getTime())) {
              setState(prev => ({
                ...prev,
                appointment: { ...prev.appointment, date }
              }));
            }
          }
          break;
          
        case 'contact-info':
          if (/^[\d\s\-\(\)]{10,}$/.test(message)) {
            setState(prev =>({
              ...prev,
              appointment: { ...prev.appointment, contactNumber: message }
            }));
          }
          break;
          
        case 'confirmation':
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message)) {
            setState(prev =>({
              ...prev,
              appointment: { ...prev.appointment, email: message, confirmed: true }
            }));
            
            // Display confirmation message with appointment details
            const appointment = state.appointment;
            const tableData = [
              ['Field', 'Value'],
              ['Name', appointment.patientName || ''],
              ['Specialization', appointment.specialization || ''],
              ['Doctor', appointment.doctorName || ''],
              ['Date', format(appointment.date || new Date(), 'MMMM d, yyyy')],
              ['Contact Number', appointment.contactNumber || ''],
              ['Email', message],
              ['Status', 'Confirmed']
            ];
            
            const table = tableData.map(row => `| ${row[0].padEnd(15)} | ${row[1].padEnd(20)} |`).join('\n');
            const separator = '|' + '-'.repeat(17) + '|' + '-'.repeat(22) + '|';
            
            const confirmationMessage = `
Your appointment has been confirmed! You will receive a confirmation email shortly.

${table.split('\n')[0]}
${separator}
${table.split('\n').slice(1).join('\n')}
            `;
            addMessage(confirmationMessage, 'bot');
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          addMessage('I\'m having trouble connecting to the server. Please check your internet connection and try again.', 'bot');
        } else if (error.message.includes('Failed to send message')) {
          addMessage('I couldn\'t process your message. Please try again in a moment.', 'bot');
        } else {
          addMessage(`I encountered an error: ${error.message}. Please try again.`, 'bot');
        }
      } else {
        addMessage('I encountered an unexpected error. Please try again.', 'bot');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSpecializationSelect = async (specialization: string) => {
    setSelectedSpecialization(specialization);
    setLoading(true);

    try {
      if (userLocation) {
        // Search for doctors using backend API
        const result = await searchDoctors(
          specialization,
          userLocation.latitude,
          userLocation.longitude
        );

        if (result.doctors && result.doctors.length > 0) {
          // Get the full doctor details from our static data
          const specializationId = SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1;
          const staticDoctor = DOCTORS.find(d => d.specialization === specializationId);
          
          if (staticDoctor) {
            // Combine API data with static data
            setSelectedDoctor({
              ...result.doctors[0],
              name: staticDoctor.name,
              qualifications: staticDoctor.qualifications,
              experience: staticDoctor.experience,
              languages: staticDoctor.languages,
              rating: staticDoctor.rating,
              reviewCount: staticDoctor.reviewCount,
              bio: staticDoctor.bio,
              consultationFee: staticDoctor.consultationFee
            });
          } else {
            setSelectedDoctor(result.doctors[0]);
          }
          
          setState(prev => ({ 
            ...prev, 
            currentStep: 'doctor',
            appointment: {
              ...prev.appointment,
              specializationId: SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1,
              specialization: specialization
            }
          }));
        } else {
          // Fallback to static data if no results found
          const specializationId = SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1;
          const staticDoctor = DOCTORS.find(d => d.specialization === specializationId);
          
          if (staticDoctor) {
            setSelectedDoctor({
              placeId: '',
              name: staticDoctor.name,
              address: 'Address not available',
              latitude: 40.7128,
              longitude: -74.0060,
              qualifications: staticDoctor.qualifications,
              experience: staticDoctor.experience,
              languages: staticDoctor.languages,
              rating: staticDoctor.rating,
              reviewCount: staticDoctor.reviewCount,
              bio: staticDoctor.bio,
              consultationFee: staticDoctor.consultationFee
            });
            setState(prev => ({ 
              ...prev, 
              currentStep: 'doctor',
              appointment: {
                ...prev.appointment,
                specializationId: specializationId,
                specialization: specialization
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error searching for doctors:', error);
      // Fallback to static data on error
      const specializationId = SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1;
      const staticDoctor = DOCTORS.find(d => d.specialization === specializationId);
      
      if (staticDoctor) {
        setSelectedDoctor({
          placeId: '',
          name: staticDoctor.name,
          address: 'Address not available',
          latitude: 40.7128,
          longitude: -74.0060,
          qualifications: staticDoctor.qualifications,
          experience: staticDoctor.experience,
          languages: staticDoctor.languages,
          rating: staticDoctor.rating,
          reviewCount: staticDoctor.reviewCount,
          bio: staticDoctor.bio,
          consultationFee: staticDoctor.consultationFee
        });
        setState(prev => ({ 
          ...prev, 
          currentStep: 'doctor',
          appointment: {
            ...prev.appointment,
            specializationId: specializationId,
            specialization: specialization
          }
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="chat-container rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Stethoscope className="text-white" size={28} />
                <div>
                  <h1 className="text-2xl font-semibold text-white">Telemedicine Appointment Scheduler</h1>
                  <p className="text-blue-100 text-sm mt-1">24/7 Healthcare Support</p>
                </div>
              </div>
              
              {/* Team Members Table */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                <table className="min-w-[200px]">
                  <thead>
                    <tr>
                      <th className="text-left px-2 py-1 border-b border-white/20">Name</th>
                      <th className="text-left px-2 py-1 border-b border-white/20">Roll No.</th>
                      <th className="text-left px-2 py-1 border-b border-white/20">Reg No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2 py-1">Mohit Kumar</td>
                      <td className="px-2 py-1">63</td>
                      <td className="px-2 py-1">12318406</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">Koyna soni</td>
                      <td className="px-2 py-1">28</td>
                      <td className="px-2 py-1">12324749</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">Aman</td>
                      <td className="px-2 py-1">65</td>
                      <td className="px-2 py-1">12319612</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-blue-50 px-6 py-3 flex items-center gap-6 text-sm">
            {['initial', 'patient-info', 'symptoms-selection', 'specialization', 'doctor', 'date', 'contact-info', 'confirmation'].map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index < ['initial', 'patient-info', 'symptoms-selection', 'specialization', 'doctor', 'date', 'contact-info', 'confirmation'].indexOf(state.currentStep)
                    ? 'text-blue-600'
                    : index === ['initial', 'patient-info', 'symptoms-selection', 'specialization', 'doctor', 'date', 'contact-info', 'confirmation'].indexOf(state.currentStep)
                    ? 'text-blue-800 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                    index < ['initial', 'patient-info', 'symptoms-selection', 'specialization', 'doctor', 'date', 'contact-info', 'confirmation'].indexOf(state.currentStep)
                      ? 'bg-blue-600 text-white'
                      : index === ['initial', 'patient-info', 'symptoms-selection', 'specialization', 'doctor', 'date', 'contact-info', 'confirmation'].indexOf(state.currentStep)
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="capitalize">{step.replace('-', ' ')}</span>
              </div>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="bg-white p-6">
            <div className="space-y-4">
              {state.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onOptionSelect={handleUserMessage}
              />
            ))}
            <div ref={chatEndRef} />
          </div>
          </div>

          {/* Doctor Location Map */}
          {state.currentStep === 'doctor' && selectedDoctor && (
            <div className="p-6 border-t">
              <DoctorLocation
                placeId={selectedDoctor.placeId}
                latitude={selectedDoctor.latitude}
                longitude={selectedDoctor.longitude}
                doctorName={selectedDoctor.name}
                specialization={selectedSpecialization}
              />
            </div>
          )}

          {/* Chat Input */}
          <div className="bg-white p-4 border-t border-gray-200">
            {loading ? (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm">Processing your request...</p>
              </div>
            ) : (
              <ChatInput 
                onSend={handleUserMessage} 
                disabled={loading} 
                placeholder={getInputPlaceholder(state.currentStep)}
                maxLength={getMaxLength(state.currentStep)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get appropriate placeholder based on current step
const getInputPlaceholder = (step: string): string => {
  switch (step) {
    case 'patient-info':
      return 'Enter your full name (letters only)';
    case 'symptoms-selection':
      return 'Type your symptoms or select from options';
    case 'specialization':
      return 'Select a specialization';
    case 'doctor':
      return 'Select a doctor';
    case 'date':
      return 'Enter date (YYYY-MM-DD)';
    case 'contact-info':
      return 'Enter your phone number';
    case 'confirmation':
      return 'Enter your email address';
    default:
      return 'Type your message...';
  }
};

// Helper function to get appropriate max length based on current step
const getMaxLength = (step: string): number => {
  switch (step) {
    case 'patient-info':
      return 50; // Name length
    case 'symptoms-selection':
      return 200; // Symptoms description
    case 'specialization':
      return 100; // Specialization name
    case 'doctor':
      return 100; // Doctor name
    case 'date':
      return 10; // YYYY-MM-DD format
    case 'contact-info':
      return 15; // Phone number
    case 'confirmation':
      return 100; // Email address
    default:
      return 500; // Default max length
  }
};