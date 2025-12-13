import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { cn } from '@shared/lib/utils';
import { View, type ViewProps } from 'react-native';

type NewAdventureCardProps = ViewProps & {
  onPress?: () => void;
};

export function NewAdventureCard({ className, onPress, ...props }: NewAdventureCardProps) {
  return (
    <View
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg',
        className
      )}
      {...props}>
      <View className="absolute right-4 top-4 flex-row gap-1">
        <Ionicons name="sparkles" size={20} color="white" />
      </View>

      {/* badge */}
      <View className="mb-4 self-start">
        <View className="rounded-full bg-primary px-3 py-1">
          <Text className="text-xs font-semibold text-primary-foreground">
            {t({ id: 'new-adventure-card.new-adventure', message: 'New Adventure' })}
          </Text>
        </View>
      </View>

      {/* Title */}
      <View className="mb-3">
        <Text className="text-4xl font-bold text-foreground">
          {t({ id: 'new-adventure-card.weave-a', message: 'Weave a' })}
        </Text>
        <Text className="text-4xl font-bold text-primary">
          {t({ id: 'new-adventure-card.new-tale', message: 'New Tale' })}
        </Text>
      </View>

      {/* Description */}
      <Text className="mb-6 mr-28 text-base leading-6 text-muted-foreground">
        {t({ id: 'new-adventure-card.description', message: 'Description' })}
      </Text>

      {/* Create Magic button */}
      <Button onPress={onPress} className="h-14 w-full rounded-xl bg-primary active:bg-primary/90">
        <Ionicons name="play" size={20} color="hsl(var(--primary-foreground))" />
        <Text className="text-base font-semibold text-primary-foreground">
          {t({ id: 'new-adventure-card.create-magic', message: 'Create Magic' })}
        </Text>
      </Button>
    </View>
  );
}
