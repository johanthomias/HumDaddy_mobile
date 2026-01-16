import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Link'>;

export default function LinkScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur HumDaddy</Text>
      <Text style={styles.subtitle}>Gérez le sommeil de votre bébé</Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('PhoneOtp')}
      >
        <Text style={styles.buttonText}>Créer mon compte</Text>
      </Pressable>

      <Pressable
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonSecondaryText}>Se connecter</Text>
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
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.muted,
  },
  buttonSecondaryText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
});
