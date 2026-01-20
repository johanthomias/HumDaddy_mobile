import { fr } from './locales/fr';
import { en } from './locales/en';
import type { Language } from './i18nStorage';

// Type pour les dictionnaires de traduction
export type TranslationDictionary = typeof fr;

// Dictionnaires disponibles
const dictionaries: Record<Language, TranslationDictionary> = {
  fr,
  en,
};

// Langue par défaut
export const DEFAULT_LANGUAGE: Language = 'fr';

/**
 * Récupère une valeur imbriquée dans un objet via une clé en notation pointée
 * Ex: getNestedValue(obj, 'home.welcome') => obj.home.welcome
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Remplace les paramètres dans une chaîne
 * Ex: interpolate('Bonjour {{name}}', { name: 'Alice' }) => 'Bonjour Alice'
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * Fonction de traduction
 * @param key Clé de traduction en notation pointée (ex: 'home.welcome')
 * @param language Langue cible
 * @param params Paramètres d'interpolation optionnels
 * @returns Texte traduit ou la clé si non trouvée
 */
export function translate(
  key: string,
  language: Language,
  params?: Record<string, string | number>,
): string {
  const dictionary = dictionaries[language] || dictionaries[DEFAULT_LANGUAGE];
  const value = getNestedValue(dictionary as unknown as Record<string, unknown>, key);

  if (value === undefined) {
    if (__DEV__) {
      console.warn(`[i18n] Missing translation key: "${key}" for language "${language}"`);
    }
    return key;
  }

  return interpolate(value, params);
}

/**
 * Vérifie si une clé de traduction existe
 */
export function hasTranslation(key: string, language: Language): boolean {
  const dictionary = dictionaries[language] || dictionaries[DEFAULT_LANGUAGE];
  return getNestedValue(dictionary as unknown as Record<string, unknown>, key) !== undefined;
}

export { fr, en };
