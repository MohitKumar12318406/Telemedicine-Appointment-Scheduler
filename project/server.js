import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Prompts data
const prompts = {
  initial: [
    {
      id: 'initial-1',
      step: 'initial',
      message: 'Hello! I\'m your telemedicine assistant. How can I help you today?',
      options: ['Book an appointment', 'Find a doctor', 'Get medical advice', 'Start from First']
    }
  ],
  'patient-info': [
    {
      id: 'patient-info-1',
      step: 'patient-info',
      message: 'Please enter your name:',
      options: ['Start from First']
    }
  ],
  'symptoms-selection': [
    {
      id: 'symptoms-1',
      step: 'symptoms-selection',
      message: 'Please select your symptoms:',
      options: ['Fever', 'Cough', 'Headache', 'Sore throat', 'Fatigue', 'Nausea', 'Dizziness', 'Chest pain', 'Start from First']
    }
  ],
  specialization: [
    {
      id: 'specialization-1',
      step: 'specialization',
      message: 'Please select a specialization:',
      options: ['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedist',]
    }
  ],
  doctor: [
    {
      id: 'doctor-1',
      step: 'doctor',
      message: 'Please select a doctor:',
      options: ['Dr. John Smith', 'Dr. Sarah Johnson', 'Dr. Michael Brown', 'Dr. Emily Davis', 'Dr. Robert Wilson', 'Start from First']
    }
  ],
  date: [
    {
      id: 'date-1',
      step: 'date',
      message: 'Please enter your preferred appointment date (YYYY-MM-DD):',
      options: ['Start from First']
    }
  ],
  'contact-info': [
    {
      id: 'contact-1',
      step: 'contact-info',
      message: 'Please enter your contact number:',
      options: ['Start from First']
    }
  ],
  confirmation: [
    {
      id: 'confirmation-1',
      step: 'confirmation',
      message: 'Please enter your email address:',
      options: ['Start from First']
    }
  ]
};

// Medical data
const symptoms = [
  { id: 1, name: 'Fever', description: 'Elevated body temperature' },
  { id: 2, name: 'Cough', description: 'Reflex action to clear airways' },
  { id: 3, name: 'Headache', description: 'Pain in the head or neck area' },
  { id: 4, name: 'Sore throat', description: 'Pain or irritation in the throat' },
  { id: 5, name: 'Fatigue', description: 'Extreme tiredness or exhaustion' },
  { id: 6, name: 'Nausea', description: 'Feeling of sickness with an urge to vomit' },
  { id: 7, name: 'Dizziness', description: 'Sensation of spinning or lightheadedness' },
  { id: 8, name: 'Chest pain', description: 'Pain or discomfort in the chest area' }
];

const diseases = [
  { 
    id: 1, 
    name: 'Common Cold', 
    description: 'Viral infection of the upper respiratory tract',
    commonSymptoms: [1, 2, 3, 4],
    recommendedSpecialization: 1
  },
  { 
    id: 2, 
    name: 'Influenza', 
    description: 'Viral infection that attacks your respiratory system',
    commonSymptoms: [1, 2, 3, 5],
    recommendedSpecialization: 1
  },
  { 
    id: 3, 
    name: 'Migraine', 
    description: 'Severe headache often accompanied by nausea and sensitivity to light',
    commonSymptoms: [3, 5, 6],
    recommendedSpecialization: 5
  },
  { 
    id: 4, 
    name: 'Angina', 
    description: 'Chest pain caused by reduced blood flow to the heart',
    commonSymptoms: [7, 8],
    recommendedSpecialization: 2
  }
];

const specializations = [
  { id: 1, name: 'General Physician', description: 'Treats common illnesses and conditions' },
  { id: 2, name: 'Cardiologist', description: 'Specializes in heart and blood vessel conditions' },
  { id: 3, name: 'Dermatologist', description: 'Treats skin, hair, and nail conditions' },
  { id: 4, name: 'Pediatrician', description: 'Provides medical care for infants, children, and adolescents' },
  { id: 5, name: 'Neurologist', description: 'Treats disorders of the nervous system' },
  { id: 6, name: 'Orthopedist', description: 'Treats injuries and diseases of the musculoskeletal system' }
];

