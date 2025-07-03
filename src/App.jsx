import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';
import InstallPromptModal from './Modal/InstallPromptModal';
import IosInstallGuideModal from './Modal/IosInstallGuideModal';
import LoginPage from './Utils/LoginPage';
import { AuthProvider } from './AuthContext';
import Dashboard from './Pages/Dashboard';
import MainLayout from './Pages/Tabs';
import ProfilePage from './Utils/ProfilePage';
import { ProtectedRoute } from './Utils/AuthRoutes';
import Chat from './Pages/ChatList';
import PremiumPage from './Utils/PremiumPage';
import Saved from './Pages/Saved';
import ViewProfile from './Pages/ViewProfile';
import ChatPage from './Pages/ChatPage';
import Random from './Pages/Random';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(
    localStorage.getItem('isAppInstalled') === 'true' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone
  );
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const alreadyShown = localStorage.getItem('iosInstallPromptShown') === 'true';

    if (!isAndroid && !isInStandalone && !alreadyShown) {
      setShowIosGuide(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }
  }, []);


  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      if (!deferredPrompt) {
        setDeferredPrompt(e);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        localStorage.setItem('isAppInstalled', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  {
    showIosGuide && (
      <IosInstallGuideModal onClose={() => setShowIosGuide(false)} />
    )
  }
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={
            <LoginPage />
          } />

          <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Random />} />
            {/* <Route path='/random' element={<Random />} />  */}
            <Route path="/anketa/:id" element={<ViewProfile />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:chatId" element={<ChatPage />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/premium" element={<PremiumPage />} />
            </Route>
          </Route>
          {/* Catch all other routes and redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Модалки нужно рендерить здесь */}
        {deferredPrompt && !isAppInstalled && (
          <InstallPromptModal onInstall={handleInstall} />
        )}

        {showIosGuide && (
          <IosInstallGuideModal onClose={() => setShowIosGuide(false)} />
        )}
      </Router>
    </AuthProvider>
  );
}

export default App;