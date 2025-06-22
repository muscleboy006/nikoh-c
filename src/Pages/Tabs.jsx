import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, HandCoins, BarChart3, Settings, MessageCircleHeart, Save, User } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'asosiy';
    if (path.includes('/chat')) return 'chat';
    if (path.includes('/saved')) return 'saqlanganlar';
    if (path.includes('/profile')) return 'profil';
    return ''; // Default
  };
  
  const handleTabChange = (tab) => {
    switch (tab) {
      case 'asosiy':
        navigate('/dashboard');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'saqlanganlar':
        navigate('/saved'); // Make sure you create this route in App.jsx
        break;
      case 'profil':
        navigate('/profile'); // Make sure you create this route in App.jsx
        break;
      default:
        navigate('/dashboard');
    }
  };
  
  const activeTab = getActiveTab();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <Outlet /> {/* This is where your route components will render */}
      </div>

      <div className="grid grid-cols-4 bg-white border-t shadow-md h-[64px] w-full fixed bottom-0 left-0 right-0">
        <button
          onClick={() => handleTabChange('asosiy')}
          className={`flex flex-col items-center justify-center text-sm w-full text-center transition-colors ${activeTab === 'asosiy' ? 'text-blue-600' : ''}`}
        >
          <Home className="w-6 h-6" />
          Asosiy
        </button>
        <button
          onClick={() => handleTabChange('chat')}
          className={`flex flex-col items-center justify-center text-sm w-full text-center transition-colors ${activeTab === 'chat' ? 'text-blue-600' : ''}`}
        >
          <MessageCircleHeart className="w-6 h-6" />
          Chat
        </button>
        <button
          onClick={() => handleTabChange('saqlanganlar')}
          className={`flex flex-col items-center justify-center text-sm w-full text-center transition-colors ${activeTab === 'saqlanganlar' ? 'text-blue-600' : ''}`}
        >
          <Save className="w-6 h-6" />
          Saqlanganlar
        </button>
        <button
          onClick={() => handleTabChange('profil')}
          className={`flex flex-col items-center justify-center text-sm w-full text-center transition-colors ${activeTab === 'profil' ? 'text-blue-600' : ''}`}
        >
          <User className="w-6 h-6" />
          Profil
        </button>
      </div>
    </div>
  );
}