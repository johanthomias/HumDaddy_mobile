import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GiftStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { giftApi, getErrorMessage, Gift } from '../../../services/api';
import { useI18n } from '../../../services/i18n';
import { useAuth } from '../../../services/auth/AuthContext';
import DonorPhotoModal from '../../../components/DonorPhotoModal';

type Props = NativeStackScreenProps<GiftStackParamList, 'GiftDetail'>;

export default function GiftDetailScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { giftId } = route.params;
  const [gift, setGift] = useState<Gift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  // Recharger les données quand l'écran reprend le focus (après édition)
  useFocusEffect(
    useCallback(() => {
      loadGift();
    }, [giftId])
  );

  const loadGift = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await giftApi.getGift(giftId);
      setGift(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!gift || gift.isPurchased) {
      Alert.alert(t('common.error'), t('gifts.detail.editDisabled'));
      return;
    }
    navigation.navigate('EditGift', { giftId });
  };

  const handleDelete = () => {
    if (!gift || gift.isPurchased) return;

    Alert.alert(
      t('gifts.detail.deleteConfirm.title'),
      t('gifts.detail.deleteConfirm.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await giftApi.deleteGift(giftId);
              navigation.goBack();
            } catch (err) {
              Alert.alert(t('common.error'), getErrorMessage(err));
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'eur' ? '€' : '$';
    return `${price.toFixed(2)} ${symbol}`;
  };

  const handleShare = async () => {
    if (!user?.username) {
      Alert.alert(t('common.error'), t('gifts.detail.shareNoUsername'));
      return;
    }

    const shareUrl = `https://humdaddy.com/${user.username}?gift=${giftId}`;
    try {
      await Share.share({
        message: shareUrl,
        url: shareUrl, // iOS
      });
    } catch (err) {
      console.warn('[GiftDetail] Share error:', err);
      Alert.alert(t('common.error'), t('gifts.detail.shareError'));
    }
  };

  const handleRequestPhoto = async (): Promise<string | null> => {
    try {
      const response = await giftApi.getGiftMedia(giftId);
      return response.donorPhotoUrl;
    } catch (err) {
      console.error('Error loading donor photo:', err);
      return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color="#7C3AED" />
      </View>
    );
  }

  if (error || !gift) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || t('errors.notFound')}</Text>
        <Pressable style={styles.backButtonError} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonErrorText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  const mainImage = gift.mediaUrls?.[gift.mainMediaIndex || 0] || gift.imageUrl;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('gifts.title')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image principale */}
        {mainImage && (
          <Image source={{ uri: mainImage }} style={styles.mainImage} />
        )}

        {/* Badge statut */}
        {gift.isPurchased ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{t('gifts.funded')}</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.statusBadgeActive]}>
            <Text style={styles.statusBadgeText}>{t('common.edit')}</Text>
          </View>
        )}

        {/* Infos cadeau */}
        <View style={styles.infoSection}>
          <Text style={styles.giftTitle}>{gift.title}</Text>
          <Text style={styles.giftPrice}>
            {formatPrice(gift.price, gift.currency)}
          </Text>
        </View>

        {/* Description */}
        {gift.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>{t('gifts.create.step2.descriptionLabel')}</Text>
            <Text style={styles.descriptionText}>{gift.description}</Text>
          </View>
        )}

        {/* Lien produit */}
        {gift.productLink && (
          <View style={styles.linkSection}>
            <Text style={styles.sectionLabel}>{t('gifts.detail.externalLink')}</Text>
            <Text style={styles.linkText} numberOfLines={2}>
              {gift.productLink}
            </Text>
          </View>
        )}

        {/* Infos donateur si financé */}
        {gift.isPurchased && gift.purchasedBy && (
          <View style={styles.donorSection}>
            <Text style={styles.sectionLabel}>{t('gifts.detail.donor.title')}</Text>
            <View style={styles.donorCard}>
              {/* Badge photo jointe - opt-in sécurisé */}
              {gift.purchasedBy.hasDonorPhoto && (
                <Pressable
                  style={styles.donorPhotoBadge}
                  onPress={() => setPhotoModalVisible(true)}
                >
                  <Ionicons name="image" size={20} color={colors.accent} />
                </Pressable>
              )}
              <View style={styles.donorInfo}>
                <Text style={styles.donorName}>
                  {gift.purchasedBy.donorPseudo || t('gifts.detail.donor.anonymous')}
                </Text>
                {gift.purchasedBy.donorMessage && (
                  <Text style={styles.donorMessage}>
                    "{gift.purchasedBy.donorMessage}"
                  </Text>
                )}
                {/* Lien "Voir le média" si photo jointe */}
                {gift.purchasedBy.hasDonorPhoto && (
                  <Pressable
                    style={styles.viewPhotoLink}
                    onPress={() => setPhotoModalVisible(true)}
                  >
                    <Text style={styles.viewPhotoLinkText}>{t('wallet.donorPhoto.seeMedia')}</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.accent} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Galerie photos */}
        {gift.mediaUrls && gift.mediaUrls.length > 1 && (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionLabel}>{t('gifts.create.step1.title')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {gift.mediaUrls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.galleryImage} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bouton partager (toujours visible) */}
        <Pressable
          style={styles.shareButton}
          onPress={handleShare}
          disabled={!user?.username}
        >
          <Text style={styles.shareButtonText}>{t('gifts.detail.share')}</Text>
        </Pressable>

        {/* Boutons d'action si non financé */}
        {!gift.isPurchased && (
          <View style={styles.actionsSection}>
            {/* Bouton modifier */}
            <Pressable
              style={styles.editButton}
              onPress={handleEdit}
            >
              <Text style={styles.editButtonText}>{t('gifts.detail.edit')}</Text>
            </Pressable>

            {/* Bouton supprimer */}
            <Pressable
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size={20} color={colors.accent} />
              ) : (
                <Text style={styles.deleteButtonText}>{t('gifts.detail.delete')}</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Modal photo donor */}
      <DonorPhotoModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onRequestPhoto={handleRequestPhoto}
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
  errorContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButtonError: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonErrorText: {
    color: colors.text,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    color: colors.muted,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBadgeActive: {
    backgroundColor: '#7C3AED',
  },
  statusBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 24,
  },
  giftTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  giftPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  linkSection: {
    marginBottom: 24,
  },
  linkText: {
    fontSize: 14,
    color: '#7C3AED',
  },
  donorSection: {
    marginBottom: 24,
  },
  donorCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  donorPhotoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  viewPhotoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  viewPhotoLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  donorMessage: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: 'italic',
  },
  gallerySection: {
    marginBottom: 24,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  actionsSection: {
    marginTop: 16,
    marginBottom: 40,
  },
  editButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
  editButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  shareButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
