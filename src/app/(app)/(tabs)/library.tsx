import { useAuth } from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Text } from '@shared/components/ui/text';
import { THEME, useColorScheme } from '@shared/lib/theme';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StoryCard({ story }: { story: Doc<'stories'> }) {
  console.log('story', story._id);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  const handlePress = () => {
    console.log('story._id', story.title);
    const storyIdString = String(story._id);
    console.log('storyIdString', storyIdString);
    router.push({
      pathname: '/(app)/story-detail',
      params: { storyId: storyIdString },
    });
  };

  // Get excerpt from first chapter
  const firstChapter = story.chapters.find((ch) => ch.chapterNumber === 1) || story.chapters[0];
  const excerpt = firstChapter
    ? firstChapter.text.length > 150
      ? `${firstChapter.text.substring(0, 150).trim()}...`
      : firstChapter.text
    : '';

  return (
    <Pressable
      onPress={handlePress}
      className="mb-4"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      {({ pressed }) => (
        <Card style={{ opacity: pressed ? 0.8 : 1 }}>
          <CardHeader>
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">{story.title}</Text>
                {excerpt && (
                  <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
                    {excerpt}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <Ionicons name="book" size={16} color={theme.mutedForeground} />
                <Text className="text-xs text-muted-foreground">
                  {story.chapters.length} {story.chapters.length === 1 ? t`Chapter` : t`Chapters`}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar" size={16} color={theme.mutedForeground} />
                <Text className="text-xs text-muted-foreground">{formatDate(story.createdAt)}</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}
    </Pressable>
  );
}

export default function Library() {
  const { isSignedIn } = useAuth();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  const { data: stories, isLoading } = useQuery({
    ...convexQuery(api.stories.getStoriesByUser, {}),
    enabled: isSignedIn ?? false,
  });

  if (isLoading) {
    return (
      <ScreenContent>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">{t`Loading stories...`}</Text>
        </View>
      </ScreenContent>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <ScreenContent>
        <ScrollView className="flex-1 bg-background">
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="library-outline" size={64} color={theme.mutedForeground} />
            <Text className="mt-4 text-center text-xl font-bold text-foreground">
              {t`Your Library`}
            </Text>
            <Text className="mt-2 text-center text-muted-foreground">
              {t`No stories yet. Create your first magical bedtime story!`}
            </Text>
          </View>
        </ScrollView>
      </ScreenContent>
    );
  }

  return (
    <ScreenContent>
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">{t`Your Stories`}</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {stories.length} {stories.length === 1 ? t`story` : t`stories`}
            </Text>
          </View>

          {stories.map((story) => (
            <StoryCard key={story._id} story={story} />
          ))}
        </View>
      </ScrollView>
    </ScreenContent>
  );
}
