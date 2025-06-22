import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, Plus, Archive, Settings } from 'lucide-react';
import api from '@/Utils/api';
import { useAuth } from '@/AuthContext';

const ChatList = () => {
  const { currentUser, loading } = useAuth();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem('token');
      if (!currentUser?._id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${api}/chat/chats/${currentUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setChats(response.data);
      } catch (error) {
        console.error('Suhbatlarni yuklashda xato:', error);
        setError('Suhbatlarni yuklab bo‘lmadi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [currentUser]);

  const openChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const filteredChats = chats.filter(chat =>
    chat._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatChatId = (id) => {
    return id.length > 8 ? id.substring(0, 8) + '...' : id;
  };

  const getInitials = (chatId) => {
    return chatId.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kecha';
    } else {
      return date.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center justify-center h-64 text-center px-4">
          <div>
            <MessageCircle className="h-12 w-12 text-red-300 mb-4 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Yuklash xatosi
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Qayta urinib ko‘rish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-gray-900">Suhbatlar</h1>
          {chats.length > 0 && (
            <span className="text-sm text-gray-500">({chats.length})</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Archive className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Suhbatlarni qidirish..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredChats.map(chat => (
        <div
          key={chat._id}
          className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
          onClick={() => openChat(chat._id)}
        >
          {/* Avatar */}
          <div className="flex-shrink-0 mr-3">
            {chat.participant.photo_url ? (
              <img
                src={chat.participant.photo_url}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {chat.participant.first_name?.substring(0, 1).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {chat.participant.first_name} {chat.participant.last_name}
              </h3>
              <span className="text-xs text-gray-500">
                {formatDate(chat.updatedAt || chat.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 truncate">
                {chat.lastMessage || 'Suhbatni ochish uchun bosing'}
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 ml-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;