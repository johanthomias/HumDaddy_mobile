import httpClient from './httpClient';

/**
 * Types pour les réponses OTP
 */
export interface OtpRequestResponse {
  message: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  username?: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  is18Plus?: boolean;
  role: string;
}

export interface OtpVerifyResponse {
  accessToken: string;
  user: User;
  isNewUser?: boolean;
}

/**
 * API pour la gestion OTP
 *
 * Endpoints backend réels :
 * - POST /v1/auth/request-otp-sms
 * - POST /v1/auth/verify-otp-sms
 */
export const otpApi = {
  /**
   * Demande l'envoi d'un code OTP par SMS
   * @param phoneNumber - Numéro de téléphone (format international recommandé: +33...)
   */
  requestOtp: async (phoneNumber: string): Promise<OtpRequestResponse> => {
    const response = await httpClient.post<OtpRequestResponse>('/v1/auth/request-otp-sms', {
      phoneNumber,
    });
    return response.data;
  },

  /**
   * Vérifie le code OTP reçu par SMS
   * @param phoneNumber - Numéro de téléphone
   * @param code - Code OTP à 6 chiffres
   * @returns Token d'accès et informations utilisateur
   */
  verifyOtp: async (phoneNumber: string, code: string): Promise<OtpVerifyResponse> => {
    const response = await httpClient.post<OtpVerifyResponse>('/v1/auth/verify-otp-sms', {
      phoneNumber,
      code,
    });
    return response.data;
  },
};
