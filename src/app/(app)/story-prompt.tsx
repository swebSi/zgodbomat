import { useAuth } from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { useLocale } from '@core/providers/language/LanguageProvider';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Text } from '@shared/components/ui/text';
import { THEME, useColorScheme } from '@shared/lib/theme';
import { useUserSettingsStore } from '@shared/stores/user-store';
import { type ChildAvatar } from '@shared/types/child';
import { useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { api } from '../../../convex/_generated/api';
import type { Doc } from '../../../convex/_generated/dataModel';

const AVATAR_EMOJI_MAP: Record<ChildAvatar, string> = {
  lion: '🦁',
  bear: '🐻',
  bunny: '🐰',
  owl: '🦉',
  fox: '🦊',
};


type SelectionOption<T extends string> = {
  value: T;
  label: string;
  icon: string;
};

type StoryPromptForm = {
  setting: string | null;
  moral: string | null;
  storyTone: string | null;
  storyLength: string | null;
  characterType: string | null;
};

function SelectionCard<T extends string>({
  label,
  options,
  selectedValue,
  onSelect,
}: {
  label: string;
  options: readonly SelectionOption<T>[];
  selectedValue: string | null;
  onSelect: (value: T) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <Text className="text-lg font-bold text-foreground">{label}</Text>
      </CardHeader>
      <CardContent>
        <View className="flex-row flex-wrap gap-3">
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                className={`flex-row items-center gap-2 rounded-2xl px-4 py-3 ${
                  isSelected
                    ? 'bg-primary active:bg-primary/90'
                    : 'border border-border bg-muted/60 active:bg-muted/80'
                }`}>
                <Text className="text-xl">{option.icon}</Text>
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}

function ChildInfoCard({ child }: { child: Doc<'children'> | null }) {
  const router = useRouter();
  const avatarEmoji = child ? AVATAR_EMOJI_MAP[child.avatar as ChildAvatar] : null;

  if (!child) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="py-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="alert-circle" size={24} color={THEME.light.destructive} />
            <View className="flex-1">
              <Text className="text-base font-semibold text-destructive">
                {t`No child selected`}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {t`Please select or create a child first`}
              </Text>
            </View>
            <Button variant="outline" size="sm" onPress={() => router.push('/(app)/child-create')}>
              <Text>{t`Create`}</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-primary">
            {avatarEmoji ? (
              <Text className="text-3xl">{avatarEmoji}</Text>
            ) : (
              <Ionicons name="person" size={32} color="hsl(var(--primary))" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">{child.name}</Text>
            <Text className="text-sm text-muted-foreground">{t`Age ${child.age} years old`}</Text>
          </View>
        </View>
      </CardHeader>
    </Card>
  );
}

export default function StoryPromptScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { activeChildId } = useUserSettingsStore();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const { language } = useLocale();

  const { data: children } = useQuery({
    ...convexQuery(api.children.getChildrenByUser, {}),
    enabled: isSignedIn ?? false,
  });

  // Memoize options to react to language changes
  const SETTINGS = useMemo(
    () => [
      { value: 'forest', label: t`Enchanted Forest`, icon: '🌲' },
      { value: 'castle', label: t`Magical Castle`, icon: '🏰' },
      { value: 'ocean', label: t`Underwater Kingdom`, icon: '🌊' },
      { value: 'space', label: t`Starry Galaxy`, icon: '🚀' },
      { value: 'jungle', label: t`Mysterious Jungle`, icon: '🌴' },
      { value: 'mountain', label: t`Mountain Peak`, icon: '⛰️' },
      { value: 'village', label: t`Cozy Village`, icon: '🏘️' },
      { value: 'desert', label: t`Desert Oasis`, icon: '🏜️' },
    ] as const,
    [language]
  );

  const MORALS = useMemo(
    () => [
      { value: 'friendship', label: t`Friendship`, icon: '🤝' },
      { value: 'bravery', label: t`Bravery`, icon: '🦸' },
      { value: 'kindness', label: t`Kindness`, icon: '💝' },
      { value: 'honesty', label: t`Honesty`, icon: '💎' },
      { value: 'perseverance', label: t`Perseverance`, icon: '💪' },
      { value: 'sharing', label: t`Sharing`, icon: '🎁' },
      { value: 'respect', label: t`Respect`, icon: '🙏' },
      { value: 'creativity', label: t`Creativity`, icon: '✨' },
    ] as const,
    [language]
  );

  const STORY_TONES = useMemo(
    () => [
      { value: 'adventurous', label: t`Adventurous`, icon: '🗺️' },
      { value: 'gentle', label: t`Gentle & Calming`, icon: '🌙' },
      { value: 'funny', label: t`Funny & Playful`, icon: '😄' },
      { value: 'mysterious', label: t`Mysterious`, icon: '🔮' },
      { value: 'inspiring', label: t`Inspiring`, icon: '⭐' },
      { value: 'magical', label: t`Magical`, icon: '✨' },
    ] as const,
    [language]
  );

  const STORY_LENGTHS = useMemo(
    () => [
      { value: 'short', label: t`Short (5-10 min)`, icon: '📖' },
      { value: 'medium', label: t`Medium (10-15 min)`, icon: '📚' },
      { value: 'long', label: t`Long (15-20 min)`, icon: '📜' },
    ] as const,
    [language]
  );

  const CHARACTER_TYPES = useMemo(
    () => [
      { value: 'animal', label: t`Animal Characters`, icon: '🐾' },
      { value: 'human', label: t`Human Characters`, icon: '👤' },
      { value: 'fantasy', label: t`Fantasy Creatures`, icon: '🧚' },
      { value: 'mixed', label: t`Mixed`, icon: '🌈' },
    ] as const,
    [language]
  );

  const activeChild = useMemo(() => {
    if (!children) return null;
    if (children.length === 0) return null;

    if (activeChildId) {
      const found = children.find((child: Doc<'children'>) => String(child._id) === activeChildId);
      if (found) return found;
    }

    return children.length === 1 ? children[0] : null;
  }, [children, activeChildId]);

  const [formData, setFormData] = useState<StoryPromptForm>({
    setting: null,
    moral: null,
    storyTone: null,
    storyLength: null,
    characterType: null,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{
    storyId: string;
    title: string;
    chapters: Array<{ chapter_number: number; text: string; image_prompt: string }>;
  } | null>(null);

  const generateStoryAction = useAction(api.stories.generateStory);
  // Image generation disabled - will be enabled later with subscription
  // const generateChapterImagesAction = useAction(api.stories.generateChapterImages);

  const handleSelect = <T extends string>(field: keyof StoryPromptForm, value: T) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setGeneratedStory(null); // Reset story when selection changes
  };

  const generateStory = async () => {
    if (!activeChild) {
      return;
    }

    setIsGenerating(true);
    setGeneratedStory(null);

    try {
      const result = await generateStoryAction({
        childId: activeChild._id,
        childName: activeChild.name,
        childAge: activeChild.age,
        setting: formData.setting,
        moral: formData.moral,
        storyTone: formData.storyTone,
        storyLength: formData.storyLength,
        characterType: formData.characterType,
        language: language,
      });

      // Image generation disabled - will be enabled later with subscription
      // generateChapterImagesAction({ storyId: result.storyId }).catch((error) => {
      //   console.error('Error generating chapter images:', error);
      // });

      // Navigate to library
      router.push('/(app)/(tabs)/library');
    } catch (error) {
      console.error('Error generating story:', error);
      Alert.alert(
        t`Error`,
        error instanceof Error ? error.message : t`Failed to generate story. Please try again.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormComplete = Object.values(formData).every((value) => value !== null);

  return (
    <ScreenContent
      edges={['top']}
      navigationOptions={{
        title: t`Create Story Prompt`,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} className="ml-2 p-2">
            <Ionicons name="arrow-back" size={24} color={theme.foreground} />
          </Pressable>
        ),
      }}>
      {isGenerating && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-background/80">
          <View className="items-center gap-4 rounded-2xl bg-card p-8 shadow-lg">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text className="text-lg font-semibold text-foreground">
              {t`Generating your magical story...`}
            </Text>
            <Text className="text-sm text-muted-foreground">{t`This may take a moment`}</Text>
          </View>
        </View>
      )}
      <ScrollView className="flex-1 bg-background">
        <View className="gap-6 p-4">
          {/* Child Information */}
          <ChildInfoCard child={activeChild} />

          {/* Selection Cards */}
          <SelectionCard
            label={t`Setting`}
            options={SETTINGS}
            selectedValue={formData.setting}
            onSelect={(value) => handleSelect('setting', value)}
          />

          <SelectionCard
            label={t`Character Type`}
            options={CHARACTER_TYPES}
            selectedValue={formData.characterType}
            onSelect={(value) => handleSelect('characterType', value)}
          />

          <SelectionCard
            label={t`Moral Lesson`}
            options={MORALS}
            selectedValue={formData.moral}
            onSelect={(value) => handleSelect('moral', value)}
          />

          <SelectionCard
            label={t`Story Tone`}
            options={STORY_TONES}
            selectedValue={formData.storyTone}
            onSelect={(value) => handleSelect('storyTone', value)}
          />

          <SelectionCard
            label={t`Story Length`}
            options={STORY_LENGTHS}
            selectedValue={formData.storyLength}
            onSelect={(value) => handleSelect('storyLength', value)}
          />

          {/* Generate Button */}
          <Button
            onPress={generateStory}
            disabled={!activeChild || !isFormComplete || isGenerating}
            className="h-14 w-full rounded-xl bg-primary active:bg-primary/90">
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="hsl(var(--primary-foreground))" />
                <Text className="text-base font-semibold text-primary-foreground">
                  {t`Generating Story...`}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="hsl(var(--primary-foreground))" />
                <Text className="text-base font-semibold text-primary-foreground">
                  {t`Generate Story`}
                </Text>
              </>
            )}
          </Button>

          {/* Generated Story */}
          {generatedStory && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="book" size={20} color={theme.primary} />
                  <Text className="text-lg font-bold text-foreground">{generatedStory.title}</Text>
                </View>
              </CardHeader>
              <CardContent>
                {/* Chapters */}
                <View className="gap-4">
                  <Text className="text-sm font-semibold text-muted-foreground">{t`Chapters`}</Text>
                  {generatedStory.chapters.map((chapter) => (
                    <View key={chapter.chapter_number} className="rounded-xl bg-background p-4">
                      <View className="mb-2 flex-row items-center gap-2">
                        <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Text className="text-xs font-bold text-primary-foreground">
                            {chapter.chapter_number}
                          </Text>
                        </View>
                        <Text className="text-sm font-semibold text-foreground">
                          {t`Chapter ${chapter.chapter_number}`}
                        </Text>
                      </View>
                      <Text className="mb-3 text-base leading-6 text-foreground">
                        {chapter.text}
                      </Text>
                      <View className="rounded-lg bg-muted/50 p-3">
                        <Text className="mb-1 text-xs font-semibold text-muted-foreground">
                          {t`Image Prompt`}
                        </Text>
                        <Text className="text-sm text-foreground">{chapter.image_prompt}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View className="mt-4 flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onPress={() => {
                      // Copy story functionality would go here
                      console.log('Copy story:', generatedStory);
                    }}>
                    <Ionicons name="copy" size={18} color={theme.foreground} />
                    <Text>{t`Copy`}</Text>
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onPress={() => {
                      // Navigate to story view/playback
                      console.log('View story:', generatedStory.storyId);
                    }}>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="hsl(var(--primary-foreground))"
                    />
                    <Text className="text-primary-foreground">{t`View Story`}</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>
    </ScreenContent>
  );
}
