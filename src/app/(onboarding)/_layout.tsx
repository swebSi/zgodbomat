import {
  constantStorage,
  STORAGE_CONSTANT_IS_USER_ONBOARDED,
} from '@shared/storage/contstant-storage';
import { useConvexAuth } from 'convex/react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function OnboardingLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useConvexAuth();

  // Redirect to login if onboarding index is accessed after completion
  // But allow child-create to be accessible after onboarding (for authenticated users)
  useEffect(() => {
    const hasCompletedOnboarding =
      constantStorage.getBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED) ?? false;
    const isOnChildCreate = segments.some((segment) => segment === 'child-create');

    // Only redirect from index if onboarding is complete
    // child-create can be accessed after onboarding (for authenticated users creating first child)
    if (hasCompletedOnboarding && !isOnChildCreate && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [router, segments, isAuthenticated]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="child-create" options={{ headerShown: false }} />
    </Stack>
  );
}
