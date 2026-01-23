import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/services/auth/AuthContext';
import { I18nProvider } from './src/services/i18n';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}
