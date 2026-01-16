export type AuthStackParamList = {
  Link: undefined;
  Login: undefined;
  PhoneOtp: undefined;
  ProfileForm: {
    accessToken?: string;
    isNewUser?: boolean;
  };
  ProfileCustomize: {
    accessToken?: string;
    publicName?: string;
    is18Plus?: boolean;
  };
};

export type AppTabsParamList = {
  Home: undefined;
  Profile: undefined;
};
