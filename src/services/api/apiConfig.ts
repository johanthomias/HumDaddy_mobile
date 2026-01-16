/**
 * Configuration API pour l'application mobile HumDaddy
 *
 * La baseURL est configurée via la variable d'environnement EXPO_PUBLIC_API_URL.
 * Voir .env.example pour les instructions de configuration.
 *
 * IMPORTANT - Pour device physique (iPhone/Android avec Expo Go) :
 * - localhost ne fonctionne pas depuis un device physique
 * - Créez un fichier .env avec votre IP locale
 * - Exemple : EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
 */

const FALLBACK_URL = 'http://localhost:4000';

/**
 * Valide et retourne l'URL de l'API
 */
function getBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  // Si pas de variable d'env, utiliser le fallback
  if (!envUrl) {
    if (__DEV__) {
      console.log('[API] EXPO_PUBLIC_API_URL non définie, fallback sur', FALLBACK_URL);
    }
    return FALLBACK_URL;
  }

  // Valider que l'URL commence par http:// ou https://
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    if (__DEV__) {
      console.warn(
        '[API] EXPO_PUBLIC_API_URL invalide (doit commencer par http:// ou https://):',
        envUrl
      );
      console.warn('[API] Fallback sur', FALLBACK_URL);
    }
    return FALLBACK_URL;
  }

  return envUrl;
}

export const API_CONFIG = {
  baseURL: getBaseUrl(),
  timeout: 10000,
};

// Log en dev pour debug
if (__DEV__) {
  console.log('[API] baseURL =', API_CONFIG.baseURL);
}
