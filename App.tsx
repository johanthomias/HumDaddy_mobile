import React from 'react';
import { AuthProvider } from './src/services/auth/AuthContext';
import { I18nProvider } from './src/services/i18n';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </I18nProvider>
  );
}
