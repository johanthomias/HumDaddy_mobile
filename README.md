# HumDaddy Mobile

Application mobile HumDaddy construite avec Expo SDK 54 et React Native.

## Prérequis

- Node.js >= 20
- npm ou yarn
- Expo Go sur votre device (App Store / Play Store)
- Backend HumDaddy en cours d'exécution
- Variable d'environnement backend : `BLOB_READ_WRITE_TOKEN` (pour upload images)

## Installation

```bash
cd mobile-app
npm install
```

## Configuration

### Variables d'environnement

1. Copiez le fichier d'exemple :
```bash
cp .env.example .env
```

2. Modifiez `.env` avec votre configuration :
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```

### Trouver votre IP locale

Pour tester sur un device physique, vous devez utiliser l'IP locale de votre machine (localhost ne fonctionne pas).

**macOS / Linux :**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows :**
```bash
ipconfig
# Cherchez "IPv4 Address"
```

### Vérifier la connexion au backend

Avant de lancer l'app sur device, vérifiez que le backend est accessible :

1. Ouvrez Safari/Chrome sur votre device
2. Allez sur `http://VOTRE_IP:4000/health`
3. Vous devez voir une réponse JSON

Si ça ne marche pas :
- Vérifiez que le backend tourne (`npm run dev` dans backend-api)
- Vérifiez que device et Mac sont sur le même réseau WiFi
- Vérifiez le firewall de votre machine

## Lancement

### Simulateur (localhost suffit)

```bash
npx expo start
```

Pas besoin de `.env`, le fallback `http://localhost:4000` sera utilisé.

### Device physique (Expo Go)

1. Créez votre fichier `.env` avec votre IP locale
2. Lancez avec clear du cache :
```bash
npx expo start -c
```
3. Scannez le QR code avec Expo Go

**Important** : après modification du `.env`, vous devez :
- Arrêter le bundler (Ctrl+C)
- Relancer avec `npx expo start -c` (le `-c` force un clear du cache)

## Mode hors-ligne (stub)

Si le backend n'est pas accessible, l'app fonctionne en mode stub :
- Utilisez le code OTP `000000` pour passer l'authentification
- Les images sélectionnées ne seront pas uploadées (skip)
- Les données ne sont pas synchronisées mais la navigation fonctionne (session locale)

## Fonctionnalités

### Onboarding
1. **Écran d'accueil** - Choix créer compte / se connecter
2. **Vérification OTP** - Saisie téléphone puis code SMS
3. **Formulaire profil** - Nom public et confirmation 18+
4. **Personnalisation** - Avatar, bannière, username, bio

### Auth
- `onboarding_completed` est stocké dans SecureStore
- `logout()` réinitialise session + onboarding

### Upload d'images
- Sélection via la galerie du device
- Avatar : format carré (1:1)
- Bannière : format paysage (16:9)
- Formats supportés : JPEG, PNG, WebP
- Taille max : 5 MB

## Structure du projet

Voir `PROJECT_MEMORY.md` pour la documentation complète de l'architecture.

## Scripts

```bash
npm start       # Démarre Expo
npm run ios     # Lance sur simulateur iOS
npm run android # Lance sur émulateur Android
npm run web     # Lance en mode web
```
