# HumDaddy Mobile - PROJECT MEMORY

## INFORMATIONS PROJET

**Nom**: HumDaddy Mobile
**Framework**: Expo SDK 54 + React Native 0.81.5
**Langage**: TypeScript
**Styling**: React Native StyleSheet (PAS de Tailwind/NativeWind)
**État**: Étape 16 - Corrections produit

---

## ARCHITECTURE

```
mobile-app/
├── .env.example                     # Template variables d'environnement
├── .gitignore                       # Ignore .env et autres
├── README.md                        # Documentation du projet
├── App.tsx                          # Point d'entrée → AuthProvider → RootNavigator
├── src/
│   ├── assets/                      # Fichiers statiques
│   │   └── link.png                 # Visuel hero LinkScreen
│   ├── navigation/
│   │   ├── AuthStack.tsx           # Stack onboarding (Link → Login → OTP → Form → Customize)
│   │   ├── AppStack.tsx            # Stack app (Tabs + StripeReturn)
│   │   ├── AppTabs.tsx             # Tabs app (Home + Wallet + Add + Gifts + Profile) avec icônes
│   │   ├── GiftStack.tsx           # Stack cadeaux (List → Create → Detail)
│   │   └── RootNavigator.tsx       # Switch Auth/App + deep linking
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LinkScreen.tsx      # Écran d'accueil (Créer/Connexion)
│   │   │   ├── LoginScreen.tsx     # Placeholder connexion
│   │   │   ├── PhoneOtpScreen.tsx  # Saisie téléphone + OTP avec appels API
│   │   │   ├── ProfileFormScreen.tsx       # Formulaire profil (nom, 18+)
│   │   │   └── ProfileCustomizeScreen.tsx  # Avatar, banner, username, bio + upload
│   │   └── app/
│   │       ├── HomeScreen.tsx      # Dashboard principal + Stripe Connect
│   │       ├── WalletScreen.tsx    # Wallet: solde + retraits + historique
│   │       ├── ProfileScreen.tsx   # Profil complet avec édition + auto-save
│   │       ├── StripeReturnScreen.tsx  # Retour Stripe onboarding
│   │       └── gifts/
│   │           ├── GiftsListScreen.tsx       # Liste des cadeaux (grille)
│   │           ├── CreateGiftPhotosScreen.tsx # Step 1: Sélection photos (max 3)
│   │           ├── CreateGiftInfoScreen.tsx   # Step 2: Infos (titre, prix, desc, lien)
│   │           └── GiftDetailScreen.tsx       # Détail cadeau + suppression
│   ├── components/
│   │   ├── IdentityVerificationCard.tsx  # Bloc Stripe verification
│   │   ├── QuickActionsCard.tsx          # Actions rapides
│   │   └── AddGiftModal.tsx              # Modal choix type cadeau
│   ├── services/
│   │   ├── auth/
│   │   │   ├── AuthContext.tsx     # Context global d'authentification
│   │   │   └── authStorage.ts      # SecureStore pour persistance session + token
│   │   ├── i18n/
│   │   │   ├── index.ts            # Export centralisé
│   │   │   ├── i18n.ts             # Fonction translate + interpolation
│   │   │   ├── i18nStorage.ts      # SecureStore pour langue
│   │   │   ├── I18nContext.tsx     # Context + Provider + useI18n hook
│   │   │   └── locales/
│   │   │       ├── index.ts        # Export fr, en
│   │   │       ├── fr.ts           # Dictionnaire français
│   │   │       └── en.ts           # Dictionnaire anglais
│   │   └── api/
│   │       ├── index.ts            # Export centralisé des services API
│   │       ├── apiConfig.ts        # Configuration baseURL et timeout
│   │       ├── apiError.ts         # Classe ApiError et normalisation erreurs
│   │       ├── httpClient.ts       # Instance Axios avec intercepteurs
│   │       ├── otpApi.ts           # Service OTP (requestOtp, verifyOtp)
│   │       ├── userApi.ts          # Service User (getMe, updateMe)
│   │       ├── uploadApi.ts        # Service Upload (avatar, banner, gift media)
│   │       ├── giftApi.ts          # Service Gift (CRUD cadeaux)
│   │       ├── stripeConnectApi.ts # Service Stripe Connect
│   │       └── walletApi.ts        # Service Wallet (summary, activity, payout)
│   ├── theme/
│   │   └── colors.ts               # Palette de couleurs centralisée
│   └── types/
│       └── navigation.ts           # Types pour AuthStack, AppTabs, GiftStack
└── package.json
```

---

## THÈME

**Fichier**: `src/theme/colors.ts`

```typescript
{
  primary: '#0A1628',      // Bleu foncé principal
  primaryLight: '#1a2942', // Bleu un peu plus clair
  accent: '#E74C3C',       // Rouge accent (boutons CTA)
  accentPink: '#FFC1D5',   // Rose accent
  text: '#FFFFFF',         // Texte blanc
  muted: '#9aa4b2'         // Texte grisé
}
```

Tous les écrans utilisent `StyleSheet.create()` avec ces couleurs.

---

## VARIABLES D'ENVIRONNEMENT EXPO

### Configuration

L'app utilise les variables d'environnement Expo (`EXPO_PUBLIC_*`).

| Variable | Description | Fallback |
|----------|-------------|----------|
| `EXPO_PUBLIC_API_URL` | URL du backend API | `http://localhost:4000` |

### Fichiers

- `.env.example` : Template avec documentation
- `.env` : Fichier local (ignoré par git)

### Usage

1. Copier `.env.example` vers `.env`
2. Modifier `EXPO_PUBLIC_API_URL` avec votre IP locale
3. Relancer Expo avec `npx expo start -c` (clear cache)

### Device physique vs Simulateur

| Environnement | URL à utiliser |
|---------------|----------------|
| Simulateur iOS/Android | `http://localhost:4000` (fallback) |
| Device physique (Expo Go) | `http://192.168.x.x:4000` (IP locale) |

**Trouver son IP locale :**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig  # chercher "IPv4 Address"
```

**Vérifier la connexion :**
- Ouvrir Safari/Chrome sur le device
- Aller sur `http://VOTRE_IP:4000/health`
- Doit retourner une réponse JSON

---

## API CLIENT

### Configuration (`src/services/api/apiConfig.ts`)

- Lit `process.env.EXPO_PUBLIC_API_URL`
- Fallback sur `http://localhost:4000` si non définie
- Valide que l'URL commence par `http://` ou `https://`
- Log en mode DEV : `[API] baseURL = <url>`

### HTTP Client (`src/services/api/httpClient.ts`)

- Instance Axios avec baseURL et timeout
- Intercepteur requête: ajoute le header `Authorization: Bearer <token>` si token présent
- Intercepteur réponse: normalise les erreurs en `ApiError`

### Gestion d'erreurs (`src/services/api/apiError.ts`)

- Classe `ApiError` avec `message`, `statusCode`, `code`
- Gestion des erreurs réseau (NETWORK_ERROR, TIMEOUT)
- Fonction `getErrorMessage()` pour extraire un message lisible

---

## ENDPOINTS API

### OTP (Authentification)

| Endpoint | Méthode | Payload | Réponse |
|----------|---------|---------|---------|
| `/v1/auth/request-otp-sms` | POST | `{ phoneNumber }` | `{ message }` |
| `/v1/auth/verify-otp-sms` | POST | `{ phoneNumber, code }` | `{ accessToken, user, isNewUser? }` |

### User (Profil)

| Endpoint | Méthode | Authentifié | Payload | Réponse |
|----------|---------|-------------|---------|---------|
| `/v1/users/me` | GET | Oui | - | `User` |
| `/v1/users/me` | PUT | Oui | `UpdateUserPayload` | `User` |

### Upload (Images profil et cadeaux)

| Endpoint | Méthode | Authentifié | Body | Réponse |
|----------|---------|-------------|------|---------|
| `/v1/uploads/profile/avatar` | POST | Oui | `multipart/form-data` (champ `file`) | `{ url, pathname }` |
| `/v1/uploads/profile/banner` | POST | Oui | `multipart/form-data` (champ `file`) | `{ url, pathname }` |
| `/v1/uploads/gifts/:giftId/media` | POST | Oui | `multipart/form-data` (champ `file`) | `{ url, pathname }` |
| `/v1/uploads/public/donor-photo` | POST | Non | `multipart/form-data` (champ `file`) + `donorClaimToken` | `{ url, pathname }` |

**Contraintes upload** :
- Formats acceptés : `image/jpeg`, `image/png`, `image/webp`
- Taille max : 5 MB
- Stockage : Vercel Blob
- Path profil : `${userId}/profile/avatar-${uuid}.${ext}` ou `${userId}/profile/banner-${uuid}.${ext}`
- Path cadeau : `${userId}/gifts/${giftId}/${uuid}.${ext}`
- Path donor : `donors/${uuid}.${ext}`

### Gift (Cadeaux)

| Endpoint | Méthode | Authentifié | Payload | Réponse |
|----------|---------|-------------|---------|---------|
| `/v1/gifts` | POST | Oui | `CreateGiftPayload` | `Gift` |
| `/v1/gifts/me` | GET | Oui | - | `Gift[]` |
| `/v1/gifts/:id` | GET | Oui | - | `Gift` |
| `/v1/gifts/:id` | PUT | Oui | `UpdateGiftPayload` | `Gift` |
| `/v1/gifts/:id` | DELETE | Oui | - | `{ message }` |

### Checkout Public (Paiement donateur)

| Endpoint | Méthode | Authentifié | Payload | Réponse |
|----------|---------|-------------|---------|---------|
| `/v1/checkout/public/gifts/:giftId` | POST | Non | `{ optionPhoto, successUrl, cancelUrl }` | `{ checkoutUrl, sessionId }` |
| `/v1/checkout/public/session` | GET | Non | `?session_id=...` | `{ gift, transaction, donorClaimToken }` |
| `/v1/checkout/public/gifts/:giftId/donor-info` | POST | Non | `{ donorClaimToken, pseudo, email, message }` | `{ success }` |
| `/v1/checkout/public/gifts/:giftId/donor-photo-url` | POST | Non | `{ donorClaimToken, photoUrl }` | `{ success }` |

---

## MODÈLE USER (BACKEND)

Champs pertinents pour le profil :

```javascript
{
  phoneNumber: String,
  username: String,
  publicName: String,
  bio: String,
  avatarUrl: String,
  avatarPathname: String,
  bannerUrl: String,        // Ajouté étape 7
  bannerPathname: String,   // Ajouté étape 7
  is18Plus: Boolean,
  galleryUrls: [String],
  socialLinks: { onlyfans, mym, instagram, twitter, twitch }
}
```

