import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@shared/components/ui/card';
import { Text } from '@shared/components/ui/text';
import { THEME } from '@shared/lib/theme';
import { ImageBackground, View, type ViewProps } from 'react-native';

type NewAdventureCardProps = ViewProps & {
  onPress?: () => void;
};

export function NewAdventureCard({ className, onPress, ...props }: NewAdventureCardProps) {
  return (
    <Card className="dark relative overflow-hidden bg-transparent" {...props}>
      <ImageBackground
        source={require('@assets/images/dream.jpg')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        imageStyle={{ borderRadius: 24 }}
        resizeMode="cover">
        <View className="absolute inset-0" />
      </ImageBackground>
      {/* Dark overlay */}
      <View className="absolute inset-0 bg-black/60" />
      <View className="absolute right-4 top-4 z-10 flex-row gap-1">
        <Ionicons name="sparkles" size={20} color="white" />
      </View>

      <CardHeader className="relative z-10 mb-0 gap-4">
        {/* badge */}
        <Badge variant="default" className="self-start rounded-full px-3 py-1">
          <Text className="font-semibold">{t`New Adventure`}</Text>
        </Badge>

        {/* Title */}
        <View className="gap-0">
          <Text className="text-4xl font-bold" style={{ color: THEME.dark.foreground }}>
            {t`Weave a`}
          </Text>
          <Text className="text-4xl font-bold text-primary">{t`New Tale`}</Text>
        </View>
      </CardHeader>

      <CardContent className="">
        {/* Description */}
        <Text className="mr-28 text-base leading-6" style={{ color: THEME.dark.mutedForeground }}>
          {t`Create a magical bedtime story in seconds. Pick a theme, choose a hero, and let the magic begin.`}
        </Text>
      </CardContent>

      <CardFooter className="mt-4">
        {/* Create Magic button */}
        <Button
          onPress={onPress}
          className="h-14 w-full rounded-xl bg-primary active:bg-primary/90">
          <Ionicons name="play" size={20} color="hsl(var(--primary-foreground))" />
          <Text className="text-base font-semibold text-primary-foreground">{t`Create Magic`}</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