const doctors = [
  {
    id: 1,
    name: 'Dr. John Smith',
    specialization: 1,
    qualifications: ['MD', 'MBBS', 'MRCP'],
    experience: '15 years',
    languages: ['English', 'Spanish'],
    rating: 4.5,
    reviewCount: 120,
    bio: 'Experienced general physician with a focus on preventive care and chronic disease management.',
    consultationFee: 150,
    placeId: 'place_1',
    address: '123 Medical Center, New York',
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: 2,
    name: 'Dr. Sarah Johnson',
    specialization: 2,
    qualifications: ['MD', 'FACC', 'FESC'],
    experience: '12 years',
    languages: ['English', 'French'],
    rating: 4.8,
    reviewCount: 95,
    bio: 'Board-certified cardiologist specializing in preventive cardiology and heart disease management.',
    consultationFee: 200,
    placeId: 'place_2',
    address: '456 Heart Institute, Boston',
    latitude: 42.3601,
    longitude: -71.0589
  },
  {
    id: 3,
    name: 'Dr. Michael Brown',
    specialization: 3,
    qualifications: ['MD', 'FAAD'],
    experience: '10 years',
    languages: ['English', 'German'],
    rating: 4.6,
    reviewCount: 78,
    bio: 'Dermatologist specializing in skin cancer detection and treatment of complex skin conditions.',
    consultationFee: 175,
    placeId: 'place_3',
    address: '789 Skin Care Clinic, Chicago',
    latitude: 41.8781,
    longitude: -87.6298
  },
  {
    id: 4,
    name: 'Dr. Emily Davis',
    specialization: 4,
    qualifications: ['MD', 'FAAP'],
    experience: '8 years',
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 150,
    bio: 'Pediatrician with expertise in child development and behavioral health.',
    consultationFee: 160,
    placeId: 'place_4',
    address: '321 Children\'s Hospital, Los Angeles',
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    id: 5,
    name: 'Dr. Robert Wilson',
    specialization: 5,
    qualifications: ['MD', 'PhD', 'FAAN'],
    experience: '20 years',
    languages: ['English', 'Italian'],
    rating: 4.7,
    reviewCount: 110,
    bio: 'Neurologist specializing in movement disorders and neurodegenerative diseases.',
    consultationFee: 225,
    placeId: 'place_5',
    address: '654 Neurology Center, San Francisco',
    latitude: 37.7749,
    longitude: -122.4194
  }
];

// Routes
app.get('/api/prompts', (req, res) => {
  const { step } = req.query;
  
  if (!step || !prompts[step]) {
    return res.status(400).json({ error: 'Invalid step parameter' });
  }
  
  res.json(prompts[step]);
});

