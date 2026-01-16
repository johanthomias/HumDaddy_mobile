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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { otpApi, getErrorMessage } from '../../services/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneOtp'>;

export default function PhoneOtpScreen({ navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await otpApi.requestOtp(phoneNumber.trim());
      setShowOtpInput(true);
    } catch (err) {
      const message = getErrorMessage(err);
      console.log(err)
      // Si backend non joignable, on permet quand même de continuer (mode stub)
      if (message.includes('Impossible de joindre le serveur')) {
        console.warn('[PhoneOtpScreen] Backend non joignable, mode stub activé');
        setShowOtpInput(true);
        setError('Mode hors-ligne : utilisez le code 000000');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError('Veuillez entrer le code OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await otpApi.verifyOtp(phoneNumber.trim(), otpCode.trim());
      // Stocker le token dans les params pour ProfileForm
      navigation.navigate('ProfileForm', {
        accessToken: response.accessToken,
        isNewUser: response.isNewUser,
      });
    } catch (err) {
      const message = getErrorMessage(err);
      // Mode stub : accepter le code 000000 si backend non joignable
      if (message.includes('Impossible de joindre le serveur') && otpCode === '000000') {
        console.warn('[PhoneOtpScreen] Backend non joignable, stub verifyOtp OK');
        navigation.navigate('ProfileForm', {
          accessToken: undefined,
          isNewUser: true,
        });
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Vérification</Text>
        <Text style={styles.subtitle}>
          {showOtpInput
            ? 'Entrez le code reçu par SMS'
            : 'Entrez votre numéro de téléphone'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!showOtpInput ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="+33 6 12 34 56 78"
              placeholderTextColor={colors.muted}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              editable={!isLoading}
            />

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRequestOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size={20} color={colors.text} />
              ) : (
                <Text style={styles.buttonText}>Recevoir le code</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor={colors.muted}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isLoading}
            />

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size={20} color={colors.text} />
              ) : (
                <Text style={styles.buttonText}>Vérifier</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => {
                setShowOtpInput(false);
                setOtpCode('');
                setError('');
              }}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>Changer de numéro</Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
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
    marginBottom: 32,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
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
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    padding: 10,
  },
  linkText: {
    color: colors.muted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
