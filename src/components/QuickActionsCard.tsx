import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useI18n } from '../services/i18n';

interface QuickAction {
  id: string;
  icon: string;
  labelKey: string;
  onPress: () => void;
  hasArrow?: boolean;
  disabled?: boolean;
}

interface QuickActionsCardProps {
  onCreateGift: () => void;
  // onCreatorFlow: () => void;
  onCreateWishlist: () => void;
  // onImportThrone: () => void;
}

export default function QuickActionsCard({
  onCreateGift,
  // onCreatorFlow,
  onCreateWishlist,
  // onImportThrone,
}: QuickActionsCardProps) {
  const { t } = useI18n();

  const actions: QuickAction[] = [
    // {
    //   id: 'creator-flow',
    //   icon: '📋',
    //   labelKey: 'home.quickActions.creatorFlow',
    //   onPress: onCreatorFlow,
    //   hasArrow: true,
    // },
    {
      id: 'create-gift',
      icon: '🎁',
      labelKey: 'home.quickActions.createGift',
      onPress: onCreateGift,
    },
    {
      id: 'create-wishlist',
      icon: '📝',
      labelKey: 'home.quickActions.wishlist',
      onPress: onCreateWishlist,
      disabled: true,
    },

    // {
    //   id: 'import-throne',
    //   icon: '👑',
    //   labelKey: 'home.quickActions.importThrone',
    //   onPress: onImportThrone,
    //   hasArrow: true,
    // },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.quickActions.title')}</Text>
      {actions.map((action, index) => (
        <Pressable
          key={action.id}
          disabled={action.disabled}
          style={[
            styles.actionRow,
            action.disabled && styles.actionRowDisabled,
            index < actions.length - 1 && styles.actionRowBorder,
          ]}
          onPress={action.onPress}
        >
          <View style={styles.actionLeft}>
            <Text
              style={[
                styles.actionIcon,
                action.disabled && styles.textDisabled,
              ]}
            >
              {action.icon}
            </Text>
            <Text
              style={[
                styles.actionLabel,
                action.disabled && styles.textDisabled,
              ]}
            >
              {t(action.labelKey)}
            </Text>
          </View>
          <Text
            style={[
              styles.actionArrow,
              action.disabled && styles.textDisabled,
            ]}
          >
            {action.hasArrow ? '›' : '+'}
          </Text>

        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  actionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 15,
    color: colors.text,
  },
  actionArrow: {
    fontSize: 20,
    color: colors.muted,
  },
  actionRowDisabled: {
    opacity: 0.4,
  },

  textDisabled: {
    color: colors.muted,
  },

  comingSoon: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
  },

});
