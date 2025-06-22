import { io } from 'socket.io-client';
import api from './api';

const socket = io(api, {
  withCredentials: true,
  autoConnect: false  // Важно! Автоматически не подключаемся
});

export default socket;
