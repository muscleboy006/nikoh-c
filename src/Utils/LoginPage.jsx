// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../AuthContext';
// import TelegramLoginButton from './TelegramLoginButton';

// // Импорт компонентов shadcn/ui
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Skeleton } from '@/components/ui/skeleton';

// const LoginPage = () => {
//   const { currentUser, loading, error } = useAuth();
//   const navigate = useNavigate();
  
//   // Перенаправляем пользователя, если он уже авторизован
//   useEffect(() => {
//     if (currentUser && !loading) {
//       navigate('/dashboard');
//     }
//   }, [currentUser, loading, navigate]);
  
//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//         <Card className="w-full max-w-md">
//           <CardHeader className="space-y-1">
//             <Skeleton className="h-8 w-1/2 mx-auto" />
//             <Skeleton className="h-4 w-3/4 mx-auto" />
//           </CardHeader>
//           <CardContent className="flex justify-center">
//             <Skeleton className="h-10 w-40 rounded-lg" />
//           </CardContent>
//           <CardFooter>
//             <Skeleton className="h-4 w-full" />
//           </CardFooter>
//         </Card>
//       </div>
//     );
//   }
  
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">Tizimga kirish</CardTitle>
//           <CardDescription className="text-center">
//             Telegram hisobingiz orqali kiring
//           </CardDescription>
//         </CardHeader>
        
//         {error && (
//           <div className="px-6">
//             <Alert variant="destructive">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           </div>
//         )}
        
//         <CardContent className="flex justify-center pt-4">
//           <TelegramLoginButton />
//         </CardContent>
        
//         <CardFooter>
//           <p className="text-center text-xs text-muted-foreground w-full">
//             Kirish tugmasini bosish orqali siz xizmatdan foydalanish qoidalariga rozilik bildirasiz
//           </p>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// };

// export default LoginPage;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import TelegramLoginButton from './TelegramLoginButton';

// Импорт компонентов shadcn/ui
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import api from './api';

const LoginPage = () => {
  const { currentUser, loading, error, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isWebApp, setIsWebApp] = useState(false);
  
  // Проверяем, что мы в Telegram Web App
  useEffect(() => {
    const checkWebApp = () => {
      if (window.Telegram?.WebApp) {
        setIsWebApp(true);
        // Расширяем WebApp на весь экран
        window.Telegram.WebApp.expand();
        // Готовим WebApp
        window.Telegram.WebApp.ready();
      }
    };
    
    // Проверяем сразу и через небольшую задержку на случай если скрипт еще загружается
    checkWebApp();
    const timer = setTimeout(checkWebApp, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Функция для автоматической авторизации через Telegram Web App
  const authenticateWithTelegramWebApp = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError(null);
      
      // Проверяем, что мы в Telegram Web App
      if (!window.Telegram?.WebApp) {
        throw new Error('Приложение должно быть запущено в Telegram');
      }
      
      const webApp = window.Telegram.WebApp;
      
      // Получаем данные пользователя из Telegram Web App
      const initData = webApp.initData;
      if (!initData) {
        throw new Error('Не удалось получить данные пользователя из Telegram');
      }
      
      // Парсим initData для получения user данных
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      
      if (!userParam) {
        throw new Error('Данные пользователя не найдены');
      }
      
      const userData = JSON.parse(decodeURIComponent(userParam));
      const telegramId = userData.id;
      
      console.log('Telegram User ID:', telegramId);
      console.log('User Data:', userData);
      
      // Отправляем запрос на сервер для получения токена
      const response = await fetch(`${api}/tg/telegram-webapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: telegramId,
          initData: initData,
          userData: userData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка авторизации');
      }
      
      const authData = await response.json();
      
      if (!authData.success) {
        throw new Error(authData.message || 'Ошибка авторизации');
      }
      
      const { token, user } = authData;
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Обновляем состояние аутентификации
      setCurrentUser(user);
      
      // Перенаправляем на dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Ошибка автоматической авторизации:', error);
      setAuthError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Проверяем токен в localStorage при загрузке
  useEffect(() => {
    const checkExistingAuth = async () => {
      // Если пользователь уже авторизован, не проверяем заново
      if (currentUser) {
        return;
      }
      
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Проверяем валидность токена
          const response = await fetch(`${api}/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            navigate('/dashboard');
            return;
          } else {
            // Токен невалидный, удаляем его
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Ошибка проверки токена:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      // Если нет валидного токена и мы в Telegram Web App, пытаемся авторизоваться
      if (isWebApp && window.Telegram?.WebApp?.initData) {
        await authenticateWithTelegramWebApp();
      }
    };
    
    if (!loading) {
      checkExistingAuth();
    }
  }, [currentUser, loading, navigate, setCurrentUser, isWebApp]);
  
  // Перенаправляем пользователя, если он уже авторизован
  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);
  
  if (loading || isAuthenticating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardHeader>
          <CardContent className="flex justify-center">
            <Skeleton className="h-10 w-40 rounded-lg" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Tizimga kirish</CardTitle>
          <CardDescription className="text-center">
            {isWebApp ? 
              'Telegram orqali avtomatik avtorizatsiya...' : 
              'Telegram hisobingiz orqali kiring'
            }
          </CardDescription>
        </CardHeader>
        
        {(error || authError) && (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertDescription>{error || authError}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent className="flex justify-center pt-4">
          {!isWebApp && <TelegramLoginButton />}
          
          {isWebApp && (
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground mb-4">
                Avtomatik avtorizatsiya jarayoni...
              </p>
              {authError && (
                <button 
                  onClick={authenticateWithTelegramWebApp}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Yuklanmoqda...' : 'Qayta urinish'}
                </button>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <p className="text-center text-xs text-muted-foreground w-full">
            Kirish tugmasini bosish orqali siz xizmatdan foydalanish qoidalariga rozilik bildirasiz
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;