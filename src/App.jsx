import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  const [userData, setUserData] = useState(null);

       useEffect(() => {
           // Проверяем, доступен ли объект Telegram Web App
           if (window.Telegram && window.Telegram.WebApp) {
               // Инициализируем Telegram Web App
               window.Telegram.WebApp.ready();

               // Получаем initData
               const initData = window.Telegram.WebApp.initData;

               // Парсим данные пользователя
               const user = parseInitData(initData);
               setUserData(user);
           } else {
               console.error('Telegram Web App is not available');
           }
       }, []);

       const parseInitData = (initData) => {
           const params = new URLSearchParams(initData);
           return {
               user: JSON.parse(params.get('user')),
               hash: params.get('hash'),
               auth_date: params.get('auth_date'),
               start_param: params.get('start_param'),
               chat_type: params.get('chat_type'),
               chat_instance: params.get('chat_instance'),
           };
      };
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={
            <LoginPage />
          } />

          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
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

      <h1>My Telegram Mini App</h1>
               {userData ? (
                   <div>
                       <h2>User Info:</h2>
                       <pre>{JSON.stringify(userData, null, 2)}</pre>
                   </div>
               ) : (
                   <p>Loading user data...</p>
               )}
    </AuthProvider>
  );
}

export default App;