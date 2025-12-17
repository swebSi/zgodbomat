import { useAuth } from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Text } from '@shared/components/ui/text';
import { THEME, useColorScheme } from '@shared/lib/theme';
import { useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import { useAudioPlayer } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function StoryDetail() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const params = useLocalSearchParams<{ storyId?: string }>();
  const storyId = typeof params.storyId === 'string' ? params.storyId : params.storyId?.[0];

  const { data: story, isLoading } = useQuery({
    ...convexQuery(api.stories.getStoryById, {
      storyId: storyId as Id<'stories'>,
    }),
    enabled: (isSignedIn ?? false) && !!storyId,
  });

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const generateAudioAction = useAction(api.stories.generateStoryAudioAction);

  // Use story audioUrl if available
  const audioUrl = story?.audioUrl;

  // Use expo-audio's useAudioPlayer hook
  const player = useAudioPlayer(audioUrl ? { uri: audioUrl } : undefined);

  const handleGenerateAudio = async () => {
    if (!storyId || !story) return;

    setIsGeneratingAudio(true);
    try {
      await generateAudioAction({
        storyId: storyId as Id<'stories'>,
      });
      // Refetch story to get updated audioUrl
      // The query will automatically refetch when the story is updated
    } catch (error) {
      console.error('Error generating audio:', error);
      Alert.alert(
        t`Error`,
        error instanceof Error ? error.message : t`Failed to generate audio. Please try again.`
      );
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioUrl || !player) {
      console.warn('Cannot play: audioUrl or player missing');
      Alert.alert(t`Error`, t`Audio URL not available.`);
      return;
    }

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleReplay = () => {
    if (!player) return;
    player.seekTo(0);
    player.play();
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Track player loading state
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const [hasPlayerError, setHasPlayerError] = useState(false);

  // Track current time and duration with state to force re-renders
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Monitor player state and update UI in real-time
  useEffect(() => {
    if (!player || !audioUrl) {
      setIsPlayerLoading(false);
      return;
    }

    // Reset loading state when audioUrl changes
    setIsPlayerLoading(true);
    setHasPlayerError(false);

    // Update player state in real-time
    const updatePlayerState = () => {
      if (!player) return;

      // Update current time and duration
      const newCurrentTime = player.currentTime || 0;
      const newDuration = player.duration || 0;
      const newIsPlaying = player.playing || false;

      setCurrentTime(newCurrentTime);
      setDuration(newDuration);
      setIsPlaying(newIsPlaying);

      // Check if player is ready (has duration or is playing)
      const ready = newDuration > 0 || newIsPlaying || newCurrentTime > 0;
      if (ready) {
        setIsPlayerLoading(false);
        setHasPlayerError(false);
      }
    };

    // Initial update
    updatePlayerState();

    // Set up interval to update state periodically (for progress bar)
    const interval = setInterval(updatePlayerState, 100); // Update every 100ms for smooth progress

    // Timeout after 10 seconds - if still loading, mark as error
    const timeout = setTimeout(() => {
      if (isPlayerLoading && duration === 0 && !player.playing) {
        console.warn('Audio player timeout - URL might be invalid or have CORS issues:', audioUrl);
        setIsPlayerLoading(false);
        setHasPlayerError(true);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [player, audioUrl, isPlayerLoading]);

  // Check if player is ready
  const isPlayerReady =
    player && !isPlayerLoading && !hasPlayerError && (duration > 0 || isPlaying);

  if (isLoading) {
    return (
      <ScreenContent
        edges={['top']}
        navigationOptions={{
          title: t`Story`,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="ml-2 p-2">
              <Ionicons name="arrow-back" size={24} color={theme.foreground} />
            </Pressable>
          ),
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">{t`Loading story...`}</Text>
        </View>
      </ScreenContent>
    );
  }

  if (!story) {
    return (
      <ScreenContent
        edges={['top']}
        navigationOptions={{
          title: t`Story`,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="ml-2 p-2">
              <Ionicons name="arrow-back" size={24} color={theme.foreground} />
            </Pressable>
          ),
        }}>
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="alert-circle" size={64} color={theme.destructive} />
          <Text className="mt-4 text-center text-xl font-bold text-foreground">
            {t`Story Not Found`}
          </Text>
          <Text className="mt-2 text-center text-muted-foreground">
            {t`The story you're looking for doesn't exist or you don't have access to it.`}
          </Text>
        </View>
      </ScreenContent>
    );
  }

  return (
    <ScreenContent
      edges={['top']}
      navigationOptions={{
        title: story.title,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} className="ml-2 p-2">
            <Ionicons name="arrow-back" size={24} color={theme.foreground} />
          </Pressable>
        ),
      }}>
      <ScrollView className="flex-1 bg-background">
        <View className="gap-6 p-4">
          {/* Story Metadata */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Ionicons name="book" size={16} color={theme.mutedForeground} />
              <Text className="text-sm text-muted-foreground">
                {story.chapters.length} {story.chapters.length === 1 ? t`Chapter` : t`Chapters`}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar" size={16} color={theme.mutedForeground} />
              <Text className="text-sm text-muted-foreground">{formatDate(story.createdAt)}</Text>
            </View>
          </View>

          {/* Audio Generation */}
          <Card>
            <CardContent className="pt-6">
              {story?.audioUrl ? (
                <View className="gap-4">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="musical-notes" size={20} color={theme.primary} />
                    <Text className="text-base font-semibold text-foreground">
                      {t`Audio Available`}
                    </Text>
                  </View>

                  {/* Audio Player Controls */}
                  {hasPlayerError ? (
                    <View className="py-4">
                      <Ionicons name="alert-circle" size={24} color={theme.destructive} />
                      <Text className="mt-2 text-center text-sm text-destructive">
                        {t`Failed to load audio. Please try again.`}
                      </Text>
                      {audioUrl && (
                        <Text className="mt-1 text-center text-xs text-muted-foreground">
                          {duration > 0
                            ? t`Duration: ${formatTime(duration)}`
                            : t`Waiting for audio to load...`}
                        </Text>
                      )}
                    </View>
                  ) : isPlayerReady && player ? (
                    <View className="gap-3">
                      {/* Progress Bar */}
                      <View className="gap-2">
                        <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <View
                            className="h-full bg-primary"
                            style={{
                              width: `${duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0}%`,
                            }}
                          />
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-xs text-muted-foreground">
                            {formatTime(currentTime)}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {formatTime(duration)}
                          </Text>
                        </View>
                      </View>

                      {/* Controls */}
                      <View className="flex-row items-center justify-center gap-4">
                        <Pressable
                          onPress={handleReplay}
                          disabled={!player}
                          className="h-10 w-10 items-center justify-center rounded-full bg-muted active:bg-muted/80 disabled:opacity-50">
                          <Ionicons
                            name="refresh"
                            size={20}
                            color={player ? theme.foreground : theme.mutedForeground}
                          />
                        </Pressable>
                        <Pressable
                          onPress={handlePlayPause}
                          disabled={!player || !audioUrl}
                          className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-sm active:bg-primary/90 disabled:opacity-50">
                          <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={28}
                            color={theme.primaryForeground || '#fff'}
                          />
                        </Pressable>
                        <View className="h-10 w-10" />
                      </View>
                    </View>
                  ) : (
                    <View className="py-4">
                      <ActivityIndicator size="small" color={theme.primary} />
                      <Text className="mt-2 text-center text-sm text-muted-foreground">
                        {isPlayerLoading
                          ? t`Loading audio player...`
                          : audioUrl
                            ? t`Preparing audio...`
                            : t`No audio available`}
                      </Text>
                      {audioUrl && (
                        <Text className="mt-1 text-center text-xs text-muted-foreground">
                          {duration > 0
                            ? t`Duration: ${formatTime(duration)}`
                            : t`Loading audio file...`}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View className="gap-3">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="volume-high-outline" size={20} color={theme.mutedForeground} />
                    <Text className="text-base font-semibold text-foreground">
                      {t`Generate Audio`}
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground">
                    {t`Create an audio version of this story using AI voice.`}
                  </Text>
                  <Button
                    onPress={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                    className="mt-2 h-12 w-full rounded-xl bg-primary active:bg-primary/90">
                    {isGeneratingAudio ? (
                      <>
                        <ActivityIndicator size="small" color="hsl(var(--primary-foreground))" />
                        <Text className="text-base font-semibold text-primary-foreground">
                          {t`Generating...`}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name="musical-notes"
                          size={18}
                          color="hsl(var(--primary-foreground))"
                        />
                        <Text className="text-base font-semibold text-primary-foreground">
                          {t`Generate Audio`}
                        </Text>
                      </>
                    )}
                  </Button>
                </View>
              )}
            </CardContent>
          </Card>

          {/* Chapters */}
          <View className="gap-4">
            <Text className="text-xl font-bold text-foreground">{t`Chapters`}</Text>
            {story.chapters.map((chapter) => (
              <Card key={chapter.chapterNumber}>
                <CardHeader>
                  <View className="flex-row items-center gap-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Text className="text-sm font-bold text-primary-foreground">
                        {chapter.chapterNumber}
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-foreground">
                      {t`Chapter ${chapter.chapterNumber}`}
                    </Text>
                  </View>
                </CardHeader>
                <CardContent>
                  {/* Placeholder image from assets */}
                  <ImageBackground
                    source={require('@assets/images/dream.jpg')}
                    className="mb-4 h-48 w-full overflow-hidden rounded-xl"
                    resizeMode="cover">
                    <View className="absolute inset-0 bg-black/20" />
                  </ImageBackground>
                  <Text className="text-base leading-7 text-foreground">{chapter.text}</Text>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContent>
  );
}
