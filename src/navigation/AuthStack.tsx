import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LinkScreen from '../screens/auth/LinkScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import PhoneOtpScreen from '../screens/auth/PhoneOtpScreen';
import ProfileFormScreen from '../screens/auth/ProfileFormScreen';
import ProfileCustomizeScreen from '../screens/auth/ProfileCustomizeScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();
const ONBOARDING_SEEN_KEY = 'humdaddy_onboarding_seen';

export default function AuthStack() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
      setHasSeenOnboarding(seen === 'true');
    } catch (error) {
      console.warn('Failed to check onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={hasSeenOnboarding ? 'Link' : 'Onboarding'}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Link" component={LinkScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
      <Stack.Screen name="ProfileForm" component={ProfileFormScreen} />
      <Stack.Screen name="ProfileCustomize" component={ProfileCustomizeScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
});