**Validation côté backend** :
- `avatarUrl` doit contenir `${userId}/profile/`
- `bannerUrl` doit contenir `${userId}/profile/`

---

## AUTHENTIFICATION

### AuthContext (`src/services/auth/AuthContext.tsx`)

**États**:
- `isAuthenticated` (boolean) - État de connexion
- `onboardingCompleted` (boolean) - Onboarding terminé
- `isLoading` (boolean) - Chargement initial de la session
- `user` (User | null) - Données utilisateur chargées depuis l'API

**Méthodes**:
- `setAuthenticated(token: string)` - Sauvegarde session + token dans SecureStore
- `completeOnboarding()` - Marque l'onboarding comme terminé (SecureStore + state)
- `logout()` - Clear SecureStore, set isAuthenticated = false, clear user
- `restoreSession()` - Appelé au montage, charge session + user depuis SecureStore/API
- `refreshUser()` - Recharge les données user depuis l'API

### AuthStorage (`src/services/auth/authStorage.ts`)

**Fonctions**:
- `saveSession(token?)` - Enregistre session + token optionnel
- `loadSession()` - Retourne `true` si session existe
- `getToken()` - Retourne le token JWT si présent
- `setOnboardingCompleted(value)` - Stocke l'état onboarding
- `getOnboardingCompleted()` - Lit l'état onboarding
- `clearSession()` - Supprime session et token

**Clés SecureStore**:
- `auth_session`: `"true"` si connecté
- `auth_token`: JWT token (si fourni par le backend)
- `onboarding_completed`: `"true"` si onboarding terminé

### Comportement

1. **Au lancement**: `restoreSession()` charge session + onboarding
   - Si session + onboardingCompleted → AppTabs
   - Sinon → AuthStack

2. **OTP (signup/login)**:
   - PhoneOtpScreen appelle `otpApi.requestOtp()` et `otpApi.verifyOtp()`
   - Si backend non joignable → mode stub (code 000000 accepté)
   - Si token reçu → `setAuthenticated(accessToken)`
   - Si user existant: onboardingCompleted = `true` si profil complet (is18Plus + publicName + username)

3. **Onboarding Profil**:
   - ProfileFormScreen collecte publicName et is18Plus
   - ProfileCustomizeScreen :
     - Upload avatar/banner via `uploadApi` (token lu depuis SecureStore)
     - `userApi.updateMe()` avec toutes les données
     - `completeOnboarding()` bascule l'app vers AppTabs

4. **Déconnexion** (ProfileScreen):
   - Appelle `logout()` → Clear session + onboarding
   - RootNavigator détecte le changement → Affiche AuthStack

---

## UPLOAD D'IMAGES

### Service Upload (`src/services/api/uploadApi.ts`)

```typescript
uploadApi.uploadProfileAvatar(asset: ImagePickerAsset): Promise<{ url, pathname }>
uploadApi.uploadProfileBanner(asset: ImagePickerAsset): Promise<{ url, pathname }>
```

**Fonctionnement** :
1. Utilise `fetch` avec `FormData` (pas axios pour multipart React Native)
2. Ajoute le token d'auth automatiquement
3. Envoie le fichier au format `{ uri, name, type }`
4. Retourne `{ url, pathname }` depuis Vercel Blob

### Image Picker

Utilise `expo-image-picker` :
- `launchImageLibraryAsync()` pour sélectionner une image
- Aspect ratio : 1:1 pour avatar, 16:9 pour banner
- Qualité : 0.8

---

## NAVIGATION

### Types de paramètres (`src/types/navigation.ts`)

```typescript
AuthStackParamList = {
  Link: undefined;
  Login: undefined;
  PhoneOtp: { mode?: 'signup' | 'login'; prefilledUsername?: string };
  ProfileForm: { prefilledUsername?: string };
  ProfileCustomize: { publicName?: string; is18Plus?: boolean; prefilledUsername?: string };
};

AppTabsParamList = {
  Home: undefined;
  Gifts: undefined;
  Profile: undefined;
};

GiftStackParamList = {
  GiftsList: undefined;
  CreateGiftPhotos: undefined;
  CreateGiftInfo: { mediaAssets: Array<{ uri: string; mimeType?: string }> };
  GiftDetail: { giftId: string };
};
```

### Flow Onboarding (AuthStack)

1. **LinkScreen** → Configurer le lien + boutons Créer/Connexion
2. **PhoneOtpScreen** → Saisie téléphone + OTP (mode signup/login)
3. **ProfileFormScreen** → Nom public + checkbox 18+
4. **ProfileCustomizeScreen** → Avatar, banner, username, bio → upload → `completeOnboarding()` → AppTabs

### RootNavigator

- Utilise `useAuth()` pour récupérer l'état
- Affiche loader si `isLoading === true`
- Affiche `AuthStack` si `!isAuthenticated` ou onboarding incomplet
- Affiche `AppTabs` si `isAuthenticated && onboardingCompleted`

---

## MODE HORS-LIGNE (STUB)

Si le backend n'est pas joignable:

1. **PhoneOtpScreen**:
   - `requestOtp` → affiche message "Mode hors-ligne"
   - `verifyOtp` → accepte le code `000000`
   - Continue vers ProfileForm sans token

2. **ProfileCustomizeScreen**:
   - Upload images → skip (pas de token)
   - `updateMe` → console.warn, continue sans bloquer
   - `setAuthenticated('')` + `completeOnboarding()` → session locale sans token

L'app reste entièrement navigable même sans backend.

---

## DÉPENDANCES INSTALLÉES

**React Navigation**:
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `react-native-screens`
- `react-native-safe-area-context`

**Persistance**:
- `expo-secure-store`

**API**:
- `axios`

**Image Picker**:
- `expo-image-picker`

**Clipboard**:
- `expo-clipboard`

---

## BACKEND - MODIFICATIONS ÉTAPE 7

### Dépendance ajoutée
- `multer` (parsing multipart/form-data)

### Modèle User modifié
Ajout de :
- `bannerUrl: String`
- `bannerPathname: String`

### Service User modifié
Ajout de `ensureBannerPath(userId, bannerUrl)` pour valider que l'URL contient `${userId}/profile/`

### Nouveaux fichiers
- `src/controllers/upload.controller.js` - Contrôleur upload avatar/banner
- `src/routes/v1/upload.routes.js` - Routes upload

### Variables d'environnement backend requises
- `BLOB_READ_WRITE_TOKEN` - Token Vercel Blob (obligatoire pour upload)

---

## RÈGLES RESPECTÉES

✅ **Client API Axios** configuré avec intercepteurs
✅ **Endpoints OTP réels** découverts et intégrés
✅ **Mode stub** si backend non joignable
✅ **Token JWT** supporté (stockage + header Authorization)
✅ **Écrans fonctionnels** avec loading states et erreurs inline
✅ **App toujours navigable** même sans backend
✅ **StyleSheet uniquement** (pas de Tailwind/NativeWind)
✅ **Upload images** vers Vercel Blob via backend
✅ **Code TypeScript strict**
✅ **Dashboard Home** inspiré YouPay avec actions rapides

---

## TESTS À EFFECTUER

### Avec backend (localhost:4000 accessible)
1. Lancer l'app → Écran Link (input lien + preview)
2. Parcourir Link → PhoneOtp → entrer téléphone → recevoir OTP
3. Entrer le code OTP reçu → ProfileForm
4. Remplir nom + checkbox 18+ → ProfileCustomize
5. **Sélectionner un avatar** (tap sur le cercle)
6. **Sélectionner une bannière** (tap sur le rectangle)
7. Optionnel: username + bio → Terminer
8. Vérifier les uploads dans la console (status "Upload avatar...", "Upload bannière...")
9. Vérifier que l'app arrive sur AppTabs
10. Vérifier en base que avatarUrl et bannerUrl sont remplis

### Login (user existant)
1. LinkScreen → "Se connecter"
2. OTP → `verifyOtp` avec user existant
3. Si profil complet → AppTabs direct
4. Si profil incomplet → ProfileForm puis ProfileCustomize

### Sans backend (mode stub)
1. Lancer l'app → Écran Link → PhoneOtp
2. Entrer n'importe quel téléphone → "Mode hors-ligne" affiché
3. Entrer code `000000` → ProfileForm
4. Sélectionner images (seront ignorées car pas de token)
5. Continuer jusqu'à AppTabs
6. Reload app → Reste sur AppTabs (session persistée)
7. Déconnexion → Retour AuthStack

