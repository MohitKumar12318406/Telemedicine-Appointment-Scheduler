import { useState, useRef, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SPECIALIZATIONS, SYMPTOMS, DISEASES, DOCTORS } from './data/medical-data';
import { Specialization, Symptom, Disease, Doctor } from './services/api';
import { format } from 'date-fns';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
};

type ChatState = {
  currentStep: 'initial' | 'name' | 'patient-info' | 'symptoms-selection' | 'specialization' | 'consultation-type' | 'doctor' | 'date' | 'time' | 'contact-info' | 'email' | 'confirmation';
  messages: Message[];
  appointment: {
    id?: string;
    date?: Date;
    time?: string;
    doctorId?: number;
    doctorName?: string;
    specializationId?: number;
    specialization?: string;
    patientName?: string;
    patientAge?: number;
    symptoms?: string[];
    contactNumber?: string;
    email?: string;
    consultationType?: 'virtual' | 'in-person' | 'both';
    preliminaryDiagnosis?: string[];
  };
  availableSymptoms?: Symptom[];
  availableDoctors?: Doctor[];
  suggestedSpecializations?: Specialization[];
};

function App() {
  const [state, setState] = useState<ChatState>({
    currentStep: 'initial',
    messages: [],
    appointment: {}
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

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

  const findPossibleDiagnosis = (symptomIds: number[]): Disease[] => {
    return DISEASES.filter((disease: Disease) => 
      disease.commonSymptoms.some((id: number) => symptomIds.includes(id))
    );
  };

  const handleUserMessage = (message: string) => {
    addMessage(message, 'user');

    switch (state.currentStep) {
      case 'initial':
        setState(prev => ({
          ...prev,
          currentStep: 'name'
        }));
        addMessage('Please enter your name:', 'bot');
        break;

      case 'name':
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, patientName: message },
          currentStep: 'patient-info'
        }));
        addMessage('Please enter your age:', 'bot');
        break;

      case 'patient-info':
        const age = parseInt(message);
        if (isNaN(age) || age < 0 || age > 120) {
          addMessage('Please enter a valid age between 0 and 120:', 'bot');
          return;
        }
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, patientAge: age },
          currentStep: 'symptoms-selection',
          availableSymptoms: SYMPTOMS
        }));
        addMessage(
          'Please select your symptoms from the list:',
          'bot',
          SYMPTOMS.map((s: Symptom) => `${s.name} - ${s.description}`)
        );
        break;

      case 'symptoms-selection':
        const selectedSymptoms = state.availableSymptoms?.filter((symptom: Symptom) =>
          message.toLowerCase().includes(symptom.name.toLowerCase())
        );

        if (!selectedSymptoms || selectedSymptoms.length === 0) {
          addMessage('Please select valid symptoms from the list.', 'bot',
            state.availableSymptoms?.map((s: Symptom) => s.name)
          );
          return;
        }

        const possibleConditions = findPossibleDiagnosis(selectedSymptoms.map((s: Symptom) => s.id));
        const suggestedSpecs = possibleConditions.map((d: Disease) => d.recommendedSpecialization);

        const filteredSpecializations = SPECIALIZATIONS.filter((s: Specialization) => 
          suggestedSpecs.includes(s.id)
        );

        setState(prev => ({
          ...prev,
          appointment: { 
            ...prev.appointment, 
            symptoms: selectedSymptoms.map((s: Symptom) => s.name),
            preliminaryDiagnosis: possibleConditions.map((d: Disease) => d.name)
          },
          currentStep: 'specialization',
          suggestedSpecializations: filteredSpecializations
        }));

        if (filteredSpecializations.length === 0) {
          addMessage('No specializations found for your symptoms. Please try selecting different symptoms.', 'bot');
          return;
        }

        // Create a formatted list of specializations
        const specializationList = filteredSpecializations.map((s: Specialization, index: number) => 
          `${index + 1}. ${s.name} - ${s.description}`
        ).join('\n');

        addMessage(
          `Based on your symptoms, here are the recommended specializations. Please select one by typing the number:\n\n${specializationList}`,
          'bot'
        );
        break;

      case 'specialization':
        const selectedIndex = parseInt(message) - 1;
        
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= (state.suggestedSpecializations?.length || 0)) {
          // Create a formatted list of specializations for the error message
          const specializationList = state.suggestedSpecializations?.map((s: Specialization, index: number) => 
            `${index + 1}. ${s.name} - ${s.description}`
          ).join('\n');
          
          addMessage(
            `Please enter a valid number from the list:\n\n${specializationList}`,
            'bot'
          );
          return;
        }
        
        const selectedSpec = state.suggestedSpecializations?.[selectedIndex];
        
        if (!selectedSpec) {
          // Create a formatted list of specializations for the error message
          const specializationList = state.suggestedSpecializations?.map((s: Specialization, index: number) => 
            `${index + 1}. ${s.name} - ${s.description}`
          ).join('\n');
          
          addMessage(
            `Please select a valid specialization by entering the number from the list:\n\n${specializationList}`,
            'bot'
          );
          return;
        }

        const availableDoctors = DOCTORS.filter((d: Doctor) => d.specialization === selectedSpec.id);
        
        if (availableDoctors.length === 0) {
          // Create a formatted list of specializations for the error message
          const specializationList = state.suggestedSpecializations?.map((s: Specialization, index: number) => 
            `${index + 1}. ${s.name} - ${s.description}`
          ).join('\n');
          
          addMessage(
            `No doctors available for this specialization. Please select another one:\n\n${specializationList}`,
            'bot'
          );
          return;
        }
        
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, specializationId: selectedSpec.id, specialization: selectedSpec.name },
          currentStep: 'consultation-type',
          availableDoctors
        }));

        addMessage(
          'Please select your preferred consultation type:',
          'bot',
          ['Virtual Consultation', 'In-Person Consultation', 'Both']
        );
        break;

      case 'consultation-type':
        let consultationType: 'virtual' | 'in-person' | 'both' = 'both';
        let filteredDoctors = state.availableDoctors || [];
        
        if (message.toLowerCase().includes('virtual')) {
          consultationType = 'virtual';
          filteredDoctors = filteredDoctors.filter((d: Doctor) => d.virtualConsultationAvailable);
        } else if (message.toLowerCase().includes('in-person')) {
          consultationType = 'in-person';
          filteredDoctors = filteredDoctors.filter((d: Doctor) => d.inPersonConsultationAvailable);
        }
        
        if (filteredDoctors.length === 0) {
          addMessage(
            `No doctors available for ${consultationType} consultation in ${state.appointment.specialization}. Please select a different specialization.`,
            'bot',
            state.suggestedSpecializations?.map((s: Specialization) => `${s.name} - ${s.description}`)
          );
          setState(prev => ({
            ...prev,
            currentStep: 'specialization'
          }));
          return;
        }
        
        // Sort doctors by rating (highest first)
        filteredDoctors.sort((a: Doctor, b: Doctor) => b.rating - a.rating);
        
        const doctorOptions = filteredDoctors.map((d: Doctor) => 
          `${d.name} - ${d.experience} experience, Rating: ${d.rating}/5 (${d.reviewCount} reviews), Fee: $${d.consultationFee}`
        );
        
        addMessage(
          'Please choose your preferred doctor:',
          'bot',
          doctorOptions
        );
        
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, consultationType },
          currentStep: 'doctor',
          availableDoctors: filteredDoctors
        }));
        break;

      case 'doctor':
        const selectedDoctor = state.availableDoctors?.find((d: Doctor) =>
          message.toLowerCase().includes(d.name.toLowerCase())
        );

        if (!selectedDoctor) {
          addMessage('Please select a valid doctor from the list.', 'bot',
            state.availableDoctors?.map((d: Doctor) => 
              `${d.name} - ${d.experience} experience, Rating: ${d.rating}/5 (${d.reviewCount} reviews), Fee: $${d.consultationFee}`)
          );
          return;
        }

        setState(prev => ({
          ...prev,
          appointment: { 
            ...prev.appointment, 
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name
          },
          currentStep: 'date',
        }));
        addMessage('Please enter your preferred appointment date (e.g., "2024-04-05"):', 'bot');
        break;

      case 'date':
        try {
          const date = new Date(message);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
          const selectedDoctor = state.availableDoctors?.find(d => d.id === state.appointment.doctorId);
          if (!selectedDoctor) {
            addMessage('Error: Doctor information not found. Please start over.', 'bot');
            setState({
              currentStep: 'initial',
              messages: [],
              appointment: {}
            });
            return;
          }
          setState(prev => ({
            ...prev,
            appointment: { ...prev.appointment, date },
            currentStep: 'time'
          }));
          addMessage('Please select your preferred time slot:', 'bot',
            selectedDoctor.availability.timeSlots
          );
        } catch (error) {
          addMessage('Please enter a valid date in the format YYYY-MM-DD:', 'bot');
        }
        break;

      case 'time':
        const currentDoctor = state.availableDoctors?.find(d => d.id === state.appointment.doctorId);
        if (!currentDoctor) {
          addMessage('Error: Doctor information not found. Please start over.', 'bot');
          setState({
            currentStep: 'initial',
            messages: [],
            appointment: {}
          });
          return;
        }
        
        const selectedTime = currentDoctor.availability.timeSlots.find(t => 
          message.toLowerCase().includes(t.toLowerCase())
        );
        
        if (!selectedTime) {
          addMessage('Please select a valid time slot from the list:', 'bot',
            currentDoctor.availability.timeSlots
          );
          return;
        }
        
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, time: selectedTime },
          currentStep: 'contact-info'
        }));
        addMessage('Please enter your contact number:', 'bot');
        break;

      case 'contact-info':
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(message)) {
          addMessage('Please enter a valid phone number:', 'bot');
          return;
        }
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, contactNumber: message },
          currentStep: 'email'
        }));
        addMessage('Please enter your email address:', 'bot');
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(message)) {
          addMessage('Please enter a valid email address:', 'bot');
          return;
        }
        setState(prev => ({
          ...prev,
          appointment: { ...prev.appointment, email: message },
          currentStep: 'confirmation'
        }));

        const confirmationMessage = `
Appointment Details:
Patient Name: ${state.appointment.patientName}
Age: ${state.appointment.patientAge}
Symptoms: ${state.appointment.symptoms?.join(', ')}
Preliminary Assessment: ${state.appointment.preliminaryDiagnosis?.join(', ')}
Specialization: ${state.appointment.specialization}
Doctor: ${state.appointment.doctorName}
Date: ${format(state.appointment.date!, 'MMMM d, yyyy')}
Time: ${state.appointment.time}
Contact Number: ${state.appointment.contactNumber}
Email: ${message}
Consultation Type: ${state.appointment.consultationType}

Please confirm your appointment by typing "confirm" or start over by typing "start over".
        `;
        addMessage(confirmationMessage, 'bot');
        break;

      case 'confirmation':
        if (message.toLowerCase() === 'confirm') {
          addMessage(`
Thank you for confirming your appointment! We've sent a confirmation email to ${state.appointment.email} and an SMS to your registered contact details.

Your appointment details:
Specialization: ${state.appointment.specialization}
Doctor: ${state.appointment.doctorName}
Date: ${format(state.appointment.date!, 'MMMM d, yyyy')}
Time: ${state.appointment.time}
Consultation Type: ${state.appointment.consultationType}
Contact Number: ${state.appointment.contactNumber}
Email: ${state.appointment.email}

You can start a new appointment by typing "start over".
          `, 'bot');
        } else if (message.toLowerCase() === 'start over') {
          setState({
            currentStep: 'initial',
            messages: [],
            appointment: {}
          });
          addMessage('Please enter your name:', 'bot');
        } else {
          addMessage('Please type "confirm" to confirm your appointment or "start over" to begin a new appointment.', 'bot');
        }
        break;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4 relative">
        {/* Member Details Table in Corner */}
        <div className="absolute top-4 right-4 w-64 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow z-10">
          <h2 className="text-sm font-semibold mb-2 text-gray-800">Team Members</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Name</th>
                <th className="text-left py-1">Reg. no.</th>
                <th className="text-left py-1">Roll no.</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-1">Mohit Kumar</td>
                <td className="py-1">12318406</td>
                <td className="py-1">63</td>
              </tr>
              <tr className="border-b">
                <td className="py-1">Koyna Soni</td>
                <td className="py-1">12318449</td>
                <td className="py-1">28</td>
              </tr>
              <tr>
                <td className="py-1">Aman</td>
                <td className="py-1">12319643</td>
                <td className="py-1">65</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="chat-container rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center gap-3">
            <Stethoscope className="text-white" size={28} />
            <div>
              <h1 className="text-2xl font-semibold text-white">Telemedicine Appointment Scheduler</h1>
              <p className="text-blue-100 text-sm mt-1">24/7 Healthcare Support</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-blue-50 px-6 py-3 flex items-center gap-6 text-sm">
            {['initial', 'name', 'patient-info', 'symptoms-selection', 'specialization', 'consultation-type', 'doctor', 'date', 'time', 'contact-info', 'email', 'confirmation'].map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index < ['initial', 'name', 'patient-info', 'symptoms-selection', 'specialization', 'consultation-type', 'doctor', 'date', 'time', 'contact-info', 'email', 'confirmation'].indexOf(state.currentStep)
                    ? 'text-blue-600'
                    : index === ['initial', 'name', 'patient-info', 'symptoms-selection', 'specialization', 'consultation-type', 'doctor', 'date', 'time', 'contact-info', 'email', 'confirmation'].indexOf(state.currentStep)
                    ? 'text-blue-800 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                    index < ['initial', 'name', 'patient-info', 'symptoms-selection', 'specialization', 'consultation-type', 'doctor', 'date', 'time', 'contact-info', 'email', 'confirmation'].indexOf(state.currentStep)
                      ? 'bg-blue-600 text-white'
                      : index === ['initial', 'name', 'patient-info', 'symptoms-selection', 'specialization', 'consultation-type', 'doctor', 'date', 'time', 'contact-info', 'email', 'confirmation'].indexOf(state.currentStep)
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
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {state.messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                onOptionSelect={handleUserMessage}
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <ChatInput onSend={handleUserMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;