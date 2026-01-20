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
import { useI18n, type Language } from '../../services/i18n';

const DEBOUNCE_MS = 1000;
const MAX_GALLERY_IMAGES = 3;
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function ProfileScreen() {
  const { t, language, setLanguage } = useI18n();
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
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Debounce refs
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChanges = useRef<UpdateUserPayload>({});

  const SOCIAL_BASE_URLS = {
    instagram: 'https://instagram.com/',
    twitter: 'https://twitter.com/',
    twitch: 'https://twitch.tv/',
    onlyfans: 'https://onlyfans.com/',
    mym: 'https://mym.fans/',
  } as const;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
const [saveMessage, setSaveMessage] = useState<string>(''); // "Enregistré", ou message d'erreur
const lastSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
const isSavingRef = useRef(false);
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

  if (debounceTimer.current) clearTimeout(debounceTimer.current);

  debounceTimer.current = setTimeout(async () => {
    if (Object.keys(pendingChanges.current).length === 0) return;

    // Evite d'empiler plusieurs saves en parallèle
    if (isSavingRef.current) return;

    const payload = pendingChanges.current;

    try {
      isSavingRef.current = true;
      setSaving(true);
      setSaveStatus('saving');
      setSaveMessage(t('common.saving'));

      await userApi.updateMe(payload);

      pendingChanges.current = {};
      await refreshUser();

      showSaved(); // "Enregistré ✓"
    } catch (error: any) {
      console.error('Auto-save failed:', error);

      // Essaie d'extraire le message backend
      const backendMsg =
        error?.message ||
        error?.response?.data?.message ||
        t('common.error');

      showError(backendMsg);

      // Important: on garde pendingChanges pour retenter ? (à toi de choisir)
      // Option A (recommandé): on garde, l'utilisateur modifie puis re-save
      // Option B: on reset pour éviter boucle
      // pendingChanges.current = {};
    } finally {
      isSavingRef.current = false;
      setSaving(false);
    }
  }, DEBOUNCE_MS);
}, [refreshUser, t]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
const showSaved = (message = t('common.saved')) => {
  setSaveStatus('saved');
  setSaveMessage(message);

  if (lastSavedTimer.current) clearTimeout(lastSavedTimer.current);
  lastSavedTimer.current = setTimeout(() => {
    setSaveStatus('idle');
    setSaveMessage('');
  }, 1500);
};

