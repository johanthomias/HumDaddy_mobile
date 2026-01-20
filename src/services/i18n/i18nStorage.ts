import * as SecureStore from 'expo-secure-store';

const LANGUAGE_KEY = 'app_language';

export type Language = 'fr' | 'en';

export const i18nStorage = {
  /**
   * Récupère la langue sauvegardée
   * @returns La langue ou null si non définie
   */
  getLanguage: async (): Promise<Language | null> => {
    try {
      const lang = await SecureStore.getItemAsync(LANGUAGE_KEY);
      if (lang === 'fr' || lang === 'en') {
        return lang;
      }
      return null;
    } catch (error) {
      console.warn('[i18n] Error reading language:', error);
      return null;
    }
  },

  /**
   * Sauvegarde la langue choisie
   */
  setLanguage: async (lang: Language): Promise<void> => {
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
    } catch (error) {
      console.warn('[i18n] Error saving language:', error);
    }
  },
};
