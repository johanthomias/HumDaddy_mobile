import { AxiosError } from 'axios';

export interface ApiErrorData {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class ApiError extends Error {
  public statusCode?: number;
  public code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }

  /**
   * Crée une ApiError à partir d'une erreur Axios
   */
  static fromAxiosError(error: AxiosError<{ message?: string; error?: string }>): ApiError {
    // Erreur réseau (pas de réponse du serveur)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new ApiError('La requête a expiré. Vérifiez votre connexion.', undefined, 'TIMEOUT');
      }
      return new ApiError(
        'Impossible de joindre le serveur. Vérifiez votre connexion.',
        undefined,
        'NETWORK_ERROR'
      );
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || 'Une erreur est survenue';

    return new ApiError(message, status);
  }
}

/**
 * Extrait un message d'erreur lisible depuis n'importe quelle erreur
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur inattendue est survenue';
}
