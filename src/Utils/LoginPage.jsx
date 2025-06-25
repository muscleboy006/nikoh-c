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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const LoginPage = () => {
  const { currentUser, loading, error } = useAuth();
  const navigate = useNavigate();
  const [initData, setInitData] = useState(null);
  const [isWebApp, setIsWebApp] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [allWindowProperties, setAllWindowProperties] = useState({});
  
  // Проверяем, запущено ли приложение в Telegram Web App
  useEffect(() => {
    const checkTelegramWebApp = () => {
      // Собираем все Telegram-связанные свойства из window
      const telegramProps = {};
      for (let prop in window) {
        if (prop.toLowerCase().includes('telegram') || prop.toLowerCase().includes('tg')) {
          try {
            telegramProps[prop] = typeof window[prop] === 'object' ? 
              JSON.stringify(window[prop], null, 2) : window[prop];
          } catch (e) {
            telegramProps[prop] = `[Error: ${e.message}]`;
          }
        }
      }

      const debug = {
        hasTelegram: !!window.Telegram,
        hasWebApp: !!(window.Telegram && window.Telegram.WebApp),
        userAgent: navigator.userAgent,
        locationSearch: window.location.search,
        locationHref: window.location.href,
        referrer: document.referrer,
        hasTelegramWebviewProxy: !!window.TelegramWebviewProxy,
        locationHash: window.location.hash,
        telegramWebAppData: null,
        initDataRaw: null,
        webAppProperties: {},
        telegramProps: telegramProps,
        documentCookies: document.cookie,
        sessionStorageKeys: [],
        localStorageKeys: []
      };

      // Проверяем sessionStorage и localStorage
      try {
        debug.sessionStorageKeys = Object.keys(sessionStorage);
        debug.localStorageKeys = Object.keys(localStorage);
      } catch (e) {
        debug.storageError = e.message;
      }

      // Проверяем различные способы определения Telegram Web App
      const isTelegramWebApp = 
        // Основной способ - проверка window.Telegram.WebApp
        (window.Telegram && window.Telegram.WebApp) ||
        // Проверка через user agent
        /TelegramWebApp/i.test(navigator.userAgent) ||
        /Telegram/i.test(navigator.userAgent) ||
        // Проверка через параметры URL
        window.location.search.includes('tgWebAppData') ||
        window.location.href.includes('tgWebAppData') ||
        // Проверка через referrer
        document.referrer.includes('t.me') ||
        // Проверка через window.TelegramWebviewProxy (для некоторых версий)
        window.TelegramWebviewProxy ||
        // Проверка через hash
        window.location.hash.includes('tgWebAppData') ||
        // Проверка на наличие любых Telegram-связанных свойств
        Object.keys(telegramProps).length > 0;

      if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        // Собираем ВСЕ доступные свойства WebApp
        const webAppProps = {};
        for (let prop in webApp) {
          try {
            if (typeof webApp[prop] === 'function') {
              webAppProps[prop] = '[Function]';
            } else if (typeof webApp[prop] === 'object' && webApp[prop] !== null) {
              webAppProps[prop] = JSON.parse(JSON.stringify(webApp[prop]));
            } else {
              webAppProps[prop] = webApp[prop];
            }
          } catch (e) {
            webAppProps[prop] = `[Error: ${e.message}]`;
          }
        }
        
        debug.webAppProperties = webAppProps;

        // Получаем initData
        if (webApp.initData) {
          setInitData(webApp.initData);
          debug.initDataRaw = webApp.initData;
        }

        // Пробуем получить данные из initDataUnsafe
        if (webApp.initDataUnsafe && Object.keys(webApp.initDataUnsafe).length > 0) {
          debug.telegramWebAppData = webApp.initDataUnsafe;
        }

        // Пробуем различные методы получения данных пользователя
        try {
          if (typeof webApp.sendData === 'function') {
            debug.hasSendData = true;
          }
          if (typeof webApp.requestWriteAccess === 'function') {
            debug.hasRequestWriteAccess = true;
          }
          if (typeof webApp.requestContact === 'function') {
            debug.hasRequestContact = true;
          }
        } catch (e) {
          debug.webAppMethodsError = e.message;
        }
        
        // Расширяем WebApp для лучшего отображения
        try {
          webApp.expand();
          webApp.ready();
        } catch (e) {
          debug.webAppInitError = e.message;
        }
      }

      // Проверяем все возможные источники данных в URL
      const urlParams = new URLSearchParams(window.location.search);
      const allUrlParams = {};
      for (let [key, value] of urlParams) {
        allUrlParams[key] = value;
        if (key.toLowerCase().includes('tg') || key.toLowerCase().includes('telegram')) {
          try {
            const decoded = decodeURIComponent(value);
            setInitData(decoded);
            debug.telegramWebAppData = decoded;
          } catch (e) {
            debug.urlDecodeError = e.message;
          }
        }
      }
      debug.allUrlParams = allUrlParams;

      // Проверяем hash параметры
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const allHashParams = {};
        for (let [key, value] of hashParams) {
          allHashParams[key] = value;
          if (key.toLowerCase().includes('tg') || key.toLowerCase().includes('telegram')) {
            try {
              const decoded = decodeURIComponent(value);
              setInitData(decoded);
              debug.telegramWebAppData = decoded;
            } catch (e) {
              debug.hashDecodeError = e.message;
            }
          }
        }
        debug.allHashParams = allHashParams;
      }

      // Проверяем document.referrer более детально
      if (document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          const referrerParams = new URLSearchParams(referrerUrl.search);
          const referrerData = {};
          for (let [key, value] of referrerParams) {
            referrerData[key] = value;
          }
          debug.referrerParams = referrerData;
        } catch (e) {
          debug.referrerParseError = e.message;
        }
      }

      debug.isTelegramWebApp = isTelegramWebApp;
      setDebugInfo(debug);
      setAllWindowProperties(telegramProps);

      console.log('🔍 Полная диагностика Telegram Web App:', debug);
      console.log('🔍 Все Telegram свойства window:', telegramProps);

      if (isTelegramWebApp) {
        setIsWebApp(true);
      }
    };

    // Проверяем сразу
    checkTelegramWebApp();
    
    // Проверяем с задержками
    const timeouts = [100, 500, 1000, 2000].map(delay => 
      setTimeout(checkTelegramWebApp, delay)
    );
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);
  
  // Перенаправляем пользователя, если он уже авторизован
  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);
  
  // Функция для парсинга initData
  const parseInitData = (initDataString) => {
    if (!initDataString) return null;
    
    try {
      const params = new URLSearchParams(initDataString);
      const result = {};
      
      for (const [key, value] of params.entries()) {
        if (key === 'user' || key === 'chat' || key === 'receiver') {
          try {
            result[key] = JSON.parse(decodeURIComponent(value));
          } catch (e) {
            result[key] = value;
          }
        } else {
          result[key] = value;
        }
      }
      
      return result;
    } catch (e) {
      console.error('Error parsing initData:', e);
      return null;
    }
  };
  
  const parsedInitData = parseInitData(initData);
  
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
      <div className="w-full max-w-2xl space-y-4">
        {/* Основная карта входа */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-2xl font-bold text-center">Tizimga kirish</CardTitle>
              {isWebApp && <Badge variant="secondary">Telegram Web App</Badge>}
            </div>
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
          
          <CardContent className="flex justify-center pt-4">
            <TelegramLoginButton />
          </CardContent>
          
          <CardFooter>
            <p className="text-center text-xs text-muted-foreground w-full">
              Kirish tugmasini bosish orqali siz xizmatdan foydalanish qoidalariga rozilik bildirasiz
            </p>
          </CardFooter>
        </Card>

        {/* Карта с отображением initData для тестирования */}
        {isWebApp && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">Debug: Telegram Web App Data</CardTitle>
              <CardDescription>
                Эта информация отображается только для тестирования
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Debug информация */}
              <div>
                <h4 className="font-medium mb-2">Debug Info:</h4>
                <div className="bg-gray-50 p-3 rounded-md text-xs space-y-1">
                  <div><strong>User Agent:</strong> {debugInfo.userAgent}</div>
                  <div><strong>Referrer:</strong> {debugInfo.referrer || 'N/A'}</div>
                  <div><strong>URL Search:</strong> {debugInfo.locationSearch || 'N/A'}</div>
                  <div><strong>URL Hash:</strong> {debugInfo.locationHash || 'N/A'}</div>
                  <div><strong>Telegram Object:</strong> {debugInfo.hasTelegram ? 'Available' : 'Not Available'}</div>
                  <div><strong>WebApp Object:</strong> {debugInfo.hasWebApp ? 'Available' : 'Not Available'}</div>
                  <div><strong>TelegramWebviewProxy:</strong> {debugInfo.hasTelegramWebviewProxy ? 'Available' : 'Not Available'}</div>
                  <div><strong>Is Telegram Web App:</strong> {debugInfo.isTelegramWebApp ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
              <Separator />

              {/* WebApp Properties */}
              {debugInfo.webAppProperties && Object.keys(debugInfo.webAppProperties).length > 0 && (
                <>
                  <div>
                    <h4 className="font-medium mb-2">WebApp Properties:</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(debugInfo.webAppProperties, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* initDataUnsafe */}
              {debugInfo.telegramWebAppData && (
                <>
                  <div>
                    <h4 className="font-medium mb-2">Telegram Web App Data (initDataUnsafe):</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(debugInfo.telegramWebAppData, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              
              {/* Статус Web App */}
              <div>
                <h4 className="font-medium mb-2">Web App Status:</h4>
                <Badge variant="outline" className="text-green-600">
                  ✓ Запущено в Telegram Web App
                </Badge>
              </div>
              
              <Separator />
              
              {/* Raw initData */}
              {initData && (
                <div>
                  <h4 className="font-medium mb-2">Raw initData:</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm font-mono break-all">
                    {initData}
                  </div>
                </div>
              )}
              
              <Separator />
              
              {/* Parsed initData */}
              {parsedInitData && (
                <div>
                  <h4 className="font-medium mb-2">Parsed initData:</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(parsedInitData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Информация о пользователе из initDataUnsafe */}
              {debugInfo.telegramWebAppData?.user && (
                <div>
                  <h4 className="font-medium mb-2">User Info (from initDataUnsafe):</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {debugInfo.telegramWebAppData.user.id}
                    </div>
                    <div>
                      <span className="font-medium">Username:</span> @{debugInfo.telegramWebAppData.user.username || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">First Name:</span> {debugInfo.telegramWebAppData.user.first_name}
                    </div>
                    <div>
                      <span className="font-medium">Last Name:</span> {debugInfo.telegramWebAppData.user.last_name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Language:</span> {debugInfo.telegramWebAppData.user.language_code}
                    </div>
                    <div>
                      <span className="font-medium">Premium:</span> {debugInfo.telegramWebAppData.user.is_premium ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              )}

              {/* Информация о пользователе */}
              {parsedInitData?.user && (
                <div>
                  <h4 className="font-medium mb-2">User Info (from parsed initData):</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {parsedInitData.user.id}
                    </div>
                    <div>
                      <span className="font-medium">Username:</span> @{parsedInitData.user.username || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">First Name:</span> {parsedInitData.user.first_name}
                    </div>
                    <div>
                      <span className="font-medium">Last Name:</span> {parsedInitData.user.last_name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Language:</span> {parsedInitData.user.language_code}
                    </div>
                    <div>
                      <span className="font-medium">Premium:</span> {parsedInitData.user.is_premium ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Дополнительная информация */}
              <div>
                <h4 className="font-medium mb-2">Additional Info:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {parsedInitData?.auth_date && (
                    <div>
                      <span className="font-medium">Auth Date:</span> {new Date(parsedInitData.auth_date * 1000).toLocaleString()}
                    </div>
                  )}
                  {parsedInitData?.query_id && (
                    <div>
                      <span className="font-medium">Query ID:</span> {parsedInitData.query_id}
                    </div>
                  )}
                  {parsedInitData?.hash && (
                    <div className="col-span-2">
                      <span className="font-medium">Hash:</span> 
                      <div className="font-mono text-xs break-all mt-1">
                        {parsedInitData.hash}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Информация для обычного браузера */}
        {!isWebApp && (
          <Card className="w-full">
            <CardContent className="pt-6">
              <Alert>
                <AlertDescription>
                  Приложение запущено в обычном браузере. 
                  Для тестирования Telegram Web App откройте приложение через бота в Telegram.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LoginPage;