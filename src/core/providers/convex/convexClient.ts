import { ConvexReactClient } from "convex/react";
import Constants from "expo-constants";

const convexUrl =
  Constants.expoConfig?.extra?.convexUrl || process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing Convex URL. Set EXPO_PUBLIC_CONVEX_URL in your environment variables."
  );
}

export const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});
