import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { THEME } from '@shared/lib/theme';
import { Link } from 'expo-router';
import { Dimensions, ImageBackground, View } from 'react-native';

interface OnboardingWelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function OnboardingWelcomeScreen({ onNext }: OnboardingWelcomeScreenProps) {
  return (
    <View className="flex-1">
      {/* Top Section: Illustration (approximately 2/3 of screen) */}
      <View
        className="relative flex-1 overflow-hidden"
        style={{ height: (Dimensions.get('window').height * 2) / 3 }}>
        <ImageBackground
          source={require('@assets/images/story_for_them.png')}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      {/* Bottom Section: Content (approximately 1/3 of screen) */}
      <View className="relative -mt-6 bg-background px-6 pb-24 pt-8">
        {/* Decorative moon and star icons */}
        <View className="absolute left-6 top-6">
          <Ionicons name="moon" size={20} color={THEME.dark.primary} />
        </View>
        <View className="absolute right-6 top-6">
          <Ionicons name="star" size={20} color={THEME.dark.primary} />
        </View>

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
          {t`Turn bedtime into an adventure. Generate custom stories with lessons you choose, featuring your child as the hero.`}
        </Text>

        {/* Call to Action Button */}
        <Button
          onPress={onNext}
          className="mb-4 h-14 w-full rounded-xl bg-primary shadow-lg active:bg-primary/90">
          <Text className="text-lg font-bold text-[#181611]">{t`Start the Magic`}</Text>
          <Ionicons name="arrow-forward" size={20} color="#181611" />
        </Button>

        {/* Secondary Action: Login Link */}
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-base text-muted-foreground">{t`Returning dreamer?`}</Text>
          <Link href="/(auth)/login" asChild>
            <Button variant="ghost" className="h-auto p-0">
              <Text className="text-base font-medium text-primary">{t`Login`}</Text>
            </Button>
          </Link>
        </View>
      </View>
    </View>
  );
}
