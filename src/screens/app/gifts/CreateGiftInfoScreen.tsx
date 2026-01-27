import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GiftStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { giftApi, uploadApi, getErrorMessage } from '../../../services/api';

type Props = NativeStackScreenProps<GiftStackParamList, 'CreateGiftInfo'>;

export default function CreateGiftInfoScreen({ navigation, route }: Props) {
  const { mediaAssets } = route.params;

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [productLink, setProductLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const isFormValid = title.trim() && price.trim() && description.trim();

  const handleCreate = async () => {
    if (!isFormValid) {
      Alert.alert('Champs requis', 'Titre, prix et description sont obligatoires');
      return;
    }

    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Prix invalide', 'Entrez un prix valide');
      return;
    }

    setIsLoading(true);
    setUploadStatus('');

    try {
      // 1. Créer le cadeau sans les images d'abord
      setUploadStatus('Création du cadeau...');
      const gift = await giftApi.createGift({
        title: title.trim(),
        price: priceNum,
        description: description.trim(),
        productLink: productLink.trim() || undefined,
        currency: 'eur',
      });

      // 2. Upload les images
      const mediaUrls: string[] = [];
      for (let i = 0; i < mediaAssets.length; i++) {
        setUploadStatus(`Upload image ${i + 1}/${mediaAssets.length}...`);
        try {
          const result = await uploadApi.uploadGiftMedia(gift._id, {
            uri: mediaAssets[i].uri,
            mimeType: mediaAssets[i].mimeType,
          } as any);
          mediaUrls.push(result.url);
        } catch (err) {
          console.warn(`[CreateGiftInfo] Failed to upload image ${i + 1}:`, getErrorMessage(err));
        }
      }

      // 3. Mettre à jour le cadeau avec les URLs d'images
      if (mediaUrls.length > 0) {
        setUploadStatus('Finalisation...');
        await giftApi.updateGift(gift._id, {
          mediaUrls,
          mainMediaIndex: 0,
        });
      }

      Alert.alert('Cadeau créé', 'Votre cadeau a été ajouté avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('GiftsList'),
        },
      ]);
    } catch (err) {
      const message = getErrorMessage(err);
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Retour</Text>
        </Pressable>
        <Text style={styles.title}>Infos du cadeau</Text>
        <Text style={styles.step}>2/2</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: iPhone 15 Pro Max"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Prix (EUR) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 99.99"
            placeholderTextColor={colors.muted}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez votre cadeau..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Lien produit (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor={colors.muted}
            value={productLink}
            onChangeText={setProductLink}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {uploadStatus ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size={20} color="#FD3DB5" />
            <Text style={styles.statusText}>{uploadStatus}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.createButton,
            (!isFormValid || isLoading) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size={20} color={colors.text} />
          ) : (
            <Text style={styles.createButtonText}>Créer le cadeau</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  statusText: {
    color: colors.muted,
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  createButton: {
    backgroundColor: '#FD3DB5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
