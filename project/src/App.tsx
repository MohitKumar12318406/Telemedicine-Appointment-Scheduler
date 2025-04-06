import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { DoctorLocation } from './components/DoctorLocation';
import { SPECIALIZATIONS, SYMPTOMS, DISEASES, DOCTORS } from './data/medical-data';
import { Specialization, Symptom, Disease, Doctor } from './services/api';
import { format } from 'date-fns';
import { getCurrentLocation, searchDoctorsByLocation } from './services/googleApi';
import { DoctorLocationData } from './services/googleApi';
import { sendChatMessage, searchDoctors, getDoctorDetails, ChatResponse } from './services/backendApi';
import { Message, ChatState } from './types';
import { fetchPrompts } from './services/promptApi';

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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    addMessage(userMessage, 'user');

    setLoading(true);

    try {
      // Send message to backend
      const response = await sendChatMessage(userMessage, state.currentStep);

      // Add bot response
      addMessage(response.message, 'bot', response.options);

      // Update step if provided
      if (response.nextStep) {
        // Use type assertion to ensure compatibility with ChatState
        const nextStep = response.nextStep as 'initial' | 'patient-info' | 'symptoms-selection' | 'specialization' | 'doctor' | 'date' | 'time' | 'contact-info' | 'confirmation';
        setState(prev => ({ 
          ...prev, 
          currentStep: nextStep
        }));
      }

      // If doctors are returned, update the selected doctor
      if (response.doctors && response.doctors.length > 0) {
        setSelectedDoctor(response.doctors[0]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('Sorry, I encountered an error. Please try again.', 'bot');
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
          setSelectedDoctor(result.doctors[0]);
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
          const staticDoctor = DOCTORS.find(d => d.specialization === SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1);
          if (staticDoctor) {
            setSelectedDoctor({
              placeId: '',
              name: staticDoctor.name,
              address: 'Address not available',
              latitude: 40.7128,
              longitude: -74.0060
            });
            setState(prev => ({ 
              ...prev, 
              currentStep: 'doctor',
              appointment: {
                ...prev.appointment,
                specializationId: SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1,
                specialization: specialization
              }
            }));
          }
        }
      } else {
        // If no user location, use static data
        const staticDoctor = DOCTORS.find(d => d.specialization === SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1);
        if (staticDoctor) {
          setSelectedDoctor({
            placeId: '',
            name: staticDoctor.name,
            address: 'Address not available',
            latitude: 40.7128,
            longitude: -74.0060
          });
          setState(prev => ({ 
            ...prev, 
            currentStep: 'doctor',
            appointment: {
              ...prev.appointment,
              specializationId: SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1,
              specialization: specialization
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error searching for doctors:', error);
      // Fallback to static data
      const staticDoctor = DOCTORS.find(d => d.specialization === SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1);
      if (staticDoctor) {
        setSelectedDoctor({
          placeId: '',
          name: staticDoctor.name,
          address: 'Address not available',
          latitude: 40.7128,
          longitude: -74.0060
        });
        setState(prev => ({ 
          ...prev, 
          currentStep: 'doctor',
          appointment: {
            ...prev.appointment,
            specializationId: SPECIALIZATIONS.findIndex(s => s.name === specialization) + 1,
            specialization: specialization
          }
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserMessage = (message: string) => {
    addMessage(message, 'user');

    // Check if user wants to start over or start from first
    if (message.toLowerCase() === 'start over' || message.toLowerCase() === 'start from first') {
      setState({
        currentStep: 'initial',
        messages: [],
        appointment: {},
        availableSymptoms: SYMPTOMS,
        availableDoctors: DOCTORS,
        suggestedSpecializations: SPECIALIZATIONS
      });
      return;
    }

    switch (state.currentStep) {
      case 'initial':
        setState(prev => ({
          ...prev,
          currentStep: 'patient-info'
        }));
        break;

      case 'patient-info':
        // Validate name (letters and spaces only, minimum 2 characters)
        if (!/^[a-zA-Z\s]{2,50}$/.test(message)) {
          addMessage('Please enter a valid name (letters and spaces only, 2-50 characters):', 'bot');
          return;
        }
        
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, patientName: message },
          currentStep: 'symptoms-selection'
        }));
        break;

      case 'symptoms-selection':
        const selectedSymptoms = SYMPTOMS.filter(symptom =>
          message.toLowerCase().includes(symptom.name.toLowerCase())
        );

        if (selectedSymptoms.length === 0) {
          addMessage('Please select valid symptoms from the list.', 'bot', SYMPTOMS.map(s => s.name));
          return;
        }

        const possibleConditions = DISEASES.filter(disease =>
          disease.commonSymptoms.some(id => selectedSymptoms.some(s => s.id === id))
        );

        const suggestedSpecs = SPECIALIZATIONS.filter(spec =>
          possibleConditions.some(disease => disease.recommendedSpecialization === spec.id)
        );

        setState(prev => ({
          ...prev,
          appointment: { 
            ...prev.appointment, 
            symptoms: selectedSymptoms
          },
          currentStep: 'specialization',
          suggestedSpecializations: suggestedSpecs
        }));
        break;

      case 'specialization':
        const selectedSpec = SPECIALIZATIONS.find(s => s.name === message);
        
        if (!selectedSpec) {
          addMessage('Please select a valid specialization from the list.', 'bot',
            state.suggestedSpecializations?.map(s => s.name)
          );
          return;
        }
        
        handleSpecializationSelect(selectedSpec.name);
        break;

      case 'doctor':
        setState(prev => ({
          ...prev,
          appointment: { 
            ...prev.appointment, 
            doctorId: selectedDoctor?.placeId || '',
            doctorName: selectedDoctor?.name || ''
          },
          currentStep: 'date'
        }));
        break;

      case 'date':
        try {
          // Validate date format (YYYY-MM-DD)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(message)) {
            addMessage('Please enter a valid date in the format YYYY-MM-DD:', 'bot');
            return;
          }
          
          const date = new Date(message);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
          
          // Check if date is in the future
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (date < today) {
            addMessage('Please select a future date for your appointment:', 'bot');
            return;
          }
          
          // Check if date is within 3 months
          const threeMonthsFromNow = new Date();
          threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
          
          if (date > threeMonthsFromNow) {
            addMessage('Please select a date within the next 3 months:', 'bot');
            return;
          }
          
          setState(prev => ({
            ...prev,
            appointment: { ...prev.appointment, date },
            currentStep: 'contact-info'
          }));
        } catch (error) {
          addMessage('Please enter a valid date in the format YYYY-MM-DD:', 'bot');
        }
        break;

      case 'contact-info':
        // Validate phone number (10 digits, can include spaces, dashes, and parentheses)
        if (!/^[\d\s\-\(\)]{10,}$/.test(message)) {
          addMessage('Please enter a valid phone number (at least 10 digits):', 'bot');
          return;
        }
        
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, contactNumber: message },
          currentStep: 'confirmation'
        }));
        break;

      case 'confirmation':
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message)) {
          addMessage('Please enter a valid email address:', 'bot');
          return;
        }
        
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, email: message, confirmed: true }
        }));

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
        break;
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