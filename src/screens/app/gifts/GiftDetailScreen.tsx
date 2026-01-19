import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GiftStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { giftApi, getErrorMessage, Gift } from '../../../services/api';

type Props = NativeStackScreenProps<GiftStackParamList, 'GiftDetail'>;

export default function GiftDetailScreen({ navigation, route }: Props) {
  const { giftId } = route.params;
  const [gift, setGift] = useState<Gift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadGift();
  }, [giftId]);

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

  const handleDelete = () => {
    if (!gift || gift.isPurchased) return;

    Alert.alert(
      'Supprimer le cadeau',
      'Êtes-vous sûr de vouloir supprimer ce cadeau ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await giftApi.deleteGift(giftId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erreur', getErrorMessage(err));
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
        <Text style={styles.errorText}>{error || 'Cadeau introuvable'}</Text>
        <Pressable style={styles.backButtonError} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonErrorText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const mainImage = gift.mediaUrls?.[gift.mainMediaIndex || 0] || gift.imageUrl;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Retour</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Détail</Text>
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
            <Text style={styles.statusBadgeText}>Financé</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.statusBadgeActive]}>
            <Text style={styles.statusBadgeText}>Actif</Text>
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
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{gift.description}</Text>
          </View>
        )}

        {/* Lien produit */}
        {gift.productLink && (
          <View style={styles.linkSection}>
            <Text style={styles.sectionLabel}>Lien produit</Text>
            <Text style={styles.linkText} numberOfLines={2}>
              {gift.productLink}
            </Text>
          </View>
        )}

        {/* Infos donateur si financé */}
        {gift.isPurchased && gift.purchasedBy && (
          <View style={styles.donorSection}>
            <Text style={styles.sectionLabel}>Financé par</Text>
            <View style={styles.donorCard}>
              {gift.purchasedBy.donorPhotoUrl && (
                <Image
                  source={{ uri: gift.purchasedBy.donorPhotoUrl }}
                  style={styles.donorPhoto}
                />
              )}
              <View style={styles.donorInfo}>
                <Text style={styles.donorName}>
                  {gift.purchasedBy.donorPseudo || 'Anonyme'}
                </Text>
                {gift.purchasedBy.donorMessage && (
                  <Text style={styles.donorMessage}>
                    "{gift.purchasedBy.donorMessage}"
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Galerie photos */}
        {gift.mediaUrls && gift.mediaUrls.length > 1 && (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionLabel}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {gift.mediaUrls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.galleryImage} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bouton supprimer si non financé */}
        {!gift.isPurchased && (
          <Pressable
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size={20} color={colors.accent} />
            ) : (
              <Text style={styles.deleteButtonText}>Supprimer le cadeau</Text>
            )}
          </Pressable>
        )}
      </ScrollView>
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
  donorPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
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
  deleteButton: {
    marginTop: 8,
    marginBottom: 40,
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
});