const showError = (message: string) => {
  setSaveStatus('error');
  setSaveMessage(message);

  // optionnel : repasser à idle après quelques secondes
  if (lastSavedTimer.current) clearTimeout(lastSavedTimer.current);
  lastSavedTimer.current = setTimeout(() => {
    setSaveStatus('idle');
    setSaveMessage('');
  }, 4000);
};


  const extractUsername = (fullUrl?: string, baseUrl?: string) => {
    if (!fullUrl || !baseUrl) return '';
    return fullUrl.replace(baseUrl, '').replace(/^@/, '');
  };

  const buildSocialUrl = (baseUrl: string, username: string) => {
    const clean = username.replace(/^@/, '').trim();
    return clean ? `${baseUrl}${clean}` : '';
  };

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

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
  };

  const pickImage = async (type: 'avatar' | 'gallery') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('errors.permissionDenied'), t('errors.cameraPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: type !== 'gallery',
      aspect: type === 'avatar' ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(type, result.assets[0]);
    }
  };

  const uploadImage = async (type: 'avatar' | 'gallery', asset: ImagePicker.ImagePickerAsset) => {
    try {
      if (type === 'avatar') {
        setUploadingAvatar(true);
        const { url } = await uploadApi.uploadProfileAvatar(asset);
        await userApi.updateMe({ avatarUrl: url });
        await refreshUser();
      } else if (type === 'gallery') {
        if (galleryUrls.length >= MAX_GALLERY_IMAGES) {
          Alert.alert(t('common.error'), t('profile.galleryCount', { count: galleryUrls.length, max: MAX_GALLERY_IMAGES }));
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
      Alert.alert(t('common.error'), t('errors.uploadFailed'));
    } finally {
      setUploadingAvatar(false);
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
      t('profile.logoutConfirm.title'),
      t('profile.logoutConfirm.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
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
  <Text style={styles.headerTitle}>{t('profile.title')}</Text>

  {(saveStatus === 'saving' || saveStatus === 'saved' || saveStatus === 'error') && (
    <View style={styles.savingIndicator}>
      {saveStatus === 'saving' ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Ionicons
          name={saveStatus === 'saved' ? 'checkmark-circle' : 'alert-circle'}
          size={16}
          color={saveStatus === 'saved' ? '#22c55e' : '#ef4444'}
        />
      )}
      <Text
        style={[
          styles.savingText,
          saveStatus === 'error' && { color: '#ef4444' },
          saveStatus === 'saved' && { color: '#22c55e' },
        ]}
        numberOfLines={1}
      >
        {saveStatus === 'saved' ? t('common.saved') : saveMessage}
      </Text>
    </View>
  )}
</View>


      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.mediaSection}>
          <Pressable style={styles.avatarContainerStandalone} onPress={() => pickImage('avatar')}>
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
          <Text style={styles.label}>{t('profile.username')}</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>@{user?.username || '...'}</Text>
            <Ionicons name="lock-closed" size={16} color={colors.muted} />
          </View>
        </View>

        {/* Public name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('profile.publicName')}</Text>
          <TextInput
            style={styles.input}
            value={publicName}
            onChangeText={handlePublicNameChange}
            placeholder={t('profile.publicName')}
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Bio */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('profile.bio')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={handleBioChange}
            placeholder={t('profile.bioPlaceholder')}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Social links */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('profile.socialLinks')}</Text>

          {/* Instagram */}
          <View style={styles.socialField}>
            <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            <Text style={styles.socialPrefix}>https://instagram.com/</Text>
            <TextInput
              style={styles.socialInput}
              value={extractUsername(socialLinks.instagram, SOCIAL_BASE_URLS.instagram)}
              onChangeText={(username) =>
                handleSocialLinkChange('instagram', buildSocialUrl(SOCIAL_BASE_URLS.instagram, username))
              }
              placeholder="username"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Twitter */}
          <View style={styles.socialField}>
            <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
            <Text style={styles.socialPrefix}>https://twitter.com/</Text>
            <TextInput
              style={styles.socialInput}
              value={extractUsername(socialLinks.twitter, SOCIAL_BASE_URLS.twitter)}
              onChangeText={(username) =>
                handleSocialLinkChange('twitter', buildSocialUrl(SOCIAL_BASE_URLS.twitter, username))
              }
              placeholder="username"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Twitch */}
          <View style={styles.socialField}>
            <Ionicons name="logo-twitch" size={20} color="#9146FF" />
            <Text style={styles.socialPrefix}>https://twitch.tv/</Text>
            <TextInput
              style={styles.socialInput}
              value={extractUsername(socialLinks.twitch, SOCIAL_BASE_URLS.twitch)}
              onChangeText={(username) =>
                handleSocialLinkChange('twitch', buildSocialUrl(SOCIAL_BASE_URLS.twitch, username))
              }
              placeholder="username"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* OnlyFans */}
          <View style={styles.socialField}>
            <Ionicons name="link-outline" size={20} color={colors.muted} />
            <Text style={styles.socialPrefix}>https://onlyfans.com/</Text>
            <TextInput
              style={styles.socialInput}
              value={extractUsername(socialLinks.onlyfans, SOCIAL_BASE_URLS.onlyfans)}
              onChangeText={(username) =>
                handleSocialLinkChange('onlyfans', buildSocialUrl(SOCIAL_BASE_URLS.onlyfans, username))
              }
              placeholder="username"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* MYM */}
          <View style={styles.socialField}>
            <Ionicons name="link-outline" size={20} color={colors.muted} />
            <Text style={styles.socialPrefix}>https://mym.fans/</Text>
            <TextInput
              style={styles.socialInput}
              value={extractUsername(socialLinks.mym, SOCIAL_BASE_URLS.mym)}
              onChangeText={(username) =>
                handleSocialLinkChange('mym', buildSocialUrl(SOCIAL_BASE_URLS.mym, username))
              }
              placeholder="username"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>


        {/* Gallery */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {t('profile.gallery')} ({galleryUrls.length}/{MAX_GALLERY_IMAGES})
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
                    <Text style={styles.addGalleryText}>{t('profile.addToGallery')}</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Language switch */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          <View style={styles.languageSwitch}>
            <Pressable
              style={[
                styles.languageButton,
                language === 'fr' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('fr')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'fr' && styles.languageButtonTextActive,
                ]}
              >
                FR
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.languageButton,
                language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive,
                ]}
              >
                EN
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Logout button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
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
    alignItems: 'center',
  },
  avatarContainerStandalone: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  languageSwitch: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted,
  },
  languageButtonTextActive: {
    color: colors.text,
  },

  socialPrefix: {
    fontSize: 13,
    color: colors.muted,
    marginLeft: 8,
  },

});
