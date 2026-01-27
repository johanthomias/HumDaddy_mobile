import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigatorScreenParams, CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../services/auth/AuthContext';
import { stripeConnectApi, giftApi, updatesApi, badgeLabels } from '../../services/api';
import type { FundedGift, Gift } from '../../services/api/giftApi';
import type { Update } from '../../services/api/updatesApi';
import IdentityVerificationCard from '../../components/IdentityVerificationCard';
import QuickActionsCard from '../../components/QuickActionsCard';
import AddGiftModal from '../../components/AddGiftModal';
import type { GiftStackParamList, AppStackParamList } from '../../types/navigation';
import * as WebBrowser from 'expo-web-browser';
import { useI18n } from '../../services/i18n';

const getBadgeColor = (badge: Update['badge']): string => {
  switch (badge) {
    case 'news':
      return '#3B82F6'; // blue
    case 'update':
      return '#10B981'; // green
    case 'maintenance':
      return '#F59E0B'; // amber
    case 'security':
      return '#EF4444'; // red
    default:
      return '#3B82F6';
  }
};

type AppTabsWithNestedParamList = {
  Home: undefined;
  Gifts: NavigatorScreenParams<GiftStackParamList>;
  Wallet: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabsWithNestedParamList, 'Home'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export default function HomeScreen() {
  const { t } = useI18n();
  const { user, refreshUser, isLoading } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [recentFunded, setRecentFunded] = useState<FundedGift[]>([]);
  const [loadingFunded, setLoadingFunded] = useState(false);
  const [myGifts, setMyGifts] = useState<Gift[]>([]);
  const [loadingMyGifts, setLoadingMyGifts] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<Update | null>(null);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  // Refresh user data and recent funded when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshUser();
      loadRecentFunded();
      loadMyGifts();
      loadLatestUpdate();
    }, [])
  );

  const loadRecentFunded = async () => {
    try {
      setLoadingFunded(true);
      const gifts = await giftApi.getRecentFunded(5);
      setRecentFunded(gifts);
    } catch (error) {
      console.warn('[HomeScreen] Failed to load recent funded:', error);
    } finally {
      setLoadingFunded(false);
    }
  };

  const loadMyGifts = async () => {
    try {
      setLoadingMyGifts(true);
      const gifts = await giftApi.listMyGifts();
      setMyGifts(gifts);
    } catch (error) {
      console.warn('[HomeScreen] Failed to load my gifts:', error);
    } finally {
      setLoadingMyGifts(false);
    }
  };

  const loadLatestUpdate = async () => {
    try {
      setLoadingUpdates(true);
      const updates = await updatesApi.listPublicUpdates(1);
      setLatestUpdate(updates.length > 0 ? updates[0] : null);
    } catch (error) {
      console.warn('[HomeScreen] Failed to load latest update:', error);
      setLatestUpdate(null);
    } finally {
      setLoadingUpdates(false);
    }
  };

  const handleFundedGiftPress = (giftId: string) => {
    navigation.navigate('Gifts', { screen: 'GiftDetail', params: { giftId } });
  };

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

  const handleViewStats = () => {
    navigation.navigate('Wallet');
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
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('common.error'), message, [{ text: t('common.ok') }]);
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
        t('addGiftModal.comingSoon'),
        `${type}`,
        [{ text: t('common.ok') }]
      );
    }
  };

  // const handleCreatorFlow = () => {
  //   // TODO: Navigate to creator flow
  //   Alert.alert('Flux créateur', 'Fonctionnalité à venir', [{ text: 'OK' }]);
  // };

  const handleCreateWishlist = () => {
    // TODO: Navigate to wishlist creation
    Alert.alert(t('home.quickActions.wishlist'), t('addGiftModal.comingSoon'), [{ text: t('common.ok') }]);
  };

  const handleImportThrone = () => {
    // TODO: Navigate to Throne import
    Alert.alert(t('home.quickActions.importThrone'), t('addGiftModal.comingSoon'), [{ text: t('common.ok') }]);
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
        <Image
          source={require('../../assets/logo/logo_humdaddy_long.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable style={styles.addButton} onPress={handleOpenGiftModal}>
          <Text style={styles.addButtonText}>+ {t('home.addGift')}</Text>
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
            {t('home.welcome', { name: user?.publicName || 'Créateur' })}
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
                {t('home.viewStats')} 👀
              </Text>
            </Pressable>
          </View>

          {!user?.username ? (
            <Text style={styles.noteText}>
              {t('home.yourLink')}
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
            <Text style={styles.totalLabel}>{t('home.totalReceived')}</Text>
            <Text style={styles.totalPeriod}></Text>
          </View>
          <Text style={styles.totalAmount}>
            {user?.totalReceived ? `${user.totalReceived} €` : '0 €'}
          </Text>
          <Pressable
            style={styles.statsLink}
            onPress={handleViewStats}
          >
            <Text style={styles.statsLinkText}>
              {t('home.viewStats')}
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

        {/* Recent funded gifts */}
        <View style={styles.recentFundedCard}>
          <Text style={styles.sectionTitle}>{t('home.recentFunded.title')}</Text>
          {loadingFunded ? (
            <ActivityIndicator size="small" color={colors.accent} style={styles.fundedLoader} />
          ) : recentFunded.length === 0 ? (
            <Text style={styles.emptyText}>{t('home.recentFunded.empty')}</Text>
          ) : (
            recentFunded.map((gift) => {
              const donorName = gift.transaction?.donorPseudo || t('home.recentFunded.anonymous');
              const imageUrl = gift.mediaUrls?.[gift.mainMediaIndex || 0] || gift.mediaUrls?.[0];
              return (
                <Pressable
                  key={gift._id}
                  style={styles.fundedItem}
                  onPress={() => handleFundedGiftPress(gift._id)}
                >
                  {imageUrl && (
                    <Image source={{ uri: imageUrl }} style={styles.fundedImage} />
                  )}
                  <View style={styles.fundedInfo}>
                    <Text style={styles.fundedTitle} numberOfLines={1}>{gift.title}</Text>
                    <Text style={styles.fundedDonor}>
                      {t('home.recentFunded.fundedBy', { name: donorName })}
                    </Text>
                    {gift.transaction?.donorMessage && (
                      <Text style={styles.fundedMessage} numberOfLines={2}>
                        "{gift.transaction.donorMessage}"
                      </Text>
                    )}
                  </View>
                  {/* Photo jointe - badge seulement, pas d'affichage direct */}
                  {gift.transaction?.hasDonorPhoto && (
                    <View style={styles.donorPhotoBadge}>
                      <Ionicons name="image" size={14} color={colors.accent} />
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Recent gifts */}
        <View style={styles.recentGiftsCard}>
          <Text style={styles.recentGiftsTitle}>{t('home.recentGifts.title')}</Text>
          {loadingMyGifts ? (
            <ActivityIndicator size="small" color={colors.accent} style={styles.fundedLoader} />
          ) : myGifts.length === 0 ? (
            <>
              <Text style={styles.recentGiftsEmpty}>
                {t('home.recentGifts.empty')}
              </Text>
              <Pressable
                style={styles.createGiftButton}
                onPress={handleOpenGiftModal}
              >
                <Text style={styles.createGiftButtonText}>{t('home.recentGifts.createFirst')}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={styles.lastGiftItem}
                onPress={() => navigation.navigate('Gifts', { screen: 'GiftDetail', params: { giftId: myGifts[0]._id } })}
              >
                {myGifts[0].mediaUrls?.[myGifts[0].mainMediaIndex || 0] && (
                  <Image
                    source={{ uri: myGifts[0].mediaUrls[myGifts[0].mainMediaIndex || 0] }}
                    style={styles.lastGiftImage}
                  />
                )}
                <View style={styles.lastGiftInfo}>
                  <Text style={styles.lastGiftTitle} numberOfLines={1}>{myGifts[0].title}</Text>
                  <Text style={styles.lastGiftPrice}>
                    {myGifts[0].price.toFixed(2)} {myGifts[0].currency === 'eur' ? '€' : '$'}
                  </Text>
                  {myGifts[0].isPurchased && (
                    <View style={styles.purchasedBadge}>
                      <Text style={styles.purchasedBadgeText}>Financé</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>
              {myGifts.length > 1 && (
                <Text style={styles.moreGiftsText}>
                  +{myGifts.length - 1} autre{myGifts.length > 2 ? 's' : ''} cadeau{myGifts.length > 2 ? 'x' : ''}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Latest updates section */}
        {loadingUpdates ? (
          <View style={styles.updatesCard}>
            <Text style={styles.updatesTitle}>{t('home.updates.title')}</Text>
            <ActivityIndicator size="small" color={colors.accent} style={styles.fundedLoader} />
          </View>
        ) : latestUpdate ? (
          <View style={styles.updatesCard}>
            <Text style={styles.updatesTitle}>{t('home.updates.title')}</Text>
            <View style={[styles.updateBadge, { backgroundColor: getBadgeColor(latestUpdate.badge) }]}>
              <Text style={styles.updateBadgeText}>{badgeLabels[latestUpdate.badge]}</Text>
            </View>
            <Text style={styles.updateHeadline}>
              {latestUpdate.headline}
            </Text>
            <Text style={styles.updateDescription}>
              {latestUpdate.description}
            </Text>
            {latestUpdate.ctaUrl && latestUpdate.ctaLabel && (
              <Pressable
                style={styles.helpButton}
                onPress={() => Linking.openURL(latestUpdate.ctaUrl!)}
              >
                <Text style={styles.helpButtonText}>{latestUpdate.ctaLabel}</Text>
              </Pressable>
            )}
          </View>
        ) : null}
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
    width: 140,
    height: 36,
  },
  addButton: {
    backgroundColor: '#FD3DB5',
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
    color: '#FD3DB5',
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
    backgroundColor: '#FD3DB5',
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
  // Recent funded styles
  recentFundedCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  fundedLoader: {
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  fundedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  fundedImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  fundedInfo: {
    flex: 1,
  },
  fundedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  fundedDonor: {
    fontSize: 12,
    color: colors.accent,
  },
  fundedMessage: {
    fontSize: 11,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  donorPhotoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Last gift styles
  lastGiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  lastGiftImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
  },
  lastGiftInfo: {
    flex: 1,
  },
  lastGiftTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  lastGiftPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FD3DB5',
  },
  purchasedBadge: {
    backgroundColor: '#10B981',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  purchasedBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  moreGiftsText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 12,
  },
});
