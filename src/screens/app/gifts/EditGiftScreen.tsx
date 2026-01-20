import React, { useState, useEffect } from 'react';
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
import { giftApi, getErrorMessage, Gift } from '../../../services/api';
import { useI18n } from '../../../services/i18n';

type Props = NativeStackScreenProps<GiftStackParamList, 'EditGift'>;

export default function EditGiftScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { giftId } = route.params;

  const [gift, setGift] = useState<Gift | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [productLink, setProductLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGift();
  }, [giftId]);

  const loadGift = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await giftApi.getGift(giftId);
      setGift(data);
      setTitle(data.title || '');
      setPrice(data.price?.toString() || '');
      setDescription(data.description || '');
      setProductLink(data.productLink || '');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = title.trim() && price.trim() && description.trim();

  const handleSave = async () => {
    if (!isFormValid || !gift) {
      Alert.alert(t('common.error'), t('gifts.create.step2.titleRequired'));
      return;
    }

    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(t('common.error'), t('gifts.create.step2.minPrice'));
      return;
    }

    setIsSaving(true);

    try {
      await giftApi.updateGift(giftId, {
        title: title.trim(),
        price: priceNum,
        description: description.trim(),
        productLink: productLink.trim() || undefined,
      });

      Alert.alert(t('common.success'), t('gifts.edit.success'), [
        {
          text: t('common.ok'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      const message = getErrorMessage(err);
      Alert.alert(t('common.error'), message);
    } finally {
      setIsSaving(false);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('gifts.edit.title')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>{t('gifts.create.step2.titleLabel')} *</Text>
          <TextInput
            style={styles.input}
            placeholder={t('gifts.create.step2.titlePlaceholder')}
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('gifts.create.step2.priceLabel')} *</Text>
          <TextInput
            style={styles.input}
            placeholder={t('gifts.create.step2.pricePlaceholder')}
            placeholderTextColor={colors.muted}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('gifts.create.step2.descriptionLabel')} *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('gifts.create.step2.descriptionPlaceholder')}
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
          <Text style={styles.label}>{t('gifts.create.step2.linkLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('gifts.create.step2.linkPlaceholder')}
            placeholderTextColor={colors.muted}
            value={productLink}
            onChangeText={setProductLink}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.saveButton,
            (!isFormValid || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size={20} color={colors.text} />
          ) : (
            <Text style={styles.saveButtonText}>{t('gifts.edit.saveButton')}</Text>
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
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
