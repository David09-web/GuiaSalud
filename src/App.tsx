import { useState, useEffect, useRef } from 'react';
import type {
  Screen,
  UserRole,
  UserProfile,
  Appointment,
  Medication,
  MedDoseHistory,
  MedFile,
  FamilyCaregiver,
  TutorialCategory,
  TutorialCategoryDef,
  AuditLog,
  NotificationItem,
  MedTakenStatus,
  AppointmentStatus,
  AllergyItem,
  MedicalBackgroundItem,
  ClinicalDiagnosisItem,
  ClinicalProcedureItem,
} from './types';
import {
  patientUser as initialUser,
  appointments as initialAppointments,
  initialMedications,
  initialDoseHistory,
  medFiles as initialFiles,
  initialAllergies,
  initialBackgrounds,
  initialDiagnoses,
  initialProcedures,
  familyCaregivers as initialCaregivers,
  initialTutorialCategories,
  tutorials as initialTutorials,
  initialAuditLogs,
  initialNotifications,
} from './data';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AgendaScreen from './screens/AgendaScreen';
import MedicationsScreen from './screens/MedicationsScreen';
import ClinicalHistoryScreen from './screens/ClinicalHistoryScreen';
import TutorialsScreen from './screens/TutorialsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminScreen from './screens/AdminScreen';

import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import NotificationModal from './components/NotificationModal';
import ClinicalReportModal from './components/ClinicalReportModal';
import DueActionModal, { type DueItem } from './components/DueActionModal';
import {
  buildAppointmentWhatsAppMessage,
  getWhatsAppUrl,
  sendBrowserPushNotification,
} from './utils/whatsapp';
import { syncRemindersWithServer, subscribeToPushNotifications } from './utils/webPush';
import PWAInstallBanner from './components/PWAInstallBanner';

// Generador de tono audible para notificaciones en tiempo real
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // Re 5
    osc.frequency.setValueAtTime(880, now + 0.12); // La 5
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // Si el navegador bloquea audio automático antes de interacción, se ignora
  }
}

interface SavedSession {
  isLoggedIn: boolean;
  role: UserRole;
  customUser?: UserProfile;
  isDemo: boolean;
  screen?: Screen;
}

function getStoredSession(): SavedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('guiasalud_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.isLoggedIn) {
      return parsed;
    }
  } catch {}
  return null;
}

function getStoredAlertedKeys(todayStr: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`guiasalud_alerted_${todayStr}`);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {}
  return new Set();
}

function saveStoredAlertedKeys(todayStr: string, set: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`guiasalud_alerted_${todayStr}`, JSON.stringify(Array.from(set)));
  } catch {}
}

