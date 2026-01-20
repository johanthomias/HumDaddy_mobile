import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '../types/navigation';

import WalletMainScreen from '../screens/app/WalletScreen';
import TransactionDetailScreen from '../screens/app/wallet/TransactionDetailScreen';

const Stack = createNativeStackNavigator<WalletStackParamList>();

export default function WalletStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="WalletMain" component={WalletMainScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    </Stack.Navigator>
  );
}
