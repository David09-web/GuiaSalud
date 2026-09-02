import { useState } from 'react';
import type { Screen } from './types';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AgendaScreen from './screens/AgendaScreen';
import MedicationsScreen from './screens/MedicationsScreen';
import ClinicalHistoryScreen from './screens/ClinicalHistoryScreen';
import TutorialsScreen from './screens/TutorialsScreen';
import ProfileScreen from './screens/ProfileScreen';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');

  const handleProfileClick = () => {
    setScreen(screen === 'profile' ? 'home' : 'profile');
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex flex-col h-full bg-app-bg overflow-hidden">
      <TopBar screen={screen} setScreen={setScreen} onProfileClick={handleProfileClick} />

      <main className="flex-1 overflow-y-auto md:pb-0 pb-20">
        {screen === 'home' && <HomeScreen setScreen={setScreen} />}
        {screen === 'agenda' && <AgendaScreen />}
        {screen === 'medications' && <MedicationsScreen />}
        {screen === 'history' && <ClinicalHistoryScreen />}
        {screen === 'tutorials' && <TutorialsScreen />}
        {screen === 'profile' && <ProfileScreen />}
      </main>

      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}
