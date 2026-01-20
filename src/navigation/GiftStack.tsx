import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GiftStackParamList } from '../types/navigation';

import GiftsListScreen from '../screens/app/gifts/GiftsListScreen';
import CreateGiftPhotosScreen from '../screens/app/gifts/CreateGiftPhotosScreen';
import CreateGiftInfoScreen from '../screens/app/gifts/CreateGiftInfoScreen';
import GiftDetailScreen from '../screens/app/gifts/GiftDetailScreen';
import EditGiftScreen from '../screens/app/gifts/EditGiftScreen';

const Stack = createNativeStackNavigator<GiftStackParamList>();

export default function GiftStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="GiftsList" component={GiftsListScreen} />
      <Stack.Screen name="CreateGiftPhotos" component={CreateGiftPhotosScreen} />
      <Stack.Screen name="CreateGiftInfo" component={CreateGiftInfoScreen} />
      <Stack.Screen name="GiftDetail" component={GiftDetailScreen} />
      <Stack.Screen name="EditGift" component={EditGiftScreen} />
    </Stack.Navigator>
  );
}
