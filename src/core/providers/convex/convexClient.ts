import { ConvexReactClient } from "convex/react";
import { Env } from "@env";

const convexUrl = Env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing Convex URL. Set EXPO_PUBLIC_CONVEX_URL in your .env.{APP_ENV} file."
  );
}

export const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});
