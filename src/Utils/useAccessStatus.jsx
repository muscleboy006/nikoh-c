// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import api from './api';

// export const useAccessStatus = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPremium, setIsPremium] = useState(false);
//   const [premiumEndsAt, setPremiumEndsAt] = useState(null);
//   const [profileComplete, setProfileComplete] = useState(false);
//   const [chatLimitReached, setChatLimitReached] = useState(false);
//   const [canStartChat, setCanStartChat] = useState(false);
//   const [chatCount, setChatCount] = useState(0);
//   const [chatLimit, setChatLimit] = useState(15);
//   const [restrictions, setRestrictions] = useState({});
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAccess = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           throw new Error('Токен не найден');
//         }

//         const res = await axios.get(`${api}/tg/access-status`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = res.data;
//         console.log('Access status response:', data);

//         // Устанавливаем все полученные данные
//         setIsPremium(data.isPremium || false);
//         setPremiumEndsAt(data.premiumEndsAt);
//         setProfileComplete(data.profileComplete || false);
//         setChatLimitReached(data.chatLimitReached || false);
//         setCanStartChat(data.canStartChat || false);
//         setChatCount(data.chatCount || 0);
//         setChatLimit(data.chatLimit || 10);
//         setRestrictions(data.restrictions || {});
//         setError(null);

//       } catch (err) {
//         console.error('Ошибка получения статуса доступа:', err);

//         // Устанавливаем ошибку на основе статуса ответа
//         if (err.response?.status === 401) {
//           setError('Необходима авторизация');
//         } else if (err.response?.status === 404) {
//           setError('Пользователь не найден');
//         } else if (err.response?.status === 500) {
//           setError('Ошибка сервера');
//         } else {
//           setError('Ошибка соединения');
//         }

//         // Сбрасываем все статусы при ошибке
//         setIsPremium(false);
//         setPremiumEndsAt(null);
//         setProfileComplete(false);
//         setChatLimitReached(false);
//         setCanStartChat(false);
//         setChatCount(0);
//         setRestrictions({});
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAccess();
//   }, []);

//   // Функция для принудительного обновления статуса
//   const refreshAccessStatus = async () => {
//     setIsLoading(true);
//     const fetchAccess = async () => {
//       // ... тот же код что и в useEffect
//     };
//     await fetchAccess();
//   };

//   return {
//     // Основные статусы
//     isPremium,
//     premiumEndsAt,
//     profileComplete,
//     chatLimitReached,
//     canStartChat,
    
//     // Дополнительная информация
//     chatCount,
//     chatLimit,
//     restrictions,
    
//     // Состояние хука
//     isLoading,
//     error,
    
//     // Методы
//     refreshAccessStatus
//   };
// };
import axios from 'axios';
import { useEffect, useState } from 'react';
import api from './api';

export const useAccessStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumEndsAt, setPremiumEndsAt] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [chatLimitReached, setChatLimitReached] = useState(false);
  const [canStartChat, setCanStartChat] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [chatLimit, setChatLimit] = useState(15);
  const [restrictions, setRestrictions] = useState({});
  const [error, setError] = useState(null);

  // Выносим fetchAccess наружу
  const fetchAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен не найден');

      const res = await axios.get(`${api}/tg/access-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      console.log('Access status response:', data);

      setIsPremium(data.isPremium || false);
      setPremiumEndsAt(data.premiumEndsAt);
      setProfileComplete(data.profileComplete || false);
      setChatLimitReached(data.chatLimitReached || false);
      setCanStartChat(data.canStartChat || false);
      setChatCount(data.chatCount || 0);
      setChatLimit(data.chatLimit || 10);
      setRestrictions(data.restrictions || {});
      setError(null);

    } catch (err) {
      console.error('Ошибка получения статуса доступа:', err);
      if (err.response?.status === 401) {
        setError('Необходима авторизация');
      } else if (err.response?.status === 404) {
        setError('Пользователь не найден');
      } else if (err.response?.status === 500) {
        setError('Ошибка сервера');
      } else {
        setError('Ошибка соединения');
      }

      // Сброс всех статусов
      setIsPremium(false);
      setPremiumEndsAt(null);
      setProfileComplete(false);
      setChatLimitReached(false);
      setCanStartChat(false);
      setChatCount(0);
      setRestrictions({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccess();
  }, []);

  // Теперь refreshAccessStatus использует ту же функцию
  const refreshAccessStatus = async () => {
    setIsLoading(true);
    await fetchAccess();
  };

  return {
    isPremium,
    premiumEndsAt,
    profileComplete,
    chatLimitReached,
    canStartChat,
    chatCount,
    chatLimit,
    restrictions,
    isLoading,
    error,
    refreshAccessStatus,
  };
};
