import httpClient from './httpClient';

/**
 * Types pour les réponses OTP
 */
export interface OtpRequestResponse {
  message: string;
}

export interface SocialLinks {
  onlyfans?: string;
  mym?: string;
  instagram?: string;
  twitter?: string;
  twitch?: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  galleryUrls?: string[];
  is18Plus?: boolean;
  role: string;
  socialLinks?: SocialLinks;
  publicProfileUrl?: string;
  // Stripe Connect
  stripeConnectAccountId?: string;
  stripeOnboardingStatus?: 'pending' | 'actif' | 'restricted' | 'disabled' | 'verified';
  stripeChargesEnabled?: boolean;
  stripePayoutsEnabled?: boolean;
  stripeDetailsSubmitted?: boolean;
  stripeRequirements?: Record<string, unknown>;
  // Stats
  totalReceived?: number;
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
    console.log("llala", phoneNumber)
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
