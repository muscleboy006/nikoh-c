// import React, { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import api from './Utils/api';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
  
//   useEffect(() => {
//     // Проверяем, есть ли сохраненный токен
//     const token = localStorage.getItem('token');
    
//     if (token) {
//       fetchUserProfile(token);
//     } else {
//       setLoading(false);
//     }
    
//     // Проверяем, пришли ли данные от Telegram в URL (для OAuth потока)
//     const urlParams = new URLSearchParams(window.location.search);
//     const telegramData = {};
//     let hasTelegramData = false;
    
//     // Telegram отправляет несколько параметров, включая id, first_name, etc.
//     for (const [key, value] of urlParams.entries()) {
//       if (['id', 'first_name', 'last_name', 'gender', 'username', 'photo_url', 'auth_date', 'hash'].includes(key)) {
//         telegramData[key] = value;
//         hasTelegramData = true;
//       }
//     }
    
//     // Если данные найдены в URL, обрабатываем их
//     if (hasTelegramData) {
//       handleTelegramAuth(telegramData);
//       // Очищаем URL от параметров после обработки
//       window.history.replaceState({}, document.title, window.location.pathname);
//     }
//   }, []);
  
//   // Получение данных пользователя по токену
//   const fetchUserProfile = async (token) => {
//     try {
//       const response = await axios.get(`${api}/tg/user/profile`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
      
//       if (response.data.success) {
//         setCurrentUser(response.data.user);
//       } else {
//         logout();
//       }
//     } catch (err) {
//       console.error('Error fetching user profile:', err);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Обработка данных аутентификации от Telegram
//   const handleTelegramAuth = async (telegramData) => {
//     setLoading(true);
//     setError(null);
    
//     console.log('Processing Telegram auth data:', telegramData);
    
//     try {
//       const response = await axios.post(`${api}/tg/auth/telegram`, telegramData);
      
//       if (response.data.success) {
//         const { user, token } = response.data;
//         localStorage.setItem('token', token);
//         setCurrentUser(user);
//         console.log('Authentication successful:', user);
//         return true;
//       } else {
//         setError(response.data.error || 'Ошибка аутентификации');
//         console.error('Server returned error:', response.data.error);
//         return false;
//       }
//     } catch (err) {
//       console.error('Auth error:', err);
//       setError(err.response?.data?.error || 'Ошибка сервера');
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Выход из аккаунта
//   const logout = () => {
//     localStorage.removeItem('token');
//     setCurrentUser(null);
//   };
  
//   const value = {
//     currentUser,
//     loading,
//     error,
//     handleTelegramAuth,
//     logout
//   };
  
