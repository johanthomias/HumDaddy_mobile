import httpClient from './httpClient';

/**
 * Types pour le Wallet
 */
export interface WalletSummary {
  currency: string;
  available: number; // en centimes
  pending: number; // en centimes
  totalReceived: number; // en centimes
  canPayout: boolean;
  reasonsBlocked: string[];
  minPayout: number; // en centimes (10000 = 100€)
  stripe: {
    accountId: string | null;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    onboardingStatus: 'pending' | 'actif' | 'restricted' | 'disabled';
    requirements: Record<string, unknown>;
  };
}

export interface WalletActivityItem {
  id: string;
  type: 'received' | 'payout';
  amount: number; // en centimes (positif pour reçu, négatif pour payout)
  fee: number; // frais en centimes
  currency: string;
  status: string;
  date: string;
  gift?: {
    id: string;
    title: string;
    imageUrl?: string;
  } | null;
  donor?: {
    pseudo: string;
    message: string;
  } | null;
  stripePayoutId?: string;
}

export interface WalletActivityResponse {
  items: WalletActivityItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PayoutRequest {
  amount: number; // en centimes
  speed?: 'instant' | 'standard';
}

export interface PayoutResponse {
  id: string;
  stripePayoutId: string;
  amount: number;
  currency: string;
  status: string;
  speed: 'instant' | 'standard';
  arrivalDate: string | null;
}

/**
 * API pour le Wallet
 */
export const walletApi = {
  /**
   * Récupère le résumé du wallet (solde, statut payout, etc.)
   */
  getSummary: async (): Promise<WalletSummary> => {
    const response = await httpClient.get<WalletSummary>('/v1/wallet/summary');
    return response.data;
  },

  /**
   * Récupère l'historique d'activité (paiements reçus + retraits)
   * @param params - Paramètres de pagination
   */
  listActivity: async (params?: {
    limit?: number;
    cursor?: string;
  }): Promise<WalletActivityResponse> => {
    const response = await httpClient.get<WalletActivityResponse>('/v1/wallet/activity', {
      params: {
        limit: params?.limit || 20,
        cursor: params?.cursor,
      },
    });
    return response.data;
  },

  /**
   * Demande un retrait vers le compte bancaire
   * @param payload - Montant en centimes et vitesse
   */
  createPayout: async (payload: PayoutRequest): Promise<PayoutResponse> => {
    const response = await httpClient.post<PayoutResponse>('/v1/wallet/payouts', {
      amount: payload.amount,
      speed: payload.speed || 'standard',
    });
    return response.data;
  },
};
