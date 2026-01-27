import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useI18n } from '../services/i18n';

type StripeStatus = 'pending' | 'actif' | 'restricted' | 'disabled' | null;

interface IdentityVerificationCardProps {
  onVerify: () => void;
  isLoading?: boolean;
  status?: StripeStatus;
}

const getStatusInfo = (status: StripeStatus, t: (key: string) => string) => {
  switch (status) {
    case 'pending':
      return {
        title: t('home.verifyIdentity.pending'),
        description: t('home.verifyIdentity.loading'),
        buttonText: t('home.verifyIdentity.button'),
        emoji: '⏳',
        bgColor: '#1E3A5F',
      };
    case 'restricted':
      return {
        title: t('home.verifyIdentity.restricted'),
        description: t('home.verifyIdentity.subtitle'),
        buttonText: t('home.verifyIdentity.button'),
        emoji: '⚠️',
        bgColor: '#7C2D12',
      };
    case 'disabled':
      return {
        title: t('home.verifyIdentity.disabled'),
        description: t('home.verifyIdentity.subtitle'),
        buttonText: t('home.verifyIdentity.button'),
        emoji: '🚫',
        bgColor: '#4B1C1C',
      };
    default:
      return {
        title: t('home.verifyIdentity.title'),
        description: t('home.verifyIdentity.subtitle'),
        buttonText: t('home.verifyIdentity.button'),
        emoji: '🛡️',
        bgColor: '#1E3A5F',
      };
  }
};

export default function IdentityVerificationCard({
  onVerify,
  isLoading = false,
  status = null,
}: IdentityVerificationCardProps) {
  const { t } = useI18n();
  const info = getStatusInfo(status, t);

  return (
    <View style={[styles.container, { backgroundColor: info.bgColor }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{info.title}</Text>
        <Text style={styles.description}>{info.description}</Text>
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={onVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>{info.buttonText}</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.imageContainer}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconEmoji}>{info.emoji}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FD3DB5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    minWidth: 140,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 40,
  },
});
