import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { GiftStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { giftApi, getErrorMessage, Gift } from '../../../services/api';

type Props = NativeStackScreenProps<GiftStackParamList, 'GiftsList'>;

export default function GiftsListScreen({ navigation }: Props) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadGifts = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError('');

    try {
      const data = await giftApi.listMyGifts();
      setGifts(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGifts();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadGifts(false);
  };

  const handleCreateGift = () => {
    navigation.navigate('CreateGiftPhotos');
  };

  const getGiftImage = (gift: Gift) => {
    if (gift.mediaUrls && gift.mediaUrls.length > 0) {
      return gift.mediaUrls[gift.mainMediaIndex || 0];
    }
    return gift.imageUrl;
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'eur' ? '€' : '$';
    return `${price.toFixed(2)} ${symbol}`;
  };

  const renderGiftItem = ({ item }: { item: Gift }) => {
    const imageUrl = getGiftImage(item);

    return (
      <Pressable
        style={styles.giftCard}
        onPress={() => navigation.navigate('GiftDetail', { giftId: item._id })}
      >
        <View style={styles.giftImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.giftImage} />
          ) : (
            <View style={styles.giftImagePlaceholder}>
              <Text style={styles.giftImagePlaceholderText}>?</Text>
            </View>
          )}
          {item.isPurchased && (
            <View style={styles.purchasedBadge}>
              <Text style={styles.purchasedBadgeText}>Financé</Text>
            </View>
          )}
        </View>
        <View style={styles.giftInfo}>
          <Text style={styles.giftTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.giftPrice}>
            {formatPrice(item.price, item.currency)}
          </Text>
          {item.isPurchased && item.purchasedBy?.donorPseudo && (
            <Text style={styles.donorText}>
              par {item.purchasedBy.donorPseudo}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>?</Text>
      <Text style={styles.emptyTitle}>Aucun cadeau</Text>
      <Text style={styles.emptyText}>
        Créez votre premier cadeau pour que vos fans puissent vous les offrir !
      </Text>
      <Pressable style={styles.emptyButton} onPress={handleCreateGift}>
        <Text style={styles.emptyButtonText}>Créer un cadeau</Text>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color="#FD3DB5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes cadeaux</Text>
        <Pressable style={styles.addButton} onPress={handleCreateGift}>
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadGifts()}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={gifts}
          keyExtractor={(item) => item._id}
          renderItem={renderGiftItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FD3DB5"
            />
          }
        />
      )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  giftCard: {
    width: '48%',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  giftImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  giftImage: {
    width: '100%',
    height: '100%',
  },
  giftImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftImagePlaceholderText: {
    fontSize: 32,
    color: colors.text,
  },
  purchasedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  purchasedBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  giftInfo: {
    padding: 12,
  },
  giftTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  giftPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FD3DB5',
  },
  donorText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FD3DB5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
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
  retryButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: colors.text,
    fontSize: 14,
  },
});
