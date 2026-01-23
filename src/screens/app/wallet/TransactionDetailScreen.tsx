import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { WalletStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { walletApi, Transaction } from '../../../services/api';
import { useI18n } from '../../../services/i18n';
import DonorPhotoModal from '../../../components/DonorPhotoModal';

type Props = NativeStackScreenProps<WalletStackParamList, 'TransactionDetail'>;

// Formater les centimes en euros
const formatCents = (cents: number): string => {
  return (cents).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
};

// Formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function TransactionDetailScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const data = await walletApi.getTransaction(transactionId);
      setTransaction(data);
    } catch (error) {
      console.error('Error loading transaction:', error);
      Alert.alert(t('common.error'), t('errors.loadingData'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPhoto = async (): Promise<string | null> => {
    try {
      const response = await walletApi.getTransactionMedia(transactionId);
      return response.donorPhotoUrl;
    } catch (error) {
      console.error('Error loading donor photo:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!transaction) {
    return null;
  }

  const giftImageUrl = transaction.gift?.imageUrl || transaction.gift?.mediaUrls?.[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('wallet.transactions.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Carte Cadeau */}
        {transaction.gift && (
          <View style={styles.giftCard}>
            {giftImageUrl && (
              <Image source={{ uri: giftImageUrl }} style={styles.giftImage} />
            )}
            <View style={styles.giftInfo}>
              <Text style={styles.giftLabel}>{t('wallet.transactions.gift')}</Text>
              <Text style={styles.giftTitle}>{transaction.gift.title}</Text>
              {transaction.gift.description && (
                <Text style={styles.giftDescription} numberOfLines={2}>
                  {transaction.gift.description}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Montants */}
        <View style={styles.amountsCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>{t('wallet.transactions.amount')}</Text>
            <Text style={styles.amountValue}>{formatCents(transaction.amount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>{t('wallet.transactions.fees')}</Text>
            <Text style={styles.feeValue}>-{formatCents(transaction.feeAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>{t('wallet.transactions.net')}</Text>
            <Text style={styles.netValue}>{formatCents(transaction.amountNet)}</Text>
          </View>

          {/* Option photo */}
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>{t('wallet.transactions.optionPhoto')}</Text>
            <Text style={transaction.optionPhotoPaid ? styles.optionPhotoYes : styles.optionPhotoNo}>
              {transaction.optionPhotoPaid
                ? t('wallet.transactions.optionPhotoYes', { amount: formatCents(transaction.optionPhotoFee) })
                : t('wallet.transactions.optionPhotoNo')}
            </Text>
          </View>
        </View>

        {/* Infos Donor */}
        <View style={styles.donorCard}>
          <Text style={styles.sectionTitle}>{t('wallet.transactions.donor')}</Text>

          <View style={styles.donorInfo}>
            <View style={styles.donorDetails}>
              <Text style={styles.donorPseudo}>
                {transaction.donorPseudo || t('wallet.transactions.anonymous')}
              </Text>
              {transaction.donorEmail && (
                <Text style={styles.donorEmail}>{transaction.donorEmail}</Text>
              )}
            </View>
          </View>

          {transaction.donorMessage && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>{t('wallet.transactions.donorMessage')}</Text>
              <Text style={styles.messageText}>{transaction.donorMessage}</Text>
            </View>
          )}

          {/* Photo jointe - Opt-in sécurisé */}
          {transaction.hasDonorPhoto && (
            <Pressable
              style={styles.viewPhotoButton}
              onPress={() => setPhotoModalVisible(true)}
            >
              <View style={styles.photoBadge}>
                <Ionicons name="image" size={16} color={colors.accent} />
                <Text style={styles.photoBadgeText}>{t('wallet.donorPhoto.badge')}</Text>
              </View>
              <View style={styles.viewPhotoAction}>
                <Text style={styles.viewPhotoText}>{t('wallet.donorPhoto.seeMedia')}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.accent} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Date */}
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>{t('wallet.transactions.date')}</Text>
          <Text style={styles.dateValue}>{formatDate(transaction.createdAt)}</Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  giftCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  giftImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  giftInfo: {
    padding: 16,
  },
  giftLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  giftTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  giftDescription: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  amountsCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  netValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  optionPhotoYes: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  optionPhotoNo: {
    fontSize: 14,
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  donorCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  donorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorDetails: {
    flex: 1,
  },
  donorPseudo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  donorEmail: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  messageContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  messageLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  // Photo jointe - styles opt-in
  viewPhotoButton: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
  viewPhotoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewPhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  dateCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});
