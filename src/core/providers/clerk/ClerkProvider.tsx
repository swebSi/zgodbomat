import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Env } from '@env';
import type { PropsWithChildren } from 'react';

const clerkPublishableKey = Env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    'Missing Clerk Publishable Key. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env.{APP_ENV} file.'
  );
}

export default function ClerkProvider(props: PropsWithChildren) {
  return (
    <ClerkProviderBase publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      {props.children}
    </ClerkProviderBase>
  );
}
