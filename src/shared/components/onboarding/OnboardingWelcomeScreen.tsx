import { useLocale } from '@core/providers/language/LanguageProvider';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { LanguageList, type LanguageType } from '@shared/i18n/model/localize';
import { THEME } from '@shared/lib/theme';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { useMemo } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LANGUAGE_OPTIONS: { label: string; value: LanguageType; flag: string }[] = [
  { label: t`English`, value: LanguageList.EN, flag: '🇬🇧' },
  { label: t`Slovenian`, value: LanguageList.SL, flag: '🇸🇮' },
];

interface OnboardingWelcomeScreenProps {
  onNext: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function OnboardingWelcomeScreen({ onNext }: OnboardingWelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useLocale();
  const selected = language ?? LanguageList.EN;

  const options = useMemo(() => LANGUAGE_OPTIONS, []);

  return (
    <View className="flex-1 bg-background" style={{ marginTop: -insets.top }}>
      <StatusBar style="light" translucent />
      <LottieView
        source={require('@assets/animations/night_bg.json')}
        autoPlay
        loop
        style={{
          position: 'absolute',
          top: -insets.top,
          left: 0,
          right: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT + insets.top,
        }}
      />

      {/* Tagline and Description on Lottie Background - Centered */}
      <View
        className="absolute left-0 right-0 flex-1 justify-center px-6"
        style={{
          top: insets.top,
          bottom: 0,
        }}>
        <View className="mb-4 items-center">
          <Text className="text-center text-5xl font-bold leading-tight tracking-tight text-white">
            {t`Stories Made`}
            {'\n'}
            <Text className="text-center text-5xl font-bold leading-tight tracking-tight text-primary">
              {t`Just for Them`}
            </Text>
          </Text>
        </View>

        <Text className="text-center text-base leading-relaxed text-white/90">
          {t`Turn bedtime into an adventure. Generate custom stories with lessons you choose, featuring your child as the hero.`}
        </Text>
      </View>

      {/* Bottom Overlay for Language Selection and CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/90 px-6 pb-14 pt-10">
        <View className="absolute left-6 top-6">
          <Ionicons name="moon" size={20} color={THEME.dark.primary} />
        </View>
        <View className="absolute right-6 top-6">
          <Ionicons name="star" size={20} color={THEME.dark.primary} />
        </View>

        {/* Language Selection */}
        <View className="mb-3 flex-row items-center justify-center gap-3">
          {options.map((option) => {
            const isActive = option.value === selected;
            return (
              <Pressable
                key={option.value}
                onPress={() => setLanguage(option.value)}
                className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 ${
                  isActive ? 'border-primary bg-primary' : 'border-border bg-card'
                }`}>
                <Text className="text-lg">{option.flag}</Text>
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-6 text-center text-xs leading-relaxed text-muted-foreground">
          {t`We need your language to craft stories and voices that feel natural. This choice stays fixed so your library is consistent.`}
        </Text>

        <Button
          onPress={onNext}
          className="h-14 w-full rounded-xl bg-primary shadow-lg active:bg-primary/90">
          <Text className="text-lg font-bold text-[#181611]">{t`Start the Magic`}</Text>
          <Ionicons name="arrow-forward" size={20} color="#181611" />
        </Button>
      </View>
    </View>
  );
}
