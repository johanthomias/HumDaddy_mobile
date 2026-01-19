import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { useAuth } from '../../services/auth/AuthContext';
import { userApi, uploadApi } from '../../services/api';
import type { UpdateUserPayload } from '../../services/api/userApi';
import type { SocialLinks } from '../../services/api/otpApi';

const DEBOUNCE_MS = 1000;
const MAX_GALLERY_IMAGES = 3;

export default function ProfileScreen() {
  const { user, refreshUser, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form state
  const [publicName, setPublicName] = useState(user?.publicName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(user?.socialLinks || {});
  const [galleryUrls, setGalleryUrls] = useState<string[]>(user?.galleryUrls || []);

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Debounce refs
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChanges = useRef<UpdateUserPayload>({});

  // Sync local state when user changes
  useEffect(() => {
    if (user) {
      setPublicName(user.publicName || '');
      setBio(user.bio || '');
      setSocialLinks(user.socialLinks || {});
      setGalleryUrls(user.galleryUrls || []);
    }
  }, [user]);

  // Auto-save with debounce
  const scheduleAutoSave = useCallback((changes: UpdateUserPayload) => {
    pendingChanges.current = { ...pendingChanges.current, ...changes };

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (Object.keys(pendingChanges.current).length === 0) return;

      try {
        setSaving(true);
        await userApi.updateMe(pendingChanges.current);
        pendingChanges.current = {};
        await refreshUser();
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, DEBOUNCE_MS);
  }, [refreshUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handlePublicNameChange = (value: string) => {
    setPublicName(value);
    scheduleAutoSave({ publicName: value });
  };

  const handleBioChange = (value: string) => {
    setBio(value);
    scheduleAutoSave({ bio: value });
  };

  const handleSocialLinkChange = (key: keyof SocialLinks, value: string) => {
    const updated = { ...socialLinks, [key]: value };
    setSocialLinks(updated);
    scheduleAutoSave({ socialLinks: updated });
  };

  const handleCopyLink = async () => {
    if (user?.publicProfileUrl) {
      await Clipboard.setStringAsync(user.publicProfileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const pickImage = async (type: 'avatar' | 'banner' | 'gallery') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès aux photos pour continuer.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: type !== 'gallery',
      aspect: type === 'avatar' ? [1, 1] : type === 'banner' ? [16, 9] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(type, result.assets[0]);
    }
  };

  const uploadImage = async (type: 'avatar' | 'banner' | 'gallery', asset: ImagePicker.ImagePickerAsset) => {
    try {
      if (type === 'avatar') {
        setUploadingAvatar(true);
        const { url } = await uploadApi.uploadProfileAvatar(asset);
        await userApi.updateMe({ avatarUrl: url });
        await refreshUser();
      } else if (type === 'banner') {
        setUploadingBanner(true);
        const { url } = await uploadApi.uploadProfileBanner(asset);
        await userApi.updateMe({ bannerUrl: url });
        await refreshUser();
      } else if (type === 'gallery') {
        if (galleryUrls.length >= MAX_GALLERY_IMAGES) {
          Alert.alert('Limite atteinte', `Maximum ${MAX_GALLERY_IMAGES} images dans la galerie.`);
          return;
        }
        setUploadingGallery(true);
        const { url } = await uploadApi.uploadProfileGallery(asset);
        const updatedGallery = [...galleryUrls, url];
        setGalleryUrls(updatedGallery);
        await userApi.updateMe({ galleryUrls: updatedGallery });
        await refreshUser();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Erreur', 'Échec de l\'upload. Veuillez réessayer.');
    } finally {
      setUploadingAvatar(false);
      setUploadingBanner(false);
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (index: number) => {
    const updatedGallery = galleryUrls.filter((_, i) => i !== index);
    setGalleryUrls(updatedGallery);
    try {
      await userApi.updateMe({ galleryUrls: updatedGallery });
      await refreshUser();
    } catch (error) {
      console.error('Failed to remove gallery image:', error);
      setGalleryUrls(galleryUrls);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon profil</Text>
        {saving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.savingText}>Sauvegarde...</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner + Avatar */}
        <View style={styles.mediaSection}>
          <Pressable style={styles.bannerContainer} onPress={() => pickImage('banner')}>
            {user?.bannerUrl ? (
              <Image source={{ uri: user.bannerUrl }} style={styles.banner} />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.muted} />
                <Text style={styles.placeholderText}>Ajouter une bannière</Text>
              </View>
            )}
            {uploadingBanner && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="large" color={colors.text} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color={colors.text} />
            </View>
          </Pressable>

          <Pressable style={styles.avatarContainer} onPress={() => pickImage('avatar')}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={colors.muted} />
              </View>
            )}
            {uploadingAvatar && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color={colors.text} />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={12} color={colors.text} />
            </View>
          </Pressable>
        </View>

        {/* Public link */}
        {user?.publicProfileUrl && (
          <Pressable style={styles.linkRow} onPress={handleCopyLink}>
            <Text style={styles.linkText} numberOfLines={1}>
              {user.publicProfileUrl}
            </Text>
            <Ionicons
              name={copiedLink ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copiedLink ? '#22c55e' : colors.muted}
            />
          </Pressable>
        )}

        {/* Username (read-only) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>@{user?.username || '...'}</Text>
            <Ionicons name="lock-closed" size={16} color={colors.muted} />
          </View>
        </View>

        {/* Public name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nom public</Text>
          <TextInput
            style={styles.input}
            value={publicName}
            onChangeText={handlePublicNameChange}
            placeholder="Votre nom public"
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Bio */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={handleBioChange}
            placeholder="Décrivez-vous en quelques mots..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Social links */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Réseaux sociaux</Text>

          <View style={styles.socialField}>
            <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            <TextInput
              style={styles.socialInput}
              value={socialLinks.instagram || ''}
              onChangeText={(v) => handleSocialLinkChange('instagram', v)}
              placeholder="Nom d'utilisateur Instagram"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.socialField}>
            <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
            <TextInput
              style={styles.socialInput}
              value={socialLinks.twitter || ''}
              onChangeText={(v) => handleSocialLinkChange('twitter', v)}
              placeholder="Nom d'utilisateur Twitter/X"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.socialField}>
            <Ionicons name="logo-twitch" size={20} color="#9146FF" />
            <TextInput
              style={styles.socialInput}
              value={socialLinks.twitch || ''}
              onChangeText={(v) => handleSocialLinkChange('twitch', v)}
              placeholder="Nom d'utilisateur Twitch"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Galerie ({galleryUrls.length}/{MAX_GALLERY_IMAGES})
          </Text>
          <View style={styles.galleryGrid}>
            {galleryUrls.map((url, index) => (
              <View key={url} style={styles.galleryItem}>
                <Image source={{ uri: url }} style={styles.galleryImage} />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeGalleryImage(index)}
                >
                  <Ionicons name="close" size={16} color={colors.text} />
                </Pressable>
              </View>
            ))}
            {galleryUrls.length < MAX_GALLERY_IMAGES && (
              <Pressable
                style={styles.addGalleryButton}
                onPress={() => pickImage('gallery')}
                disabled={uploadingGallery}
              >
                {uploadingGallery ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <>
                    <Ionicons name="add" size={32} color={colors.accent} />
                    <Text style={styles.addGalleryText}>Ajouter</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Logout button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    fontSize: 12,
    color: colors.muted,
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mediaSection: {
    marginBottom: 16,
  },
  bannerContainer: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  editBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -50,
    marginLeft: 20,
    borderWidth: 4,
    borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.accent,
    padding: 6,
    borderRadius: 12,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 14,
    color: colors.muted,
    flex: 1,
    marginRight: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    opacity: 0.7,
  },
  readOnlyText: {
    fontSize: 16,
    color: colors.muted,
  },
  sectionContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  socialField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  socialInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 12,
  },
  addGalleryButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGalleryText: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
});
