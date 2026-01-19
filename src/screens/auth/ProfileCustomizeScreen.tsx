import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { useAuth } from '../../services/auth/AuthContext';
import { userApi, uploadApi, getErrorMessage } from '../../services/api';
import { getToken } from '../../services/auth/authStorage';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileCustomize'>;

export default function ProfileCustomizeScreen({ route }: Props) {
  const { publicName, is18Plus, prefilledUsername } = route.params || {};
  const { completeOnboarding, setAuthenticated } = useAuth();

  const [username, setUsername] = useState(prefilledUsername || '');
  const [bio, setBio] = useState('');
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [bannerAsset, setBannerAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');

  const pickImage = async (type: 'avatar' | 'banner') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'avatar') {
        setAvatarAsset(result.assets[0]);
      } else {
        setBannerAsset(result.assets[0]);
      }
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');
    setUploadStatus('');

    const token = await getToken();

    let avatarUrl: string | undefined;
    let avatarPathname: string | undefined;
    let bannerUrl: string | undefined;
    let bannerPathname: string | undefined;

    // Upload avatar si sélectionné
    if (avatarAsset && token) {
      try {
        setUploadStatus('Upload avatar...');
        const result = await uploadApi.uploadProfileAvatar(avatarAsset);
        avatarUrl = result.url;
        avatarPathname = result.pathname;
      } catch (err) {
        const message = getErrorMessage(err);
        console.warn('[ProfileCustomize] Erreur upload avatar:', message);
        // Continue sans bloquer
      }
    }

    // Upload banner si sélectionné
    if (bannerAsset && token) {
      try {
        setUploadStatus('Upload bannière...');
        const result = await uploadApi.uploadProfileBanner(bannerAsset);
        bannerUrl = result.url;
        bannerPathname = result.pathname;
      } catch (err) {
        const message = getErrorMessage(err);
        console.warn('[ProfileCustomize] Erreur upload banner:', message);
        // Continue sans bloquer
      }
    }

    // Mettre à jour le profil via API si on a un token
    if (token) {
      try {
        setUploadStatus('Sauvegarde profil...');
        await userApi.updateMe({
          publicName,
          is18Plus,
          username: username.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarUrl,
          avatarPathname,
          bannerUrl,
          bannerPathname,
        });
      } catch (err) {
        const message = getErrorMessage(err);
        if (!message.includes('Impossible de joindre le serveur')) {
          console.warn('[ProfileCustomize] Erreur updateMe:', message);
        }
      }
    } else {
      console.warn('[ProfileCustomize] Pas de token, profil non synchronisé avec le backend');
    }

    // Finaliser l'onboarding local
    try {
      if (!token) {
        await setAuthenticated('');
      }
      await completeOnboarding();
    } catch (err) {
      setError('Erreur lors de la finalisation. Réessayez.');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Personnaliser</Text>
        <Text style={styles.subtitle}>Optionnel - vous pouvez compléter plus tard</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Banner Picker */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>Bannière</Text>
          <Pressable
            style={styles.bannerPicker}
            onPress={() => pickImage('banner')}
            disabled={isLoading}
          >
            {bannerAsset ? (
              <Image source={{ uri: bannerAsset.uri }} style={styles.bannerPreview} />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Text style={styles.placeholderText}>+ Ajouter une bannière</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Avatar Picker */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>Photo de profil</Text>
          <Pressable
            style={styles.avatarPicker}
            onPress={() => pickImage('avatar')}
            disabled={isLoading}
          >
            {avatarAsset ? (
              <Image source={{ uri: avatarAsset.uri }} style={styles.avatarPreview} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.placeholderIcon}>+</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          <TextInput
            style={styles.input}
            placeholder="@username (optionnel)"
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Décrivez-vous en quelques mots (optionnel)"
            placeholderTextColor={colors.muted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {uploadStatus ? (
          <Text style={styles.uploadStatus}>{uploadStatus}</Text>
        ) : null}

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size={20} color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Terminer</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 32,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 16,
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  bannerPicker: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.muted,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.muted,
    borderStyle: 'dashed',
    borderRadius: 50,
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 14,
  },
  placeholderIcon: {
    color: colors.muted,
    fontSize: 32,
    fontWeight: '300',
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: colors.text,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 16,
  },
  uploadStatus: {
    fontSize: 14,
    color: colors.accentPink,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
