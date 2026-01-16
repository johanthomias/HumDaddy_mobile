import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../services/auth/AuthContext';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import { colors } from '../theme/colors';

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
});
