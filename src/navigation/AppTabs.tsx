import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabsParamList } from '../types/navigation';
import HomeScreen from '../screens/app/HomeScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}
