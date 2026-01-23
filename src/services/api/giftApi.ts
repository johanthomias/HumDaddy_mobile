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
    // Option photo : l'URL n'est plus exposée, seulement hasDonorPhoto
    hasDonorPhoto?: boolean;
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
 * Stats des cadeaux
 */
export interface GiftStats {
  activeCount: number;
  maxActive: number;
  canCreate: boolean;
}

/**
 * Cadeau financé avec infos transaction
 */
export interface FundedGift {
  _id: string;
  title: string;
  mediaUrls: string[];
  mainMediaIndex: number;
  price: number;
  currency: string;
  purchasedAt: string;
  purchasedBy?: {
    donorPseudo?: string;
    donorMessage?: string;
    // Option photo : l'URL n'est plus exposée, seulement hasDonorPhoto
    hasDonorPhoto?: boolean;
  };
  transaction?: {
    amount: number;
    amountNet: number;
    feeAmount: number;
    optionPhotoPaid: boolean;
    optionPhotoFee: number;
    donorPseudo?: string;
    donorMessage?: string;
    // Option photo : l'URL n'est plus exposée, seulement hasDonorPhoto
    hasDonorPhoto?: boolean;
  };
}

/**
 * Réponse pour l'endpoint media (photo donor)
 */
export interface GiftMediaResponse {
  donorPhotoUrl: string;
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

  /**
   * Récupère les stats des cadeaux (activeCount, maxActive, canCreate)
   */
  getStats: async (): Promise<GiftStats> => {
    const response = await httpClient.get<GiftStats>('/v1/gifts/me/stats');
    return response.data;
  },

  /**
   * Récupère les derniers cadeaux financés (pour Home)
   */
  getRecentFunded: async (limit = 5): Promise<FundedGift[]> => {
    const response = await httpClient.get<{ gifts: FundedGift[] }>(
      `/v1/gifts/me/recent-funded?limit=${limit}`
    );
    return response.data.gifts;
  },

  /**
   * Récupère le média (photo donor) d'un cadeau
   * Endpoint sécurisé pour opt-in "Voir le média"
   */
  getGiftMedia: async (giftId: string): Promise<GiftMediaResponse> => {
    const response = await httpClient.get<GiftMediaResponse>(
      `/v1/gifts/${giftId}/media`
    );
    return response.data;
  },
};
