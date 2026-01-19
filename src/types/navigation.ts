import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Link: undefined;
  Login: undefined;
  PhoneOtp: {
    mode?: 'signup' | 'login';
    prefilledUsername?: string;
  };
  ProfileForm: {
    prefilledUsername?: string;
  };
  ProfileCustomize: {
    publicName?: string;
    is18Plus?: boolean;
    prefilledUsername?: string;
  };
};

export type GiftStackParamList = {
  GiftsList: undefined;
  CreateGiftPhotos: undefined;
  CreateGiftInfo: {
    mediaAssets: Array<{ uri: string; mimeType?: string }>;
  };
  GiftDetail: {
    giftId: string;
  };
};

export type AppTabsParamList = {
  Home: undefined;
  Gifts: NavigatorScreenParams<GiftStackParamList>;
  Add: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<AppTabsParamList>;
  StripeReturn: undefined;
};