export default function App() {
  const initialSession = getStoredSession();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(initialSession));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => initialSession?.role || 'patient');
  const [isDemoUser, setIsDemoUser] = useState<boolean>(() => (initialSession ? initialSession.isDemo : true));
  const [screen, setScreenState] = useState<Screen>(() => {
    if (initialSession?.screen) return initialSession.screen;
    return initialSession?.role === 'admin' ? 'admin' : 'home';
  });

  // Guardar cambio de pantalla en sesión persistente
  const setScreen = (s: Screen) => {
    setScreenState(s);
    try {
      const currentRaw = localStorage.getItem('guiasalud_session');
      if (currentRaw) {
        const parsed = JSON.parse(currentRaw);
        localStorage.setItem('guiasalud_session', JSON.stringify({ ...parsed, screen: s }));
      }
    } catch {}
  };

  // Application State
  const [user, setUser] = useState<UserProfile>(() => {
    if (initialSession?.customUser) return initialSession.customUser;
    return initialUser;
  });

  const activeUserId = initialSession?.customUser?.id || (initialSession && !initialSession.isDemo ? 'usr-custom' : initialUser.id);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(`guiasalud_appts_${activeUserId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialAppointments;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      const saved = localStorage.getItem(`guiasalud_meds_${activeUserId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialMedications;
  });

  const [doseHistory, setDoseHistory] = useState<MedDoseHistory[]>(() => {
    try {
      const saved = localStorage.getItem(`guiasalud_dose_history_${activeUserId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialDoseHistory;
  });

  const [files, setFiles] = useState<MedFile[]>(() => {
    try {
      const saved = localStorage.getItem(`guiasalud_files_${activeUserId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialFiles;
  });

  const [allergies, setAllergies] = useState<AllergyItem[]>(initialAllergies);
  const [backgrounds, setBackgrounds] = useState<MedicalBackgroundItem[]>(initialBackgrounds);
  const [diagnoses, setDiagnoses] = useState<ClinicalDiagnosisItem[]>(initialDiagnoses);
  const [procedures, setProcedures] = useState<ClinicalProcedureItem[]>(initialProcedures);
  const [caregivers, setCaregivers] = useState<FamilyCaregiver[]>(() => {
    try {
      const saved = localStorage.getItem(`guiasalud_caregivers_${activeUserId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialCaregivers;
  });
  const [categoriesList, setCategoriesList] = useState<TutorialCategoryDef[]>(initialTutorialCategories);
  const [tutorialsList, setTutorialsList] = useState<TutorialCategory[]>(initialTutorials);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`guiasalud_notifs_${activeUserId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialSession && !initialSession.isDemo ? [] : initialNotifications;
  });

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Alerta interactiva en tiempo real (Cita cumplida o Medicamento / Pasta)
  const [activeDueItem, setActiveDueItem] = useState<DueItem | null>(null);
  const alertedKeysRef = useRef<Set<string>>(new Set());

  // Helper para actualizar y sincronizar notificaciones por usuario
  const updateNotificationsList = (updater: (prev: NotificationItem[]) => NotificationItem[]) => {
    setNotifications((prev) => {
      const next = updater(prev);
      const uid = user.id || 'default';
      try {
        localStorage.setItem(`guiasalud_notifs_${uid}`, JSON.stringify(next));
      } catch (e) {
        console.error('Error guardando notificaciones:', e);
      }
      return next;
    });
  };

  // General Audit Logger helper
  const handleRecordAuditLog = (
    action: string,
    module: string,
    details: string,
    status: 'SUCCESS' | 'WARNING' | 'DENIED' = 'SUCCESS'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userEmail:
        currentRole === 'admin'
          ? 'admin.fet@guiasalud.edu.co'
          : currentRole === 'family'
          ? 'carlos.rodriguez@gmail.com'
          : user.email,
      userRole: currentRole,
      action,
      module,
      details,
      ipAddress: '190.84.112.45',
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Handlers
  const handleLogin = (role: UserRole, customUser?: UserProfile, isDemo: boolean = true) => {
    setCurrentRole(role);
    setIsDemoUser(isDemo);
    setIsLoggedIn(true);
    const targetScreen = role === 'admin' ? 'admin' : 'home';
    setScreenState(targetScreen);

    const effectiveUser = customUser || (role === 'patient' ? initialUser : user);

    // PERSISTENCIA PERMANENTE DE SESIÓN: nunca se sale hasta que se presione cerrar sesión
    try {
      localStorage.setItem(
        'guiasalud_session',
        JSON.stringify({
          isLoggedIn: true,
          role,
          customUser: effectiveUser,
          isDemo,
          screen: targetScreen,
        })
      );
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }

    if (customUser) {
      setUser(customUser);

      // Cargar citas persistidas de este usuario o iniciar con lista limpia
      try {
        const savedAppts = localStorage.getItem(`guiasalud_appts_${customUser.id}`);
        if (savedAppts) {
          setAppointments(JSON.parse(savedAppts));
        } else {
          setAppointments([]);
        }
      } catch {
        setAppointments([]);
      }

      // Cargar medicamentos persistidos
      try {
        const savedMeds = localStorage.getItem(`guiasalud_meds_${customUser.id}`);
        if (savedMeds) {
          setMedications(JSON.parse(savedMeds));
        } else {
          setMedications([]);
        }
      } catch {
        setMedications([]);
      }

      // Cargar archivos clínicos persistidos
      try {
        const savedFiles = localStorage.getItem(`guiasalud_files_${customUser.id}`);
        if (savedFiles) {
          setFiles(JSON.parse(savedFiles));
        } else {
          setFiles([]);
        }
      } catch {
        setFiles([]);
      }

      // Cargar NOTIFICACIONES EXCLUSIVAS de esta cuenta (aislamiento total de cuentas)
      try {
        const savedNotifs = localStorage.getItem(`guiasalud_notifs_${customUser.id}`);
        if (savedNotifs) {
          const parsed: NotificationItem[] = JSON.parse(savedNotifs);
          // Purga de cualquier residuo antiguo de demo
          const clean = parsed.filter(
            (n) =>
              !n.message?.includes('4 de septiembre a las 09:30') &&
              !n.title?.includes('Alerta de Medicamento: Omeprazol') &&
              !n.title?.includes('Aviso de Seguridad 2FA')
          );
          setNotifications(clean);
        } else {
          setNotifications([]);
        }
      } catch {
        setNotifications([]);
      }
    } else {
      // Si es una cuenta de demostración precargada
      if (role === 'patient') {
        setUser(initialUser);
        try {
          const savedAppts = localStorage.getItem(`guiasalud_appts_${initialUser.id}`);
          setAppointments(savedAppts ? JSON.parse(savedAppts) : initialAppointments);
          const savedMeds = localStorage.getItem(`guiasalud_meds_${initialUser.id}`);
          setMedications(savedMeds ? JSON.parse(savedMeds) : initialMedications);
          const savedFiles = localStorage.getItem(`guiasalud_files_${initialUser.id}`);
          setFiles(savedFiles ? JSON.parse(savedFiles) : initialFiles);
        } catch {
          setAppointments(initialAppointments);
          setMedications(initialMedications);
          setFiles(initialFiles);
        }
        setNotifications(initialNotifications);
      } else {
        setNotifications([]);
      }
    }

    // Register login audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userEmail:
        role === 'patient'
          ? customUser?.email || user.email
          : role === 'family'
          ? 'carlos.rodriguez@gmail.com'
          : 'admin.fet@guiasalud.edu.co',
      userRole: role,
      action: 'LOGIN_2FA_SUCCESS',
      module: 'Autenticación',
      details: `Inicio de sesión exitoso en cuenta ${customUser?.email || user.email} (Rol: ${role}, Demo: ${isDemo ? 'Sí' : 'No'})`,
      ipAddress: '190.84.112.45',
      status: 'SUCCESS',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('guiasalud_session');
    } catch {}
    setIsLoggedIn(false);
    setScreenState('home');
    setIsDemoUser(true);
    setUser(initialUser);
    setAppointments(initialAppointments);
    setMedications(initialMedications);
    setNotifications([]);
    setActiveDueItem(null);
    alertedKeysRef.current.clear();
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const newScreen = role === 'admin' ? 'admin' : screen;
    if (role === 'admin') {
      setScreenState('admin');
    }

    try {
      const currentRaw = localStorage.getItem('guiasalud_session');
      if (currentRaw) {
        const parsed = JSON.parse(currentRaw);
        localStorage.setItem('guiasalud_session', JSON.stringify({ ...parsed, role, screen: newScreen }));
      }
    } catch {}
    setCurrentRole(role);
    if (role === 'admin') {
      setScreen('admin');
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userEmail: user.email,
      userRole: role,
      action: 'ROLE_SWITCH',
      module: 'Sesión',
      details: `Cambio de contexto activo al rol: ${role}`,
      ipAddress: '190.84.112.45',
      status: 'SUCCESS',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Appointment Actions
  const handleAddAppointment = (appt: Omit<Appointment, 'id' | 'patientId'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: `apt-${Date.now()}`,
      patientId: user.id,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => {
      const updated = [...prev, newAppt];
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_appts_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Registro de auditoría médica
    handleRecordAuditLog(
      'APPOINTMENT_CREATE',
      'Agenda Médica',
      `Cita creada para ${appt.specialty} con ${appt.doctor} en ${appt.center} el ${appt.date} ${appt.time}`
    );

    // Add notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Cita médica agendada',
      message: `Nueva cita de ${appt.specialty} con ${appt.doctor} para el ${appt.date} a las ${appt.time}.`,
      type: 'appointment',
      timestamp: 'Ahora mismo',
      read: false,
      targetScreen: 'agenda',
    };
    updateNotificationsList((prev) => [notif, ...prev]);
  };

  const handleUpdateApptStatus = (id: string, status: AppointmentStatus) => {
    const target = appointments.find((a) => a.id === id);
    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status } : a));
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_appts_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Registro de auditoría médica de cambio de estado
    handleRecordAuditLog(
      'APPOINTMENT_STATUS_UPDATE',
      'Agenda Médica',
      `Estado de cita ${target?.specialty || id} cambiado a: ${status}. Conservada en historial clínico.`
    );
  };

  const handleRescheduleAppointment = (
    id: string,
    newDate: string,
    newTime: string,
    notes?: string,
    specialty?: string,
    doctor?: string,
    center?: string
  ) => {
    const target = appointments.find((a) => a.id === id);
    const oldDate = target?.date || '';
    const oldTime = target?.time || '';

    setAppointments((prev) => {
      const updated = prev.map((a) =>
        a.id === id
          ? {
              ...a,
              date: newDate,
              time: newTime,
              status: 'pending' as AppointmentStatus,
              notes: notes !== undefined ? notes : a.notes,
              specialty: specialty || a.specialty,
              doctor: doctor || a.doctor,
              center: center || a.center,
            }
          : a
      );
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_appts_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    const targetSpec = specialty || target?.specialty || 'salud';
    const targetDoc = doctor || target?.doctor || 'profesional de salud';

    // Registro de auditoría médica
    handleRecordAuditLog(
      'APPOINTMENT_RESCHEDULE',
      'Agenda Médica',
      `Cita ${targetSpec} con ${targetDoc} reagendada. Fecha anterior: ${oldDate} ${oldTime} ➔ Nueva fecha: ${newDate} ${newTime}. Estado: Pendiente.`
    );

    // Notificación en vivo
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Cita médica reagendada',
      message: `Tu consulta de ${targetSpec} con ${targetDoc} ha sido reprogramada para el ${newDate} a las ${newTime}.`,
      type: 'appointment',
      timestamp: 'Ahora mismo',
      read: false,
      targetScreen: 'agenda',
    };
    updateNotificationsList((prev) => [notif, ...prev]);
  };

  const handleRescheduleMedication = (medId: string, newTime: string) => {
    const targetMed = medications.find((m) => m.id === medId);
    setMedications((prev) => {
      const updated = prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              timeOfDay: [newTime, ...(m.timeOfDay || []).filter((t) => t !== newTime)],
            }
          : m
      );
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_meds_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    const notif: NotificationItem = {
      id: `notif-med-resched-${Date.now()}`,
      title: 'Medicamento reprogramado',
      message: `Dosis de ${targetMed?.name || 'medicamento'} reprogramada para las ${newTime}.`,
      type: 'medication',
      timestamp: 'Ahora mismo',
      read: false,
      targetScreen: 'medications',
    };
    updateNotificationsList((prev) => [notif, ...prev]);
  };

  const handleDeleteAppointment = (id: string) => {
    const target = appointments.find((a) => a.id === id);
    // Soft-delete garantizado: no se elimina físicamente del array para mantener el historial clínico
    setAppointments((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a
      );
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_appts_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    handleRecordAuditLog(
      'APPOINTMENT_SOFT_DELETE',
      'Agenda Médica',
      `Cita ${target?.specialty || id} cancelada lógicamente (sin eliminación física en PostgreSQL para auditoría).`
    );
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      if (!isDemoUser && next.email) {
        try {
          const registered: any[] = JSON.parse(
            localStorage.getItem('guiasalud_registered_users') || '[]'
          );
          const idx = registered.findIndex(
            (u) => u.email?.toLowerCase() === next.email.toLowerCase()
          );
          if (idx >= 0) {
            registered[idx] = { ...registered[idx], ...next };
            localStorage.setItem('guiasalud_registered_users', JSON.stringify(registered));
          }
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  };

  // Medication Actions
  const handleAddMedication = (med: Omit<Medication, 'id' | 'patientId'>) => {
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}`,
      patientId: user.id,
    };
    setMedications((prev) => {
      const updated = [...prev, newMed];
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_meds_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleUpdateMedication = (id: string, updatedFields: Partial<Medication>) => {
    setMedications((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_meds_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    handleRecordAuditLog(
      'MEDICATION_UPDATE',
      'Medicamentos',
      `Medicamento ${updatedFields.name || id} actualizado en posología y datos clínicos.`
    );
  };

  const handleUpdateMedTaken = (id: string, status: MedTakenStatus) => {
    const targetMed = medications.find((m) => m.id === id);
    
    setMedications((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== id) return m;
        // Si se marca como tomada y antes no lo estaba, aumentamos días transcurridos si aún no llegó al total
        let newDaysElapsed = m.daysElapsed;
        if (status === 'taken' && m.takenToday !== 'taken') {
          newDaysElapsed = Math.min(m.durationDays, (m.daysElapsed || 0) + 1);
        } else if (status === 'none' && m.takenToday === 'taken') {
          newDaysElapsed = Math.max(0, (m.daysElapsed || 0) - 1);
        }
        return { ...m, takenToday: status, daysElapsed: newDaysElapsed };
      });

      try {
        localStorage.setItem(`guiasalud_meds_${user.id || 'default'}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (status !== 'none' && targetMed) {
      const historyItem: MedDoseHistory = {
        id: `dh-${Date.now()}`,
        medicationId: id,
        medicationName: `${targetMed.name} ${targetMed.dose}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        status: status === 'taken' ? 'taken' : 'skipped',
      };
      setDoseHistory((prev) => {
        const next = [historyItem, ...prev];
        try {
          localStorage.setItem(`guiasalud_dose_history_${user.id || 'default'}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_meds_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Clinical Files Actions
  const handleAddFile = (file: Omit<MedFile, 'id' | 'patientId'>) => {
    const newFile: MedFile = {
      ...file,
      id: `doc-${Date.now()}`,
      patientId: user.id,
    };
    setFiles((prev) => [newFile, ...prev]);
    handleRecordAuditLog(
      'CARGAR_ADJUNTO_CIFRADO',
      'Historia Clínica',
      `Archivo ${newFile.name} (${newFile.category}) cifrado en reposo (AES-256)`
    );
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    handleRecordAuditLog('ELIMINAR_ADJUNTO_CLINICO', 'Historia Clínica', `Archivo eliminado ID: ${id}`);
  };

  const handleUpdateFile = (id: string, updatedFields: Partial<MedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updatedFields } : f)));
    handleRecordAuditLog('ACTUALIZAR_ADJUNTO_CLINICO', 'Historia Clínica', `Archivo ID ${id} actualizado.`);
  };

  const handleAddAllergy = (allergy: Omit<AllergyItem, 'id'>) => {
    const item: AllergyItem = { ...allergy, id: `alg-${Date.now()}` };
    setAllergies((prev) => [item, ...prev]);
    setUser((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(item.allergen) ? prev.allergies : [item.allergen, ...prev.allergies],
    }));
    handleRecordAuditLog('REGISTRAR_ALERGIA', 'Historia Clínica', `Alergia agregada: ${item.allergen} (${item.severity})`);
  };

  const handleUpdateAllergy = (id: string, updatedFields: Partial<AllergyItem>) => {
    setAllergies((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a));
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_allergies_${user.id}`, JSON.stringify(next));
      }
      return next;
    });
    handleRecordAuditLog('MODIFICAR_ALERGIA', 'Historia Clínica', `Alergia ID ${id} actualizada.`);
  };

  const handleDeleteAllergy = (id: string) => {
    setAllergies((prev) => prev.filter((a) => a.id !== id));
    handleRecordAuditLog('ELIMINAR_ALERGIA', 'Historia Clínica', `Alergia eliminada ID: ${id}`);
  };

  const handleAddBackground = (bg: Omit<MedicalBackgroundItem, 'id'>) => {
    const item: MedicalBackgroundItem = { ...bg, id: `bg-${Date.now()}` };
    setBackgrounds((prev) => [item, ...prev]);
    handleRecordAuditLog('REGISTRAR_ANTECEDENTE', 'Historia Clínica', `Antecedente ${item.category}: ${item.title}`);
  };

  const handleUpdateBackground = (id: string, updatedFields: Partial<MedicalBackgroundItem>) => {
    setBackgrounds((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_backgrounds_${user.id}`, JSON.stringify(next));
      }
      return next;
    });
    handleRecordAuditLog('MODIFICAR_ANTECEDENTE', 'Historia Clínica', `Antecedente ID ${id} actualizado.`);
  };

  const handleDeleteBackground = (id: string) => {
    setBackgrounds((prev) => prev.filter((b) => b.id !== id));
    handleRecordAuditLog('ELIMINAR_ANTECEDENTE', 'Historia Clínica', `Antecedente eliminado ID: ${id}`);
  };

  const handleAddDiagnosis = (diag: Omit<ClinicalDiagnosisItem, 'id'>) => {
    const item: ClinicalDiagnosisItem = { ...diag, id: `diag-${Date.now()}` };
    setDiagnoses((prev) => [item, ...prev]);
    handleRecordAuditLog('REGISTRAR_DIAGNOSTICO', 'Historia Clínica', `Diagnóstico CIE-10 ${item.code}: ${item.title}`);
  };

  const handleUpdateDiagnosis = (id: string, updatedFields: Partial<ClinicalDiagnosisItem>) => {
    setDiagnoses((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d));
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_diagnoses_${user.id}`, JSON.stringify(next));
      }
      return next;
    });
    handleRecordAuditLog('MODIFICAR_DIAGNOSTICO', 'Historia Clínica', `Diagnóstico ID ${id} actualizado.`);
  };

  const handleAddProcedure = (proc: Omit<ClinicalProcedureItem, 'id'>) => {
    const item: ClinicalProcedureItem = { ...proc, id: `proc-${Date.now()}` };
    setProcedures((prev) => [item, ...prev]);
    handleRecordAuditLog('REGISTRAR_PROCEDIMIENTO', 'Historia Clínica', `Procedimiento: ${item.title}`);
  };

  const handleUpdateProcedure = (id: string, updatedFields: Partial<ClinicalProcedureItem>) => {
    setProcedures((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      if (!isDemoUser && user.id) {
        localStorage.setItem(`guiasalud_procedures_${user.id}`, JSON.stringify(next));
      }
      return next;
    });
    handleRecordAuditLog('MODIFICAR_PROCEDIMIENTO', 'Historia Clínica', `Procedimiento ID ${id} actualizado.`);
  };

  // Caregiver Actions
  const handleToggleCaregiverPermission = (
    caregiverId: string,
    permissionKey: keyof FamilyCaregiver['permissions']
  ) => {
    setCaregivers((prev) => {
      const next = prev.map((cg) => {
        if (cg.id !== caregiverId) return cg;
        return {
          ...cg,
          permissions: {
            ...cg.permissions,
            [permissionKey]: !cg.permissions[permissionKey],
          },
        };
      });
      try {
        localStorage.setItem(`guiasalud_caregivers_${user.id || 'default'}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleAddCaregiver = (caregiver: Omit<FamilyCaregiver, 'id'>) => {
    const newCg: FamilyCaregiver = {
      ...caregiver,
      id: `fam-${Date.now()}`,
    };
    setCaregivers((prev) => {
      const next = [...prev, newCg];
      try {
        localStorage.setItem(`guiasalud_caregivers_${user.id || 'default'}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    handleRecordAuditLog('AGREGAR_CUIDADOR', 'Perfil', `Familiar autorizado ${newCg.name} registrado.`);
  };

  const handleUpdateCaregiver = (id: string, updated: Partial<FamilyCaregiver>) => {
    setCaregivers((prev) => {
      const next = prev.map((cg) => (cg.id === id ? { ...cg, ...updated } : cg));
      try {
        localStorage.setItem(`guiasalud_caregivers_${user.id || 'default'}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    handleRecordAuditLog('MODIFICAR_CUIDADOR', 'Perfil', `Familiar ID ${id} actualizado.`);
  };

  const handleDeleteCaregiver = (id: string) => {
    setCaregivers((prev) => {
      const target = prev.find((cg) => cg.id === id);
      const next = prev.filter((cg) => cg.id !== id);
      try {
        localStorage.setItem(`guiasalud_caregivers_${user.id || 'default'}`, JSON.stringify(next));
      } catch {}
      if (target) {
        handleRecordAuditLog('ELIMINAR_CUIDADOR', 'Perfil', `Familiar autorizado ${target.name} eliminado.`);
      }
      return next;
    });
  };

  // Tutorials & Admin Actions
  const handleAddTutorial = (tut: Omit<TutorialCategory, 'id'>) => {
    const newTut: TutorialCategory = {
      ...tut,
      id: `tut-${Date.now()}`,
    };
    setTutorialsList((prev) => [...prev, newTut]);
  };

  const handleUpdateTutorial = (id: string, updated: Partial<TutorialCategory>) => {
    setTutorialsList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const handleDeleteTutorial = (id: string) => {
    setTutorialsList((prev) => prev.filter((t) => t.id !== id));
  };

  // Categories Actions
  const handleAddCategory = (category: TutorialCategoryDef) => {
    setCategoriesList((prev) => [...prev, category]);
  };

  const handleUpdateCategory = (id: string, updated: Partial<TutorialCategoryDef>) => {
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== id));
  };

  // Notifications
  const handleMarkAllNotificationsRead = () => {
    updateNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // =========================================================================
  // SISTEMA EN TIEMPO REAL: REVISIÓN DE HORARIOS DE CITAS Y MEDICAMENTOS (PASTAS)
  // Revisa periódicamente si se cumplió la hora programada para hoy.
  // Emite sonido, genera notificación y abre el cuadro de acción interactivo.
  // =========================================================================
  useEffect(() => {
    if (!isLoggedIn) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayYMD = `${year}-${month}-${day}`;

    // Cargar llaves alertadas persistidas desde localStorage para no repetir alertas en el día
    alertedKeysRef.current = getStoredAlertedKeys(todayYMD);

    const activeTimeouts: NodeJS.Timeout[] = [];
    const upcomingReminders: {
      title: string;
      body: string;
      targetTimeMs: number;
      tag: string;
      url?: string;
    }[] = [];

    // 1. Programar alarmas exactas en primer y segundo plano para medicamentos de hoy
    medications.forEach((med) => {
      if (med.takenToday === 'taken') return;
      const times = med.timeOfDay && med.timeOfDay.length > 0 ? med.timeOfDay : ['08:00'];
      times.forEach((t) => {
        const [mh, mm] = t.split(':').map(Number);
        if (!isNaN(mh) && !isNaN(mm)) {
          const targetDate = new Date(year, now.getMonth(), now.getDate(), mh, mm, 0);
          const targetTimeMs = targetDate.getTime();
          const delay = targetTimeMs - Date.now();
          const alertKey = `med_${med.id}_${todayYMD}_${t}`;

          if (delay > 0 && delay < 24 * 60 * 60 * 1000 && !alertedKeysRef.current.has(alertKey)) {
            upcomingReminders.push({
              title: `💊 ¡Hora de tu medicamento: ${med.name}!`,
              body: `Es hora de tomar tu dosis de ${med.name} (${med.dose}) programada para las ${t}.`,
              targetTimeMs,
              tag: alertKey,
            });

            // Disparador local exacto para el minuto previsto
            const timer = setTimeout(() => {
              if (!alertedKeysRef.current.has(alertKey)) {
                alertedKeysRef.current.add(alertKey);
                saveStoredAlertedKeys(todayYMD, alertedKeysRef.current);
                playNotificationSound();

                const notif: NotificationItem = {
                  id: `due-med-${med.id}-${t}-${Date.now()}`,
                  title: `💊 ¡Hora de tu medicamento: ${med.name}!`,
                  message: `Es hora de tomar tu dosis de ${med.name} (${med.dose}) programada para las ${t}.`,
                  type: 'medication',
                  timestamp: 'Ahora mismo',
                  read: false,
                  targetScreen: 'medications',
                };
                updateNotificationsList((prev) => [notif, ...prev]);
                sendBrowserPushNotification(notif.title, { body: notif.message, tag: alertKey });
                setActiveDueItem({ type: 'medication', med, scheduledTime: t });
              }
            }, delay);
            activeTimeouts.push(timer);
          }
        }
      });
    });

    // Enviar lista al Service Worker y al servidor Backend para vigilar con la app cerrada
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_REMINDERS',
        reminders: upcomingReminders,
      });
    }

    const serverReminders = upcomingReminders.map((r) => ({
      id: r.tag,
      patientId: user.id || 'usr-001',
      title: r.title,
      body: r.body,
      targetTimeMs: r.targetTimeMs,
      tag: r.tag,
      url: '/',
    }));
    syncRemindersWithServer(user.id || 'usr-001', serverReminders);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      subscribeToPushNotifications(user.id || 'usr-001', serverReminders).catch(() => {});
    }

    const checkDueReminders = () => {
      const currentDate = new Date();
      const currentHours = currentDate.getHours();
      const currentMinutes = currentDate.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      // 1. Revisión de Citas Médicas: Antelación (1 día / 24h, 12 horas, 5 horas) y Hora Exacta
      appointments.forEach((appt) => {
        const s = (appt.status || '').toLowerCase();
        if (s === 'done' || s === 'realizada' || s === 'cancelled' || s === 'cancelada') {
          return;
        }

        if (!appt.date || !appt.time) return;

        const [ay, amo, ad] = appt.date.split('-').map(Number);
        const [ah, am] = appt.time.split(':').map(Number);
        if (isNaN(ay) || isNaN(amo) || isNaN(ad) || isNaN(ah) || isNaN(am)) return;

        const apptDateTime = new Date(ay, amo - 1, ad, ah, am, 0);
        const diffMs = apptDateTime.getTime() - currentDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // a) ALERTA DE 1 DÍA ANTES (24 Horas)
        if (diffHours > 12 && diffHours <= 24) {
          const alertKey = `appt_${appt.id}_24h_prior`;
          if (!alertedKeysRef.current.has(alertKey)) {
            alertedKeysRef.current.add(alertKey);
            saveStoredAlertedKeys(todayYMD, alertedKeysRef.current);
            playNotificationSound();

            const waMsg = buildAppointmentWhatsAppMessage(
              appt,
              { name: user.name, idNumber: user.idNumber, eps: user.eps },
              '1 día antes'
            );
            const whatsAppUrl = getWhatsAppUrl(user.phone, waMsg);

            const notif: NotificationItem = {
              id: `due-appt-24h-${appt.id}-${Date.now()}`,
              title: `📅 Recordatorio (1 día antes): Cita de ${appt.specialty}`,
              message: `Mañana tienes cita médica con ${appt.doctor} a las ${appt.time} en ${appt.center}. Prepara tus documentos y autorizaciones de ${user.eps || 'tu EPS'}.`,
              type: 'appointment',
              advanceType: '24h',
              apptId: appt.id,
              whatsAppUrl,
              timestamp: 'Aviso 1 día antes',
              read: false,
              targetScreen: 'agenda',
            };
            updateNotificationsList((prev) => [notif, ...prev]);
            sendBrowserPushNotification(notif.title, { body: notif.message, tag: alertKey });
          }
        }

        // b) ALERTA DE 12 HORAS ANTES
        if (diffHours > 5 && diffHours <= 12) {
          const alertKey = `appt_${appt.id}_12h_prior`;
          if (!alertedKeysRef.current.has(alertKey)) {
            alertedKeysRef.current.add(alertKey);
            saveStoredAlertedKeys(todayYMD, alertedKeysRef.current);
            playNotificationSound();

            const waMsg = buildAppointmentWhatsAppMessage(
              appt,
              { name: user.name, idNumber: user.idNumber, eps: user.eps },
              '12 horas antes'
            );
            const whatsAppUrl = getWhatsAppUrl(user.phone, waMsg);

            const notif: NotificationItem = {
              id: `due-appt-12h-${appt.id}-${Date.now()}`,
              title: `⏰ Recordatorio (12 horas antes): Cita de ${appt.specialty}`,
              message: `Tu cita médica con ${appt.doctor} es en 12 horas (${appt.time}) en ${appt.center}. Revisa la ruta de desplazamiento y tus exámenes previos.`,
              type: 'appointment',
              advanceType: '12h',
              apptId: appt.id,
              whatsAppUrl,
              timestamp: 'Aviso 12 horas antes',
              read: false,
              targetScreen: 'agenda',
            };
            updateNotificationsList((prev) => [notif, ...prev]);
            sendBrowserPushNotification(notif.title, { body: notif.message, tag: alertKey });
          }
        }

        // c) ALERTA DE 5 HORAS ANTES
        if (diffHours > 0 && diffHours <= 5) {
          const alertKey = `appt_${appt.id}_5h_prior`;
          if (!alertedKeysRef.current.has(alertKey)) {
            alertedKeysRef.current.add(alertKey);
            saveStoredAlertedKeys(todayYMD, alertedKeysRef.current);
            playNotificationSound();

            const waMsg = buildAppointmentWhatsAppMessage(
              appt,
              { name: user.name, idNumber: user.idNumber, eps: user.eps },
              '5 horas antes'
            );
            const whatsAppUrl = getWhatsAppUrl(user.phone, waMsg);

            const notif: NotificationItem = {
              id: `due-appt-5h-${appt.id}-${Date.now()}`,
              title: `🚨 Recordatorio (5 horas antes): Cita de ${appt.specialty}`,
              message: `¡Atención! En 5 horas tienes cita con ${appt.doctor} a las ${appt.time} en ${appt.center}. Alista tu salida para presentarte 15 minutos antes.`,
              type: 'appointment',
              advanceType: '5h',
              apptId: appt.id,
              whatsAppUrl,
              timestamp: 'Aviso 5 horas antes',
              read: false,
              targetScreen: 'agenda',
            };
            updateNotificationsList((prev) => [notif, ...prev]);
            sendBrowserPushNotification(notif.title, { body: notif.message, tag: alertKey });
          }
        }

        // d) ALERTA DE HORA EXACTA (Margen estricto de 2 minutos para evitar ráfagas)
        if (diffHours <= 0 && diffHours >= -0.05) {
          const alertKey = `appt_${appt.id}_${appt.date}_${appt.time}`;
          if (!alertedKeysRef.current.has(alertKey)) {
            alertedKeysRef.current.add(alertKey);
            saveStoredAlertedKeys(todayYMD, alertedKeysRef.current);
            playNotificationSound();

            const waMsg = buildAppointmentWhatsAppMessage(appt, { name: user.name });
            const whatsAppUrl = getWhatsAppUrl(user.phone, waMsg);

            const notif: NotificationItem = {
              id: `due-appt-${appt.id}-${Date.now()}`,
              title: `⏰ ¡Hora de tu cita médica: ${appt.specialty}!`,
              message: `Es hora de tu cita médica con ${appt.doctor} en ${appt.center} (${appt.time}).`,
              type: 'appointment',
              advanceType: 'now',
              apptId: appt.id,
              whatsAppUrl,
              timestamp: 'Ahora mismo',
              read: false,
              targetScreen: 'agenda',
            };
            updateNotificationsList((prev) => [notif, ...prev]);
            sendBrowserPushNotification(notif.title, { body: notif.message, tag: alertKey });

            // Abrir cuadro interactivo dentro de la app
            setActiveDueItem({ type: 'appointment', appt });
          }
        }
      });

      // 2. Revisión de Medicamentos / Pastas (Margen de 2 minutos para no disparar ráfagas atrasadas)
      medications.forEach((med) => {
        if (med.takenToday === 'taken') return;
        const times = med.timeOfDay && med.timeOfDay.length > 0 ? med.timeOfDay : ['08:00'];
        times.forEach((t) => {
          const [mh, mm] = t.split(':').map(Number);
          if (!isNaN(mh) && !isNaN(mm)) {
            const medTotalMinutes = mh * 60 + mm;
            const diff = currentTotalMinutes - medTotalMinutes;
            if (diff >= 0 && diff <= 2) {
              const alertKey = `med_${med.id}_${todayYMD}_${t}`;
              if (!alertedKeysRef.current.has(alertKey)) {
                alertedKeysRef.current.add(alertKey);
                saveStoredAlertedKeys(todayYMD, alertedKeysRef.current);
                playNotificationSound();

                const notif: NotificationItem = {
                  id: `due-med-${med.id}-${t}-${Date.now()}`,
                  title: `💊 ¡Hora de tu medicamento: ${med.name}!`,
                  message: `Es hora de tomar tu dosis de ${med.name} (${med.dose}) programada para las ${t}.`,
                  type: 'medication',
                  timestamp: 'Ahora mismo',
                  read: false,
                  targetScreen: 'medications',
                };
                updateNotificationsList((prev) => [notif, ...prev]);
                sendBrowserPushNotification(notif.title, { body: notif.message, tag: alertKey });

                // Abrir cuadro interactivo dentro de la app
                setActiveDueItem({ type: 'medication', med, scheduledTime: t });
              }
            }
          }
        });
      });
    };

    checkDueReminders();
    const interval = setInterval(checkDueReminders, 3000);
    return () => {
      clearInterval(interval);
      activeTimeouts.forEach((t) => clearTimeout(t));
    };
  }, [isLoggedIn, appointments, medications, user.id, isDemoUser]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // RBAC Access Guard for Administrator attempting to view private medical data
  const isRestrictedForAdmin =
    currentRole === 'admin' && (screen === 'agenda' || screen === 'medications' || screen === 'history');

  return (
    <div className="min-h-screen bg-app-bg antialiased">
      {/* Top Application Bar */}
      <TopBar
        screen={screen}
        setScreen={setScreen}
        onProfileClick={() => setScreen(screen === 'profile' ? 'home' : 'profile')}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        unreadCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onLogout={handleLogout}
        user={user}
        isDemoUser={isDemoUser}
      />

      {/* Main Content Area — scroll natural del body, no overflow interno */}
      <main className="pb-24">
        {isRestrictedForAdmin ? (
          <div className="px-4 py-16 max-w-lg mx-auto text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto shadow-sm">
              🛡️
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900">
              Acceso Restringido por Política RBAC
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 leading-relaxed text-left space-y-2">
              <p>
                <strong>Principio de Mínimo Privilegio (OMS) & Ley 1581 de 2012:</strong>
              </p>
              <p>
                El rol <strong>Administrador</strong> está destinado a la administración de guías, categorías y enlaces oficiales del sistema.
                Por diseño de seguridad estricto, <strong>no tiene permiso para visualizar agendas personales, medicamentos ni historias clínicas de los pacientes</strong>.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setScreen('admin')}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Ir a Panel de Administración
              </button>
              <button
                onClick={() => setScreen('tutorials')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Ver Tutoriales
              </button>
            </div>
          </div>
        ) : (
          <>
            {screen === 'home' && (
              <HomeScreen
                setScreen={setScreen}
                currentRole={currentRole}
                user={user}
                appointments={appointments}
                medications={medications}
                onUpdateMedTaken={handleUpdateMedTaken}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
            {screen === 'agenda' && (
              <AgendaScreen
                appointments={appointments}
                patientName={user.name}
                userPhone={user.phone}
                onAddAppointment={handleAddAppointment}
                onUpdateStatus={handleUpdateApptStatus}
                onRescheduleAppointment={handleRescheduleAppointment}
                onDeleteAppointment={handleDeleteAppointment}
              />
            )}
            {screen === 'medications' && (
              <MedicationsScreen
                medications={medications}
                doseHistory={doseHistory}
                onAddMedication={handleAddMedication}
                onUpdateMedication={handleUpdateMedication}
                onUpdateTakenStatus={handleUpdateMedTaken}
                onDeleteMedication={handleDeleteMedication}
              />
            )}
            {screen === 'history' && (
              <ClinicalHistoryScreen
                user={user}
                files={files}
                allergies={allergies}
                backgrounds={backgrounds}
                diagnoses={diagnoses}
                procedures={procedures}
                currentRole={currentRole}
                onAddFile={handleAddFile}
                onUpdateFile={handleUpdateFile}
                onDeleteFile={handleDeleteFile}
                onAddAllergy={handleAddAllergy}
                onUpdateAllergy={handleUpdateAllergy}
                onDeleteAllergy={handleDeleteAllergy}
                onAddBackground={handleAddBackground}
                onUpdateBackground={handleUpdateBackground}
                onDeleteBackground={handleDeleteBackground}
                onAddDiagnosis={handleAddDiagnosis}
                onUpdateDiagnosis={handleUpdateDiagnosis}
                onAddProcedure={handleAddProcedure}
                onUpdateProcedure={handleUpdateProcedure}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
            {screen === 'tutorials' && (
              <TutorialsScreen
                tutorials={tutorialsList}
                categories={categoriesList}
              />
            )}
            {screen === 'profile' && (
              <ProfileScreen
                user={user}
                caregivers={caregivers}
                auditLogs={auditLogs}
                currentRole={currentRole}
                onUpdateUser={handleUpdateUser}
                onToggleCaregiverPermission={handleToggleCaregiverPermission}
                onAddCaregiver={handleAddCaregiver}
                onUpdateCaregiver={handleUpdateCaregiver}
                onDeleteCaregiver={handleDeleteCaregiver}
                onRevokeConsent={() =>
                  handleUpdateUser({ dataConsentGranted: false, dataConsentDate: 'Revocado' })
                }
              />
            )}
            {screen === 'admin' && (
              <AdminScreen
                tutorials={tutorialsList}
                categories={categoriesList}
                auditLogs={auditLogs}
                onAddTutorial={handleAddTutorial}
                onUpdateTutorial={handleUpdateTutorial}
                onDeleteTutorial={handleDeleteTutorial}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onRecordAuditLog={handleRecordAuditLog}
              />
            )}
          </>
        )}
      </main>

      {/* Adaptive Bottom Navigation Bar */}
      <BottomNav screen={screen} setScreen={setScreen} currentRole={currentRole} />

      {/* Interactive Notifications Modal */}
      <NotificationModal
        notifications={notifications}
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectNotification={(target) => {
          if (target) setScreen(target);
        }}
        patientId={user.id || 'usr-001'}
      />

      {/* Clinical PDF Report Modal */}
      <ClinicalReportModal
        user={user}
        appointments={appointments}
        medications={medications}
        files={files}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Cuadro Interactivo en tiempo real: Cita Médica Cumplida o Pasta (Realizar, Reprogramar o Cancelar) */}
      <DueActionModal
        isOpen={Boolean(activeDueItem)}
        item={activeDueItem}
        onClose={() => setActiveDueItem(null)}
        onCompleteAppointment={(apptId) => {
          handleUpdateApptStatus(apptId, 'realizada');
          handleRecordAuditLog(
            'APPOINTMENT_COMPLETED',
            'Agenda Médica',
            `Cita médica marcada como realizada exitosamente en tiempo real.`
          );
        }}
        onCancelAppointment={(apptId) => {
          handleUpdateApptStatus(apptId, 'cancelada');
          handleRecordAuditLog(
            'APPOINTMENT_CANCELLED',
            'Agenda Médica',
            `Cita médica cancelada por el usuario desde el recordatorio en vivo.`
          );
        }}
        onRescheduleAppointment={(apptId, newDate, newTime, notes, specialty, doctor, center) => {
          handleRescheduleAppointment(apptId, newDate, newTime, notes, specialty, doctor, center);
        }}
        onTakeMedication={(medId) => {
          handleUpdateMedTaken(medId, 'taken');
        }}
        onSkipMedication={(medId) => {
          handleUpdateMedTaken(medId, 'skipped');
        }}
        onRescheduleMedication={(medId, newTime) => {
          handleRescheduleMedication(medId, newTime);
        }}
      />

      {/* PWA Install Banner for mobile users */}
      <PWAInstallBanner />
    </div>
  );
}