### Backend - Test upload direct
```bash
# Remplacer TOKEN par un JWT valide
curl -X POST http://localhost:4000/v1/uploads/profile/avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

## PROCHAINES ÉTAPES (NON RÉALISÉES)

Les étapes suivantes ne font PAS partie de cette phase:

- [ ] Logique OTP réelle avec SMS (Twilio/autre)
- [ ] Galerie d'images (3 photos max)
- [ ] Données utilisateur complètes dans AuthContext
- [ ] Gestion des erreurs API plus fine (retry, offline queue)
- [ ] Validation formulaires avec lib (zod, yup)
- [ ] Refresh token automatique

---

## DASHBOARD HOME (ÉTAPE 9)

### Structure

Le Dashboard Home (`src/screens/app/HomeScreen.tsx`) est inspiré de YouPay avec :

1. **Header** : Logo HumDaddy + bouton "Ajouter un cadeau"
2. **Welcome** : "Bienvenue, <publicName>" + lien public cliquable/copiable
3. **Identity Verification Card** : Bloc conditionnel Stripe (si non vérifié)
4. **Total Received** : Montant total reçu + lien stats
5. **Quick Actions** : Flux créateur, Créer cadeau, Liste souhaits, Import Throne
6. **Recent Gifts** : Liste vide avec CTA création
7. **Updates** : Section actualités

### Composants

**IdentityVerificationCard** (`src/components/IdentityVerificationCard.tsx`):
- Affiché si `stripeConnectAccountId` absent OU `stripeOnboardingStatus !== 'actif'` OU `stripeChargesEnabled === false`
- CTA vers vérification Stripe (placeholder)

**QuickActionsCard** (`src/components/QuickActionsCard.tsx`):
- 4 actions : Flux créateur, Créer cadeau, Liste souhaits, Import Throne
- Callbacks pour chaque action

**AddGiftModal** (`src/components/AddGiftModal.tsx`):
- Modal bottom sheet avec 3 types : Cadeau, Carte cadeau, Carte paiement
- Déclenchée par bouton header + action rapide + CTA cadeaux récents

### Type User (mis à jour)

```typescript
interface User {
  id: string;
  phoneNumber: string;
  username?: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  is18Plus?: boolean;
  role: string;
  // Stripe Connect
  stripeConnectAccountId?: string;
  stripeOnboardingStatus?: 'pending' | 'actif' | 'restricted';
  stripeChargesEnabled?: boolean;
  // Stats
  totalReceived?: number;
}
```

### Logique Stripe

Le bloc "Vérifier l'identité" s'affiche si :
- `!user.stripeConnectAccountId` OU
- `user.stripeOnboardingStatus !== 'actif'` OU
- `user.stripeChargesEnabled === false`

Important : ce bloc NE bloque PAS la création de cadeaux.

---

## CHANGELOG

### 2026-01-16 - Étape 9 Complétée

**Dashboard Home** :
- Création `HomeScreen.tsx` complet inspiré YouPay
- Header avec logo + bouton "Ajouter un cadeau"
- Section welcome avec lien public copiable (expo-clipboard)
- Bloc vérification identité conditionnel (Stripe)
- Carte "Total reçu" avec montant et lien stats
- Actions rapides : flux créateur, créer cadeau, liste souhaits, import Throne
- Section cadeaux récents (état vide avec CTA)
- Section actualités

**Composants créés** :
- `IdentityVerificationCard.tsx` - Bloc Stripe verification
- `QuickActionsCard.tsx` - Liste actions rapides
- `AddGiftModal.tsx` - Modal choix type cadeau (bottom sheet)

**AuthContext mis à jour** :
- Ajout état `user: User | null`
- Ajout méthode `refreshUser()` pour recharger depuis API
- `restoreSession()` charge aussi les données user
- `logout()` clear aussi l'état user

**Type User enrichi** :
- Ajout champs Stripe : `stripeConnectAccountId`, `stripeOnboardingStatus`, `stripeChargesEnabled`
- Ajout `totalReceived` pour stats

**Dépendance ajoutée** :
- `expo-clipboard` pour copier le lien public

### 2026-01-16 - Étape 8 Complétée

**Auth & onboarding** :
- Ajout du flag `onboarding_completed` dans SecureStore
- `AuthContext` expose `onboardingCompleted`, `setAuthenticated`, `completeOnboarding`
- RootNavigator bascule AppTabs uniquement si session + onboarding terminé
- OTP stocke le token dès `verifyOtp` (plus de token passé en params)
- Règle user existant : onboarding terminé si `is18Plus` + `publicName` + `username`

**Login & LinkScreen** :
- Login OTP réel (redirige vers PhoneOtp en mode login)
- LinkScreen : input pseudo + preview + image hero `link.png`

**ProfileCustomize** :
- Uploads et `updateMe` lisent le token depuis SecureStore
- `completeOnboarding()` finalise le flow, mode stub supporté

### 2026-01-16 - Étape 7 Complétée

**Backend modifié** :
- Ajout `multer` pour parsing multipart
- Ajout `bannerUrl` et `bannerPathname` au modèle User
- Ajout `ensureBannerPath()` dans user.service.js
- Création `upload.controller.js` avec uploadProfileAvatar/uploadProfileBanner
- Création `upload.routes.js` avec routes POST protégées
- Routes montées sur `/v1/uploads`

**Mobile modifié** :
- Installation `expo-image-picker`
- Création `uploadApi.ts` avec fonctions upload avatar/banner
- Modification `ProfileCustomizeScreen.tsx` :
  - Ajout pickers pour avatar et banner
  - Preview des images sélectionnées
  - Upload des images avant updateMe
  - Status d'upload affiché

**userApi.ts modifié** :
- Ajout `avatarPathname`, `bannerUrl`, `bannerPathname` au payload

---

### 2026-01-16 - Étape 6 Complétée

**Variables d'environnement Expo ajoutées** :
- `.env.example` créé avec documentation complète
- `.gitignore` mis à jour pour ignorer `.env`
- `README.md` créé avec instructions de configuration

**apiConfig.ts modifié** :
- Lit `EXPO_PUBLIC_API_URL` depuis `process.env`
- Fallback sur `http://localhost:4000` si non définie
- Validation URL (doit commencer par http:// ou https://)
- Log DEV au démarrage avec `[API] baseURL = ...`

---

### 2026-01-16 - Étape 5 Complétée

**API Client ajouté**:
- `src/services/api/` créé avec 6 fichiers
- Axios configuré avec baseURL `http://localhost:4000`
- Intercepteurs pour token et normalisation erreurs

**Endpoints découverts**:
- `POST /v1/auth/request-otp-sms` (demande OTP)
- `POST /v1/auth/verify-otp-sms` (vérifie OTP, retourne token)
- `GET /v1/users/me` (récupère profil)
- `PUT /v1/users/me` (met à jour profil)

---

### 2026-01-15 - Étape 4 Complétée

**AuthContext ajouté**:
- `src/services/auth/AuthContext.tsx` créé
- Provider wrappé dans `App.tsx`
- Hook `useAuth()` exporté

**SecureStore implémenté**:
- `src/services/auth/authStorage.ts` créé
- Fonctions `saveSession()`, `loadSession()`, `clearSession()`

---

### 2026-01-15 - Étape 3 Complétée

**Architecture créée**:
- Structure `src/` complète
- Navigation (AuthStack, AppTabs, RootNavigator)
- Thème centralisé
- Types de navigation

---

## NOTES TECHNIQUES

- **React Native 0.81.5**: Utiliser `size={48}` au lieu de `size="large"` sur ActivityIndicator
- **SecureStore**: Ne fonctionne pas sur web, uniquement sur iOS/Android natifs et Expo Go
- **Variables d'env Expo**: Utiliser `EXPO_PUBLIC_*` (pas besoin de dotenv)
- **Clear cache**: Après modification `.env`, relancer avec `npx expo start -c`
- **Mode stub OTP**: Code `000000` accepté si backend non joignable
- **Upload React Native**: Utiliser `fetch` avec FormData, pas axios (problèmes multipart)
- **Backend BLOB_READ_WRITE_TOKEN**: Variable env requise pour Vercel Blob

---

## TESTS DASHBOARD (ÉTAPE 9)

### Test Dashboard Home
1. Lancer l'app → Login → Arriver sur Dashboard
2. Vérifier header : logo "HumDaddy" + bouton violet "Ajouter un cadeau"
3. Vérifier welcome : "Bienvenue, <nom>" + lien humdaddy.com/<username>
4. Tap sur le lien → doit copier (affiche ✓)
5. Vérifier bloc "Vérifier l'identité" est affiché (Stripe non configuré)
6. Vérifier carte "Total reçu" : 0 €
7. Vérifier actions rapides : 4 items cliquables

### Test Modal Cadeau
1. Tap sur "Ajouter un cadeau" (header)
2. Modal s'ouvre en bottom sheet
3. Affiche 3 options : Cadeau, Carte cadeau, Carte paiement
4. Tap sur une option → Alert + fermeture
5. Tap sur "Annuler" → fermeture modal

### Test Actions Rapides
1. Tap "Créer un cadeau" → ouvre modal
2. Tap "Flux créateur" → Alert placeholder
3. Tap "Liste souhaits" → Alert placeholder
4. Tap "Import Throne" → Alert placeholder

### Test Cadeaux Récents
1. Section affiche état vide
2. Bouton "Créer un cadeau" → ouvre modal

---

**FIN DE L'ÉTAPE 9**

---

## ÉTAPE 10 - CRÉATION + ACHAT CADEAU

### Résumé

Implémentation complète du flow de création et achat de cadeaux :
- **Mobile (baby)** : Wizard création cadeau en 2 étapes + liste + détail
- **Backend** : CRUD cadeaux, upload media, checkout Stripe public, webhook donorClaimToken
- **Web (daddy)** : À implémenter - page publique avec checkout

### Modèle Gift (Backend)

```javascript
{
  userId: ObjectId,              // Propriétaire du cadeau
  title: String,                 // Titre (3-100 chars)
  description: String,           // Description (max 1000 chars)
  mediaUrls: [String],           // URLs images (max 3)
  price: Number,                 // Prix en centimes
  currency: String,              // 'eur' (default)
  externalLink: String,          // Lien externe optionnel
  isActive: Boolean,             // Cadeau actif (default true)
  isPurchased: Boolean,          // Déjà acheté (default false)
  purchasedAt: Date,             // Date d'achat
  purchasedBy: {                 // Infos donateur (après soumission)
    donorPseudo: String,
    donorEmail: String,
    donorMessage: String,
    donorPhotoUrl: String,
  },
  purchasedTransactionId: ObjectId,  // Référence transaction
  optionPhotoFee: Number,        // Frais option photo (default 50€)
  optionPhotoPaid: Boolean,      // Option photo payée
}
```

### Modèle Transaction (Backend - champs ajoutés)

```javascript
{
  // ... champs existants ...
  donorEmail: String,            // Email donateur (soumis post-paiement)
  donorPhotoUrl: String,         // Photo donateur (si option payée)
  optionPhotoPaid: Boolean,      // Option photo incluse
  optionPhotoFee: Number,        // Montant option photo
  donorClaimToken: String,       // Token pour soumettre infos (24h TTL)
  donorClaimTokenExpiresAt: Date,
  donorInfoSubmitted: Boolean,   // Infos donateur soumises
}
```

### Service Stripe (Backend)

**Constantes** :
- `OPTION_PHOTO_FEE = 50` (50€ en centimes = 5000)

**Fonctions ajoutées** :
- `generateDonorClaimToken()` - Génère token UUID pour post-paiement
- `createPublicCheckoutSession(giftId, optionPhoto, successUrl, cancelUrl)` - Crée session Stripe public
- `handleCheckoutSessionCompletedWithDonorToken(session)` - Webhook handler avec génération token
- `getCheckoutSessionInfo(sessionId)` - Récupère infos après paiement
- `submitDonorInfo(giftId, donorClaimToken, pseudo, email, message)` - Soumet infos donateur
- `updateDonorPhoto(giftId, donorClaimToken, photoUrl)` - Met à jour photo donateur

### Flow Checkout Public

1. **Pré-paiement** : `POST /v1/checkout/public/gifts/:giftId`
   - Vérifie que le cadeau existe et n'est pas déjà acheté
   - Crée session Stripe avec `optionPhoto` optionnelle (+50€)
   - Retourne `checkoutUrl` pour redirection

2. **Paiement Stripe** : Utilisateur complète le paiement

3. **Webhook** : `checkout.session.completed`
   - Marque le cadeau comme `isPurchased = true`
   - Crée Transaction avec `donorClaimToken` (TTL 24h)
   - Enregistre `optionPhotoPaid` si applicable

4. **Post-paiement** : `GET /v1/checkout/public/session?session_id=...`
   - Retourne infos cadeau, transaction, et `donorClaimToken`

5. **Soumission infos** : `POST /v1/checkout/public/gifts/:giftId/donor-info`
   - Vérifie `donorClaimToken` valide et non expiré
   - Met à jour `purchasedBy` sur le cadeau
   - Marque `donorInfoSubmitted = true`

6. **Upload photo** (si option payée) :
   - `POST /v1/uploads/public/donor-photo` (upload vers Vercel Blob)
   - `POST /v1/checkout/public/gifts/:giftId/donor-photo-url` (associe URL)

### Écrans Mobile

**GiftsListScreen** (`src/screens/app/gifts/GiftsListScreen.tsx`)
- Liste en grille (2 colonnes) des cadeaux du créateur
- Badge "Déjà financé" sur les cadeaux achetés
- Bouton flottant "+" pour créer un cadeau
- Pull-to-refresh
- Navigation vers GiftDetail au tap

**CreateGiftPhotosScreen** (`src/screens/app/gifts/CreateGiftPhotosScreen.tsx`)
- Step 1 du wizard
- Sélection jusqu'à 3 photos via expo-image-picker
- Aperçu des photos sélectionnées avec suppression
- Bouton "Suivant" vers CreateGiftInfo

**CreateGiftInfoScreen** (`src/screens/app/gifts/CreateGiftInfoScreen.tsx`)
- Step 2 du wizard
- Formulaire : titre, prix, description, lien externe
- Validation : titre requis (3+ chars), prix requis (min 1€)
- Upload des photos puis création du cadeau
- Navigation vers GiftsList après succès

**GiftDetailScreen** (`src/screens/app/gifts/GiftDetailScreen.tsx`)
- Affichage détaillé du cadeau
- Carousel images
- Infos donateur si acheté
- Bouton suppression avec confirmation

### Navigation

**GiftStack** (`src/navigation/GiftStack.tsx`)
- Navigator natif pour les écrans cadeaux
- Animation slide_from_right
- Écrans : GiftsList → CreateGiftPhotos → CreateGiftInfo → GiftDetail

**AppTabs** (mis à jour)
- Nouvel onglet "Cadeaux" au milieu (Home - Gifts - Profile)
- Utilise GiftStack comme composant

**HomeScreen** (mis à jour)
- AddGiftModal navigue vers `Gifts > CreateGiftPhotos` pour type "gift"

### API Mobile

**giftApi.ts** (`src/services/api/giftApi.ts`)
```typescript
interface Gift {
  _id: string;
  title: string;
  description?: string;
  mediaUrls: string[];
  price: number;
  currency: string;
  externalLink?: string;
  isActive: boolean;
  isPurchased: boolean;
  purchasedAt?: string;
  purchasedBy?: {
    donorPseudo?: string;
    donorEmail?: string;
    donorMessage?: string;
    donorPhotoUrl?: string;
  };
}

giftApi.createGift(payload): Promise<Gift>
giftApi.listMyGifts(): Promise<Gift[]>
giftApi.getGift(id): Promise<Gift>
giftApi.updateGift(id, payload): Promise<Gift>
giftApi.deleteGift(id): Promise<void>
```

**uploadApi.ts** (mis à jour)
```typescript
uploadApi.uploadGiftMedia(giftId, asset): Promise<{ url, pathname }>
```

### Sécurité

- **donorClaimToken** : UUID généré au webhook, expire après 24h
- **Validation token** : Vérifié à chaque soumission d'info donateur
- **Single funding** : Un cadeau ne peut être financé qu'une seule fois (vérifié au checkout)
- **Routes protégées** : CRUD cadeaux nécessite authentification
- **Routes publiques** : Checkout et soumission infos avec token uniquement

### Tests

**Création cadeau (mobile)** :
1. Home → "Ajouter un cadeau" → "Cadeau"
2. Sélectionner 1-3 photos → "Suivant"
3. Remplir titre (requis) + prix (requis) + description + lien
4. "Créer le cadeau" → Upload photos → Création
5. Redirection vers liste cadeaux

**Liste cadeaux (mobile)** :
1. Tab "Cadeaux" → Affiche grille
2. Pull-to-refresh → Recharge
3. Tap cadeau → Détail
4. Bouton "+" → Création

**Détail cadeau (mobile)** :
1. Affiche images en carousel
2. Affiche titre, prix, description, lien
3. Si acheté : affiche badge + infos donateur
4. Bouton supprimer → Confirmation → Suppression

**Checkout (web - à implémenter)** :
1. Page publique `humdaddy.com/<username>`
2. Liste des cadeaux non achetés
3. Bouton "Financer" → Option photo (+50€) → Stripe
4. Post-paiement → Formulaire infos donateur
5. Si option photo → Upload photo

---

## CHANGELOG

### 2026-01-16 - Étape 10 Complétée

**Backend - Modèles modifiés** :
- Gift : ajout `purchasedBy`, `purchasedTransactionId`, `optionPhotoFee`, `optionPhotoPaid`
- Transaction : ajout `donorEmail`, `donorPhotoUrl`, `optionPhotoPaid`, `optionPhotoFee`, `donorClaimToken`, `donorClaimTokenExpiresAt`, `donorInfoSubmitted`

**Backend - Services** :
- stripe.service.js : ajout `OPTION_PHOTO_FEE`, `generateDonorClaimToken`, `createPublicCheckoutSession`, `handleCheckoutSessionCompletedWithDonorToken`, `getCheckoutSessionInfo`, `submitDonorInfo`, `updateDonorPhoto`
- stripeWebhook.service.js : utilise `handleCheckoutSessionCompletedWithDonorToken`

**Backend - Controllers** :
- upload.controller.js : ajout `uploadGiftMedia`, `uploadDonorPhoto`
- checkout.controller.js : nouveau fichier avec `createPublicCheckout`, `getPublicCheckoutSession`, `submitPublicDonorInfo`, `updatePublicDonorPhotoUrl`

**Backend - Routes** :
- upload.routes.js : ajout `/gifts/:giftId/media`, `/public/donor-photo`
- checkout.routes.js : nouveau fichier avec routes publiques checkout

**Mobile - API** :
- giftApi.ts : nouveau service CRUD cadeaux
- uploadApi.ts : ajout `uploadGiftMedia`
- index.ts : exports giftApi

**Mobile - Écrans** :
- GiftsListScreen.tsx : liste grille avec badge acheté
- CreateGiftPhotosScreen.tsx : wizard step 1 (photos)
- CreateGiftInfoScreen.tsx : wizard step 2 (infos)
- GiftDetailScreen.tsx : détail + suppression

**Mobile - Navigation** :
- GiftStack.tsx : nouveau navigator cadeaux
- AppTabs.tsx : ajout onglet "Cadeaux"
- HomeScreen.tsx : navigation vers création depuis modal
- navigation.ts : ajout `GiftStackParamList`

---

**FIN DE L'ÉTAPE 10**

---

## ÉTAPE 11 - STRIPE CONNECT ONBOARDING

### Résumé

Implémentation complète du flow Stripe Connect Express pour permettre aux baby's de recevoir des paiements :
- **Mobile** : CTA vérification, ouverture Stripe en browser externe, écran retour
- **Backend** : Service Stripe Connect, webhook account.updated, blocage checkout si non vérifié
- **Commission** : 22% de frais plateforme

### Variables d'environnement Backend

```
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
PLATFORM_FEE_PERCENT=22
APP_BASE_URL=https://humdaddy.com
MOBILE_DEEPLINK_URL=humdaddy://stripe-return
```

### Modèle User (champs Stripe)

```javascript
{
  stripeConnectAccountId: String,           // ID compte Express
  stripeOnboardingStatus: {                 // Statut onboarding
    type: String,
    enum: ['pending', 'verified', 'restricted', 'disabled', 'actif'],
    default: 'pending',
  },
  stripeChargesEnabled: { type: Boolean, default: false },  // Peut recevoir
  stripePayoutsEnabled: { type: Boolean, default: false },  // Peut retirer
  stripeDetailsSubmitted: { type: Boolean, default: false }, // Infos soumises
  stripeRequirements: { type: Mixed },      // Requirements Stripe bruts
  stripeLastSyncAt: Date,                   // Dernière sync
}
```

### Service Stripe Connect (Backend)

**Fichier** : `backend-api/src/services/stripeConnect.service.js`

**Fonctions** :
- `computeOnboardingStatus(account)` - Calcule le statut depuis l'objet Stripe
- `applyAccountStatusToUser(user, account)` - Met à jour user avec les données Stripe
- `createConnectAccount(user)` - Crée un compte Express (idempotent)
- `createAccountLink(user, returnContext)` - Génère lien onboarding
- `refreshAccountStatus(user)` - Sync depuis Stripe API
- `getAccountStatus(userId)` - Récupère et retourne le statut

**Logique de statut** :
```javascript
if (disabled_reason) → 'disabled'
if (payouts_enabled && charges_enabled && details_submitted) → 'actif'
if (past_due.length || eventually_due.length) → 'restricted'
if (currently_due.length) → 'pending'
else → 'pending'
```

### Webhook account.updated

**Fichier** : `backend-api/src/services/stripeWebhook.service.js`

```javascript
case 'account.updated': {
  const account = event.data.object;
  const user = await User.findOne({ stripeConnectAccountId: account.id });
  if (user) {
    applyAccountStatusToUser(user, account);
    await user.save();
  }
  break;
}
```

### Blocage Checkout

Dans `stripe.service.js`, les fonctions `createCheckoutSession` et `createPublicCheckoutSession` vérifient :
```javascript
if (baby.stripeChargesEnabled === false) {
  throw new ApiError(
    httpStatus.BAD_REQUEST,
    'La baby doit vérifier son identité pour recevoir des paiements.',
  );
}
```

### Commission 22%

Configurée via `PLATFORM_FEE_PERCENT=22` dans `.env`.
Appliquée via `application_fee_amount` dans les sessions Stripe Checkout.

### Routes Backend

**Fichier** : `backend-api/src/routes/v1/stripeConnect.routes.js`

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/v1/stripe-connect/account` | POST | Oui (baby) | Crée compte Express |
| `/v1/stripe-connect/account-link` | POST | Oui (baby) | Génère lien onboarding |
| `/v1/stripe-connect/status` | GET | Oui (baby) | Récupère statut |

### API Mobile

**Fichier** : `mobile-app/src/services/api/stripeConnectApi.ts`

```typescript
interface StripeConnectStatus {
  accountId: string | null;
  status: 'pending' | 'actif' | 'restricted' | 'disabled';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: Record<string, unknown>;
}

stripeConnectApi.createAccount(): Promise<{ accountId: string }>
stripeConnectApi.createAccountLink(returnContext): Promise<{ url: string }>
stripeConnectApi.getStatus(): Promise<StripeConnectStatus>
```

### Navigation Mobile

**AppStack** (`src/navigation/AppStack.tsx`) :
- Englobe AppTabs et StripeReturnScreen
- Deep linking configuré pour `humdaddy://stripe-return`

**RootNavigator** (mis à jour) :
- Utilise AppStack au lieu de AppTabs
- Configuration deep linking avec expo-linking

### Écrans Mobile

**StripeReturnScreen** (`src/screens/app/StripeReturnScreen.tsx`) :
- Écran affiché après retour de Stripe
- Affiche le statut actuel (pending, actif, restricted, disabled)
- Bouton "Rafraîchir le statut"
- Bouton "Retour à l'accueil"

**IdentityVerificationCard** (mis à jour) :
- Props : `onVerify`, `isLoading`, `status`
- Affichage adapté selon le statut
- Textes et couleurs différents pour chaque état

**HomeScreen** (mis à jour) :
- Flow Stripe Connect complet
- Appelle `createAccount()` puis `createAccountLink()`
- Ouvre Stripe en browser externe via `Linking.openURL()`
- Navigate vers StripeReturnScreen au retour

### Dépendance ajoutée

- `expo-linking` - Pour deep linking et ouverture URL externe

### Tests

**Baby sans compte Stripe** :
1. Home affiche "Vérifiez votre identité"
2. Clic → Ouvre Stripe onboarding
3. Retour → Affiche StripeReturnScreen
4. Statut → pending puis actif

**Baby compte actif** :
1. Bloc vérification n'apparaît plus

**Daddy checkout** :
1. Si baby pas active → erreur "La baby doit vérifier son identité..."
2. Si baby active → checkout OK

**Webhook** :
1. Modifier compte dans Stripe Dashboard
2. Webhook reçu → User sync automatique

### Curl Tests Backend

```bash
# Créer compte Connect (baby auth)
curl -X POST http://localhost:4000/v1/stripe-connect/account \
  -H "Authorization: Bearer <TOKEN>"

# Générer lien onboarding
curl -X POST http://localhost:4000/v1/stripe-connect/account-link \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"returnContext": "mobile"}'

# Récupérer statut
curl -X GET http://localhost:4000/v1/stripe-connect/status \
  -H "Authorization: Bearer <TOKEN>"
```

---

## CHANGELOG

### 2026-01-18 - Étape 11 Complétée

**Backend - Modèle User** :
- Ajout `stripeLastSyncAt: Date`

**Backend - Config** :
- env.js : ajout `appBaseUrl`, `mobileDeepLinkUrl`
- .env.example : ajout `PLATFORM_FEE_PERCENT=22`, `MOBILE_DEEPLINK_URL`

**Backend - Services** :
- stripeConnect.service.js : ajout `applyAccountStatusToUser`, amélioration `computeOnboardingStatus` (gestion disabled)
- stripeWebhook.service.js : ajout handler `account.updated`
- stripe.service.js : ajout blocage checkout si `stripeChargesEnabled === false`

**Backend - Routes** :
- stripeConnect.routes.js : routes `/account`, `/account-link`, `/status`

**Mobile - API** :
- stripeConnectApi.ts : nouveau service

**Mobile - Navigation** :
- AppStack.tsx : nouveau stack englobant AppTabs
- RootNavigator.tsx : utilise AppStack, deep linking configuré
- navigation.ts : ajout `AppStackParamList`

**Mobile - Écrans** :
- StripeReturnScreen.tsx : écran retour Stripe
- HomeScreen.tsx : flow Stripe Connect complet
- IdentityVerificationCard.tsx : props status et loading

**Mobile - Dépendances** :
- expo-linking installé

---

**FIN DE L'ÉTAPE 11**

---

## ÉTAPE 12 - TAB BAR FINALE + PROFIL COMPLET

### Résumé

Implémentation de la Tab Bar finale avec icônes et bouton + central, plus un écran Profil complet permettant à la baby de modifier son profil avec auto-save.

### Backend - Modifications

**Modèle User** (`backend-api/src/models/user.model.js`) :
- Ajout champs `firstName`, `lastName`
- Ajout virtual `publicProfileUrl` (lecture seule)
- Configuration `toJSON` et `toObject` avec virtuals

```javascript
{
  firstName: String,
  lastName: String,
  // ... autres champs existants ...
}

// Virtual
userSchema.virtual('publicProfileUrl').get(function () {
  if (this.username) {
    return `https://humdaddy.com/${this.username}`;
  }
  return null;
});
```

**Upload Controller** (`backend-api/src/controllers/upload.controller.js`) :
- Ajout fonction `uploadProfileGallery` pour upload images galerie

**Upload Routes** (`backend-api/src/routes/v1/upload.routes.js`) :
- Ajout route `POST /v1/uploads/profile/gallery`

### Mobile - Tab Bar

**AppTabs** (`src/navigation/AppTabs.tsx`) :
- 4 onglets : Home, Add (bouton +), Gifts, Profile
- Icônes Ionicons pour chaque onglet
- Bouton "+" central surélevé avec style custom
- AddGiftModal intégré dans AppTabs

```typescript
<Tab.Screen name="Home" options={{ tabBarIcon: <Ionicons name="home-outline" /> }} />
<Tab.Screen name="Add" options={{ tabBarButton: <AddButton /> }} />
<Tab.Screen name="Gifts" options={{ tabBarIcon: <Ionicons name="gift-outline" /> }} />
<Tab.Screen name="Profile" options={{ tabBarIcon: <Ionicons name="person-outline" /> }} />
```

**Types Navigation** (`src/types/navigation.ts`) :
- Ajout écran `Add` à `AppTabsParamList`
- `Gifts` avec `NavigatorScreenParams<GiftStackParamList>`

### Mobile - ProfileScreen

**Fonctionnalités** :
- Header avec indicateur "Sauvegarde..."
- Banner + Avatar éditables (tap pour upload)
- Lien public copiable (publicProfileUrl)
- Username en lecture seule (avec icône cadenas)
- Nom public éditable avec auto-save
- Bio éditable avec auto-save
- Réseaux sociaux (Instagram, Twitter, Twitch)
- Galerie d'images (max 3, ajout/suppression)
- Bouton déconnexion avec confirmation

**Auto-save avec debounce** :
```typescript
const DEBOUNCE_MS = 1000;
const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
const pendingChanges = useRef<UpdateUserPayload>({});

