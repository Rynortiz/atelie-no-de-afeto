import { Platform } from 'react-native';

/**
 * Endereço da API conforme o ambiente de execução.
 *
 * no cel físico deixar android: 'http://localhost:3333'
 * no caso de emulador deixar android: 'http://10.0.2.2:3333'
 *
 */
const HOSTS = {
  android: 'http://10.0.2.2:3333',
  ios: 'http://localhost:3333',
};

export const API_BASE_URL = `${
  Platform.OS === 'android' ? HOSTS.android : HOSTS.ios
}/api`;

/** tempo até um timeout (ms)
 *  1000ms = 1s
*/
export const REQUEST_TIMEOUT = 15000;

export const STORAGE_KEYS = {
  token: '@nosdeafeto:token',
  user: '@nosdeafeto:user',
};
