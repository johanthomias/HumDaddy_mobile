import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useI18n } from '../services/i18n';

interface DonorPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestPhoto: () => Promise<string | null>;
}

export default function DonorPhotoModal({
  visible,
  onClose,
  onRequestPhoto,
}: DonorPhotoModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<'confirm' | 'loading' | 'display'>('confirm');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setStep('loading');
    setError(null);

    try {
      const url = await onRequestPhoto();
      if (url) {
        setPhotoUrl(url);
        setStep('display');
      } else {
        setError(t('wallet.donorPhoto.unavailable'));
        setStep('confirm');
      }
    } catch (err) {
      console.error('Error loading donor photo:', err);
      setError(t('wallet.donorPhoto.unavailable'));
      setStep('confirm');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setPhotoUrl(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 'display'
                ? t('wallet.donorPhoto.title')
                : t('wallet.donorPhoto.warningTitle')}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Content */}
          {step === 'confirm' && (
            <View style={styles.confirmContent}>
              <View style={styles.warningIcon}>
                <Ionicons name="eye-outline" size={48} color={colors.accent} />
              </View>
              <Text style={styles.warningText}>
                {t('wallet.donorPhoto.warningMessage')}
              </Text>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.buttonRow}>
                <Pressable style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </Pressable>
                <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                  <Text style={styles.confirmButtonText}>
                    {t('wallet.donorPhoto.viewButton')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {step === 'loading' && (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          )}

          {step === 'display' && photoUrl && (
            <View style={styles.displayContent}>
              <Text style={styles.privateLabel}>
                {t('wallet.donorPhoto.privateContent')}
              </Text>
              <Image
                source={{ uri: photoUrl }}
                style={styles.photo}
                resizeMode="contain"
              />
              <Pressable style={styles.closePhotoButton} onPress={handleClose}>
                <Text style={styles.closePhotoButtonText}>{t('common.close')}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  // Confirm step
  confirmContent: {
    padding: 24,
    alignItems: 'center',
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  // Loading step
  loadingContent: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 16,
  },
  // Display step
  displayContent: {
    padding: 16,
    alignItems: 'center',
  },
  privateLabel: {
    fontSize: 12,
    color: colors.accent,
    marginBottom: 12,
    fontWeight: '500',
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  closePhotoButton: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  closePhotoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
