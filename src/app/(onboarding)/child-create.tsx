import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Redirect component - redirects to the app version of child-create
 * This maintains backward compatibility for any links to the onboarding version
 */
export default function ChildCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ childId?: string }>();

  useEffect(() => {
    // Redirect to app version, preserving any query parameters
    if (params.childId) {
      router.replace({
        pathname: '/(app)/child-create',
        params: { childId: params.childId },
      });
    } else {
      router.replace('/(app)/child-create');
    }
  }, [router, params.childId]);

  return null;
}
