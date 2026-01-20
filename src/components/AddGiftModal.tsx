import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../theme/colors';
import { useI18n } from '../services/i18n';

interface GiftType {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  disabled?: boolean;
}

interface AddGiftModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: string) => void;
}

const giftTypes: GiftType[] = [
  {
    id: 'gift',
    icon: '🎁',
    titleKey: 'addGiftModal.gift.title',
    descriptionKey: 'addGiftModal.gift.description',
  },
  {
    id: 'giftcard',
    icon: '🎟️',
    titleKey: 'addGiftModal.giftCard.title',
    descriptionKey: 'addGiftModal.giftCard.description',
    disabled: true,
  },
  {
    id: 'paymentcard',
    icon: '💳',
    titleKey: 'addGiftModal.paymentCard.title',
    descriptionKey: 'addGiftModal.paymentCard.description',
    disabled: true,
  },
];

export default function AddGiftModal({
  visible,
  onClose,
  onSelectType,
}: AddGiftModalProps) {
  const { t } = useI18n();

  const handleSelect = (typeId: string) => {
    onSelectType(typeId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.handle} />
              <Text style={styles.title}>{t('addGiftModal.title')}</Text>
              <Text style={styles.subtitle}>
                {t('addGiftModal.gift.description')}
              </Text>

              {giftTypes.map((type) => (
                <Pressable
                  key={type.id}
                  disabled={type.disabled}
                  style={[
                    styles.optionCard,
                    type.disabled && styles.optionCardDisabled,
                  ]}
                  onPress={() => handleSelect(type.id)}
                >
                  <Text
                    style={[
                      styles.optionIcon,
                      type.disabled && styles.textDisabled,
                    ]}
                  >
                    {type.icon}
                  </Text>

                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionTitle,
                        type.disabled && styles.textDisabled,
                      ]}
                    >
                      {t(type.titleKey)}
                    </Text>

                    <Text
                      style={[
                        styles.optionDescription,
                        type.disabled && styles.textDisabled,
                      ]}
                    >
                      {t(type.descriptionKey)}
                    </Text>

                  </View>
                  <Text
                    style={[
                      styles.optionArrow,
                      type.disabled && styles.textDisabled,
                    ]}
                  >
                    ›
                  </Text>

                </Pressable>
              ))}

              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.muted,
  },
  optionArrow: {
    fontSize: 24,
    color: colors.muted,
    marginLeft: 8,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: colors.muted,
  },
  optionCardDisabled: {
    opacity: 0.4,
  },

  textDisabled: {
    color: colors.muted,
  },
});
