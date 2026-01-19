import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigatorScreenParams, CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { useAuth } from '../../services/auth/AuthContext';
import { stripeConnectApi } from '../../services/api';
import IdentityVerificationCard from '../../components/IdentityVerificationCard';
import QuickActionsCard from '../../components/QuickActionsCard';
import AddGiftModal from '../../components/AddGiftModal';
import type { GiftStackParamList, AppStackParamList } from '../../types/navigation';
import * as WebBrowser from 'expo-web-browser';

type AppTabsWithNestedParamList = {
  Home: undefined;
  Gifts: NavigatorScreenParams<GiftStackParamList>;
  Profile: undefined;
};

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabsWithNestedParamList, 'Home'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export default function HomeScreen() {
  const { user, refreshUser, isLoading } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  // Refresh user data when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [])
  );

  // Check if identity verification is needed
  const needsIdentityVerification =
    !user?.stripeConnectAccountId ||
    user?.stripeOnboardingStatus !== 'actif' ||
    user?.stripeChargesEnabled === false;

  const publicLink = user?.username
    ? `https://humdaddy.com/${user.username}`
    : 'https://humdaddy.com/...';

  const handleCopyLink = async () => {
    if (user?.username) {
      await Clipboard.setStringAsync(publicLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleOpenPublicPage = async () => {
    if (!user?.username) return;
    await WebBrowser.openBrowserAsync(publicLink);
  };


  const handleVerifyIdentity = async () => {
    try {
      setStripeLoading(true);

      await stripeConnectApi.createAccount();
      const { url } = await stripeConnectApi.createAccountLink('mobile');

      // Ouvre Stripe onboarding
      const result = await WebBrowser.openBrowserAsync(url);

      // result.type = "opened" | "cancel" | "dismiss"
      // Ne navigate pas automatiquement : attends un vrai retour (deep link) OU laisse l'utilisateur revenir.
    } catch (error: unknown) {
      console.error('Error starting Stripe onboarding:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message, [{ text: 'OK' }]);
    } finally {
      setStripeLoading(false);
    }
  };

  const handleOpenGiftModal = () => {
    setGiftModalVisible(true);
  };

  const handleSelectGiftType = (type: string) => {
    if (type === 'gift') {
      // Navigate to gift creation wizard
      navigation.navigate('Gifts', { screen: 'CreateGiftPhotos' });
    } else {
      // Other gift types coming soon
      Alert.alert(
        'Créer un cadeau',
        `Création de ${type} - fonctionnalité à venir`,
        [{ text: 'OK' }]
      );
    }
  };

  // const handleCreatorFlow = () => {
  //   // TODO: Navigate to creator flow
  //   Alert.alert('Flux créateur', 'Fonctionnalité à venir', [{ text: 'OK' }]);
  // };

  const handleCreateWishlist = () => {
    // TODO: Navigate to wishlist creation
    Alert.alert('Liste de souhaits', 'Fonctionnalité à venir', [{ text: 'OK' }]);
  };

  const handleImportThrone = () => {
    // TODO: Navigate to Throne import
    Alert.alert('Import Throne', 'Fonctionnalité à venir', [{ text: 'OK' }]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>HumDaddy</Text>
        <Pressable style={styles.addButton} onPress={handleOpenGiftModal}>
          <Text style={styles.addButtonText}>+ Ajouter un cadeau</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome section */}
<View style={styles.welcomeSection}>
  <Text style={styles.welcomeText}>
    Bienvenue, {user?.publicName || 'Créateur'}
  </Text>

  <View style={styles.linkLine}>
    <Pressable
      style={styles.linkRow}
      onPress={handleCopyLink}
      disabled={!user?.username}
    >
      <Text
        style={[
          styles.linkText,
          !user?.username && styles.linkTextDisabled,
        ]}
        numberOfLines={1}
      >
        {publicLink}
      </Text>
      {user?.username ? (
        <Text style={styles.copyIcon}>{copiedLink ? '✓' : '📋'}</Text>
      ) : null}
    </Pressable>

    <Pressable
      style={[
        styles.publicPageButton,
        !user?.username && styles.publicPageButtonDisabled,
      ]}
      onPress={handleOpenPublicPage}
      disabled={!user?.username}
    >
      <Text
        style={[
          styles.publicPageButtonText,
          !user?.username && styles.publicPageButtonTextDisabled,
        ]}
      >
       Voir 👀
      </Text>
    </Pressable>
  </View>

  {!user?.username ? (
    <Text style={styles.noteText}>
      Configure ton pseudo pour activer ta page publique.
    </Text>
  ) : null}
</View>


        {/* Identity verification card (conditional) */}
        {needsIdentityVerification && (
          <IdentityVerificationCard
            onVerify={handleVerifyIdentity}
            isLoading={stripeLoading}
            status={user?.stripeOnboardingStatus as 'pending' | 'actif' | 'restricted' | 'disabled' | null}
          />
        )}

        {/* Total received card */}
        <View style={styles.totalCard}>
          <View style={styles.totalHeader}>
            <Text style={styles.totalLabel}>Total reçu</Text>
            <Text style={styles.totalPeriod}>Tout le temps</Text>
          </View>
          <Text style={styles.totalAmount}>
            {user?.totalReceived ? `${user.totalReceived} €` : '0 €'}
          </Text>
          <Pressable style={styles.statsLink}>
            <Text style={styles.statsLinkText}>
              Afficher plus de statistiques
            </Text>
          </Pressable>
        </View>

        {/* Quick actions */}
        <QuickActionsCard
          onCreateGift={handleOpenGiftModal}
          // onCreatorFlow={handleCreatorFlow}
          onCreateWishlist={handleCreateWishlist}
        // onImportThrone={handleImportThrone}
        />

        {/* Recent gifts */}
        <View style={styles.recentGiftsCard}>
          <Text style={styles.recentGiftsTitle}>Vos cadeaux récents</Text>
          <Text style={styles.recentGiftsEmpty}>
            Vous n'avez encore reçu aucun cadeau. Pour commencer, ajoutez un
            cadeau à votre liste de souhaits.
          </Text>
          <Pressable
            style={styles.createGiftButton}
            onPress={handleOpenGiftModal}
          >
            <Text style={styles.createGiftButtonText}>Créer un cadeau</Text>
          </Pressable>
        </View>

        {/* Latest updates section */}
        <View style={styles.updatesCard}>
          <Text style={styles.updatesTitle}>Dernières mises à jour</Text>
          <View style={styles.updateBadge}>
            <Text style={styles.updateBadgeText}>Nouvelles</Text>
          </View>
          <Text style={styles.updateHeadline}>
            HumDaddy est le nouveau nom de...
          </Text>
          <Text style={styles.updateDescription}>
            Rien n'a changé concernant l'accès à vos fonds et l'utilisation de
            la plateforme.
          </Text>
          <Pressable style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Aide</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Gift modal */}
      <AddGiftModal
        visible={giftModalVisible}
        onClose={() => setGiftModalVisible(false)}
        onSelectType={handleSelectGiftType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.primary,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.muted,
    marginRight: 8,
  },
  copyIcon: {
    fontSize: 16,
  },
  totalCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  totalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  totalPeriod: {
    fontSize: 12,
    color: colors.muted,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsLink: {
    alignSelf: 'flex-start',
  },
  statsLinkText: {
    fontSize: 14,
    color: '#7C3AED',
    textDecorationLine: 'underline',
  },
  recentGiftsCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  recentGiftsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  recentGiftsEmpty: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  createGiftButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.muted,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  createGiftButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  updatesCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  updatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  updateBadge: {
    backgroundColor: '#3B82F6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  updateBadgeText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  updateHeadline: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  updateDescription: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  publicPageButton: {
    marginLeft: 'auto',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  publicPageButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  noteText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
  },
linkLine: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

linkTextDisabled: {
  opacity: 0.6,
},

publicPageButtonDisabled: {
  opacity: 0.4,
},

publicPageButtonTextDisabled: {
  color: colors.muted,
},
});
