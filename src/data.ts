import type { Appointment, Medication, MedFile, TutorialCategory } from './types';

export const user = {
  name: 'María Rodríguez',
  firstName: 'María',
  idNumber: '1.024.567.890',
  birthDate: '15 de marzo de 1988',
  address: 'Calle 45 # 23-67, Bogotá D.C.',
  phone: '+57 320 456 7890',
  email: 'maria.rodriguez@gmail.com',
  eps: 'Sanitas EPS',
  ips: 'Centro Médico El Bosque',
  bloodType: 'O+',
  allergies: ['Penicilina', 'Aspirina', 'Látex'],
  conditions: ['Hipertensión arterial (controlada)', 'Diabetes tipo 2 (en tratamiento)'],
  emergencyContact: {
    name: 'Carlos Rodríguez',
    relation: 'Hermano',
    phone: '+57 310 234 5678',
  },
};

export const appointments: Appointment[] = [
  {
    id: '1',
    date: '2026-09-04',
    time: '09:30',
    specialty: 'Medicina General',
    doctor: 'Dr. Andrés Morales',
    center: 'Centro Médico El Bosque',
    status: 'pending',
  },
  {
    id: '2',
    date: '2026-09-10',
    time: '14:00',
    specialty: 'Cardiología',
    doctor: 'Dra. Claudia Vega',
    center: 'Clínica del Norte',
    status: 'pending',
  },
  {
    id: '3',
    date: '2026-09-15',
    time: '08:00',
    specialty: 'Laboratorio Clínico',
    doctor: 'Tec. Roberto Suárez',
    center: 'Centro Médico El Bosque',
    status: 'pending',
  },
  {
    id: '4',
    date: '2026-08-28',
    time: '10:00',
    specialty: 'Laboratorio Clínico',
    doctor: 'Tec. Roberto Suárez',
    center: 'Centro Médico El Bosque',
    status: 'done',
  },
  {
    id: '5',
    date: '2026-08-20',
    time: '11:30',
    specialty: 'Oftalmología',
    doctor: 'Dra. Sofía Gómez',
    center: 'Instituto Oftalmológico Nacional',
    status: 'cancelled',
  },
];

export const initialMedications: Medication[] = [
  {
    id: '1',
    name: 'Enalapril',
    dose: '10 mg',
    frequency: 'Cada 12 horas',
    durationDays: 90,
    daysElapsed: 32,
    takenToday: 'none',
  },
  {
    id: '2',
    name: 'Metformina',
    dose: '500 mg',
    frequency: 'Cada 8 horas',
    durationDays: 30,
    daysElapsed: 24,
    takenToday: 'none',
  },
  {
    id: '3',
    name: 'Omeprazol',
    dose: '20 mg',
    frequency: 'Una vez al día',
    durationDays: 14,
    daysElapsed: 12,
    takenToday: 'none',
  },
];

export const medFiles: MedFile[] = [
  { id: '1', name: 'Resultado Hemograma Completo', type: 'PDF', date: '2026-08-28' },
  { id: '2', name: 'Radiografía Tórax AP', type: 'Imagen', date: '2026-07-15' },
  { id: '3', name: 'Electrocardiograma en Reposo', type: 'PDF', date: '2026-06-30' },
  { id: '4', name: 'Ecografía Abdominal', type: 'Imagen', date: '2026-05-12' },
];

export const tutorials: TutorialCategory[] = [
  {
    id: '1',
    title: 'Agendar Cita Online',
    emoji: '📅',
    description: 'Solicita tus citas médicas desde la app de tu EPS sin filas.',
    color: '#EBF3FD',
    officialUrl: 'https://www.supersalud.gov.co',
    steps: [
      { title: 'Ingresa a la app de tu EPS', description: 'Descarga la app oficial de Sanitas desde Play Store o App Store y accede con tu número de afiliado.' },
      { title: 'Selecciona "Citas Médicas"', description: 'En el menú principal busca la opción "Solicitar Cita" o "Agenda Médica".' },
      { title: 'Elige especialidad y sede', description: 'Selecciona el tipo de consulta (general, especialista) y la IPS o sede más cercana a tu ubicación.' },
      { title: 'Escoge fecha y hora disponible', description: 'El sistema mostrará los horarios disponibles. Selecciona el que mejor te convenga.' },
      { title: 'Confirma tu cita', description: 'Revisa los datos y confirma. Recibirás un SMS y correo con los detalles de la cita.' },
    ],
  },
  {
    id: '2',
    title: 'Consultar Resultados',
    emoji: '🔬',
    description: 'Accede a tus resultados de laboratorio y exámenes diagnósticos.',
    color: '#ECFDF5',
    officialUrl: 'https://www.minsalud.gov.co',
    steps: [
      { title: 'Entra al portal de resultados', description: 'Visita el portal web de tu IPS o laboratorio donde se realizaron los exámenes.' },
      { title: 'Autentícate con tu número de orden', description: 'Usa el número de orden de examen o tu cédula para ingresar al sistema.' },
      { title: 'Descarga tus resultados', description: 'Localiza el examen deseado y descárgalo en formato PDF para compartirlo con tu médico.' },
      { title: 'Guarda en GuiaSalud', description: 'Adjunta el documento en tu Historia Clínica Personal dentro de GuiaSalud para tenerlo siempre disponible.' },
    ],
  },
  {
    id: '3',
    title: 'Descargar Certificados EPS',
    emoji: '📄',
    description: 'Obtén tu certificado de afiliación vigente en minutos.',
    color: '#FFEDD5',
    officialUrl: 'https://www.supersalud.gov.co',
    steps: [
      { title: 'Ingresa al portal de tu EPS', description: 'Visita el sitio web oficial de Sanitas EPS y accede con tu número de cédula.' },
      { title: 'Busca "Certificados y Documentos"', description: 'En el menú de afiliado, selecciona la sección de certificados y trámites.' },
      { title: 'Selecciona el tipo de certificado', description: 'Elige "Certificado de Afiliación Vigente" u otro según necesites (laboral, copagos, etc.).' },
      { title: 'Descarga e imprime', description: 'El certificado se genera en PDF con firma digital. Está listo para presentar en entidades públicas o privadas.' },
    ],
  },
  {
    id: '4',
    title: 'Solicitar Autorizaciones',
    emoji: '✅',
    description: 'Gestiona autorizaciones para procedimientos, medicamentos o interconsultas.',
    color: '#FEF3C7',
    officialUrl: 'https://www.supersalud.gov.co',
    steps: [
      { title: 'Obtén la solicitud médica', description: 'Tu médico tratante debe emitir una orden o solicitud de autorización con diagnóstico y código CIE-10.' },
      { title: 'Radica en la EPS', description: 'Presenta la orden en la sede EPS o súbela por la app. Guarda el número de radicado.' },
      { title: 'Espera la respuesta', description: 'La EPS tiene un plazo legal para responder (urgente: 24h, programado: 5 días hábiles).' },
      { title: 'Recibe la autorización', description: 'Si aprobada, recibirás un SMS o correo con el número de autorización para presentar en la IPS.' },
      { title: 'Agenda el servicio', description: 'Con la autorización en mano, llama o agenda en línea con la IPS habilitada para el procedimiento.' },
    ],
  },
];
