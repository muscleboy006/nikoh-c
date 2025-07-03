import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import {
  Filter,
  RefreshCw,
  Search,
  Users,
  MapPin,
  Calendar,
  Heart,
  ChevronDown,
  X,
  Sparkles,
  User,
  Moon,
  MessageCircle,
  Loader,
  ArrowLeft,
  MoveRight
} from 'lucide-react';
import api from '../Utils/api';
import { useAccessStatus } from '@/Utils/useAccessStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

// Memoized TinderCard component
const TinderCard = React.memo(({
  profile,
  onSwipe,
  navigate,
  savedAnketas,
  toggleSave,
  undoRemove,
  startChat,
  canStartChat,
  removedProfiles,
  currentUser
}) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe('left', profile._id),
    onSwipedRight: () => onSwipe('right', profile._id),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
    delta: 10
  });

  const getInitials = useCallback((firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  }, []);

  const calculateAge = useCallback((birthDate) => {
    if (!birthDate) return '—';
    try {
      const ageDifMs = Date.now() - new Date(birthDate).getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch (error) {
      return '—';
    }
  }, []);

  const getGenderIcon = useCallback((gender) => {
    return gender === 'Erkak' ? '👨' : gender === 'Ayol' ? '👩' : '👤';
  }, []);

  return (
    <div {...handlers} className="relative w-full h-[calc(100vh-120px)] rounded-3xl overflow-hidden shadow-xl">
      <motion.div
        className="absolute inset-0"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
      >
        {/* Background image */}
        {profile.photo_url && (
          <img
            src={api + profile.photo_url}
            alt="Profile"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>

        {/* Overlay content */}
        <div className="relative z-20 h-full w-full flex flex-col justify-between p-6 text-white">
          {/* Top info */}
          <div className="-mt-4">
            <h2 className="text-3xl font-bold">
              {profile.first_name}, {calculateAge(profile.profile?.birthDate)}
            </h2>
            <p className="flex items-center gap-1 mt-1 text-white/90">
              <MapPin className="w-4 h-4" />
              {profile.profile?.city || "Shahar ko'rsatilmagan"}
            </p>

            <div className="flex items-center gap-2 mt-3 text-sm text-white/80">
              <User className="w-4 h-4" />
              {getGenderIcon(profile.profile?.gender)}{" "}
              {profile.profile?.gender || "Jins ko'rsatilmagan"}
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
              <Moon className="w-4 h-4" />
              Holati: {profile.profile?.maritalStatus || "Ko'rsatilmagan"}
            </div>

            {profile.profile?.bio && (
              <p className="mt-3 text-sm text-white/70">{profile.profile.bio}</p>
            )}
          </div>

          {/* Bottom buttons */}
          {/* <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/80 backdrop-blur-md hover:bg-red-100"
              onClick={() => onSwipe("left", profile._id)}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/80 backdrop-blur-md hover:bg-gray-100"
              onClick={undoRemove}
              disabled={removedProfiles.length === 0}
            >
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </Button>

            {canStartChat && (
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/80 backdrop-blur-md hover:bg-blue-100"
                onClick={() => startChat(profile._id)}
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/80 backdrop-blur-md hover:bg-green-100"
              onClick={() => onSwipe("right", profile._id)}
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </Button>
          </div> */}
          {/* Bottom action buttons */}
<div className="flex justify-center gap-6 flex-wrap">
  {/* ❌ Dislike */}
  <button
    onClick={() => onSwipe('left', profile._id)}
    className="text-[40px] sm:text-[48px] hover:scale-110 transition-transform"
  >
    ❌
  </button>

  {/* 🔁 Undo */}
  <button
    onClick={undoRemove}
    disabled={removedProfiles.length === 0}
    className="text-[36px] sm:text-[44px] hover:scale-110 transition-transform"
  >
    🔙
  </button>

  {/* 💬 Message */}
  {canStartChat && (
    <button
      onClick={() => startChat(profile._id)}
      className="text-[38px] sm:text-[46px] hover:scale-110 transition-transform"
    >
      💬
    </button>
  )}

  {/* ❤️ Like */}
  <button
    onClick={() => onSwipe('right', profile._id)}
    className="text-[42px] sm:text-[50px] hover:scale-110 transition-transform"
  >
    ❤️
  </button>

  {/* 🔥 Boost (если планируешь) */}
  {/* <button className="text-[40px] sm:text-[48px] hover:scale-110 transition-transform">
    🔥
  </button> */}
</div>

        </div>
      </motion.div>
    </div>
  );
});

const Random = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { access, premiumEndsAt, isLoading: accessLoading, isPremium, profileComplete, chatLimitReached } = useAccessStatus();
  
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const oppositeGender = currentUser?.profile?.gender === 'Erkak' ? 'Ayol' : 'Erkak';
  const [filters, setFilters] = useState({
    gender: oppositeGender,
    birthYearFrom: '',
    birthYearTo: '',
    city: '',
    maritalStatus: '',
    hijab: false,
  });
  const [showHijabFilter, setShowHijabFilter] = useState(false);
  const [savedAnketas, setSavedAnketas] = useState([]);
  const profileContainerRef = useRef(null);

  // Tinder-like interface states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [removedProfiles, setRemovedProfiles] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const cities = useMemo(() => [
    'Toshkent', 'Toshkent vil', 'Sirdaryo', 'Jizzax', 'Samarqand', 'Andijon',
    'Namangan', 'Farg\'ona', 'Qashqadaryo', 'Surhondaryo', 'Buxoro', 'Navoiy',
    'Xorazm', 'Qoraqolpog\'ston',
  ], []);

  const maritalStatuses = useMemo(() => ['Yolg\'iz', 'Ajrashgan', 'Beva'], []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const birthYears = useMemo(() => Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i), [currentYear]);

  const fetchSavedAnketas = useCallback(async () => {
    try {
      if (!currentUser?._id) return;

      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${api}/tg/saved-ids/${currentUser._id}`, config);
      setSavedAnketas(response.data || []);
    } catch (error) {
      console.error('Ошибка при загрузке сохранённых анкет:', error);
      setSavedAnketas([]);
    }
  }, [currentUser?._id]);

  const PAGE_LIMIT = 100;

  const fetchProfiles = useCallback(async (pageNum = 1, loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const token = localStorage.getItem('token');
      const params = {
        gender: filters.gender || undefined,
        birthYearFrom: filters.birthYearFrom || undefined,
        birthYearTo: filters.birthYearTo || undefined,
        city: filters.city || undefined,
        maritalStatus: filters.maritalStatus || undefined,
        hijab: (filters.hijab && filters.gender === 'Ayol') ? 'true' : undefined,
        page: pageNum,
        limit: PAGE_LIMIT
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const config = { params };
      if (token) config.headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${api}/tg/search`, config);
      const data = response.data.data || response.data;
      const newProfiles = Array.isArray(data) ? data : [];
      const total = response.data.total || 0;

      if (loadMore) {
        setProfiles(prev => [...prev, ...newProfiles]);
      } else {
        setProfiles(newProfiles);
        setTotalProfiles(total);
        setCurrentIndex(0);
        setRemovedProfiles([]);
      }

      const loadedCount = loadMore ? profiles.length + newProfiles.length : newProfiles.length;
      setHasMore(loadedCount < total);
      
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Profillarni yuklashda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, profiles.length]);

  // Load initial data
  useEffect(() => {
    if (!loading && currentUser) {
      fetchProfiles(1);
      fetchSavedAnketas();
    }
  }, [loading, currentUser, fetchSavedAnketas]);

  // Auto-load more profiles when user reaches the end
  useEffect(() => {
    if (!isLoading && hasMore && currentIndex + 3 >= profiles.length) {
      fetchProfiles(page + 1, true);
    }
  }, [currentIndex, profiles.length, hasMore, isLoading, fetchProfiles, page]);

  const startChat = useCallback(async (userBId) => {
    try {
      if (!profileComplete) {
        toast.error("Profil to'liq to'ldirilmagan.");
        navigate('/profile')
        return;
      }

      if (!isPremium) {
        toast.error("Chatlar limiti tugagan. Premium kerak.");
        navigate('/premium')
        return;
      }

      if (!currentUser?._id) {
        toast.error('Avval tizimga kiring.');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Avtorizatsiya token topilmadi.');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${api}/chat`, {
        userA: currentUser._id,
        userB: userBId
      }, config);
      const chatId = response.data._id;
      if (response.data && chatId) {
        navigate(`/chat/${chatId}`);
      } else {
        toast.error('Chat ID olinmadi.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      if (error.response?.status === 401) {
        toast.error('Avtorizatsiya muammosi. Qayta kiring.');
      } else if (error.response?.status === 403) {
        toast.error('Chatni boshlash uchun ruxsat yo\'q.');
      } else {
        toast.error('Chatni boshlashda xatolik yuz berdi.');
      }
    }
  }, [currentUser?._id, navigate, chatLimitReached, isPremium, profileComplete]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'gender') {
        setShowHijabFilter(value === 'Ayol');
        if (value !== 'Ayol') {
          newFilters.hijab = false;
        }
      }
      return newFilters;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      gender: oppositeGender,
      birthYearFrom: '',
      birthYearTo: '',
      city: '',
      maritalStatus: '',
      hijab: false,
    });
    setShowHijabFilter(false);
    setSearchQuery('');
    fetchProfiles(1);
  }, [oppositeGender, fetchProfiles]);

  const getActiveFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value =>
      value !== '' && value !== false
    ).length;
  }, [filters]);

  const toggleSave = useCallback(async (anketaId, event) => {
    event?.stopPropagation();

    try {
      if (!currentUser?._id) {
        toast.error('Avval tizimga kiring.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Avtorizatsiya token topilmadi.');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (savedAnketas.includes(anketaId)) {
        await axios.post(`${api}/tg/unsave`, { userId: currentUser._id, anketaId }, config);
        setSavedAnketas(prev => prev.filter(id => id !== anketaId));
        toast.error('Saqlangan anketalardan olib tashlandi');
      } else {
        await axios.post(`${api}/tg/save`, { userId: currentUser._id, anketaId }, config);
        setSavedAnketas(prev => [...prev, anketaId]);
        toast.success('Anketalar saqlanadigan bo\'limga qo\'shildi');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error("Xatolik yuz berdi");
    }
  }, [currentUser?._id, savedAnketas]);

  // Handle swipe actions
  const handleSwipe = (direction, profileId) => {
    setDirection(direction);
    
    if (direction === 'right') {
      toggleSave(profileId);
    }
    
    setRemovedProfiles([...removedProfiles, profileId]);
    setCurrentIndex(prev => prev + 1);
  };

  // Undo last action
  const undoRemove = () => {
    if (removedProfiles.length > 0) {
      const lastRemoved = removedProfiles.pop();
      setRemovedProfiles([...removedProfiles]);
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading || (!currentUser && !loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Check if chat is possible with current profile
  const canStartChat = currentIndex < profiles.length && 
                       currentUser?._id !== profiles[currentIndex]?._id && 
                       currentUser?.profile?.gender !== profiles[currentIndex]?.profile?.gender;

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Tasodifiy Profillar</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filterlar
                {getActiveFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-red-500">
                    {getActiveFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Panel */}
        {isFiltersOpen && (
          <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Filterlar
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFiltersOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Jins</Label>
                  <Select
                    value={filters.gender}
                    onValueChange={(value) => handleFilterChange('gender', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Jinsni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Erkak">👨 Erkak</SelectItem>
                      <SelectItem value="Ayol">👩 Ayol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthYearFrom" className="text-sm font-medium text-gray-700">Tug'ilgan yil (dan)</Label>
                  <Select
                    value={filters.birthYearFrom}
                    onValueChange={(value) => handleFilterChange('birthYearFrom', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Yilni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {birthYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthYearTo" className="text-sm font-medium text-gray-700">Tug'ilgan yil (gacha)</Label>
                  <Select
                    value={filters.birthYearTo}
                    onValueChange={(value) => handleFilterChange('birthYearTo', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Yilni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {birthYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">Viloyat</Label>
                  <Select
                    value={filters.city}
                    onValueChange={(value) => handleFilterChange('city', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Viloyatni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          <MapPin className="w-3 h-3 mr-2 inline" />
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700">Oilaviy holat</Label>
                  <Select
                    value={filters.maritalStatus}
                    onValueChange={(value) => handleFilterChange('maritalStatus', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Holatni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tozalash
                </Button>
                <Button
                  onClick={() => {
                    fetchProfiles(1);
                    setIsFiltersOpen(false);
                  }}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Natijalarni ko'rish
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Tinder-like interface */}
        <div ref={profileContainerRef} className="h-[80vh] max-w-md mx-auto relative">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Profillar yuklanmoqda...</p>
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Hech qanday profil topilmadi</h3>
                    <p className="text-gray-600 mb-4">Qidiruv mezonlaringizni o'zgartirib ko'ring</p>
                    <Button onClick={resetFilters} variant="outline">
                      Barcha filterlarni tozalash
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                  {profiles[currentIndex] && (
                    <motion.div
                      key={profiles[currentIndex]._id}
                      className="absolute w-full h-full"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ 
                        x: direction === 'right' ? 500 : -500, 
                        opacity: 0,
                        rotate: direction === 'right' ? 30 : -30
                      }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 300, 
                        damping: 30
                      }}
                    >
                      <TinderCard
                        profile={profiles[currentIndex]}
                        onSwipe={handleSwipe}
                        navigate={navigate}
                        savedAnketas={savedAnketas}
                        toggleSave={toggleSave}
                        currentUser={currentUser}
                        undoRemove={undoRemove}              // 🆕
                        startChat={startChat}                // 🆕
                        canStartChat={canStartChat}          // 🆕
                        removedProfiles={removedProfiles}    // 🆕
                        currentIndex={currentIndex} // ← qo‘shing!
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Loading indicator for new profiles */}
                {isLoadingMore && (
                  <motion.div
                    className="absolute bottom-4 left-0 right-0 flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Loader className="w-6 h-6 text-blue-500 animate-spin" />
                  </motion.div>
                )}

                {/* No more profiles message */}
                {currentIndex >= profiles.length && !hasMore && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <Users className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Barcha profillar ko'rib chiqildi
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Yangi profillar ko'rish uchun filterlarni o'zgartiring
                    </p>
                    <Button 
                      onClick={() => {
                        resetFilters();
                        fetchProfiles(1);
                      }}
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Filterlarni tozalash
                    </Button>
                  </div>
                )}
              </div>
                          
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Random;