//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from './Utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Функция для проверки доступности сервера
  const checkServerHealth = async () => {
    try {
      console.log('Checking server health...');
      console.log('API URL:', api);
      
      const response = await axios.get(`${api}/health`, { timeout: 5000 });
      console.log('Server health check:', response.status);
      return true;
    } catch (err) {
      console.error('Server health check failed:', err.message);
      return false;
    }
  };
  
  useEffect(() => {
    console.log('AuthContext: Starting authentication process');
    console.log('Current URL:', window.location.href);
    console.log('API URL:', api);
    
    // Сначала проверим доступность сервера
    checkServerHealth().then(serverAvailable => {
      if (!serverAvailable) {
        setError('Сервер недоступен. Проверьте подключение к интернету.');
        setLoading(false);
        return;
      }
      
      // Проверяем, есть ли сохраненный токен
      const token = localStorage.getItem('token');
      
      if (token) {
        console.log('Found saved token, fetching user profile');
        fetchUserProfile(token);
        return;
      }
      
      console.log('No saved token found');
      
      // Проверяем, доступен ли Telegram Web App
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram Web App is available');
        
        try {
          window.Telegram.WebApp.ready();
          
          // Получаем initData
          const initData = window.Telegram.WebApp.initData;
          console.log('InitData length:', initData ? initData.length : 0);
          console.log('InitData preview:', initData ? initData.substring(0, 100) + '...' : 'empty');
          
          if (initData && initData.trim() !== '') {
            // Отправляем initData на сервер для аутентификации
            handleTelegramInitDataAuth(initData);
          } else {
            console.warn('No initData available or initData is empty');
            // Пробуем fallback метод
            checkUrlParams();
          }
        } catch (telegramError) {
          console.error('Error with Telegram Web App:', telegramError);
          // Пробуем fallback метод
          checkUrlParams();
        }
      } else {
        console.log('Telegram Web App is not available, checking URL params');
        // Fallback: проверяем URL параметры (для тестирования или других случаев)
        checkUrlParams();
      }
    });
  }, []);
  
  // Получение данных пользователя по токену
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${api}/tg/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      });
      
      if (response.data.success) {
        setCurrentUser(response.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };
  
  // Новый метод для отправки initData на сервер
  const handleTelegramInitDataAuth = async (initData) => {
    setLoading(true);
    setError(null);
    
    console.log('Processing Telegram initData:', initData);
    console.log('API endpoint:', `${api}/tg/auth/telegram-initdata`);
    
    try {
      // Проверяем, что initData не пустые
      if (!initData || initData.trim() === '') {
        console.error('InitData is empty or undefined');
        setError('Отсутствуют данные для аутентификации');
        setLoading(false);
        return false;
      }

      console.log('Sending request to server...');
      console.log('Full URL:', `${api}/tg/auth/telegram-initdata`);
      
      // Отправляем сырые initData на сервер
      const response = await axios.post(`${api}/tg/auth/telegram-initdata`, {
        initData: initData
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 секунд таймаут
      });
      
      console.log('Server response:', response.data);
      
      if (response.data.success) {
        const { user, token, walletId } = response.data;
        localStorage.setItem('token', token);
        if (walletId) localStorage.setItem('walletId', walletId);
        setCurrentUser(user);
        console.log('Authentication successful:', user);
        return true;
      } else {
        setError(response.data.error || 'Ошибка аутентификации');
        console.error('Server returned error:', response.data.error);
        return false;
      }
    } catch (err) {
      console.error('Auth error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        code: err.code
      });
      
      if (err.code === 'ECONNABORTED') {
        setError('Время ожидания истекло. Проверьте подключение к интернету.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message.includes('Network Error')) {
        setError('Ошибка сети. Возможно, сервер недоступен или заблокирован CORS политикой.');
      } else if (err.message) {
        setError(`Ошибка соединения: ${err.message}`);
      } else {
        setError('Неизвестная ошибка сервера');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback метод для URL параметров (оставляем для совместимости)
  const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramData = {};
    let hasTelegramData = false;
    
    // Telegram отправляет несколько параметров, включая id, first_name, etc.
    for (const [key, value] of urlParams.entries()) {
      if (['id', 'first_name', 'last_name', 'gender', 'username', 'photo_url', 'auth_date', 'hash'].includes(key)) {
        telegramData[key] = value;
        hasTelegramData = true;
      }
    }
    
    // Если данные найдены в URL, обрабатываем их
    if (hasTelegramData) {
      handleTelegramAuth(telegramData);
      // Очищаем URL от параметров после обработки
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.log('No URL params found, setting loading to false');
      setLoading(false);
    }
  };
  
  // Обработка данных аутентификации от Telegram (старый метод)
  const handleTelegramAuth = async (telegramData) => {
    setLoading(true);
    setError(null);
    
    console.log('Processing Telegram auth data:', telegramData);
    
    try {
      const response = await axios.post(`${api}/tg/auth/telegram`, telegramData, {
        timeout: 10000
      });
      
      if (response.data.success) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        setCurrentUser(user);
        console.log('Authentication successful:', user);
        return true;
      } else {
        setError(response.data.error || 'Ошибка аутентификации');
        console.error('Server returned error:', response.data.error);
        return false;
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Ошибка сервера');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Выход из аккаунта
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  const value = {
    currentUser,
    loading,
    error,
    handleTelegramAuth,
    handleTelegramInitDataAuth,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};