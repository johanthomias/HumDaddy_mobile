import httpClient from './httpClient';
import type { User, SocialLinks } from './otpApi';

/**
 * Payload pour la mise à jour du profil utilisateur
 */
export interface UpdateUserPayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  avatarPathname?: string;
  bannerUrl?: string;
  bannerPathname?: string;
  galleryUrls?: string[];
  is18Plus?: boolean;
  socialLinks?: SocialLinks;
}

/**
 * API pour la gestion utilisateur
 *
 * Endpoints backend réels :
 * - GET /v1/users/me (authentifié)
 * - PUT /v1/users/me (authentifié)
 */
export const userApi = {
  /**
   * Récupère les informations de l'utilisateur connecté
   * Nécessite un token d'authentification
   */
  getMe: async (): Promise<User> => {
    const response = await httpClient.get<User>('/v1/users/me');
    return response.data;
  },

  /**
   * Met à jour les informations de l'utilisateur connecté
   * Nécessite un token d'authentification
   * @param payload - Champs à mettre à jour
   */
  updateMe: async (payload: UpdateUserPayload): Promise<User> => {
    const response = await httpClient.put<User>('/v1/users/me', payload);
    return response.data;
  },
};
