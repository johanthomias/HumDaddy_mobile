import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppTabsParamList } from '../types/navigation';
import HomeScreen from '../screens/app/HomeScreen';
import GiftStack from './GiftStack';
import WalletStack from './WalletStack';
import ProfileScreen from '../screens/app/ProfileScreen';
import AddGiftModal from '../components/AddGiftModal';
import { colors } from '../theme/colors';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { AppStackParamList } from '../types/navigation';
import { useI18n } from '../services/i18n';

const Tab = createBottomTabNavigator<AppTabsParamList>();

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.addButton} onPress={onPress}>
      <View style={styles.addButtonInner}>
        <Ionicons name="add" size={32} color={colors.text} />
      </View>
    </Pressable>
  );
}

export default function AppTabs() {
  const { t } = useI18n();
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const handleOpenGiftModal = () => {
    setGiftModalVisible(true);
  };

  const handleSelectGiftType = (type: string) => {
    setGiftModalVisible(false);
    if (type === 'gift') {
      navigation.navigate('Tabs', { screen: 'Gifts', params: { screen: 'CreateGiftPhotos' } });
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.primary,
            borderTopWidth: 0,
            height: 85,
            paddingBottom: 25,
            paddingTop: 10,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: t('tabs.home'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
                <Tab.Screen
          name="Gifts"
          component={GiftStack}
          options={{
            tabBarLabel: t('tabs.gifts'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="gift-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Add"
          component={View}
          options={{
            tabBarLabel: '',
            tabBarButton: () => <AddButton onPress={handleOpenGiftModal} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleOpenGiftModal();
            },
          }}
        />
                <Tab.Screen
          name="Wallet"
          component={WalletStack}
          options={{
            tabBarLabel: t('tabs.wallet'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      <AddGiftModal
        visible={giftModalVisible}
        onClose={() => setGiftModalVisible(false)}
        onSelectType={handleSelectGiftType}
      />
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FD3DB5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FD3DB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
