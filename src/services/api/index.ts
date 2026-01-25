// Export centralisé des services API
export { otpApi } from './otpApi';
export { userApi } from './userApi';
export { uploadApi } from './uploadApi';
export { giftApi } from './giftApi';
export { stripeConnectApi } from './stripeConnectApi';
export { walletApi } from './walletApi';
export { updatesApi, badgeLabels } from './updatesApi';
export { ApiError, getErrorMessage } from './apiError';
export { API_CONFIG } from './apiConfig';
export type { User, OtpVerifyResponse, OtpRequestResponse } from './otpApi';
export type { UpdateUserPayload } from './userApi';
export type { UploadResponse } from './uploadApi';
export type { Gift, CreateGiftPayload, UpdateGiftPayload, FundedGift, GiftMediaResponse } from './giftApi';
export type { StripeConnectStatus } from './stripeConnectApi';
export type { WalletSummary, WalletActivityItem, WalletActivityResponse, PayoutRequest, PayoutResponse, Transaction, TransactionsResponse, TransactionMediaResponse } from './walletApi';
export type { Update } from './updatesApi';
