import { useUser } from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { useLocale } from '@core/providers/language/LanguageProvider';
import type { LanguageType } from '@shared/i18n/model/localize';
import { useQuery } from '@tanstack/react-query';
import { useConvexAuth } from 'convex/react';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { api } from '../../../convex/_generated/api';

export default function AppLayout() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { language, setLanguage } = useLocale();
  const [isLanguageSyncing, setIsLanguageSyncing] = useState(true);
  const { data: children } = useQuery({
    ...convexQuery(api.children.getChildrenByUser, {}),
    enabled: isAuthenticated ?? false,
  });

  // Sync language from Clerk's unsafeMetadata when user is loaded
  useEffect(() => {
    if (!isUserLoaded || !user) {
      return;
    }

    // Language is always set at sign-up, so just mirror it from Clerk
    const clerkLanguage = user.unsafeMetadata?.language as LanguageType | undefined;
    if (clerkLanguage && clerkLanguage !== language) {
      setLanguage(clerkLanguage);
    }

    setIsLanguageSyncing(false);
  }, [isUserLoaded, user, language, setLanguage]);

  // After login, if no child exists, redirect to child creation
  useEffect(() => {
    if (isAuthenticated && children !== undefined) {
      // Only redirect if we've loaded children and there are none
      if (children.length === 0) {
        router.replace('/(app)/child-create');
      }
    }
  }, [isAuthenticated, children, router]);

  // Show spinner while syncing language
  if (isLanguageSyncing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen name="child-create" options={{ headerShown: true, title: 'Child Profile' }} />
      <Stack.Screen name="story-prompt" options={{ headerShown: false }} />
      <Stack.Screen name="story-detail" options={{ headerShown: false }} />
    </Stack>
  );
}
