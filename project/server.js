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

// Routes
app.get('/api/prompts', (req, res) => {
  const { step } = req.query;
  
  if (!step || !prompts[step]) {
    return res.status(400).json({ error: 'Invalid step parameter' });
  }
  
  res.json(prompts[step]);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 