import httpClient from './httpClient';

/**
 * Interface pour un cadeau
 */
export interface Gift {
  _id: string;
  id?: string;
  baby: string;
  title: string;
  description?: string;
  mediaUrls: string[];
  mainMediaIndex: number;
  imageUrl?: string;
  price: number;
  currency: string;
  productLink?: string;
  purchasedAt?: string;
  isPurchased: boolean;
  isDeleted: boolean;
  stripeCheckoutSessionId?: string;
  optionPhotoPaid?: boolean;
  purchasedBy?: {
    donorPseudo?: string;
    donorEmail?: string;
    donorMessage?: string;
    donorPhotoUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload pour créer un cadeau
 */
export interface CreateGiftPayload {
  title: string;
  description?: string;
  price: number;
  currency?: string;
  productLink?: string;
  mediaUrls?: string[];
  mainMediaIndex?: number;
}

/**
 * Payload pour mettre à jour un cadeau
 */
export interface UpdateGiftPayload {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  productLink?: string;
  mediaUrls?: string[];
  mainMediaIndex?: number;
}

/**
 * API pour la gestion des cadeaux (baby)
 */
export const giftApi = {
  /**
   * Crée un nouveau cadeau
   */
  createGift: async (payload: CreateGiftPayload): Promise<Gift> => {
    const response = await httpClient.post<Gift>('/v1/gifts', payload);
    return response.data;
  },

  /**
   * Liste tous les cadeaux de la baby connectée
   */
  listMyGifts: async (): Promise<Gift[]> => {
    const response = await httpClient.get<Gift[]>('/v1/gifts');
    return response.data;
  },

  /**
   * Récupère un cadeau par son ID
   */
  getGift: async (giftId: string): Promise<Gift> => {
    const response = await httpClient.get<Gift>(`/v1/gifts/${giftId}`);
    return response.data;
  },

  /**
   * Met à jour un cadeau
   */
  updateGift: async (giftId: string, payload: UpdateGiftPayload): Promise<Gift> => {
    const response = await httpClient.put<Gift>(`/v1/gifts/${giftId}`, payload);
    return response.data;
  },

  /**
   * Supprime un cadeau (soft delete)
   */
  deleteGift: async (giftId: string): Promise<void> => {
    await httpClient.delete(`/v1/gifts/${giftId}`);
  },
};