const scheduleAutoSave = useCallback((changes: UpdateUserPayload) => {
  pendingChanges.current = { ...pendingChanges.current, ...changes };
  if (debounceTimer.current) clearTimeout(debounceTimer.current);
  debounceTimer.current = setTimeout(async () => {
    await userApi.updateMe(pendingChanges.current);
    pendingChanges.current = {};
    await refreshUser();
  }, DEBOUNCE_MS);
}, [refreshUser]);
```

**États gérés** :
- `publicName`, `bio`, `socialLinks`, `galleryUrls` (form state)
- `saving` (indicateur sauvegarde)
- `uploadingAvatar`, `uploadingBanner`, `uploadingGallery` (upload states)

### Mobile - API Updates

**Type User** (`src/services/api/otpApi.ts`) :
```typescript
export interface SocialLinks {
  onlyfans?: string;
  mym?: string;
  instagram?: string;
  twitter?: string;
  twitch?: string;
}

export interface User {
  // ... existant ...
  firstName?: string;
  lastName?: string;
  galleryUrls?: string[];
  socialLinks?: SocialLinks;
  publicProfileUrl?: string;
}
```

**UpdateUserPayload** (`src/services/api/userApi.ts`) :
```typescript
export interface UpdateUserPayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  galleryUrls?: string[];
  is18Plus?: boolean;
  socialLinks?: SocialLinks;
}
```

**uploadApi** (`src/services/api/uploadApi.ts`) :
```typescript
uploadApi.uploadProfileGallery(asset): Promise<{ url, pathname }>
```

### Dépendance ajoutée

- `@expo/vector-icons` - Pour les icônes de tab bar (Ionicons)

### Tests

**Tab Bar** :
1. Vérifier 4 onglets avec icônes
2. Bouton "+" central surélevé avec couleur accent
3. Tap "+" → ouvre AddGiftModal
4. Navigation entre onglets fonctionne

**ProfileScreen** :
1. Banner tap → picker image → upload → affichage
2. Avatar tap → picker image → upload → affichage
3. Modifier publicName → "Sauvegarde..." → refresh
4. Modifier bio → auto-save après 1s
5. Modifier réseaux sociaux → auto-save
6. Galerie : ajouter image (max 3), supprimer image
7. Lien public tap → copie (icône checkmark)
8. Déconnexion → confirmation → logout

---

## CHANGELOG

### 2026-01-18 - Étape 12 Complétée

**Backend - Modèle User** :
- Ajout `firstName: String`, `lastName: String`
- Ajout virtual `publicProfileUrl` avec getter
- Configuration `toJSON` et `toObject` avec virtuals

**Backend - Upload** :
- Ajout `uploadProfileGallery` dans upload.controller.js
- Ajout route `POST /v1/uploads/profile/gallery`

**Mobile - Navigation** :
- AppTabs refactorisé avec icônes Ionicons
- Bouton "+" central avec AddGiftModal intégré
- Types navigation mis à jour (Add, NavigatorScreenParams)

**Mobile - ProfileScreen** :
- Écran complet avec tous les champs éditables
- Auto-save avec debounce (1000ms)
- Upload avatar, banner, gallery
- Galerie avec max 3 images
- Lien public copiable
- Déconnexion avec confirmation

**Mobile - API** :
- Type User enrichi (firstName, lastName, galleryUrls, socialLinks, publicProfileUrl)
- UpdateUserPayload complet
- uploadApi.uploadProfileGallery ajouté

**Mobile - Dépendances** :
- @expo/vector-icons installé

---

**FIN DE L'ÉTAPE 12**

---

## ÉTAPE 13 - WALLET (SOLDE + RETRAITS) + STRIPE RETURN DEEPLINK

### Résumé

Implémentation complète du Wallet pour les baby's :
- Voir le solde (disponible / en attente / total reçu)
- Historique complet (paiements reçus + retraits + frais)
- Demander un retrait partiel (min 100€) vers IBAN via Stripe Connect
- Flow de retour Stripe : web-app → deeplink → app mobile

### Règles métier Wallet

- **Devise** : EUR
- **Min payout** : 100€ (10000 centimes)
- **Retrait** : partiel (input montant)
- **Type payout** : instant si Stripe le permet, sinon fallback standard
- **IBAN** : géré uniquement via l'onboarding Stripe
- **Autorisation payout** : basée sur les flags Stripe (chargesEnabled, payoutsEnabled, onboardingStatus)

### Backend - Endpoints Wallet

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/v1/wallet/summary` | GET | Oui (baby) | Résumé wallet (solde, statut payout) |
| `/v1/wallet/activity` | GET | Oui (baby) | Historique (paiements + retraits + frais) |
| `/v1/wallet/payouts` | POST | Oui (baby) | Créer un retrait |

