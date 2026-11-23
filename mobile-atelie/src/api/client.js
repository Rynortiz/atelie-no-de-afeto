import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, REQUEST_TIMEOUT, STORAGE_KEYS } from './config';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;

    let message = 'Não foi possível conectar ao servidor.';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.code === 'ECONNABORTED') {
      message = 'A requisição demorou demais. Tente novamente.';
    } else if (status === 401) {
      message = 'Sessão expirada. Faça login novamente.';
    } else if (status === 403) {
      message = 'Você não tem permissão para esta ação.';
    } else if (status >= 500) {
      message = 'Erro no servidor. Tente novamente em instantes.';
    }

    return Promise.reject({ status, message, original: error });
  },
);

export default client;