// Chat endpoint to process user input
app.post('/api/chat', (req, res) => {
  const { message, currentStep } = req.body;
  
  if (!message || !currentStep) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  let response = {
    message: '',
    options: [],
    nextStep: null
  };
  
  // Process user input based on current step
  switch (currentStep) {
    case 'initial':
      if (message.toLowerCase() === 'book an appointment' || message.toLowerCase() === 'find a doctor') {
        response.message = 'Please enter your name:';
        response.nextStep = 'patient-info';
      } else if (message.toLowerCase() === 'get medical advice') {
        response.message = 'Please describe your symptoms:';
        response.nextStep = 'symptoms-selection';
      } else {
        response.message = 'I didn\'t understand that. Please select an option:';
        response.options = prompts.initial[0].options;
      }
      break;
      
    case 'patient-info':
      // Validate name (letters and spaces only, minimum 2 characters)
      if (/^[a-zA-Z\s]{2,50}$/.test(message)) {
        response.message = 'Please select your symptoms:';
        response.options = symptoms.map(s => s.name);
        response.nextStep = 'symptoms-selection';
      } else {
        response.message = 'Please enter a valid name (letters and spaces only, 2-50 characters):';
      }
      break;
      
    case 'symptoms-selection':
      const selectedSymptoms = symptoms.filter(symptom =>
        message.toLowerCase().includes(symptom.name.toLowerCase())
      );
      
      if (selectedSymptoms.length > 0) {
        const possibleConditions = diseases.filter(disease =>
          disease.commonSymptoms.some(id => selectedSymptoms.some(s => s.id === id))
        );
        
        const suggestedSpecs = specializations.filter(spec =>
          possibleConditions.some(disease => disease.recommendedSpecialization === spec.id)
        );
        
        response.message = 'Based on your symptoms, I recommend the following specializations:';
        response.options = suggestedSpecs.map(s => s.name);
        response.nextStep = 'specialization';
      } else {
        response.message = 'Please select valid symptoms from the list:';
        response.options = symptoms.map(s => s.name);
      }
      break;
      
    case 'specialization':
      const selectedSpec = specializations.find(s => s.name === message);
      
      if (selectedSpec) {
        const availableDoctors = doctors.filter(d => d.specialization === selectedSpec.id);
        
        response.message = 'Here are the available doctors in this specialization:';
        response.options = availableDoctors.map(d => d.name);
        response.nextStep = 'doctor';
        response.doctors = availableDoctors;
      } else {
        response.message = 'Please select a valid specialization from the list:';
        response.options = specializations.map(s => s.name);
      }
      break;
      
    case 'doctor':
      const selectedDoctor = doctors.find(d => d.name === message);
      
      if (selectedDoctor) {
        response.message = 'Please enter your preferred appointment date (YYYY-MM-DD):';
        response.nextStep = 'date';
      } else {
        response.message = 'Please select a valid doctor from the list:';
        response.options = doctors.map(d => d.name);
      }
      break;
      
    case 'date':
      // Validate date format (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(message)) {
        const date = new Date(message);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date >= today) {
          const threeMonthsFromNow = new Date();
          threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
          
          if (date <= threeMonthsFromNow) {
            response.message = 'Please enter your contact number:';
            response.nextStep = 'contact-info';
          } else {
            response.message = 'Please select a date within the next 3 months:';
          }
        } else {
          response.message = 'Please select a future date for your appointment:';
        }
      } else {
        response.message = 'Please enter a valid date in the format YYYY-MM-DD:';
      }
      break;
      
    case 'contact-info':
      // Validate phone number (10 digits, can include spaces, dashes, and parentheses)
      if (/^[\d\s\-\(\)]{10,}$/.test(message)) {
        response.message = 'Please enter your email address:';
        response.nextStep = 'confirmation';
      } else {
        response.message = 'Please enter a valid phone number (at least 10 digits):';
      }
      break;
      
    case 'confirmation':
      // Validate email format
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message)) {
        response.message = 'Your appointment has been confirmed! You will receive a confirmation email shortly.';
        response.nextStep = 'initial';
      } else {
        response.message = 'Please enter a valid email address:';
      }
      break;
      
    default:
      response.message = 'I didn\'t understand that. Please try again.';
  }
  
  res.json(response);
});

// Doctor search endpoint
app.post('/api/doctors/search', (req, res) => {
  const { specialization, latitude, longitude } = req.body;
  
  if (!specialization) {
    return res.status(400).json({ error: 'Missing specialization parameter' });
  }
  
  // Find specialization ID
  const specializationObj = specializations.find(s => s.name === specialization);
  
  if (!specializationObj) {
    return res.status(400).json({ error: 'Invalid specialization' });
  }
  
  // Filter doctors by specialization
  const availableDoctors = doctors.filter(d => d.specialization === specializationObj.id);
  
  res.json({ doctors: availableDoctors });
});

// Doctor details endpoint
app.get('/api/doctors/:placeId', (req, res) => {
  const { placeId } = req.params;
  
  if (!placeId) {
    return res.status(400).json({ error: 'Missing placeId parameter' });
  }
  
  // Find doctor by placeId
  const doctor = doctors.find(d => d.placeId === placeId);
  
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  
  res.json(doctor);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 