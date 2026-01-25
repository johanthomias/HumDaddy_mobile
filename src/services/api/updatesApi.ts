import httpClient from './httpClient';

/**
 * Interface pour une actualité/update
 */
export interface Update {
  _id: string;
  badge: 'news' | 'update' | 'maintenance' | 'security';
  title: string;
  headline: string;
  description: string;
  ctaLabel?: string;
  ctaUrl?: string;
  publishedAt?: string;
}

/**
 * Labels affichés pour chaque type de badge
 */
export const badgeLabels: Record<Update['badge'], string> = {
  news: 'News',
  update: 'Update',
  maintenance: 'Maintenance',
  security: 'Sécurité',
};

/**
 * API pour récupérer les actualités publiques
 * Endpoint public, pas besoin d'authentification
 */
export const updatesApi = {
  /**
   * Récupère les actualités publiées et actives
   * @param limit Nombre max d'actualités à récupérer (défaut: 3)
   */
  listPublicUpdates: async (limit = 3): Promise<Update[]> => {
    const response = await httpClient.get<{ updates: Update[] }>(
      `/v1/public/updates?limit=${limit}`
    );
    return response.data.updates;
  },
};
