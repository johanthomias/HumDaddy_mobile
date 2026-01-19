import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { useAuth } from '../../services/auth/AuthContext';
import { stripeConnectApi, StripeConnectStatus } from '../../services/api';
import type { AppStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'StripeReturn'>;

export default function StripeReturnScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await stripeConnectApi.getStatus();
      setStatus(result);
      // Also refresh user data in context
      await refreshUser();
    } catch (err) {
      setError('Impossible de récupérer le statut. Veuillez réessayer.');
      console.error('Error fetching Stripe status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusMessage = () => {
    if (!status) return '';

    switch (status.status) {
      case 'actif':
        return 'Votre compte est vérifié et actif. Vous pouvez maintenant recevoir des paiements.';
      case 'pending':
        return 'Votre vérification est en cours. Stripe examine vos informations.';
      case 'restricted':
        return 'Des informations supplémentaires sont requises pour activer votre compte.';
      case 'disabled':
        return 'Votre compte a été désactivé. Veuillez contacter le support.';
      default:
        return 'Statut en cours de vérification...';
    }
  };

  const getStatusColor = () => {
    if (!status) return colors.muted;

    switch (status.status) {
      case 'actif':
        return '#22c55e'; // green
      case 'pending':
        return '#f59e0b'; // amber
      case 'restricted':
        return '#ef4444'; // red
      case 'disabled':
        return '#6b7280'; // gray
      default:
        return colors.muted;
    }
  };

  const handleGoHome = () => {
    navigation.navigate({ name: 'Tabs', params: { screen: 'Home' } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vérification Stripe</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={48} color={colors.accent} />
            <Text style={styles.loadingText}>Vérification en cours...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchStatus}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusBadgeText}>
                {status?.status === 'actif' ? 'Actif' :
                 status?.status === 'pending' ? 'En attente' :
                 status?.status === 'restricted' ? 'Restreint' :
                 status?.status === 'disabled' ? 'Désactivé' : 'Inconnu'}
              </Text>
            </View>

            <Text style={styles.statusMessage}>{getStatusMessage()}</Text>

            {status && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Paiements activés:</Text>
                  <Text style={[styles.detailValue, { color: status.chargesEnabled ? '#22c55e' : '#ef4444' }]}>
                    {status.chargesEnabled ? 'Oui' : 'Non'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Virements activés:</Text>
                  <Text style={[styles.detailValue, { color: status.payoutsEnabled ? '#22c55e' : '#ef4444' }]}>
                    {status.payoutsEnabled ? 'Oui' : 'Non'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Informations soumises:</Text>
                  <Text style={[styles.detailValue, { color: status.detailsSubmitted ? '#22c55e' : '#ef4444' }]}>
                    {status.detailsSubmitted ? 'Oui' : 'Non'}
                  </Text>
                </View>
              </View>
            )}

            <Pressable style={styles.refreshButton} onPress={fetchStatus}>
              <Text style={styles.refreshButtonText}>Rafraîchir le statut</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.muted,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusMessage: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  homeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
});