**Response GET /v1/wallet/summary** :
```json
{
  "currency": "eur",
  "available": 12345,
  "pending": 6789,
  "totalReceived": 55555,
  "canPayout": true,
  "reasonsBlocked": [],
  "minPayout": 10000,
  "stripe": {
    "accountId": "acct_...",
    "chargesEnabled": true,
    "payoutsEnabled": true,
    "onboardingStatus": "actif",
    "requirements": {}
  }
}
```

**Response GET /v1/wallet/activity** :
```json
{
  "items": [
    {
      "id": "...",
      "type": "received",
      "amount": 5000,
      "fee": 1100,
      "currency": "eur",
      "status": "succeeded",
      "date": "2026-01-19T...",
      "gift": { "id": "...", "title": "...", "imageUrl": "..." },
      "donor": { "pseudo": "...", "message": "..." }
    },
    {
      "id": "...",
      "type": "payout",
      "amount": -10000,
      "fee": 0,
      "currency": "eur",
      "status": "approved",
      "date": "2026-01-19T...",
      "stripePayoutId": "po_..."
    }
  ],
  "nextCursor": "2026-01-18T...",
  "hasMore": true
}
```

**Request POST /v1/wallet/payouts** :
```json
{ "amount": 15000, "speed": "instant" }
```

