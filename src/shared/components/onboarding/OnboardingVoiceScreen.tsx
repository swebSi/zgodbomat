import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { THEME } from '@shared/lib/theme';
import { useEffect } from 'react';
import { Dimensions, ImageBackground, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingVoiceScreenProps {
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

// Waveform bar component with animation
function WaveformBar({
  delay = 0,
  minHeight = 8,
  maxHeight = 16,
  duration = 1000,
  opacity = 1,
}: {
  delay?: number;
  minHeight?: number;
  maxHeight?: number;
  duration?: number;
  opacity?: number;
}) {
  const animatedHeight = useSharedValue(minHeight);

  useEffect(() => {
    animatedHeight.value = withRepeat(
      withTiming(maxHeight, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [maxHeight, duration, minHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View
      className="w-[3px] rounded-full"
      style={[
        animatedStyle,
        {
          backgroundColor: THEME.dark.primary,
          opacity,
        },
      ]}
    />
  );
}

export function OnboardingVoiceScreen({
  onNext,
  onSkip,
  onBack,
  showBackButton,
}: OnboardingVoiceScreenProps) {
  return (
    <View className="flex-1 justify-between px-6 pb-8 pt-12">
      {/* Header buttons */}
      <View className="flex-row items-center justify-between">
        {showBackButton && onBack ? (
          <Button variant="ghost" onPress={onBack} className="px-4">
            <Ionicons name="arrow-back" size={20} color={THEME.dark.foreground} />
            <Text className="text-base text-foreground/80">{t`Back`}</Text>
          </Button>
        ) : (
          <View />
        )}
        <Button variant="ghost" onPress={onSkip} className="px-4">
          <Text className="text-base text-foreground/80">{t`Skip for now`}</Text>
        </Button>
      </View>

      {/* Content */}
      <View className="flex-1 justify-center">
        {/* Hero Graphic Composition */}
        <View
          className="relative mb-8 w-full items-center justify-center"
          style={{ height: SCREEN_WIDTH * 0.85 }}>
          {/* Ambient Glow Background */}
          <View
            className="absolute rounded-full"
            style={{
              width: SCREEN_WIDTH * 0.75,
              height: SCREEN_WIDTH * 0.75,
              backgroundColor: THEME.dark.primary + '10',
              opacity: 0.5,
              transform: [{ scale: 0.75 }],
            }}
          />

          {/* Center: Child Profile Card (Main Focus) */}
          <View
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#2C2417] shadow-2xl"
            style={{
              width: SCREEN_WIDTH * 0.5,
              height: SCREEN_WIDTH * 0.65,
              transform: [{ rotate: '-2deg' }],
            }}>
            {/* Image Placeholder */}
            <ImageBackground
              source={require('@assets/images/voice_record.jpg')}
              className="flex-[4]"
              resizeMode="cover">
              {/* Gradient overlay */}
              <View
                className="absolute inset-0"
                style={{
                  backgroundColor: 'rgba(44, 36, 23, 0.6)',
                }}
              />
              <View
                className="absolute left-0 right-0 top-0 h-1/3"
                style={{
                  backgroundColor: 'rgba(44, 36, 23, 0.3)',
                }}
              />
            </ImageBackground>
            {/* Name and Edit */}
            <View className="flex-1 flex-row items-center justify-between bg-[#2C2417] px-4">
              <Text className="text-lg font-bold text-white">{t`Leo`}</Text>
              <Ionicons name="create-outline" size={20} color={THEME.dark.primary} />
            </View>
          </View>

          {/* Floating Badge 1: Your Voice (Top Right) */}
          <View
            className="absolute rounded-xl bg-primary p-3"
            style={{
              top: SCREEN_WIDTH * 0.08,
              right: SCREEN_WIDTH * 0.02,
              transform: [{ rotate: '6deg' }],
              shadowColor: THEME.dark.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 10,
            }}>
            <View className="flex-row items-center gap-2">
              <View className="rounded-lg bg-white/20 p-1.5">
                <Ionicons name="mic" size={20} color="#221c10" />
              </View>
              <View className="flex-col pr-1 leading-none">
                <Text
                  className="text-[10px] font-bold uppercase opacity-70"
                  style={{ color: '#221c10' }}>
                  {t`Voice`}
                </Text>
                <Text className="text-sm font-bold" style={{ color: '#221c10' }}>
                  {t`Your Own`}
                </Text>
              </View>
            </View>
          </View>

          {/* Floating Badge 2: AI Voice (Top Left) */}
          <View
            className="absolute rounded-xl border border-white/10 bg-[#3a3124] p-3"
            style={{
              top: SCREEN_WIDTH * 0.12,
              left: SCREEN_WIDTH * 0.02,
              transform: [{ rotate: '-3deg' }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <View className="flex-row items-center gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-full shadow-lg"
                style={{
                  backgroundColor: THEME.dark.primary,
                }}>
                <Ionicons name="sparkles" size={20} color="#221c10" />
              </View>
              <View className="flex-col leading-none">
                <Text className="mb-0.5 text-[10px] font-bold uppercase text-white/50">{t`Voice`}</Text>
                <Text className="text-sm font-bold text-white">{t`AI Generated`}</Text>
              </View>
            </View>
          </View>

          {/* Decorative Elements */}
          <Ionicons
            name="star"
            size={24}
            color="rgba(255, 255, 255, 0.1)"
            style={{
              position: 'absolute',
              bottom: SCREEN_WIDTH * 0.1,
              right: SCREEN_WIDTH * 0.2,
            }}
          />

          {/* Recording Banner at Bottom */}
          <View
            className="absolute w-full px-6"
            style={{
              bottom: SCREEN_WIDTH * 0.05,
            }}>
            <View className="flex-row items-center gap-4 rounded-xl bg-[#393328] p-3 shadow-sm">
              {/* Album Art */}
              <View className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <ImageBackground
                  source={require('@assets/images/voice_record.jpg')}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>

              {/* Info & Waveform */}
              <View className="flex-1 overflow-hidden">
                <Text className="truncate text-base font-bold leading-tight text-foreground">
                  {t`The Sleepy Bear`}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Text className="text-xs font-bold uppercase tracking-wide text-primary">
                    {t`Recording...`}
                  </Text>
                  {/* Visual Waveform Animation */}
                  <View className="h-4 flex-row items-end gap-[2px] pb-1">
                    <WaveformBar minHeight={8} maxHeight={8} duration={1000} opacity={0.6} />
                    <WaveformBar minHeight={8} maxHeight={12} duration={1200} opacity={1} />
                    <WaveformBar minHeight={8} maxHeight={16} duration={800} opacity={0.8} />
                    <WaveformBar minHeight={8} maxHeight={8} duration={1500} opacity={1} />
                    <WaveformBar minHeight={8} maxHeight={12} duration={1100} opacity={0.6} />
                  </View>
                </View>
              </View>

              {/* Mic Button */}
              <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary">
                <Ionicons name="mic" size={28} color="#221c10" />
              </View>
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View className="z-10 flex-col items-center">
          {/* Title */}
          <View className="mb-4 items-center">
            <Text className="text-center text-5xl font-bold leading-tight tracking-tight text-foreground">
              {t`Your Voice, Their Dreams`}
            </Text>
          </View>

          {/* Description */}
          <Text className="mb-6 text-center text-base leading-relaxed text-muted-foreground">
            {t`Record stories in your own voice so your little one can hear you anytime, anywhere.`}
          </Text>
        </View>
      </View>

      {/* Footer Actions */}
      <View className="mt-4 gap-3 pb-8">
        <Button
          onPress={onNext}
          className="h-14 w-full rounded-xl bg-primary shadow-lg active:bg-primary/90">
          <Text className="text-lg font-bold text-[#181611]">{t`Get Started`}</Text>
          <Ionicons name="arrow-forward" size={20} color="#181611" />
        </Button>
      </View>
    </View>
  );
}
