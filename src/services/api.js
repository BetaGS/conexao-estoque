import axios from 'axios';
import { io } from 'socket.io-client';

export const BASE_URL = 'https://conexao-estoque-backends.onrender.com';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
});

export const socket = io(BASE_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}