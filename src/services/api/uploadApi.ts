import { API_CONFIG } from './apiConfig';
import { ApiError } from './apiError';
import { getToken } from '../auth/authStorage';
import type { ImagePickerAsset } from 'expo-image-picker';

export interface UploadResponse {
  url: string;
  pathname: string;
}

/**
 * Extrait le nom du fichier depuis l'URI
 */
function getFileName(uri: string, prefix: string): string {
  const uriParts = uri.split('/');
  const originalName = uriParts[uriParts.length - 1];
  // Garder l'extension originale
  const extension = originalName.includes('.') ? originalName.split('.').pop() : 'jpg';
  return `${prefix}-${Date.now()}.${extension}`;
}

/**
 * Détermine le type MIME depuis l'URI
 */
function getMimeType(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return mimeTypes[extension || ''] || 'image/jpeg';
}

/**
 * Upload une image vers le backend
 */
async function uploadImage(
  endpoint: string,
  asset: ImagePickerAsset,
  prefix: string
): Promise<UploadResponse> {
  const token = await getToken();

  const formData = new FormData();

  // Format spécial pour React Native / Expo
  const file = {
    uri: asset.uri,
    name: getFileName(asset.uri, prefix),
    type: asset.mimeType || getMimeType(asset.uri),
  };

  formData.append('file', file as unknown as Blob);

  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Ne pas définir Content-Type, fetch le fait automatiquement avec FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'Erreur lors de l\'upload',
      response.status
    );
  }

  return response.json();
}

/**
 * API pour les uploads
 */
export const uploadApi = {
  /**
   * Upload un avatar de profil
   * @param asset - Image sélectionnée via expo-image-picker
   * @returns URL et pathname de l'image uploadée
   */
  uploadProfileAvatar: async (asset: ImagePickerAsset): Promise<UploadResponse> => {
    return uploadImage('/v1/uploads/profile/avatar', asset, 'avatar');
  },

  /**
   * Upload une bannière de profil
   * @param asset - Image sélectionnée via expo-image-picker
   * @returns URL et pathname de l'image uploadée
   */
  uploadProfileBanner: async (asset: ImagePickerAsset): Promise<UploadResponse> => {
    return uploadImage('/v1/uploads/profile/banner', asset, 'banner');
  },

  /**
   * Upload une image pour un cadeau (max 3 par cadeau)
   * @param giftId - ID du cadeau
   * @param asset - Image sélectionnée via expo-image-picker
   * @returns URL et pathname de l'image uploadée
   */
  uploadGiftMedia: async (giftId: string, asset: ImagePickerAsset): Promise<UploadResponse> => {
    return uploadImage(`/v1/uploads/gifts/${giftId}/media`, asset, 'gift');
  },

  /**
   * Upload une image pour la galerie de profil (max 3 images)
   * @param asset - Image sélectionnée via expo-image-picker
   * @returns URL et pathname de l'image uploadée
   */
  uploadProfileGallery: async (asset: ImagePickerAsset): Promise<UploadResponse> => {
    return uploadImage('/v1/uploads/profile/gallery', asset, 'gallery');
  },
};