### Backend - Services modifiés

**wallet.service.js** :
- `getWalletSummary(user)` - Résumé avec balance Stripe + total reçu
- `getWalletActivity(user, { limit, cursor })` - Historique unifié
- `createPayout(user, { amount, speed })` - Crée payout Stripe avec fallback
- `checkPayoutAllowed(user, amountInCents)` - Vérifie autorisation

**stripeConnect.service.js** :
- `createAccountLink()` modifié pour rediriger vers web-app `/stripe/return?context=mobile`

### Web-app - Pages Stripe Return

**`/stripe/return/page.tsx`** :
- Détecte `context=mobile`
- Tente d'ouvrir deeplink `humdaddy://stripe/return`
- Affiche bouton fallback si auto-redirect échoue

**`/stripe/refresh/page.tsx`** :
- Même logique pour session expirée
- Deeplink `humdaddy://stripe/refresh`

### Mobile - WalletScreen

**Fonctionnalités** :
- Carte solde : disponible, en attente, total reçu
- Carte retrait : input montant + validation + confirmation modal
- Historique : FlatList avec pagination (cursor)
- Pull-to-refresh

**États gérés** :
- `summary: WalletSummary | null`
- `activity: WalletActivityItem[]`
- `loading`, `refreshing`, `loadingMore`
- `payoutModalVisible`, `payoutAmount`, `payoutLoading`

### Mobile - Tab Bar

**Ordre des onglets** : Home | Wallet | + | Cadeaux | Profil

```typescript
<Tab.Screen name="Home" ... />
<Tab.Screen name="Wallet" ... />
<Tab.Screen name="Add" ... />
<Tab.Screen name="Gifts" ... />
<Tab.Screen name="Profile" ... />
```

### Mobile - Deep Linking

**app.json** :
```json
{
  "scheme": "humdaddy"
}
```

**RootNavigator** :
- `StripeDeepLinkHandler` composant
- Écoute `Linking.addEventListener('url', ...)`
- Gère `humdaddy://stripe/return` et `humdaddy://stripe/refresh`
- Appelle `refreshUser()` + affiche Alert

### Mobile - API Wallet

**walletApi.ts** :
```typescript
walletApi.getSummary(): Promise<WalletSummary>
walletApi.listActivity(params): Promise<WalletActivityResponse>
walletApi.createPayout({ amount, speed }): Promise<PayoutResponse>
```

### Tests

**Mobile - Wallet** :
1. Tab Wallet visible dans la barre
2. Summary OK + amounts affichés en € (format fr-FR)
3. Retrait < 100€ bloqué
4. Retrait > available bloqué
5. Retrait validé → payout créé
6. Payout instant fallback standard si non disponible
7. Historique paginé correctement

**Stripe onboarding** :
1. Depuis app : "Vérifier identité" ouvre Stripe
2. Fin onboarding → redirige web-app `/stripe/return?context=mobile`
3. Web-app tente d'ouvrir app via deeplink
4. App reçoit deeplink → refreshUser() + Alert "Compte Stripe mis à jour"
5. Bloc "Vérifier identité" disparaît si status = actif

---

## CHANGELOG

### 2026-01-19 - Étape 13 Complétée

**Backend - wallet.service.js** :
- Ajout `getWalletSummary()` avec balance Stripe + total reçu
- Ajout `getWalletActivity()` avec pagination (transactions + cashouts)
- Ajout `createPayout()` avec fallback instant → standard
- Ajout `checkPayoutAllowed()` et `getPayoutBlockedReasons()`

**Backend - wallet.controller.js** :
- Ajout `getSummary`, `getActivity`, `requestPayout`

**Backend - wallet.routes.js** :
- Ajout routes `/summary`, `/activity`, `/payouts`

**Backend - stripeConnect.service.js** :
- `createAccountLink()` redirige vers web-app avec `?context=mobile`

**Web-app - Pages Stripe** :
- `/stripe/return/page.tsx` - Page retour avec deeplink
- `/stripe/refresh/page.tsx` - Page refresh avec deeplink

**Mobile - API** :
- `walletApi.ts` nouveau service

**Mobile - Écrans** :
- `WalletScreen.tsx` - Écran wallet complet

**Mobile - Navigation** :
- `AppTabs.tsx` - Ajout onglet Wallet
- `RootNavigator.tsx` - `StripeDeepLinkHandler` pour gérer deeplinks
- `navigation.ts` - Ajout `Wallet` à `AppTabsParamList`

**Mobile - Configuration** :
- `app.json` - Ajout `scheme: "humdaddy"`

---

**FIN DE L'ÉTAPE 13**

---

## ÉTAPE 14 - INTERNATIONALIZATION (FR/EN)

### Résumé

Implémentation d'un système i18n maison (sans dépendances externes) pour supporter le français et l'anglais dans l'application mobile.

### Stack i18n

- **Pas de dépendances externes** : Pas de i18next, react-i18next, ou autre lib
- **Context React** : `I18nProvider` + hook `useI18n()`
- **Dictionnaires** : Objets TypeScript typés (`fr.ts`, `en.ts`)
- **Persistance** : SecureStore avec clé `app_language`
- **Langue par défaut** : Français (`fr`)

### Architecture

```
src/services/i18n/
├── index.ts              # Export centralisé
├── i18n.ts               # Fonction translate() + interpolation
├── i18nStorage.ts        # Persistance SecureStore
├── I18nContext.tsx       # React Context + Provider + useI18n hook
└── locales/
    ├── index.ts          # Export fr, en
    ├── fr.ts             # Dictionnaire français (complet)
    └── en.ts             # Dictionnaire anglais (complet)
```

### Service i18n

**i18nStorage.ts** :
```typescript
import * as SecureStore from 'expo-secure-store';

const LANGUAGE_KEY = 'app_language';
export type Language = 'fr' | 'en';

export const i18nStorage = {
  getLanguage: async (): Promise<Language | null> => {...},
  setLanguage: async (lang: Language): Promise<void> => {...},
};
```

**i18n.ts** :
```typescript
import { fr } from './locales/fr';
import { en } from './locales/en';

export const DEFAULT_LANGUAGE: Language = 'fr';

// Accès aux clés imbriquées : 'home.quickActions.title'
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined

// Interpolation : {{name}} → valeur
function interpolate(text: string, params?: Record<string, string | number>): string

// Traduction principale
export function translate(
  key: string,
  language: Language,
  params?: Record<string, string | number>
): string
```

**I18nContext.tsx** :
```typescript
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

export function I18nProvider({ children }: { children: ReactNode })
export function useI18n(): I18nContextType
```

### Convention des clés

Les clés de traduction suivent une convention hiérarchique :

| Préfixe | Usage |
|---------|-------|
| `common.*` | Boutons, actions génériques (OK, Cancel, Save, etc.) |
| `tabs.*` | Labels des onglets de navigation |
| `auth.*` | Écrans d'authentification (link, login, otp, profileForm, profileCustomize) |
| `home.*` | Écran d'accueil (welcome, yourLink, verifyIdentity, quickActions, etc.) |
| `gifts.*` | Cadeaux (title, create, detail, etc.) |
| `addGiftModal.*` | Modal d'ajout de cadeau |
| `profile.*` | Écran profil |
| `wallet.*` | Écran wallet (available, pending, withdraw, history, etc.) |
| `stripe.*` | Retour Stripe (return, status) |
| `errors.*` | Messages d'erreur |
| `validation.*` | Messages de validation formulaire |

### Exemples d'utilisation

**Simple** :
```typescript
const { t } = useI18n();
<Text>{t('common.save')}</Text>
// FR: "Enregistrer"
// EN: "Save"
```

**Avec interpolation** :
```typescript
<Text>{t('home.welcome', { name: user.publicName })}</Text>
// FR: "Bienvenue, Jean"
// EN: "Welcome, Jean"
```

**Clé manquante** (dev mode) :
```typescript
t('nonexistent.key')
// Retourne: "nonexistent.key"
// Console: "[i18n] Missing translation for key: nonexistent.key in language: fr"
```

### Language Switch (ProfileScreen)

Le switch de langue est intégré dans ProfileScreen avec deux boutons FR/EN :

```typescript
const { language, setLanguage } = useI18n();

<View style={styles.languageSwitch}>
  <Pressable
    style={[styles.languageButton, language === 'fr' && styles.languageButtonActive]}
    onPress={() => setLanguage('fr')}
  >
    <Text style={[styles.languageButtonText, language === 'fr' && styles.languageButtonTextActive]}>
      FR
    </Text>
  </Pressable>
  <Pressable
    style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
    onPress={() => setLanguage('en')}
  >
    <Text style={[styles.languageButtonText, language === 'en' && styles.languageButtonTextActive]}>
      EN
    </Text>
  </Pressable>
</View>
```

