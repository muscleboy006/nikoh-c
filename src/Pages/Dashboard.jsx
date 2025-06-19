import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  User
} from 'lucide-react';
import api from '../Utils/api';

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [filters, setFilters] = useState({
    gender: '',
    birthYearFrom: '',
    birthYearTo: '',
    city: '',
    maritalStatus: '',
    hijab: false,
  });
  const [showHijabFilter, setShowHijabFilter] = useState(false);

  const cities = [
    'Toshkent', 'Toshkent vil', 'Sirdaryo', 'Jizzax', 'Samarqand', 'Andijon',
    'Namangan', 'Farg\'ona', 'Qashqadaryo', 'Surhondaryo', 'Buxoro', 'Navoiy',
    'Xorazm', 'Qoraqolpog\'ston',
  ];

  const maritalStatuses = ['Yolg\'iz', 'Ajrashgan', 'Beva'];
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!loading) {
      fetchProfiles();
    }
  }, [loading, filters]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        params: {
          gender: filters.gender,
          birthYearFrom: filters.birthYearFrom,
          birthYearTo: filters.birthYearTo,
          city: filters.city,
          maritalStatus: filters.maritalStatus,
          acceptPolygamy: filters.acceptPolygamy ? 'true' : undefined,
          hijab: filters.hijab && filters.gender === 'Ayol' ? 'true' : undefined,
        },
      };
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await axios.get(`${api}/tg/search`, config);
      setProfiles(response.data);
      setTotalProfiles(response.data.length);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Profillarni yuklashda xatolik yuz berdi.');
      setProfiles([]);
      setTotalProfiles(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
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
  };

  const resetFilters = () => {
    setFilters({
      gender: '',
      birthYearFrom: '',
      birthYearTo: '',
      city: '',
      maritalStatus: '',
      acceptPolygamy: false,
      hijab: false,
    });
    setShowHijabFilter(false);
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== false
    ).length;
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  const getGenderLabel = (gender) => {
    const labels = { Erkak: 'Erkak', Ayol: 'Ayol' };
    return labels[gender] || '—';
  };

  const getGenderIcon = (gender) => {
    return gender === 'Erkak' ? '👨' : gender === 'Ayol' ? '👩' : '👤';
  };

  const getMaritalStatusLabel = (status) => {
    const labels = {
      single: 'Yolg\'iz',
      divorced: 'Ajrashgan',
      widowed: 'Beva',
    };
    return labels[status] || '—';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '—';
    const ageDifMs = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      profile.first_name?.toLowerCase().includes(searchLower) ||
      profile.last_name?.toLowerCase().includes(searchLower) ||
      profile.username?.toLowerCase().includes(searchLower)
    );
  });

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
                <p className="text-xs text-gray-500">Halol tanishuv platformasi</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Users className="w-3 h-3 mr-1" />
                {totalProfiles} profil
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filterlar
                {getActiveFiltersCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-red-500">
                    {getActiveFiltersCount()}
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

                {showHijabFilter && (
                  <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-gray-200">
                    <input
                      type="checkbox"
                      id="hijab"
                      checked={filters.hijab}
                      onChange={(e) => handleFilterChange('hijab', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="hijab" className="text-sm font-medium text-gray-700">
                      Hijob
                    </Label>
                  </div>
                )}
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

        {/* Results */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill().map((_, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                <Card
                  key={profile._id}
                  className="group shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:scale-[1.02]"
                  onClick={() => navigate(`/anketa/${profile._id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-3 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                          {profile.photo_url ? (
                            <AvatarImage src={profile.photo_url} alt="Аватар" />
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
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{getMaritalStatusLabel(profile.profile?.maritalStatus)}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          {getGenderLabel(profile.profile?.gender)}
                        </Badge>
                        {profile.profile?.acceptPolygamy && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            Qoshxotinlik
                          </Badge>
                        )}
                        {profile.profile?.hijab && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Hijob
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {!isLoading && filteredProfiles.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white/90"
            >
              Ko'proq yuklash
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;