import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { useI18n } from '../../services/i18n';

type Props = NativeStackScreenProps<AuthStackParamList, 'Link'>;

export default function LinkScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [username, setUsername] = useState('');

  const normalizedUsername = useMemo(() => {
    return username.trim() ? username : '';
  }, [username]);

  const handleChangeUsername = (value: string) => {
    const normalized = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '');
    setUsername(normalized);
  };

  const previewUsername = normalizedUsername || t('auth.link.placeholder');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image
          source={require('../../assets/link.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.title}>{t('auth.link.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.link.subtitle')}</Text>

        <View style={styles.linkCard}>
          <Text style={styles.linkLabel}>{t('auth.link.preview')}</Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkPrefix}>humdaddy.com/</Text>
            <TextInput
              style={styles.linkInput}
              placeholder={t('auth.link.placeholder')}
              placeholderTextColor={colors.muted}
              value={username}
              onChangeText={handleChangeUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.previewText}>humdaddy.com/{previewUsername}</Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate('PhoneOtp', {
              mode: 'signup',
              prefilledUsername: normalizedUsername || undefined,
            })
          }
        >
          <Text style={styles.buttonText}>{t('auth.link.createAccount')}</Text>
        </Pressable>

        <Pressable
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonSecondaryText}>{t('auth.link.login')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 28,
    textAlign: 'left',
  },
  linkCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  linkLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  linkPrefix: {
    color: colors.muted,
    fontSize: 14,
  },
  linkInput: {
    flex: 1,
    minWidth: 120,
    color: colors.text,
    fontSize: 16,
    marginLeft: 6,
    paddingVertical: 4,
  },
  previewText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 12,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.muted,
  },
  buttonSecondaryText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
