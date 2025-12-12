import { AuthConfig } from 'convex/server';

export default {
  providers: [
    {
      // Clerk Issuer URL is loaded from .env.{APP_ENV} file via EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN
      // Configure this variable in your .env.development, .env.staging, or .env.production file
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig;
