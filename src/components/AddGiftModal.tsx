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

interface GiftType {
  id: string;
  icon: string;
  title: string;
  description: string;
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
    title: 'Cadeau',
    description: 'Un cadeau physique ou digital pour vos fans',
  },
  {
    id: 'giftcard',
    icon: '🎟️',
    title: 'Carte cadeau',
    description: 'Une carte cadeau Amazon, Steam, etc.',
    disabled: true,
  },
  {
    id: 'paymentcard',
    icon: '💳',
    title: 'Carte de paiement',
    description: 'Contribution directe via carte bancaire',
    disabled: true,
  },
];

export default function AddGiftModal({
  visible,
  onClose,
  onSelectType,
}: AddGiftModalProps) {
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
              <Text style={styles.title}>Ajouter un cadeau</Text>
              <Text style={styles.subtitle}>
                Choisissez le type de cadeau que vous souhaitez créer
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
                      {type.title}
                    </Text>

                    <Text
                      style={[
                        styles.optionDescription,
                        type.disabled && styles.textDisabled,
                      ]}
                    >
                      {type.description}
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
                <Text style={styles.cancelText}>Annuler</Text>
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
