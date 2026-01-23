import React from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, ImageSourcePropType, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  image?: ImageSourcePropType;
  label?: string;
  gradientColors: readonly [string, string, ...string[]];
}

interface OnboardingSlideProps {
  slide: SlideData;
  index: number;
  scrollX: Animated.Value;
}

export default function OnboardingSlide({ slide, index, scrollX }: OnboardingSlideProps) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [1.1, 1.05, 1.1],
    extrapolate: 'clamp',
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [30, 0, 30],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const labelTranslateY = scrollX.interpolate({
    inputRange,
    outputRange: [20, 0, 20],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { transform: [{ scale }] }]}>
        {slide.image ? (
          <ImageBackground
            source={slide.image}
            style={styles.image}
            resizeMode="cover"
          >
            <LinearGradient
              colors={slide.gradientColors}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={slide.gradientColors}
            style={styles.image}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
      </Animated.View>

      <View style={styles.content}>
        {slide.label && (
          <Animated.View
            style={[
              styles.labelContainer,
              {
                transform: [{ translateY: labelTranslateY }],
                opacity,
              },
            ]}
          >
            <Text style={styles.label}>{slide.label}</Text>
          </Animated.View>
        )}

        <Animated.View
          style={{
            transform: [{ translateY }],
            opacity,
          }}
        >
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: colors.primary,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  labelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: 44,
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
});
