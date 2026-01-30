import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { walletApi, stripeConnectApi } from '../../services/api';
import type { WalletSummary, WalletActivityItem } from '../../services/api/walletApi';
import { useAuth } from '../../services/auth/AuthContext';
import { useI18n } from '../../services/i18n';
import { WalletStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<WalletStackParamList, 'WalletMain'>;

const MIN_PAYOUT_EUR = 100;

// Formater les centimes en euros
const formatCents = (cents: number): string => {
  return (cents / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
};

// Formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function WalletScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [activity, setActivity] = useState<WalletActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Modal retrait
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Rafraîchir le statut Stripe Connect en parallèle (fire-and-forget pour le status)
      const [summaryData, activityData] = await Promise.all([
        walletApi.getSummary(),
        walletApi.listActivity({ limit: 20 }),
        stripeConnectApi.getStatus().catch(() => null),
      ]);
      setSummary(summaryData);
      setActivity(activityData.items);
      setNextCursor(activityData.nextCursor);
      setHasMore(activityData.hasMore);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert(t('common.error'), t('errors.loadingData'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMoreActivity = async () => {
    if (loadingMore || !hasMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      const data = await walletApi.listActivity({ limit: 20, cursor: nextCursor });
      setActivity((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading more activity:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePayout = async () => {
    const amountEur = parseFloat(payoutAmount.replace(',', '.'));
    if (isNaN(amountEur) || amountEur < MIN_PAYOUT_EUR) {
      Alert.alert(t('common.error'), t('wallet.withdraw.errors.minAmount', { amount: MIN_PAYOUT_EUR }));
      return;
    }

    const amountCents = Math.round(amountEur * 100);
    const availableCents = summary?.available || 0;

    if (amountCents > availableCents) {
      Alert.alert(t('common.error'), t('wallet.withdraw.errors.insufficientBalance', { amount: formatCents(availableCents) }));
      return;
    }

    // Confirmation
    Alert.alert(
      t('wallet.withdraw.confirmTitle'),
      t('wallet.withdraw.confirmMessage', { amount: formatCents(amountCents) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              setPayoutLoading(true);
              const result = await walletApi.createPayout({
                amount: amountCents,
                speed: 'instant', // On essaie instant, fallback standard géré par le backend
              });

              setPayoutModalVisible(false);
              setPayoutAmount('');

              Alert.alert(
                t('wallet.withdraw.success.title'),
                t('wallet.withdraw.success.message', { amount: formatCents(result.amount) }) + '\n' +
                  (result.speed === 'instant' ? t('wallet.withdraw.success.instant') : t('wallet.withdraw.success.standard')) +
                  (result.arrivalDate
                    ? `\n${t('wallet.withdraw.success.arrival', { date: formatDate(result.arrivalDate) })}`
                    : ''),
              );

              // Rafraîchir les données
              loadData(true);
              refreshUser();
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : t('errors.generic');
              Alert.alert(t('common.error'), errorMessage);
            } finally {
              setPayoutLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleActivityPress = (item: WalletActivityItem) => {
    // Only navigate for received payments (not payouts)
    if (item.type === 'received') {
      navigation.navigate('TransactionDetail', { transactionId: item.id });
    }
  };

  const getPayoutStatusInfo = (status: string) => {
    switch (status) {
      case 'processing':
      case 'pending':
        return { label: t('wallet.history.payoutStatus.processing'), color: '#f59e0b' };
      case 'paid':
        return { label: t('wallet.history.payoutStatus.paid'), color: '#22c55e' };
      case 'failed':
      case 'canceled':
        return { label: t('wallet.history.payoutStatus.failed'), color: '#ef4444' };
      default:
        return { label: status, color: '#6b7280' };
    }
  };

  const renderActivityItem = ({ item }: { item: WalletActivityItem }) => {
    const isReceived = item.type === 'received';
    const isPayout = item.type === 'payout';
    const iconName = isReceived ? 'arrow-down-circle' : 'arrow-up-circle';
    const iconColor = isReceived ? '#22c55e' : '#ef4444';
    const amountColor = isReceived ? '#22c55e' : '#ef4444';
    const payoutStatus = isPayout ? getPayoutStatusInfo(item.status) : null;

    return (
      <Pressable
        style={styles.activityItem}
        onPress={() => handleActivityPress(item)}
        disabled={!isReceived}
      >
        <View style={styles.activityIcon}>
          <Ionicons name={iconName} size={28} color={iconColor} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>
            {isReceived
              ? item.gift?.title || t('wallet.history.received')
              : t('wallet.history.payout')}
          </Text>
          <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
          {item.donor?.pseudo && (
            <Text style={styles.activityDonor}>{t('wallet.history.from', { name: item.donor.pseudo })}</Text>
          )}
          {isPayout && payoutStatus && (
            <Text style={[styles.payoutStatus, { color: payoutStatus.color }]}>
              {payoutStatus.label}
            </Text>
          )}
        </View>
        <View style={styles.activityAmount}>
          <Text style={[styles.amountText, { color: amountColor }]}>
            {isReceived ? '+' : ''}{formatCents(item.amount)}
          </Text>
          {item.fee > 0 && (
            <Text style={styles.feeText}>-{formatCents(item.fee)} {t('wallet.history.fee')}</Text>
          )}
        </View>
        {isReceived && (
          <Ionicons name="chevron-forward" size={20} color={colors.muted} style={styles.chevron} />
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('wallet.title')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={colors.accent}
          />
        }
      >
        {/* Carte Solde */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('wallet.available')}</Text>
          <Text style={styles.balanceAmount}>
            {formatCents(summary?.available || 0)}
          </Text>

          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>{t('wallet.pending')}</Text>
              <Text style={styles.balanceItemValue}>
                {formatCents(summary?.pending || 0)}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>{t('wallet.totalReceived')}</Text>
              <Text style={styles.balanceItemValue}>
                {formatCents(summary?.totalReceived || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Carte Retrait */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Ionicons name="wallet-outline" size={24} color={colors.text} />
            <Text style={styles.payoutTitle}>{t('wallet.withdraw.title')}</Text>
          </View>

          {summary?.canPayout ? (
            <Pressable
              style={styles.payoutButton}
              onPress={() => setPayoutModalVisible(true)}
            >
              <Text style={styles.payoutButtonText}>{t('wallet.withdraw.button')}</Text>
            </Pressable>
          ) : (
            <View style={styles.payoutBlocked}>
              {summary?.reasonsBlocked.map((reason, index) => (
                <View key={index} style={styles.blockedReason}>
                  <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                  <Text style={styles.blockedReasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.payoutNote}>
            {t('wallet.withdraw.minAmount', { amount: MIN_PAYOUT_EUR })} • {t('wallet.withdraw.ibanNote')}
          </Text>
        </View>

        {/* Historique */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>{t('wallet.history.title')}</Text>

          {activity.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>{t('wallet.history.empty')}</Text>
            </View>
          ) : (
            <FlatList
              data={activity}
              keyExtractor={(item) => item.id}
              renderItem={renderActivityItem}
              scrollEnabled={false}
              onEndReached={loadMoreActivity}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.accent}
                    style={styles.loadingMore}
                  />
                ) : null
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Modal Retrait */}
      <Modal
        visible={payoutModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPayoutModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('wallet.withdraw.modal.title')}</Text>
              <Pressable onPress={() => setPayoutModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>
              {t('wallet.withdraw.modal.available', { amount: formatCents(summary?.available || 0) })}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.amountInput}
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                placeholder={t('wallet.withdraw.modal.placeholder')}
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <Text style={styles.minNote}>{t('wallet.withdraw.modal.minNote', { amount: MIN_PAYOUT_EUR })}</Text>

            <Pressable
              style={[
                styles.confirmButton,
                payoutLoading && styles.confirmButtonDisabled,
              ]}
              onPress={handlePayout}
              disabled={payoutLoading}
            >
              {payoutLoading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Text style={styles.confirmButtonText}>{t('wallet.withdraw.modal.confirm')}</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  payoutCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  payoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  payoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 10,
  },
  payoutButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  payoutBlocked: {
    marginBottom: 12,
  },
  blockedReason: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockedReasonText: {
    fontSize: 14,
    color: '#f59e0b',
    marginLeft: 8,
    flex: 1,
  },
  payoutNote: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  historySection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: colors.muted,
  },
  activityDonor: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  payoutStatus: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  activityAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  feeText: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
  loadingMore: {
    paddingVertical: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  modalContent: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 20,
  },
  minNote: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});
