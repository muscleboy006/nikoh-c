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
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const LoginPage = () => {
  const { currentUser, loading, error } = useAuth();
  const navigate = useNavigate();
  const [initData, setInitData] = useState('');

  useEffect(() => {
    // Пытаемся взять из localStorage
    const savedInitData = localStorage.getItem('initData');

    if (savedInitData) {
      setInitData(savedInitData);
      console.log('✅ initData from localStorage:', savedInitData);
    } else if (window.Telegram?.WebApp?.initData) {
      // fallback если вдруг localStorage пуст
      const rawInitData = window.Telegram.WebApp.initData;
      setInitData(rawInitData);
      localStorage.setItem('initData', rawInitData);
      console.log('✅ initData from Telegram SDK:', rawInitData);
    } else {
      setInitData('⚠️ initData not available');
      console.warn('⚠️ Telegram WebApp initData not found');
    }
  }, []);

  // Редирект если авторизован
  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
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
            Telegram hisobingiz orqali kiring
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <CardContent className="flex flex-col items-center pt-4 space-y-4">
          <TelegramLoginButton />

          {/* Показываем initData (для отладки) */}
          <div className="w-full text-xs text-muted-foreground bg-gray-50 p-2 rounded overflow-x-auto max-h-40">
            <strong>initData:</strong>
            <pre className="whitespace-pre-wrap break-words">{initData}</pre>
          </div>
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
