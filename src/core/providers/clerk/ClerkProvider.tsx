import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import Constants from 'expo-constants';
import type { PropsWithChildren } from 'react';

const clerkPublishableKey =
  Constants.expoConfig?.extra?.clerkPublishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    'Missing Clerk Publishable Key. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your environment variables.'
  );
}

export default function ClerkProvider(props: PropsWithChildren) {
  return (
    <ClerkProviderBase publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      {props.children}
    </ClerkProviderBase>
  );
}