### Fichiers modifiés

**App.tsx** :
- Ajout `I18nProvider` comme wrapper externe

**Screens traduits** :
- `LinkScreen.tsx`
- `PhoneOtpScreen.tsx`
- `ProfileFormScreen.tsx`
- `ProfileCustomizeScreen.tsx`
- `HomeScreen.tsx`
- `WalletScreen.tsx`
- `ProfileScreen.tsx` (+ switch langue)

**Components traduits** :
- `QuickActionsCard.tsx` (utilise `labelKey` au lieu de `label`)
- `AddGiftModal.tsx` (utilise `titleKey`, `descriptionKey`)
- `IdentityVerificationCard.tsx` (fonction `getStatusInfo` accepte `t`)

**Navigation traduite** :
- `AppTabs.tsx` (labels des onglets via `t('tabs.*')`)

### Comment ajouter une traduction

1. **Ajouter la clé dans `fr.ts`** :
```typescript
export const fr = {
  mySection: {
    myKey: 'Ma traduction en français',
  },
};
```

2. **Ajouter la clé dans `en.ts`** :
```typescript
export const en = {
  mySection: {
    myKey: 'My English translation',
  },
};
```

3. **Utiliser dans le composant** :
```typescript
const { t } = useI18n();
<Text>{t('mySection.myKey')}</Text>
```

### Tests

**Switch langue** :
1. Ouvrir ProfileScreen
2. Vérifier boutons FR/EN affichés
3. Cliquer sur EN → toute l'app passe en anglais
4. Relancer l'app → langue EN persistée
5. Cliquer sur FR → retour en français

**Traductions** :
1. Vérifier HomeScreen : "Bienvenue" vs "Welcome"
2. Vérifier tabs : "Accueil" vs "Home"
3. Vérifier WalletScreen : "Solde disponible" vs "Available balance"
4. Vérifier modals et boutons

---

## CHANGELOG

### 2026-01-19 - Étape 14 Complétée

**Mobile - Services i18n** :
- `src/services/i18n/i18nStorage.ts` - Persistance SecureStore
- `src/services/i18n/i18n.ts` - Fonction translate avec interpolation
- `src/services/i18n/I18nContext.tsx` - React Context + Provider + hook
- `src/services/i18n/locales/fr.ts` - Dictionnaire français complet
- `src/services/i18n/locales/en.ts` - Dictionnaire anglais complet
- `src/services/i18n/locales/index.ts` - Export locales
- `src/services/i18n/index.ts` - Export centralisé

**Mobile - App.tsx** :
- Ajout `I18nProvider` comme wrapper externe

**Mobile - Screens traduits** :
- Tous les écrans auth (Link, PhoneOtp, ProfileForm, ProfileCustomize)
- Tous les écrans app (Home, Wallet, Profile)
- ProfileScreen avec switch langue FR/EN

**Mobile - Components traduits** :
- QuickActionsCard (labelKey)
- AddGiftModal (titleKey, descriptionKey)
- IdentityVerificationCard (getStatusInfo avec t)

**Mobile - Navigation** :
- AppTabs labels traduits via t('tabs.*')

---

**FIN DE L'ÉTAPE 14**

---

## BUGFIXES - 2026-01-19

### BUGFIX 1 — Paiements Stripe non bloqués

**Problème** : Les daddy's ne pouvaient pas payer un cadeau si la baby n'avait pas terminé l'onboarding Stripe (stripeChargesEnabled === false).

**Solution** :
- Suppression du blocage basé sur `stripeChargesEnabled` dans `stripe.service.js`
- Les paiements sont désormais autorisés tant que `stripeConnectAccountId` existe
- Stripe gère les fonds en attente jusqu'à ce que l'onboarding soit complété
- Seul le cas "pas de compte Connect" retourne une erreur 409

**Fichier modifié** :
- `backend-api/src/services/stripe.service.js` - Suppression du check `stripeChargesEnabled` dans `createCheckoutSession` et `createPublicCheckoutSession`

**Comportement attendu** :
- ✅ Baby avec `stripeConnectAccountId` mais onboarding incomplet → paiement OK
- ✅ Baby sans `stripeConnectAccountId` → erreur 409 "paiements non configurés"
- ✅ Retraits (wallet/payout) toujours bloqués si onboarding incomplet

### BUGFIX 2 — Édition des cadeaux actifs

**Problème** : Impossible de modifier un cadeau actif (non financé) depuis l'app mobile.

**Solution** :
- Ajout de la vérification `isPurchased` dans `updateGift` backend (erreur 409 si déjà financé)
- Création de l'écran `EditGiftScreen.tsx` pour l'édition
- Ajout du bouton "Modifier" dans `GiftDetailScreen.tsx`
- Navigation EditGift ajoutée dans GiftStack

**Fichiers backend modifiés** :
- `backend-api/src/services/gift.service.js` - Ajout check `isPurchased` dans `updateGift`

**Fichiers mobile créés** :
- `mobile-app/src/screens/app/gifts/EditGiftScreen.tsx`

**Fichiers mobile modifiés** :
- `mobile-app/src/screens/app/gifts/GiftDetailScreen.tsx` - Ajout bouton Modifier + i18n
- `mobile-app/src/navigation/GiftStack.tsx` - Ajout route EditGift
- `mobile-app/src/types/navigation.ts` - Ajout type EditGift
- `mobile-app/src/services/i18n/locales/fr.ts` - Ajout traductions édition
- `mobile-app/src/services/i18n/locales/en.ts` - Ajout traductions édition

**Comportement attendu** :
- ✅ Cadeau actif → bouton "Modifier" visible → édition OK
- ✅ Cadeau financé → bouton "Modifier" caché
- ✅ API updateGift sur cadeau financé → erreur 409
- ✅ Rechargement des données après retour de l'écran d'édition

---

### BUGFIX 3 — Flow Checkout Public Complet (2026-01-19)

**Problème** : Plusieurs bugs dans le flow de paiement public sur `humdaddy.com/<username>` :
1. Le message du donateur était requis mais devrait être optionnel
2. Le mapping des champs `pseudo`/`email` du web-app vers `donorPseudo`/`donorEmail` du backend ne fonctionnait pas
3. L'endpoint `getCheckoutSessionInfo` pouvait retourner `undefined` si le token n'était pas généré
4. L'upload de photo donor n'avait pas de route `/public/donor-photo` (sans giftId)

**Solutions appliquées** :

**Backend - checkout.controller.js** :
- `submitPublicDonorInfo` accepte maintenant `pseudo`, `email`, `message` (web-app) en plus de `donorPseudo`, `donorEmail`, `donorMessage` (legacy)
- Le message est désormais optionnel (défaut: chaîne vide)
- Suppression du try/catch qui avalait les erreurs

**Backend - stripe.service.js** :
- `getCheckoutSessionInfo` corrigé pour toujours retourner le `donorClaimToken`
- Si le token n'existe pas (transaction ancienne), il est généré automatiquement
- Si le paiement Stripe est confirmé mais webhook pas encore traité, la transaction est marquée comme succeeded et le token est généré
- Suppression du try/catch qui retournait `undefined`

**Backend - upload.controller.js** :
- `uploadDonorPhoto` modifié pour supporter les deux routes :
  - `POST /v1/uploads/gifts/:giftId/donor-photo` (avec giftId)
  - `POST /v1/uploads/public/donor-photo` (sans giftId, trouve le gift via donorClaimToken)

**Backend - upload.routes.js** :
- Ajout de la route `POST /v1/uploads/public/donor-photo`

**Web-app - DonorInfoForm.tsx** :
- Ajout de la prévisualisation de la photo sélectionnée
- Amélioration du label pour l'option photo payée
- Style amélioré du bouton de sélection de fichier

**Fichiers backend modifiés** :
- `backend-api/src/controllers/checkout.controller.js`
- `backend-api/src/services/stripe.service.js`
- `backend-api/src/controllers/upload.controller.js`
- `backend-api/src/routes/v1/upload.routes.js`

**Fichiers web-app modifiés** :
- `web-app/src/components/public/DonorInfoForm.tsx`

**Flow complet vérifié** :
1. ✅ Page publique `humdaddy.com/<username>` affiche les cadeaux
2. ✅ Clic "Financer" ouvre FundGiftModal avec option photo (+50€)
3. ✅ Clic "Payer" crée session Stripe et redirige vers checkout
4. ✅ Paiement Stripe réussi → webhook génère `donorClaimToken`
5. ✅ Retour sur page avec `?session_id=...` → affiche DonorInfoForm
6. ✅ `GET /v1/checkout/public/session` retourne le `donorClaimToken`
7. ✅ Soumission infos (pseudo, email, message optionnel) → OK
8. ✅ Si option photo payée : upload + soumission URL → OK
9. ✅ Baby voit les infos donateur dans GiftDetailScreen

---

**FIN DES BUGFIXES**

---

## ÉTAPE 16 - CORRECTIONS PRODUIT

### Résumé

Implémentation de corrections et améliorations produit :
- Limite de 4 cadeaux actifs par baby
- Affichage des transactions dans le wallet avec détails
- Section "Derniers cadeaux financés" sur Home
- Bouton partage sur les cadeaux
- Icônes sociales sur le profil public (web-app)
- Gestion du paramètre `?gift=` dans l'URL profil public
- Masquage de la bannière dans l'app mobile

### Limite 4 cadeaux actifs

**Backend - gift.service.js** :
- Ajout constante `MAX_ACTIVE_GIFTS = 4`
- Ajout fonction `countActiveGifts(babyId)` - compte les cadeaux non supprimés et non achetés
- `createGift()` vérifie la limite avant création et retourne erreur 403 si dépassée
- Ajout `getGiftStats()` retournant `{ activeCount, maxActive, canCreate }`

**Backend - Routes** :
- `GET /v1/gifts/me/stats` - Retourne les stats cadeaux

**Mobile - giftApi.ts** :
```typescript
interface GiftStats {
  activeCount: number;
  maxActive: number;
  canCreate: boolean;
}

giftApi.getStats(): Promise<GiftStats>
```

**Mobile - CreateGiftPhotosScreen.tsx** :
- Vérification de la limite au montage
- Si `!canCreate` → Alert + navigation back
- Affichage du compteur `activeCount / maxActive`

### Transactions Wallet

