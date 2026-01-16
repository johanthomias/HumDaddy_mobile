import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import LinkScreen from '../screens/auth/LinkScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import PhoneOtpScreen from '../screens/auth/PhoneOtpScreen';
import ProfileFormScreen from '../screens/auth/ProfileFormScreen';
import ProfileCustomizeScreen from '../screens/auth/ProfileCustomizeScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Link" component={LinkScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
      <Stack.Screen name="ProfileForm" component={ProfileFormScreen} />
      <Stack.Screen name="ProfileCustomize" component={ProfileCustomizeScreen} />
    </Stack.Navigator>
  );
}
