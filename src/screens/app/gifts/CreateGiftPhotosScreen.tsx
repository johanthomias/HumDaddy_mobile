import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { GiftStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { giftApi, GiftStats } from '../../../services/api';
import { useI18n } from '../../../services/i18n';

type Props = NativeStackScreenProps<GiftStackParamList, 'CreateGiftPhotos'>;

const MAX_PHOTOS = 3;

interface MediaAsset {
  uri: string;
  mimeType?: string;
}

export default function CreateGiftPhotosScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [stats, setStats] = useState<GiftStats | null>(null);
  const [checkingLimit, setCheckingLimit] = useState(true);

  // Vérifier la limite de cadeaux au chargement
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const giftStats = await giftApi.getStats();
        setStats(giftStats);
        if (!giftStats.canCreate) {
          Alert.alert(
            t('gifts.create.limitReachedTitle'),
            t('gifts.create.limitReachedMessage'),
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (err) {
        console.warn('[CreateGiftPhotos] Failed to check limit:', err);
      } finally {
        setCheckingLimit(false);
      }
    };
    checkLimit();
  }, [navigation, t]);

  const pickImage = async () => {
    if (mediaAssets.length >= MAX_PHOTOS) {
      Alert.alert('Maximum atteint', `Vous pouvez ajouter jusqu'à ${MAX_PHOTOS} photos`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setMediaAssets((prev) => [
        ...prev,
        { uri: asset.uri, mimeType: asset.mimeType },
      ]);
    }
  };

  const removeImage = (index: number) => {
    setMediaAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (mediaAssets.length === 0) {
      Alert.alert('Photo requise', 'Ajoutez au moins une photo pour votre cadeau');
      return;
    }

    navigation.navigate('CreateGiftInfo', { mediaAssets });
  };

  // Afficher un loader pendant la vérification
  if (checkingLimit) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('gifts.create.photosTitle')}</Text>
        <Text style={styles.step}>1/2</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {stats && (
          <View style={styles.limitInfo}>
            <Text style={styles.limitText}>
              {t('gifts.create.activeCount', { count: stats.activeCount, max: stats.maxActive })}
            </Text>
          </View>
        )}
        <Text style={styles.subtitle}>
          {t('gifts.create.photosSubtitle', { max: MAX_PHOTOS })}
        </Text>

        <View style={styles.photosGrid}>
          {mediaAssets.map((asset, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: asset.uri }} style={styles.photo} />
              <Pressable
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </Pressable>
              {index === 0 && (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>Principale</Text>
                </View>
              )}
            </View>
          ))}

          {mediaAssets.length < MAX_PHOTOS && (
            <Pressable style={styles.addPhotoButton} onPress={pickImage}>
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={styles.addPhotoText}>Ajouter</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.hint}>
          La première photo sera l'image principale affichée sur votre page publique.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.continueButton,
            mediaAssets.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={mediaAssets.length === 0}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitInfo: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  limitText: {
    fontSize: 13,
    color: colors.muted,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  step: {
    color: colors.muted,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 24,
    textAlign: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  photoContainer: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#7C3AED',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  mainBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  addPhotoButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.muted,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 32,
    color: colors.muted,
  },
  addPhotoText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
