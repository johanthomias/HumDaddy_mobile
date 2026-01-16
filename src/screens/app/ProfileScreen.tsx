import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../services/auth/AuthContext';

export default function ProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // RootNavigator gérera automatiquement la redirection vers AuthStack
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Placeholder - Informations utilisateur</Text>

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    textAlign: 'center',
    marginBottom: 48,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  logoutButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
