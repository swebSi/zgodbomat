import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { THEME } from '@shared/lib/theme';
import { Dimensions, ImageBackground, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingCustomizeScreenProps {
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function OnboardingCustomizeScreen({
  onNext,
  onSkip,
  onBack,
  showBackButton,
}: OnboardingCustomizeScreenProps) {
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
              source={require('@assets/images/dream.jpg')}
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

          {/* Floating Card 1: Setting Badge (Top Right) */}
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
                <Ionicons name="rocket" size={20} color="#221c10" />
              </View>
              <View className="flex-col pr-1 leading-none">
                <Text
                  className="text-[10px] font-bold uppercase opacity-70"
                  style={{ color: '#221c10' }}>
                  {t`Setting`}
                </Text>
                <Text className="text-sm font-bold" style={{ color: '#221c10' }}>
                  {t`Deep Space`}
                </Text>
              </View>
            </View>
          </View>

          {/* Floating Card 2: Moral Badge (Bottom Left) */}
          <View
            className="absolute rounded-xl border border-white/10 bg-[#3a3124] p-3"
            style={{
              bottom: SCREEN_WIDTH * 0.12,
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
                  backgroundColor: '#ec4899',
                }}>
                <Ionicons name="heart" size={20} color="white" />
              </View>
              <View className="flex-col leading-none">
                <Text className="mb-0.5 text-[10px] font-bold uppercase text-white/50">{t`Moral`}</Text>
                <Text className="text-sm font-bold text-white">{t`Kindness`}</Text>
              </View>
            </View>
          </View>

          {/* Decorative Elements */}
          <Ionicons
            name="sparkles"
            size={32}
            color={THEME.dark.primary + '66'}
            style={{
              position: 'absolute',
              top: SCREEN_WIDTH * 0.05,
              left: SCREEN_WIDTH * 0.15,
            }}
          />
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
        </View>

        {/* Text Content */}
        <View className="z-10 flex-col items-center">
          {/* Title */}
          <View className="mb-4 items-center">
            <Text className="text-center text-5xl font-bold leading-tight tracking-tight text-foreground">
              {t`Stories Made`}
              {'\n'}
              <Text className="text-center text-5xl font-bold leading-tight tracking-tight text-primary">
                {t`Just for Them`}
              </Text>
            </Text>
          </View>

          {/* Description */}
          <Text className="mb-6 text-center text-base leading-relaxed text-muted-foreground">
            {t`Tell us about your child, pick a magical setting, and choose a life lesson. We'll weave a unique tale that sparks their imagination.`}
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View className="mt-4 gap-3 pb-8">
        <Button
          onPress={onNext}
          className="h-14 w-full rounded-xl bg-primary shadow-lg active:bg-primary/90">
          <Text className="text-lg font-bold text-[#181611]">{t`Continue`}</Text>
          <Ionicons name="arrow-forward" size={20} color="#181611" />
        </Button>
      </View>
    </View>
  );
}
