import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import AppTabs from './AppTabs';
import StripeReturnScreen from '../screens/app/StripeReturnScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen
        name="StripeReturn"
        component={StripeReturnScreen}
        options={{
          headerShown: true,
          headerTitle: 'Vérification',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.text,
          headerBackTitle: 'Retour',
        }}
      />
    </Stack.Navigator>
  );
}
