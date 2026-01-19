import httpClient from './httpClient';

export interface StripeConnectStatus {
  accountId: string | null;
  status: 'pending' | 'actif' | 'restricted' | 'disabled';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: Record<string, unknown>;
}

export const stripeConnectApi = {
  createAccount: async (): Promise<{ accountId: string }> => {
    const response = await httpClient.post<{ accountId: string }>(
      '/v1/stripe-connect/account',
    );
    return response.data;
  },

  createAccountLink: async (returnContext: 'mobile' | 'web' = 'mobile'): Promise<{ url: string }> => {
    const response = await httpClient.post<{ url: string }>(
      '/v1/stripe-connect/account-link',
      { returnContext },
    );
    return response.data;
  },

  getStatus: async (): Promise<StripeConnectStatus> => {
    const response = await httpClient.get<StripeConnectStatus>('/v1/stripe-connect/status');
    return response.data;
  },
};
