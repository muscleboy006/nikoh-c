import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useAccessStatus } from './useAccessStatus';
import axios from 'axios';
import { ChevronDown, ChevronUp, Upload } from 'lucide-react';

// Импорт компонентов shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';
import api from './api';

const ProfilePage = () => {
  const { currentUser, loading, logout } = useAuth();
  const { access, premiumEndsAt, isLoading: accessLoading } = useAccessStatus();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [expandedSections, setExpandedSections] = useState({Profil: true,});
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

    // Обработчик загрузки изображения
    const handleImageUpload = async (file) => {
      if (!file) return;
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);
  
      try {
        setProfileLoading(true);
        const response = await axios.post(
          `${api}/tg/profile-photo/${currentUser._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        setUserProfile(response.data);
        setFormData(response.data);
        setIsEditing(false)
        fetchUserProfile()
        setPreviewImage(URL.createObjectURL(file));
        toast.success('Rasm muvaffaqiyatli yuklandi!');
      } catch (error) {
        console.error('Rasm yuklashda xatolik:', error);
        toast.error('Rasm yuklashda xatolik yuz berdi.');
      } finally {
        setProfileLoading(false);
      }
    };
  
    // Обработчик изменения файла
    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        handleImageUpload(file);
      }
    };
  
    // Инициализация предпросмотра
    useEffect(() => {
      if (userProfile?.photo_url) {
        setPreviewImage(userProfile.photo_url);
      }
    }, [userProfile]);

  // Lists for cities and nationalities in Uzbekistan
  const cities = [
    'Toshkent',
    'Toshkent vil',
    'Sirdaryo',
    'Jizzax',
    'Samarqand',
    'Andijon',
    'Namangan',
    'Farg\'ona',
    'Qashqadaryo',
    'Surhondaryo',
    'Buxoro',
    'Navoiy',
    'Xorazm',
    'Qoraqolpog\'ston',
  ];

  const nationalities = [
    'O\'zbek',
    'Tojik',
    'Qozoq',
    'Qoraqalpoq',
    'Rus',
    'Koreys',
    'Turkman',
    'Qirg\'iz',
    'Ukrain',
    'Arman',
  ];

  // Translation functions
  const getGenderLabel = (gender) => {
    const labels = {
      Erkak: 'Erkak',
      Ayol: 'Ayol',
    };
    return labels[gender] || '—';
  };

  const fetchUserProfile = async () => {
    if (!currentUser?._id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/dashboard');
      return;
    }
    try {
      setProfileLoading(true);
      const response = await axios.get(`${api}/tg/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(response.data);
      setFormData(response.data);
      console.log(response.data);
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/dashboard');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/dashboard');
    } else if (currentUser?._id) {
      fetchUserProfile();
    }
  }, [currentUser, loading, navigate]);

  if (loading || accessLoading || profileLoading) {
    return (
      <div className="flex min-h-screen justify-center bg-gray-50 p-4">
        <div className="flex flex-col gap-4 w-full max-w-lg">
          <Card>
            <CardContent className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="text-center py-8">
            <p className="text-gray-700">Профиль не найден</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4" variant="outline">
              Вернуться к авторизации
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = () => {
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  const formatPremiumEndDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return null;
    const uzbekMonths = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'
    ];
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = uzbekMonths[d.getMonth()];
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}-chi ${month}, soat ${hours}:${minutes}`;
  };

  const isPremiumEnded = premiumEndsAt && new Date(premiumEndsAt) < new Date();

  const handleCopy = () => {
    navigator.clipboard.writeText(userProfile.id?.toString() || userProfile._id?.toString()).then(() => {
      setCopied(true);
      toast.success('ID ko\'chirildi!');
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleEdit = async () => {
    const token = localStorage.getItem('token');
    let dataToSend = { ...formData };
    if (dataToSend.profile?.gender === 'Erkak') {
      dataToSend.religiousPractice = { ...dataToSend.religiousPractice, hijab: false };
    }
    try {
      await axios.put(`${api}/tg/${userProfile._id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchUserProfile();
      setIsEditing(false);
      toast.success('Profil muvaffaqiyatli yangilandi!');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Xatolik yuz berdi. Qayta urinib ko\'ring.');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderField = (label, value) => (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  );

  const sections = [
    {
      title: 'Profil',
      fields: [
        { label: 'Jins', value: getGenderLabel(userProfile.profile?.gender) },
        { label: 'Tug\'ilgan sana', value: userProfile.profile?.birthDate ? new Date(userProfile.profile.birthDate).toLocaleDateString() : '—' },
        { label: 'Viloyat', value: userProfile.profile?.city },
        { label: 'Millat', value: userProfile.profile?.nationality },
        { label: 'Oilaviy holat', value: userProfile.profile?.maritalStatus },
        { label: 'Farazndlari bormi', value: userProfile.profile?.hasChildren ? 'Ha' : 'Yo\'q' },
        { label: 'Ko\'chib o\'tishga tayyormi', value: userProfile.profile?.readyForRelocation ? 'Ha' : 'Yo\'q' },
      ],
    },
    {
      title: 'Diniy amaliyot',
      fields: [
        { label: 'Namoz', value: userProfile.religiousPractice?.prayer },
        ...(userProfile.profile?.gender === 'Ayol' ? [
          { label: 'Hijob', value: userProfile.religiousPractice?.hijab ? 'Ha' : 'Yo\'q' }
        ] : []),
      ],
    },
    {
      title: 'Ta\'lim',
      fields: [
        { label: 'Daraja', value: userProfile.education?.degree },
        { label: 'Yo\'nalish', value: userProfile.education?.field },
        { label: 'Kasb', value: userProfile.education?.profession },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-30 p-2 sm:p-3">
      <Toaster position="top-right" richColors />
      {/* Карточка профиля */}
      <Card className="w-full max-w-lg mb-3 shadow-md">
        <CardContent className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-500 shadow-sm">
              {userProfile.photo_url ? (
                <AvatarImage src={api + userProfile.photo_url} alt="Аватар" />
              ) : null}
              <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-700">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900">
                {userProfile.first_name} {userProfile.last_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-500 text-sm">
                  ID: {userProfile.telegramId}
                </p>
                <button onClick={handleCopy} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Ko'chirildi</span>
                    </>
                  ) : (
                    "Ko'chirish"
                  )}
                </button>
              </div>
            </div>
          </div>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-5 w-5 text-gray-600" />
                  <span className="sr-only">Menyu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600">Chiqish</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hisobdan chiqish</AlertDialogTitle>
                <AlertDialogDescription>
                  Siz rostdan ham o'z hisobingizdan chiqmoqchimisiz?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction onClick={logout}>Chiqish</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-lg mb-3 shadow-md p-4">
        <div className="text-xl font-semibold mb-2">🎯 Referal tizimi</div>
        <div className="text-lg">
          Siz <span className="font-bold text-green-600">{userProfile.referrals.length}</span> do'stingizni taklif qildingiz.
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Agar 5 ta do'st taklif qilsangiz — 1 oylik premium a'zolik bepul bo'ladi.
        </div>

        <div className="mt-4">
          {userProfile.referrals.length >= 5 ? (
            <div className="text-green-600 font-semibold">🎉 Siz premium olishingiz mumkin!</div>
          ) : (
            <div className="text-blue-600">
              {5 - userProfile.referrals.length} ta do'st qolgan.
            </div>
          )}
        </div>
      </Card>


      {/* Информация о пробном периоде */}
      {!access && premiumEndsAt && formatPremiumEndDate(premiumEndsAt) && (
        <Card className="w-full max-w-lg mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Premium muddat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={isPremiumEnded ? "text-sm text-red-600" : "text-sm text-gray-700"}>
              {isPremiumEnded
                ? `Sizning premium muddatingiz ${formatPremiumEndDate(premiumEndsAt)} da tugagan`
                : `Sizning premium muddatingiz ${formatPremiumEndDate(premiumEndsAt)} da tugaydi`}
            </p>
          </CardContent>
        </Card>
      )}

      <div className='w-full max-w-lg space-y-4'>
        <Card className="w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                ⭐ Premium obuna
              </span>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                TOP
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Cheksiz imkoniyatlar
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-600">✓</span>
                <span>Barcha funksiyalar</span>
              </div>
              <Button
                onClick={() => navigate('/premium')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm h-10 font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                💳 Sotib olish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Полная информация о пользователе */}
      <Card className="w-full max-w-lg mb-6 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Shaxsiy ma'lumotlar</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Edit2 className="h-4 w-4" />
            Tahrirlash
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderField('Ism', userProfile.first_name)}
          {renderField('Familiya', userProfile.last_name)}
          {renderField('Ro\'yxatdan o\'tgan sana', userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '—')}

          {sections.map((section) => (
            <div key={section.title} className="border-t border-gray-200 pt-4 first:border-t-0">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between text-left text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                {section.title}
                {expandedSections[section.title] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections[section.title] && (
                <div className="mt-2">
                  {section.fields ? section.fields.map((field) => renderField(field.label, field.value)) : section.content}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Модальное окно для редактирования */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Profilni tahrirlash</DialogTitle>
            <DialogDescription>
              Ma'lumotlarni o'zgartirish uchun quyidagi bo'limlarni to'ldiring va saqlang.
            </DialogDescription>
          </DialogHeader>
          {/* Добавлен блок для загрузки изображения */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-32 w-32 border-2 border-blue-500 mb-4">
              {previewImage ? (
                <AvatarImage src={api + previewImage} alt="Profil rasmi" />
              ) : (
                <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-700">
                  {getInitials(formData)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {previewImage ? "Rasmni almashtirish" : "Rasm yuklash"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG yoki WEBP formatlari qabul qilinadi</p>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic">Asosiy</TabsTrigger>
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="religious">Diniy</TabsTrigger>
              <TabsTrigger value="education">Ta'lim</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Ism</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Familiya</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Jins</Label>
                  <Select
                    value={formData.profile?.gender || ''}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, gender: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Jinsni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Erkak">Erkak</SelectItem>
                      <SelectItem value="Ayol">Ayol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="birthDate">Tug'ilgan sana</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.profile?.birthDate ? new Date(formData.profile.birthDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, birthDate: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Viloyat</Label>
                  <Select
                    value={formData.profile?.city || ''}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, city: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Shaharni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nationality">Millat</Label>
                  <Select
                    value={formData.profile?.nationality || ''}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, nationality: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Millatni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map((nat) => (
                        <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Oilaviy holat</Label>
                  <Select
                    value={formData.profile?.maritalStatus || ''}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, maritalStatus: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Oilaviy holatni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yolg'iz">Yolg'iz</SelectItem>
                      <SelectItem value="Ajrashgan">Ajrashgan</SelectItem>
                      <SelectItem value="Beva">Beva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasChildren"
                    checked={formData.profile?.hasChildren || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, hasChildren: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="hasChildren">Farzandlari bor</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="readyForRelocation"
                    checked={formData.profile?.readyForRelocation || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, readyForRelocation: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="readyForRelocation">Ko'chib o'tishga tayyor</Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="religious" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prayer">Namoz</Label>
                  <Select
                    value={formData.religiousPractice?.prayer || ''}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      religiousPractice: { ...formData.religiousPractice, prayer: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Namoz holatini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Doim">Doim</SelectItem>
                      <SelectItem value="Ba'zan">Ba'zan</SelectItem>
                      <SelectItem value="Kamdam-kam">Kamdan-kam</SelectItem>
                      <SelectItem value="Oqimayman">Oqimayman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.profile?.gender === 'Ayol' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hijab"
                      checked={formData.religiousPractice?.hijab || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        religiousPractice: { ...formData.religiousPractice, hijab: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="hijab">Hijob</Label>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="education" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Daraja</Label>
                  <Select
                    value={formData.education?.degree || ''}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      education: { ...formData.education, degree: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ta'lim darajasini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maktab">Maktab</SelectItem>
                      <SelectItem value="Kollej">Kollej</SelectItem>
                      <SelectItem value="Bakalavr">Bakalavr</SelectItem>
                      <SelectItem value="Magistr">Magistr</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="field">Yo'nalish</Label>
                  <Input
                    id="field"
                    value={formData.education?.field || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      education: { ...formData.education, field: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="profession">Kasb</Label>
                  <Input
                    id="profession"
                    value={formData.education?.profession || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      education: { ...formData.education, profession: e.target.value }
                    })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Дополнительные элементы */}
      <div className="w-full max-w-lg space-y-4">
        <Card className="w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Ilova haqida</CardTitle>
          </CardHeader>
          <CardContent>
            Savol va takliflaringiz bolsa yozishingiz mumkun. <br />
            Telegram: <a href="https://t.me/hisobda_app" className="underline text-blue-600 hover:text-blue-800">@hisobda_app</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;