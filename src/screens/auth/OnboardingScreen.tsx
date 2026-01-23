import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
  StatusBar,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { useI18n } from '../../services/i18n';
import OnboardingSlide, { SlideData } from '../../components/onboarding/OnboardingSlide';
import PaginationDots from '../../components/onboarding/PaginationDots';

const { width } = Dimensions.get('window');
const ONBOARDING_SEEN_KEY = 'humdaddy_onboarding_seen';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Slides data with translations
  const slides: SlideData[] = [
    {
      id: '1',
      title: t('onboarding.slide1.title'),
      subtitle: t('onboarding.slide1.subtitle'),
      label: t('onboarding.slide1.label'),
      gradientColors: ['#1a2942', '#0A1628'] as const,
    },
    {
      id: '2',
      title: t('onboarding.slide2.title'),
      subtitle: t('onboarding.slide2.subtitle'),
      label: t('onboarding.slide2.label'),
      gradientColors: ['#7C3AED', '#0A1628'] as const,
    },
    {
      id: '3',
      title: t('onboarding.slide3.title'),
      subtitle: t('onboarding.slide3.subtitle'),
      label: t('onboarding.slide3.label'),
      gradientColors: ['#E74C3C', '#0A1628'] as const,
    },
  ];

  const handleGetStarted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
    navigation.replace('Link');
  }, [navigation]);

  const handlePressIn = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const skipOpacity = scrollX.interpolate({
    inputRange: [0, width * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleSkip = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
    navigation.replace('Link');
  }, [navigation]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Skip button */}
      <Animated.View style={[styles.skipContainer, { top: insets.top + 16, opacity: skipOpacity }]}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </Pressable>
      </Animated.View>

      {/* Slides */}
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
      >
        {slides.map((slide, index) => (
          <OnboardingSlide
            key={slide.id}
            slide={slide}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      {/* Bottom controls */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 24 }]}>
        {/* Pagination */}
        <View style={styles.paginationContainer}>
          <PaginationDots
            total={slides.length}
            scrollX={scrollX}
            width={width}
          />
        </View>

        {/* Get Started Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={handleGetStarted}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.buttonText}>{t('onboarding.getStarted')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  skipContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  paginationContainer: {
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#A3E635',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1628',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
