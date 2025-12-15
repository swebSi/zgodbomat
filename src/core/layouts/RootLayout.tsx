import NetInfo from '@react-native-community/netinfo';
import { useColorScheme } from '@shared/lib/theme';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useUserSettingsStore } from '@shared/stores/user-store';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform, View } from 'react-native';
import { Toaster } from 'sonner-native';
import AppContextProviders from '../providers/AppProvider';

import { initSentry } from '@shared/config/sentry';
import { NAV_THEME } from '@shared/lib/theme/theme';
import {
  constantStorage,
  STORAGE_CONSTANT_IS_USER_ONBOARDED,
} from '@shared/storage/contstant-storage';
import { useConvexAuth } from 'convex/react';
import '../global.css';

const SentryInstance = initSentry();

// Online status management
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export default SentryInstance ? SentryInstance.wrap(RootLayout) : RootLayout;

export function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);
  const preferredTheme = useUserSettingsStore((state) => state.preferredTheme);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);

    const loadTheme = async () => {
      if (!preferredTheme) {
        setIsColorSchemeLoaded(true);
        return;
      }
      if (preferredTheme !== colorScheme) {
        setColorScheme(preferredTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    };

    loadTheme();

    return () => subscription.remove();
  }, []);

  const onLayoutRootView = useCallback(() => {
    // Use a double requestAnimationFrame:
    // 1. The first rAF waits for the current layout/paint cycle to finish.
    // 2. The second rAF ensures the first real UI frame is actually rendered.
    // This prevents a white flash between the splash screen and the app content.
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await SplashScreen.hideAsync();
      });
    });
  }, []);

  return (
    <AppContextProviders>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <View className="flex-1" onLayout={onLayoutRootView}>
          <Routes />
          <PortalHost />
          <Toaster />
        </View>
      </ThemeProvider>
    </AppContextProviders>
  );

  function Routes() {
    const { isAuthenticated, isLoading } = useConvexAuth();

    useEffect(() => {
      if (!isLoading) {
        SplashScreen.hideAsync();
      }
    }, [isLoading]);

    if (isLoading) {
      return null;
    }

    return (
      <Stack>
        {/* Onboarding screens - shown first time before login, but child-create accessible after login */}
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />

        {/* Auth screens - only shown when the user is NOT signed in */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)/login" options={SIGN_IN_SCREEN_OPTIONS} />
          <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
          <Stack.Screen name="(auth)/password-reset" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
          <Stack.Screen name="(auth)/forgot-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
          <Stack.Screen name="(auth)/verify-second-factor" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        </Stack.Protected>

        {/* Screens only shown when the user IS signed in and onboarded */}
        <Stack.Protected
          guard={
            isAuthenticated &&
            (constantStorage.getBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED) ?? false)
          }>
          <Stack.Screen name="(app)" options={DEFAULT_APP_SCREEN_OPTIONS} />
        </Stack.Protected>

        {/* Screens outside the guards are accessible to everyone (e.g. not found) */}
      </Stack>
    );
  }
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
};

const SIGN_UP_SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
  gestureEnabled: false,
} as const;

const DEFAULT_AUTH_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
  headerShown: false,
};

const DEFAULT_APP_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
  headerShown: false,
};
