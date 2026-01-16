import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_CONFIG } from './apiConfig';
import { ApiError } from './apiError';
import { getToken } from '../auth/authStorage';

/**
 * Client HTTP Axios configuré pour l'API HumDaddy
 */
const httpClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requête pour ajouter le token d'authentification
 */
httpClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse pour normaliser les erreurs
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const apiError = ApiError.fromAxiosError(error);
    return Promise.reject(apiError);
  }
);

export default httpClient;
