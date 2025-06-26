import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, MoreVertical, Phone, Video, Paperclip, Smile, Pin } from 'lucide-react';
import api from '@/Utils/api';
import { useAuth } from '@/AuthContext';
import io from 'socket.io-client';
import { Toaster, toast } from 'sonner';

const ChatPage = () => {
  const { currentUser, loading } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Socket.IO ni ishga tushirish
  useEffect(() => {
    const newSocket = io(api, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO ga ulandi:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO dan uzildi');
      setIsConnected(false);
    });

    newSocket.on('new_message', (message) => {
      console.log('Yangi xabar olindi:', message);
      setMessages(prevMessages => {
        const messageExists = prevMessages.some(msg => msg._id === message._id);
        if (!messageExists) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [api]);

  // Suhbat xonasiga qo‘shilish
  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join_chat', chatId);
      console.log('Suhbatga qo‘shildi:', chatId);

      return () => {
        socket.emit('leave_chat', chatId);
        console.log('Suhbatni tark etdi:', chatId);
      };
    }
  }, [socket, chatId]);

  // Suhbat xabarlarini yuklash
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const resChat = await axios.get(`${api}/chat/${chatId}?userId=${currentUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setChat(resChat.data.participant);
        console.log(resChat.data);

        const response = await axios.get(`${api}/chat/chats/${chatId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Xabarlarni yuklashda xato:', error);
      }
    };

    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  // Yangi xabarlar uchun avtomatik skroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem('token');
    const senderId = currentUser._id;
    if (!newMessage.trim()) return;
    if (newMessage.length > 1000) {
      alert('Xabar 1000 ta belgidan oshmasligi kerak');
      return;
    }

    try {
      await axios.post(
        `${api}/chat/message`,
        { chatId, senderId, text: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setNewMessage('');
    } catch (error) {
      console.error('Xabar yuborishda xato:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyMessage = (senderId) => {
    return senderId === currentUser?._id;
  };

// Проверяем только твое условие
const isMan = currentUser?.profile?.gender === 'Erkak';
const isWoman = currentUser?.profile?.gender === 'Ayol';
const isChatWithWoman = chat?.profile?.gender === 'Ayol';
const isChatWithMan = chat?.profile?.gender === 'Erkak';
const isPremium = currentUser?.isPremium || false;

let canSendMessage = true;

// Если мужчина общается с женщиной — смотрим ограничения
// if (isMan && isChatWithWoman) {
//   canSendMessage = true; // Мужик пишет женщине — всегда можно
// }

// // Если женщина общается с мужчиной — смотрим премиум
// if (isWoman && isChatWithMan) {
//   canSendMessage = true; // Женщина пишет мужчине — всегда можно
// }

// // Если мужчина отвечает женщине — проверяем премиум
// if (isMan && isChatWithWoman && !isPremium) {
//   // Здесь твое ключевое условие:
//   canSendMessage = false;
// }


  return (
    <div className="flex flex-col h-[90vh] bg-gray-50">
      <Toaster richColors position="top-center" />
      {/* Suhbat sarlavhasi */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3">
            {chat?.photo_url ? (
              <img src={api+chat.photo_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {chat?.first_name?.[0] || 'U'}
                </span>
              </div>
            )}
            <span className="text-black font-medium text-sm">
              {chat?.first_name || 'Noma\'lum'} {chat?.last_name || ''}
            </span>
          </div>
        </div>

        <div className="flex items-center SPACE-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Ulangan' : 'Uzilgan'} />
          <Button variant="ghost" size="sm" className="p-2">
            <Phone className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Video className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Xabarlar konteyneri */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Zakreplangan xabar */}
        <div className="sticky top-0 z-10 bg-blue-100 border border-blue-300 rounded-lg p-3 shadow-sm flex items-center space-x-2">
          <Pin className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-gray-700">
            Ushbu suhbatda 50 ta xabar limiti bor. Davom ettirish uchun{' '}
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Instagram
            </a>{' '}
            yoki{' '}
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Telegram
            </a>{' '}
            ga o‘ting.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Suhbatni boshlang
            </h3>
            <p className="text-gray-500">
              Ushbu suhbatda birinchi xabarni yuboring
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMine = isMyMessage(message.sender);

            return (
              <div
                key={message._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-xs lg:max-w-md">
                  <div
                    className={`px-4 py-2 rounded-2xl ${isMine
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                      }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {message.text}
                    </p>
                  </div>

                  <div className={`flex items-center mt-1 space-x-1 ${isMine ? 'justify-end' : ''}`}>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.createdAt || new Date())}
                    </span>
                    {isMine && (
                      <div className="flex space-x-1">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Xabar kiritish */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Xabar..."
              disabled={!isConnected}
              className="pr-12 py-3 rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={() => {
              if (!canSendMessage) {
                toast.error("Sizga yozgan ayolga yozish uchun premium kerak.");
                return;
              }
              handleSendMessage();
            }}
            disabled={!newMessage.trim() || !isConnected}
            className={`p-3 rounded-full transition-all ${newMessage.trim() && isConnected
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {newMessage.length > 900 && (
          <div className="mt-2 text-xs text-center">
            <span className={`${newMessage.length > 1000 ? 'text-red-500' : 'text-orange-500'}`}>
              {newMessage.length}/1000
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;