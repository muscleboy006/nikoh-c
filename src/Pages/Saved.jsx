import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import api from '../Utils/api';
import { MapPin, Calendar, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Saved = () => {
  const { currentUser } = useAuth();
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [savedAnketas, setSavedAnketas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedProfiles();
    fetchSavedAnketas(); // Добавлен вызов для загрузки сохраненных анкет
  }, []);

  const fetchSavedProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${api}/tg/saved/${currentUser._id}`, config);
      setSavedProfiles(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке сохранённых анкет:', error);
    }
  };

  // Добавлена функция для загрузки ID сохраненных анкет
  const fetchSavedAnketas = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${api}/tg/saved/${currentUser._id}`, config);
      setSavedAnketas(response.data); 
    } catch (error) {
      console.error('Ошибка при загрузке ID сохранённых анкет:', error);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '—';
    const ageDifMs = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  const toggleSave = async (anketaId) => {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    
    try {
      if (savedAnketas.includes(anketaId)) {
        await axios.post(`${api}/tg/unsave`, { userId: currentUser._id, anketaId }, config);
        setSavedAnketas(prev => prev.filter(id => id !== anketaId));
        setSavedProfiles(prev => prev.filter(profile => profile._id !== anketaId)); // Удаляем из списка
      } else {
        await axios.post(`${api}/tg/save`, { userId: currentUser._id, anketaId }, config);
        setSavedAnketas(prev => [...prev, anketaId]);
      }
    } catch (error) {
      console.error("Xatolik yuz berdi", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Saqlangan anketalar</h1>

      {savedProfiles.length === 0 ? (
        <div className="text-center text-gray-500">Saqlangan anketalar yo'q</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProfiles.map((profile) => (
            <Card
              key={profile._id}
              className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:scale-[1.02]"
              onClick={() => navigate(`/anketa/${profile._id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-3 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                      {profile.photo_url ? (
                        <AvatarImage src={api+profile.photo_url} alt="Аватар" />
                      ) : (
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                          {getInitials(profile.first_name, profile.last_name, profile.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{profile.profile?.gender === 'Erkak' ? '👨' : profile.profile?.gender === 'Ayol' ? '👩' : '👤'}</span>
                      <span>{calculateAge(profile.profile?.birthDate)} yosh</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{profile.profile?.city || 'Shahar ko\'rsatilmagan'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      {profile.profile?.gender}
                    </Badge>
                    {profile.profile?.hijab && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Hijob
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleSave(profile._id);
                      }}
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;