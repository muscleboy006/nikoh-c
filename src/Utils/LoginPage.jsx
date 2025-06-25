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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import api from './api';

const LoginPage = () => {
  const { setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initDataRaw, setInitDataRaw] = useState('');
  const [initDataParsed, setInitDataParsed] = useState(null);
  const [isWebApp, setIsWebApp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData;
    setInitDataRaw(initData || 'null');
    setIsWebApp(!!initData);

    if (initData) {
      console.log('[WebApp] initData:', initData);

      try {
        // Парсим initData
        const params = new URLSearchParams(initData);
        const parsed = {};
        for (const [key, value] of params.entries()) {
          parsed[key] = value;
        }
        setInitDataParsed(parsed);

        // Отправляем на сервер
        const authorize = async () => {
          try {
            const res = await fetch(`${api}/tg/authTelegram`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData }),
            });

            const data = await res.json();
            if (data.success) {
              localStorage.setItem('token', data.token);
              setCurrentUser(data.user);
              navigate('/dashboard');
            } else {
              setError(data.error || 'Avtorizatsiya xatoligi');
            }
          } catch (err) {
            console.error('Auth error:', err);
            setError('Serverga ulanishda xatolik');
          } finally {
            setLoading(false);
          }
        };

        authorize();
      } catch (err) {
        console.error('InitData parse error:', err);
        setError('initData xato formatda');
        setLoading(false);
      }
    } else {
      console.warn('⚠️ WebApp initData yo‘q. Ehtimol, sayt Telegram orqali ochilmagan.');
      setLoading(false);
    }
  }, [navigate, setCurrentUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Tizimga kirish</CardTitle>
          <CardDescription className="text-center">
            Telegram hisobingiz orqali tizimga kiring
          </CardDescription>
        </CardHeader>

        {loading ? (
          <CardContent className="flex justify-center">
            <Skeleton className="h-10 w-40 rounded-lg" />
          </CardContent>
        ) : error ? (
          <CardContent className="px-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        ) : isWebApp ? (
          <CardContent className="text-sm text-gray-700 space-y-4">
            <p className="font-semibold text-green-700">WebApp orqali kirdingiz ✅</p>
            <p className="font-mono text-xs break-words bg-gray-200 p-2 rounded">
              <strong>Raw initData:</strong><br />
              {initDataRaw}
            </p>
            <p className="text-sm">Tahlil qilingan initData:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(initDataParsed, null, 2)}
            </pre>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col items-center gap-2 pt-4">
            <TelegramLoginButton />
            <p className="text-sm text-gray-500 text-center">
              Agar tugma yuklanmagan bo‘lsa, sahifani yangilang yoki boshqa brauzerdan foydalaning
            </p>
          </CardContent>
        )}

        <CardFooter>
          <p className="text-center text-xs text-muted-foreground w-full">
            Kirish tugmasini bosish orqali siz xizmat qoidalariga rozilik bildirasiz
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;