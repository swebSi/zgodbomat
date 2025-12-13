import { useChildStore } from '@shared/stores/child-store';
import { useConvexAuth } from 'convex/react';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { getActiveChild } = useChildStore();

  // After login, if no child exists, redirect to child creation
  useEffect(() => {
    if (isAuthenticated && !getActiveChild()) {
      router.replace('/(onboarding)/child-create');
    }
  }, [isAuthenticated, getActiveChild, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
