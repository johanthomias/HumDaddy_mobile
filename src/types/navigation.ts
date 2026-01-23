import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Onboarding: undefined;
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
  EditGift: {
    giftId: string;
  };
};

export type WalletStackParamList = {
  WalletMain: undefined;
  TransactionDetail: {
    transactionId: string;
  };
};

export type AppTabsParamList = {
  Home: undefined;
  Gifts: NavigatorScreenParams<GiftStackParamList>;
  Add: undefined;
  Wallet: NavigatorScreenParams<WalletStackParamList>;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<AppTabsParamList>;
  StripeReturn: undefined;
};
