# HumDaddy Mobile - PROJECT MEMORY

## INFORMATIONS PROJET

**Nom**: HumDaddy Mobile
**Framework**: Expo SDK 54 + React Native 0.81.5
**Langage**: TypeScript
**Styling**: React Native StyleSheet (PAS de Tailwind/NativeWind)
**État**: Étape 7 - Upload Avatar + Banner

---

## ARCHITECTURE

```
mobile-app/
├── .env.example                     # Template variables d'environnement
├── .gitignore                       # Ignore .env et autres
├── README.md                        # Documentation du projet
├── App.tsx                          # Point d'entrée → AuthProvider → RootNavigator
├── src/
│   ├── assets/                      # Fichiers statiques (vide pour l'instant)
│   ├── navigation/
│   │   ├── AuthStack.tsx           # Stack onboarding (Link → Login → OTP → Form → Customize)
│   │   ├── AppTabs.tsx             # Tabs app principale (Home + Profile)
│   │   └── RootNavigator.tsx       # Switch Auth/App basé sur AuthContext
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LinkScreen.tsx      # Écran d'accueil (Créer/Connexion)
│   │   │   ├── LoginScreen.tsx     # Placeholder connexion
│   │   │   ├── PhoneOtpScreen.tsx  # Saisie téléphone + OTP avec appels API
│   │   │   ├── ProfileFormScreen.tsx       # Formulaire profil (nom, 18+)
│   │   │   └── ProfileCustomizeScreen.tsx  # Avatar, banner, username, bio + upload
│   │   └── app/
│   │       ├── HomeScreen.tsx      # Placeholder dashboard
│   │       └── ProfileScreen.tsx   # Bouton déconnexion via AuthContext
│   ├── services/
│   │   ├── auth/
│   │   │   ├── AuthContext.tsx     # Context global d'authentification
│   │   │   └── authStorage.ts      # SecureStore pour persistance session + token
│   │   └── api/
│   │       ├── index.ts            # Export centralisé des services API
│   │       ├── apiConfig.ts        # Configuration baseURL et timeout
│   │       ├── apiError.ts         # Classe ApiError et normalisation erreurs
│   │       ├── httpClient.ts       # Instance Axios avec intercepteurs
│   │       ├── otpApi.ts           # Service OTP (requestOtp, verifyOtp)
│   │       ├── userApi.ts          # Service User (getMe, updateMe)
│   │       └── uploadApi.ts        # Service Upload (avatar, banner)
│   ├── theme/
│   │   └── colors.ts               # Palette de couleurs centralisée
│   └── types/
│       └── navigation.ts           # Types pour AuthStack et AppTabs
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

### Upload (Images profil)

| Endpoint | Méthode | Authentifié | Body | Réponse |
|----------|---------|-------------|------|---------|
| `/v1/uploads/profile/avatar` | POST | Oui | `multipart/form-data` (champ `file`) | `{ url, pathname }` |
| `/v1/uploads/profile/banner` | POST | Oui | `multipart/form-data` (champ `file`) | `{ url, pathname }` |

**Contraintes upload** :
- Formats acceptés : `image/jpeg`, `image/png`, `image/webp`
- Taille max : 5 MB
- Stockage : Vercel Blob
- Path : `${userId}/profile/avatar-${uuid}.${ext}` ou `${userId}/profile/banner-${uuid}.${ext}`

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
- `isLoading` (boolean) - Chargement initial de la session

**Méthodes**:
- `login(token?: string)` - Sauvegarde session + token dans SecureStore
- `logout()` - Clear SecureStore, set isAuthenticated = false
- `restoreSession()` - Appelé au montage, charge session depuis SecureStore

### AuthStorage (`src/services/auth/authStorage.ts`)

**Fonctions**:
- `saveSession(token?)` - Enregistre session + token optionnel
- `loadSession()` - Retourne `true` si session existe
- `getToken()` - Retourne le token JWT si présent
- `clearSession()` - Supprime session et token

**Clés SecureStore**:
- `auth_session`: `"true"` si connecté
- `auth_token`: JWT token (si fourni par le backend)

### Comportement

1. **Au lancement**: `restoreSession()` charge la session
   - Si session existe → `isAuthenticated = true` → AppTabs
   - Sinon → `isAuthenticated = false` → AuthStack

2. **Onboarding OTP**:
   - PhoneOtpScreen appelle `otpApi.requestOtp()` et `otpApi.verifyOtp()`
   - Si backend non joignable → mode stub (code 000000 accepté)
   - Token passé via navigation params

3. **Onboarding Profil**:
   - ProfileFormScreen collecte publicName et is18Plus
   - ProfileCustomizeScreen :
     - Permet de choisir avatar et banner via expo-image-picker
     - Upload les images via `uploadApi`
     - Appelle `userApi.updateMe()` avec toutes les données
     - Appelle `login(token)` pour finaliser

4. **Déconnexion** (ProfileScreen):
   - Appelle `logout()` → Clear session
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
  PhoneOtp: undefined;
  ProfileForm: { accessToken?: string; isNewUser?: boolean };
  ProfileCustomize: { accessToken?: string; publicName?: string; is18Plus?: boolean };
};
```

### Flow Onboarding (AuthStack)

1. **LinkScreen** → Boutons Créer/Connexion
2. **PhoneOtpScreen** → Saisie téléphone + OTP avec appels API
3. **ProfileFormScreen** → Nom public + checkbox 18+
4. **ProfileCustomizeScreen** → Avatar, banner, username, bio → upload → `login(token)` → AppTabs

### RootNavigator

- Utilise `useAuth()` pour récupérer l'état
- Affiche loader si `isLoading === true`
- Affiche `AuthStack` si `!isAuthenticated`
- Affiche `AppTabs` si `isAuthenticated`

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
   - `login()` → sauvegarde session locale uniquement

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

---

## TESTS À EFFECTUER

### Avec backend (localhost:4000 accessible)
1. Lancer l'app → Écran Link
2. Parcourir Link → PhoneOtp → entrer téléphone → recevoir OTP
3. Entrer le code OTP reçu → ProfileForm
4. Remplir nom + checkbox 18+ → ProfileCustomize
5. **Sélectionner un avatar** (tap sur le cercle)
6. **Sélectionner une bannière** (tap sur le rectangle)
7. Optionnel: username + bio → Terminer
8. Vérifier les uploads dans la console (status "Upload avatar...", "Upload bannière...")
9. Vérifier que l'app arrive sur AppTabs
10. Vérifier en base que avatarUrl et bannerUrl sont remplis

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

## CHANGELOG

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

**FIN DE L'ÉTAPE 7**
