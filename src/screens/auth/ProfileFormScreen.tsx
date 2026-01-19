import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileForm'>;

export default function ProfileFormScreen({ navigation, route }: Props) {
  const { prefilledUsername } = route.params || {};

  const [publicName, setPublicName] = useState('');
  const [is18Plus, setIs18Plus] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!publicName.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }

    // Passer les données au prochain écran
    navigation.navigate('ProfileCustomize', {
      publicName: publicName.trim(),
      is18Plus,
      prefilledUsername,
    });
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
        <Text style={styles.title}>Créer votre profil</Text>
        <Text style={styles.subtitle}>Quelques informations pour commencer</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom public</Text>
          <TextInput
            style={styles.input}
            placeholder="Comment voulez-vous être appelé ?"
            placeholderTextColor={colors.muted}
            value={publicName}
            onChangeText={(text) => {
              setPublicName(text);
              setError('');
            }}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.label}>J'ai plus de 18 ans</Text>
            <Text style={styles.hint}>Requis pour certaines fonctionnalités</Text>
          </View>
          <Switch
            value={is18Plus}
            onValueChange={setIs18Plus}
            trackColor={{ false: colors.primaryLight, true: colors.accent }}
            thumbColor={colors.text}
          />
        </View>

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continuer</Text>
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
    justifyContent: 'center',
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
    marginBottom: 40,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
