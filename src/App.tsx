import { useState } from 'react';
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
  AuditLog,
  NotificationItem,
  MedTakenStatus,
  AppointmentStatus,
} from './types';
import {
  patientUser as initialUser,
  appointments as initialAppointments,
  initialMedications,
  initialDoseHistory,
  medFiles as initialFiles,
  familyCaregivers as initialCaregivers,
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [screen, setScreen] = useState<Screen>('home');

  // Application State
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [doseHistory, setDoseHistory] = useState<MedDoseHistory[]>(initialDoseHistory);
  const [files, setFiles] = useState<MedFile[]>(initialFiles);
  const [caregivers, setCaregivers] = useState<FamilyCaregiver[]>(initialCaregivers);
  const [tutorialsList, setTutorialsList] = useState<TutorialCategory[]>(initialTutorials);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Handlers
  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    setScreen(role === 'admin' ? 'admin' : 'home');

    // Register login audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userEmail:
        role === 'patient'
          ? user.email
          : role === 'family'
          ? 'carlos.rodriguez@gmail.com'
          : 'admin.fet@guiasalud.edu.co',
      userRole: role,
      action: 'LOGIN_2FA_SUCCESS',
      module: 'Autenticación',
      details: `Inicio de sesión con 2FA exitoso en rol: ${role}`,
      ipAddress: '190.84.112.45',
      status: 'SUCCESS',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen('home');
  };

  const handleRoleChange = (role: UserRole) => {
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
    };
    setAppointments((prev) => [...prev, newAppt]);

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
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleUpdateApptStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  // Medication Actions
  const handleAddMedication = (med: Omit<Medication, 'id' | 'patientId'>) => {
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}`,
      patientId: user.id,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const handleUpdateMedTaken = (id: string, status: MedTakenStatus) => {
    const targetMed = medications.find((m) => m.id === id);
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, takenToday: status } : m))
    );

    if (status !== 'none' && targetMed) {
      const historyItem: MedDoseHistory = {
        id: `dh-${Date.now()}`,
        medicationId: id,
        medicationName: `${targetMed.name} ${targetMed.dose}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        status: status === 'taken' ? 'taken' : 'skipped',
      };
      setDoseHistory((prev) => [historyItem, ...prev]);
    }
  };

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // Clinical Files Actions
  const handleAddFile = (file: Omit<MedFile, 'id' | 'patientId'>) => {
    const newFile: MedFile = {
      ...file,
      id: `doc-${Date.now()}`,
      patientId: user.id,
    };
    setFiles((prev) => [newFile, ...prev]);
  };

  // Caregiver Actions
  const handleToggleCaregiverPermission = (
    caregiverId: string,
    permissionKey: keyof FamilyCaregiver['permissions']
  ) => {
    setCaregivers((prev) =>
      prev.map((cg) => {
        if (cg.id !== caregiverId) return cg;
        return {
          ...cg,
          permissions: {
            ...cg.permissions,
            [permissionKey]: !cg.permissions[permissionKey],
          },
        };
      })
    );
  };

  const handleAddCaregiver = (caregiver: Omit<FamilyCaregiver, 'id'>) => {
    const newCg: FamilyCaregiver = {
      ...caregiver,
      id: `fam-${Date.now()}`,
    };
    setCaregivers((prev) => [...prev, newCg]);
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

  // Notifications
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col h-full bg-app-bg overflow-hidden antialiased">
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
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
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
            onAddAppointment={handleAddAppointment}
            onUpdateStatus={handleUpdateApptStatus}
            onDeleteAppointment={handleDeleteAppointment}
          />
        )}
        {screen === 'medications' && (
          <MedicationsScreen
            medications={medications}
            doseHistory={doseHistory}
            onAddMedication={handleAddMedication}
            onUpdateTakenStatus={handleUpdateMedTaken}
            onDeleteMedication={handleDeleteMedication}
          />
        )}
        {screen === 'history' && (
          <ClinicalHistoryScreen
            user={user}
            files={files}
            onAddFile={handleAddFile}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
        {screen === 'tutorials' && <TutorialsScreen tutorials={tutorialsList} />}
        {screen === 'profile' && (
          <ProfileScreen
            user={user}
            caregivers={caregivers}
            auditLogs={auditLogs}
            currentRole={currentRole}
            onUpdateUser={(updated) => setUser({ ...user, ...updated })}
            onToggleCaregiverPermission={handleToggleCaregiverPermission}
            onAddCaregiver={handleAddCaregiver}
            onRevokeConsent={() =>
              setUser({ ...user, dataConsentGranted: false, dataConsentDate: 'Revocado' })
            }
          />
        )}
        {screen === 'admin' && (
          <AdminScreen
            tutorials={tutorialsList}
            auditLogs={auditLogs}
            onAddTutorial={handleAddTutorial}
            onUpdateTutorial={handleUpdateTutorial}
            onDeleteTutorial={handleDeleteTutorial}
          />
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
    </div>
  );
}
