import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Calendar, 
  MapPin, 
  Heart, 
  GraduationCap, 
  Camera,
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Globe,
  Instagram,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import api from '../Utils/api';

const ViewProfile = () => {
  const { currentUser, loading } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    religious: false,
    education: false,
    marriage: false,
    photos: false
  });

  const getGenderLabel = (gender) => {
    const labels = { Erkak: 'Erkak', Ayol: 'Ayol' };
    return labels[gender] || '—';
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      setProfileLoading(true);
      const response = await axios.get(`${api}/tg/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Profilni yuklashda xatolik yuz berdi.');
      if (error.response?.status === 401) {
        navigate('/dashboard');
      } else if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
      fetchUserProfile();
  }, [id]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <CardContent className="relative pt-0">
              <div className="flex flex-col items-center -mt-16 pb-6">
                <Skeleton className="h-32 w-32 rounded-full border-4 border-white shadow-lg" />
                <div className="mt-4 text-center space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profil topilmadi</h3>
            <p className="text-gray-600 mb-6">Siz qidirayotgan profil mavjud emas</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Orqaga qaytish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = () => {
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    } else if (userProfile.username) {
      return userProfile.username[0].toUpperCase();
    }
    return 'U';
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderField = (label, value, icon) => (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-500">{icon}</div>}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-sm text-gray-900 font-medium">{value || '—'}</span>
    </div>
  );

  const renderBooleanField = (label, value, icon) => (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-500">{icon}</div>}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <Badge variant={value ? "default" : "secondary"} className="text-xs">
        {value ? (
          <><CheckCircle className="h-3 w-3 mr-1" /> Ha</>
        ) : (
          <><XCircle className="h-3 w-3 mr-1" /> Yo'q</>
        )}
      </Badge>
    </div>
  );

  const getAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const sections = [
    {
      key: 'profile',
      title: 'Shaxsiy ma\'lumotlar',
      icon: <User className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          {renderField('Jins', getGenderLabel(userProfile.profile?.gender))}
          {renderField(
            'Tug‘ilgan sana',
            userProfile.profile?.birthDate 
              ? (() => {
                  const d = new Date(userProfile.profile.birthDate);
                  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth()+1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                })()
              : '—'
          )}
          {renderField('Viloyat', userProfile.profile?.city, <MapPin className="h-4 w-4" />)}
          {renderField('Millat', userProfile.profile?.nationality, <Globe className="h-4 w-4" />)}
          {renderField('Oilaviy holat', userProfile.profile?.maritalStatus)}
          {renderBooleanField('Farzandlari bormi', userProfile.profile?.hasChildren)}
          {renderBooleanField('Ko\'chib o\'tishga tayyormi', userProfile.profile?.readyForRelocation)}
        </div>
      ),
    },
    {
      key: 'religious',
      title: 'Diniy amaliyot',
      icon: <Heart className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          {renderField('Namoz', userProfile.religiousPractice?.prayer)}
          {userProfile.profile?.gender === 'Ayol' && 
            renderBooleanField('Hijob', userProfile.religiousPractice?.hijab)
          }
        </div>
      ),
    },
    {
      key: 'education',
      title: 'Ta\'lim va kasb',
      icon: <GraduationCap className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          {renderField('Ta\'lim darajasi', userProfile.education?.degree)}
          {renderField('Yo\'nalish', userProfile.education?.field)}
          {renderField('Kasb', userProfile.education?.profession)}
        </div>
      ),
    },
    {
      key: 'marriage',
      title: 'Nikoh rejalari',
      icon: <Heart className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          {renderBooleanField('Ota-onalar roziligi', userProfile.marriageGoals?.parentApproval)}
        </div>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-center" richColors />
      
      <div className="mx-auto max-w-2xl p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Profil ko'rish</h1>
        </div>

        <Card className="mb-6 overflow-hidden shadow-lg">
          {/* <div className="h-32 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div> */}
          
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center">
              <Avatar className="h-62 w-62 border-4 border-white shadow-lg">
                {userProfile.photo_url ? (
                  <AvatarImage src={api+userProfile.photo_url} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {userProfile.first_name} {userProfile.last_name}
                </h2>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    <Shield className="h-3 w-3 mr-1" />
                    ID: {userProfile.telegramId}
                  </Badge>
                  <Badge variant={userProfile.isVerified ? "default" : "secondary"} className="text-xs px-3 py-1">
                    {userProfile.isVerified ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Tasdiqlangan</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> Tasdiqlanmagan</>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 w-full">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Ro'yxatdan o'tgan</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.key} className="shadow-sm">
              <CardHeader className="pb-3">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full text-left flex items-center justify-between hover:text-gray-600 hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">{section.icon}</div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </CardTitle>
                  </div>
                  <div className="text-gray-400">
                    {expandedSections[section.key] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </button>
              </CardHeader>
              
              {expandedSections[section.key] && (
                <CardContent className="pt-0">
                  {section.content}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;