**Backend - wallet.service.js** :
- Ajout `listTransactions(user, { limit, cursor })` - Liste les transactions avec pagination
- Ajout `getTransactionById(user, transactionId)` - Détail d'une transaction

**Backend - Routes** :
- `GET /v1/wallet/me/transactions` - Liste transactions
- `GET /v1/wallet/me/transactions/:id` - Détail transaction

**Mobile - walletApi.ts** :
```typescript
interface Transaction {
  id: string;
  amount: number;
  amountNet: number;
  feeAmount: number;
  optionPhotoPaid: boolean;
  donorPseudo?: string;
  donorPhotoUrl?: string;
  gift?: { id: string; title: string; imageUrl?: string; };
  createdAt: string;
}

walletApi.listTransactions(params): Promise<TransactionsResponse>
walletApi.getTransaction(transactionId): Promise<Transaction>
```

**Mobile - Navigation** :
- Création de `WalletStack.tsx` avec écrans `WalletMain` et `TransactionDetail`
- `TransactionDetailScreen.tsx` affiche le détail complet d'une transaction

**Mobile - WalletScreen.tsx** :
- Clic sur transaction "received" → navigation vers TransactionDetail

### Home - Derniers financés

**Backend - gift.service.js** :
- Ajout `getRecentFundedGifts(babyId, limit)` - Retourne les cadeaux récemment financés

**Backend - Routes** :
- `GET /v1/gifts/me/recent-funded?limit=5` - Liste derniers cadeaux financés

**Mobile - giftApi.ts** :
```typescript
interface FundedGift {
  _id: string;
  title: string;
  mediaUrls?: string[];
  mainMediaIndex?: number;
  transaction?: {
    donorPseudo?: string;
    donorMessage?: string;
    donorPhotoUrl?: string;
  };
}

giftApi.getRecentFunded(limit): Promise<FundedGift[]>
```

**Mobile - HomeScreen.tsx** :
- Section "Derniers cadeaux financés" avec liste cliquable
- Navigation vers GiftDetail au clic
- Affichage photo donateur + message si présents

### Partage cadeau

**Mobile - GiftDetailScreen.tsx** :
- Import `Share` de React Native
- Import `useAuth` pour récupérer le username
- Fonction `handleShare()` génère l'URL `https://humdaddy.com/<username>?gift=<giftId>`
- Bouton "Partager" toujours visible

### Web-app - Profil social

**Web-app - SocialLinks.tsx** :
- Ajout d'icônes SVG pour chaque réseau social (OnlyFans, MYM, Instagram, X, Twitch)
- Couleurs spécifiques par plateforme
- Style amélioré avec hover effects

### Web-app - Paramètre ?gift=

**Web-app - [username]/page.tsx** :
- Lecture du paramètre `?gift=` via `useSearchParams()`
- Si présent et cadeau trouvé et non acheté → ouvre FundGiftModal automatiquement
- Clear du paramètre URL après ouverture

### Masquage bannière

**Mobile - ProfileCustomizeScreen.tsx** (onboarding) :
- Suppression du state `bannerAsset`
- Suppression du picker bannière
- Suppression de l'upload bannière
- Suppression des styles bannière inutilisés

**Mobile - ProfileScreen.tsx** (profil) :
- Suppression du state `uploadingBanner`
- Modification de `pickImage()` et `uploadImage()` pour ne plus gérer 'banner'
- Remplacement de la section Banner+Avatar par Avatar seul (centré)
- Nouveau style `avatarContainerStandalone` (120x120)

### Fichiers modifiés

**Backend** :
- `backend-api/src/services/gift.service.js`
- `backend-api/src/controllers/gift.controller.js`
- `backend-api/src/routes/v1/gift.routes.js`
- `backend-api/src/services/wallet.service.js`
- `backend-api/src/controllers/wallet.controller.js`
- `backend-api/src/routes/v1/wallet.routes.js`

**Mobile** :
- `mobile-app/src/services/api/giftApi.ts`
- `mobile-app/src/services/api/walletApi.ts`
- `mobile-app/src/screens/app/gifts/CreateGiftPhotosScreen.tsx`
- `mobile-app/src/screens/app/gifts/GiftDetailScreen.tsx`
- `mobile-app/src/screens/app/HomeScreen.tsx`
- `mobile-app/src/screens/app/WalletScreen.tsx`
- `mobile-app/src/screens/app/wallet/TransactionDetailScreen.tsx` (nouveau)
- `mobile-app/src/screens/app/ProfileScreen.tsx`
- `mobile-app/src/screens/auth/ProfileCustomizeScreen.tsx`
- `mobile-app/src/navigation/WalletStack.tsx` (nouveau)
- `mobile-app/src/navigation/AppTabs.tsx`
- `mobile-app/src/types/navigation.ts`
- `mobile-app/src/services/i18n/locales/fr.ts`
- `mobile-app/src/services/i18n/locales/en.ts`

**Web-app** :
- `web-app/src/components/public/SocialLinks.tsx`
- `web-app/src/app/[username]/page.tsx`

---

## CHANGELOG

### 2026-01-20 - Étape 16 Complétée

**Backend - Gift** :
- Ajout limite 4 cadeaux actifs (`MAX_ACTIVE_GIFTS`)
- Ajout `countActiveGifts()`, `getGiftStats()`, `getRecentFundedGifts()`
- Routes `/me/stats`, `/me/recent-funded`

**Backend - Wallet** :
- Ajout `listTransactions()`, `getTransactionById()`
- Routes `/me/transactions`, `/me/transactions/:id`

**Mobile - Gift** :
- Vérification limite dans CreateGiftPhotosScreen
- Interface `GiftStats`, `FundedGift`
- Bouton partage dans GiftDetailScreen

**Mobile - Wallet** :
- Création WalletStack avec TransactionDetailScreen
- Navigation vers détail transaction

**Mobile - Home** :
- Section "Derniers cadeaux financés"
- Navigation vers détail cadeau

**Mobile - Profil** :
- Suppression bannière (onboarding + profil)
- Avatar centré et agrandi

**Web-app** :
- Icônes sociales avec couleurs
- Gestion paramètre `?gift=` pour ouverture auto modal

---

**FIN DE L'ÉTAPE 16**

---

## ÉTAPE CORRECTION — Fiche Produit + Style "Déjà Financé" + Top Daddy

### Résumé

Corrections et améliorations du profil public web-app :
- Fix Next.js Suspense pour useSearchParams (erreur build)
- Fiche produit accessible via `?gift=<giftId>`
- Overlay "déjà financé" sur les cartes cadeaux
- Bloc "Top Daddy" (Top 5 supporters)

### Fix Next.js Suspense

**Problème** : `useSearchParams() should be wrapped in a suspense boundary`

**Solution** :
- Création de `PublicProfileClient.tsx` - composant client avec toute la logique
- Modification de `page.tsx` - wrapper Suspense autour de PublicProfileClient

**web-app/src/app/[username]/page.tsx** :
```tsx
import { Suspense } from 'react';
import PublicProfileClient from './PublicProfileClient';

export default function PublicProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PublicProfileClient />
    </Suspense>
  );
}
```

### Fiche Produit (ProductDetail)

**web-app/src/components/public/ProductDetail.tsx** (nouveau) :
- Galerie avec image principale + thumbnails cliquables
- Prix, description, lien externe
- Bouton CTA "Financer ce caprice"
- Bouton fermer

**Fonctionnalités** :
- URL: `/{username}?gift=<giftId>` ouvre la fiche produit
- Scroll automatique vers la fiche
- Navigation URL sans rechargement (router.push/replace)

**PublicProfileClient.tsx** :
```typescript
// State
const [viewingGift, setViewingGift] = useState<Gift | null>(null);
const productDetailRef = useRef<HTMLDivElement>(null);

// Handler pour voir un cadeau
const handleViewGift = (gift: Gift) => {
  setViewingGift(gift);
  router.push(`/${username}?gift=${gift._id}`, { scroll: false });
  setTimeout(() => {
    productDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};

// Handler pour fermer
const handleCloseProductDetail = () => {
  setViewingGift(null);
  router.replace(`/${username}`, { scroll: false });
};
```

### Overlay "Déjà Financé"

**web-app/src/components/public/GiftCard.tsx** modifié :
- Suppression du bloc supplémentaire pour cadeaux financés
- Ajout d'un overlay sur l'image avec texte "{donorPseudo} a offert ce cadeau"
- Hauteur de carte identique (financé ou non)
- Bouton "Déjà financé" désactivé avec `cursor-not-allowed`
- Prop `onView` ajoutée pour navigation vers fiche produit

```tsx
{isPurchased && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
    <p className="text-base font-semibold text-white">
      {gift.purchasedBy?.donorPseudo || 'Un daddy'} a offert ce cadeau
    </p>
  </div>
)}
```

### Top Daddy (Top 5 Supporters)

**web-app/src/components/public/TopDaddyCard.tsx** (nouveau) :
- Affiche les 5 meilleurs supporters
- Trié par total € desc, puis count desc (backend)
- Badge "VIP" pour le #1
- Style différencié pour le premier (bg-accent/10, border accent)

**Interface Supporter** :
```typescript
interface Supporter {
  name: string;   // donorPseudo
  total: number;  // total en centimes
  count: number;  // nombre de cadeaux
}
```

**Backend** : Déjà implémenté dans `getPublicWishlist()` - retourne `supportersTop`

### Fichiers Créés/Modifiés

**Web-app** :
- `web-app/src/app/[username]/page.tsx` - Wrapper Suspense
- `web-app/src/app/[username]/PublicProfileClient.tsx` - Composant client (nouveau)
- `web-app/src/components/public/ProductDetail.tsx` - Fiche produit (nouveau)
- `web-app/src/components/public/TopDaddyCard.tsx` - Top Daddy (nouveau)
- `web-app/src/components/public/GiftCard.tsx` - Overlay + onView prop

---

## CHANGELOG

### 2026-01-20 - Étape Correction Complétée

**Web-app - Suspense Fix** :
- Création PublicProfileClient.tsx avec toute la logique client
- page.tsx simplifié avec Suspense boundary

**Web-app - Fiche Produit** :
- ProductDetail.tsx avec galerie, prix, description, CTA
- Navigation URL via ?gift= param
- Scroll automatique vers la fiche

**Web-app - Overlay Déjà Financé** :
- GiftCard modifié pour overlay sur image
- Même hauteur pour toutes les cartes
- Ajout prop onView pour navigation

**Web-app - Top Daddy** :
- TopDaddyCard.tsx affichant Top 5 supporters
- Badge VIP pour le #1
- Utilise supportersTop du backend

---

**FIN DE L'ÉTAPE CORRECTION**
