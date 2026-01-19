import React, { useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { NavigationContainer, LinkingOptions, useNavigation, NavigationProp } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useAuth } from '../services/auth/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { colors } from '../theme/colors';
import type { AppStackParamList } from '../types/navigation';

// Deep linking configuration for Stripe return
const linking: LinkingOptions<AppStackParamList> = {
  prefixes: [Linking.createURL('/'), 'humdaddy://'],
  config: {
    screens: {
      StripeReturn: 'stripe-return',
      Tabs: {
        screens: {
          Home: 'home',
          Gifts: 'gifts',
          Wallet: 'wallet',
          Profile: 'profile',
        },
      },
    },
  },
};

// Composant pour gérer les deep links Stripe
function StripeDeepLinkHandler() {
  const { refreshUser } = useAuth();

  const handleDeepLink = useCallback(
    async (url: string) => {
      try {
        const { path } = Linking.parse(url);

        if (path === 'stripe/return' || path === 'stripe-return') {
          // Stripe onboarding terminé - rafraîchir le user
          await refreshUser();
          Alert.alert(
            'Compte Stripe mis à jour',
            'Votre compte Stripe a été synchronisé avec succès.',
          );
        } else if (path === 'stripe/refresh' || path === 'stripe-refresh') {
          // Session expirée - informer l'utilisateur
          await refreshUser();
          Alert.alert(
            'Session expirée',
            'Veuillez relancer la vérification depuis le Wallet.',
          );
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    },
    [refreshUser],
  );

  useEffect(() => {
    // Gérer les deep links quand l'app est déjà ouverte
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Vérifier si l'app a été ouverte via un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  return null;
}

export default function RootNavigator() {
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={isAuthenticated && onboardingCompleted ? linking : undefined}>
      {isAuthenticated && onboardingCompleted ? (
        <>
          <StripeDeepLinkHandler />
          <AppStack />
        </>
      ) : (
        <AuthStack />
      )}
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
