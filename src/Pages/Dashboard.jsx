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
  MessageCircle
} from 'lucide-react';
import api from '../Utils/api';
import { useAccessStatus } from '@/Utils/useAccessStatus';

// Memoized ProfileCard component to prevent unnecessary re-renders
const ProfileCard = React.memo(({ profile, navigate, savedAnketas, toggleSave, startChat, currentUser }) => {
  const getInitials = useCallback((firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  }, []);

  const getGenderLabel = useCallback((gender) => {
    const labels = { Erkak: 'Erkak', Ayol: 'Ayol' };
    return labels[gender] || '—';
  }, []);

  const getGenderIcon = useCallback((gender) => {
    return gender === 'Erkak' ? '👨' : gender === 'Ayol' ? '👩' : '👤';
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

  return (
    <Card
      key={profile._id}
      className="group shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:scale-[1.02] relative"
      onClick={() => navigate(`/anketa/${profile._id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-3 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              {profile.photo_url ? (
                <AvatarImage src={api + profile.photo_url} alt="Аватар" />
              ) : (
                <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                  {getInitials(profile.first_name, profile.last_name, profile.username)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {profile.first_name} {profile.last_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{getGenderIcon(profile.profile?.gender)}</span>
              <span>{calculateAge(profile.profile?.birthDate)} yosh</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{profile.profile?.city || 'Shahar ko\'rsatilmagan'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Moon className="w-4 h-4 text-gray-400" />
            <span>Holati: {profile.profile?.maritalStatus || 'Ko\'rsatilmagan'}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              {getGenderLabel(profile.profile?.gender)}
            </Badge>
            {profile.profile?.hijab && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                Hijob
              </Badge>
            )}
          </div>
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => toggleSave(profile._id, e)}
            className="hover:bg-white/50"
          >
            {savedAnketas.includes(profile._id) ? (
              <Heart className="w-5 h-5 text-red-500 fill-red-500 transition-all duration-200" />
            ) : (
              <Heart className="w-5 h-5 text-gray-400 transition-all duration-200" />
            )}
          </Button>
          {currentUser?._id?.toString() !== profile?._id?.toString() && currentUser?.profile?.gender !== profile?.profile?.gender ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                startChat(profile?._id?.toString());
              }}
              className="hover:bg-white/50"
            >
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
});

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { access, premiumEndsAt, isLoading: accessLoading, isPremium, profileComplete, chatLimitReached } = useAccessStatus();
  
  // Initialize currentPage from URL query parameter
  const initialPage = parseInt(new URLSearchParams(location.search).get('page')) || 1;
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const profileContainerRef = useRef(null);
  const isInitialLoad = useRef(true);

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

  const PAGE_LIMIT = 50;

  const fetchProfiles = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('token');
      const params = {
        gender: filters.gender || undefined,
        birthYearFrom: filters.birthYearFrom || undefined,
        birthYearTo: filters.birthYearTo || undefined,
        city: filters.city || undefined,
        maritalStatus: filters.maritalStatus || undefined,
        hijab: (filters.hijab && filters.gender === 'Ayol') ? 'true' : undefined,
        page,
        limit: PAGE_LIMIT
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const config = { params };
      if (token) config.headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${api}/tg/search`, config);
      const data = response.data.data || response.data;

      setProfiles(Array.isArray(data) ? data : []);
      const total = response.data.total || 0;
      setTotalProfiles(total);
      setTotalPages(Math.ceil(total / PAGE_LIMIT));
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Profillarni yuklashda xatolik yuz berdi.');
      setProfiles([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load initial data and reset page to 1 on filter change or user load
  useEffect(() => {
    if (!loading && currentUser) {
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get('page')) || 1;
      setCurrentPage(pageFromUrl);
      fetchProfiles(pageFromUrl);
      fetchSavedAnketas();
      isInitialLoad.current = true; // Mark as initial load
    }
  }, [loading, currentUser, location.search, fetchSavedAnketas]);

  // Update URL and handle scrolling on page change
  useEffect(() => {
    if (!loading && currentUser) {
      // Update URL with current page
      const params = new URLSearchParams(location.search);
      params.set('page', currentPage);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });

      // Scroll to top of profile container
      if (profileContainerRef.current) {
        profileContainerRef.current.scrollIntoView({
          behavior: isInitialLoad.current ? 'auto' : 'smooth',
        });
      } else {
        window.scrollTo({ top: 0, behavior: isInitialLoad.current ? 'auto' : 'smooth' });
      }
      isInitialLoad.current = false; // Mark initial load as complete
    }
  }, [currentPage, loading, currentUser, navigate, location.pathname]);

  const startChat = useCallback(async (userBId) => {
    try {
      if (!profileComplete) {
        toast.error("Profil to'liq to'ldirilmagan.");
        navigate('/profile')
        return;
      }

      if (chatLimitReached && !isPremium) {
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
      gender: '',
      birthYearFrom: '',
      birthYearTo: '',
      city: '',
      maritalStatus: '',
      hijab: false,
    });
    setShowHijabFilter(false);
    setSearchQuery('');
  }, []);

  const getActiveFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value =>
      value !== '' && value !== false
    ).length;
  }, [filters]);

  const filteredProfiles = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return profiles.filter(profile => {
      if (!searchQuery) return true;
      return (
        profile.first_name?.toLowerCase().includes(searchLower) ||
        profile.last_name?.toLowerCase().includes(searchLower) ||
        profile.username?.toLowerCase().includes(searchLower)
      );
    });
  }, [profiles, searchQuery]);

  const toggleSave = useCallback(async (anketaId, event) => {
    event.stopPropagation();

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
        toast.success('Saqlangan anketalardan olib tashlandi');
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

  const formatPremiumEndDate = useCallback((date) => {
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
  }, []);

  const isPremiumEnded = useMemo(() => premiumEndsAt && new Date(premiumEndsAt) < new Date(), [premiumEndsAt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nikoh.uz</h1>
                <p className="text-xs text-gray-500">Nikoh uchun tanishuv platformasi</p>
              </div>
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
                <Badge variant="secondary" className="text-sm">
                  {filteredProfiles.length} natija topildi
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {!access && premiumEndsAt && formatPremiumEndDate(premiumEndsAt) && (
          <div className="w-full max-w-lg -mt-5 mb-6">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-amber-800 mb-1">
                    <Link to='/premium' className='underline text-blue-400'>Premium</Link> muddat
                  </h3>
                  <p className={`text-xs leading-relaxed ${isPremiumEnded ? "text-red-700 font-medium" : "text-amber-700"}`}>
                    {isPremiumEnded
                      ? `Sizning premium muddatingiz ${formatPremiumEndDate(premiumEndsAt)} da tugagan`
                      : `Sizning premium muddatingiz ${formatPremiumEndDate(premiumEndsAt)} da tugaydi`}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${isPremiumEnded ? 'bg-red-400' : 'bg-amber-400'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div ref={profileContainerRef} className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill().map((_, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-[200px]">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <ProfileCard
                  key={profile._id}
                  profile={profile}
                  navigate={navigate}
                  savedAnketas={savedAnketas}
                  toggleSave={toggleSave}
                  startChat={startChat}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              variant="outline"
              disabled={currentPage === 1}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white/90"
            >
              Oldingi
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="w-10 h-10 bg-blue-600 text-white"
              disabled
            >
              {currentPage}
            </Button>
            
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              variant="outline"
              disabled={currentPage === totalPages}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white/90"
            >
              Keyingi
            </Button>
            
            <div className="ml-4 text-sm text-gray-600">
              Sahifa {currentPage} / {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;