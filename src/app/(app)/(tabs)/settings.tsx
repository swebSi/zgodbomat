import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Text } from '@shared/components/ui/text';
import { THEME, useColorScheme } from '@shared/lib/theme';
import { useUserSettingsStore } from '@shared/stores/user-store';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Switch, View } from 'react-native';

export default function Settings() {
  const { signOut, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const {
    enabledLocalAuth,
    setEnabledLocalAuth,
    enabledPushNotifications,
    setEnabledPushNotifications,
  } = useUserSettingsStore();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const [downloadOverWifiOnly, setDownloadOverWifiOnly] = useState(true);
  const [useCompactUI, setUseCompactUI] = useState(false);

  const mockStorageUsage = useMemo(
    () => ({
      used: '1.2 GB',
      total: '5 GB',
    }),
    []
  );

  const handleLogout = async () => {
    if (!isSignedIn) return;
    await signOut();
  };

  console.log('user', user?.publicMetadata);

  const displayName = isUserLoaded
    ? user?.fullName || user?.firstName || t`Signed in user`
    : t`Loading profile`;
  const emailAddress = isUserLoaded
    ? user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      t`Email unavailable`
    : t`Fetching email...`;
  const userInitial = (
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress ||
    'U'
  )
    .charAt(0)
    .toUpperCase();

  return (
    <ScreenContent>
      <ScrollView className="flex-1 bg-background">
        <View className="gap-4 p-4">
          <View className="rounded-3xl border border-border bg-card shadow-sm shadow-black/5">
            <View className="flex-row items-center gap-4 px-4 py-5">
              <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/60">
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="h-full w-full" />
                ) : (
                  <Text className="text-lg font-semibold text-foreground">{userInitial}</Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">{displayName}</Text>
                <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                  {emailAddress}
                </Text>
                {user?.id && (
                  <Text className="text-xs text-muted-foreground">{t`User ID: ${user.id}`}</Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={18} color={theme.mutedForeground} />
            </View>
          </View>

          <View className="rounded-3xl border border-border bg-card shadow-sm shadow-black/5">
            <Pressable className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-muted/70">
                  <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text className="text-base font-semibold text-foreground">{t`Account security`}</Text>
                  <Text className="text-sm text-muted-foreground">{t`Logged in with Clerk`}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color={theme.mutedForeground} />
            </Pressable>

            <View className="border-t border-border/60 px-4 py-4">
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-muted/70">
                    <Ionicons name="finger-print" size={20} color={theme.primary} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground">{t`Face/Touch ID`}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {t`Require biometrics for quick unlock`}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={enabledLocalAuth}
                  onValueChange={setEnabledLocalAuth}
                  thumbColor={enabledLocalAuth ? theme.primary : theme.border}
                  trackColor={{ true: theme.primary, false: theme.border }}
                />
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-muted/70">
                    <Ionicons name="notifications" size={20} color={theme.primary} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground">{t`Notifications`}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {t`Daily reminders and bedtime alerts`}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={enabledPushNotifications}
                  onValueChange={setEnabledPushNotifications}
                  thumbColor={enabledPushNotifications ? theme.primary : theme.border}
                  trackColor={{ true: theme.primary, false: theme.border }}
                />
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-muted/70">
                    <Ionicons name="download" size={20} color={theme.primary} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground">{t`Downloads`}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {t`Save stories for offline nights`}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-semibold text-foreground">
                    {mockStorageUsage.used} / {mockStorageUsage.total}
                  </Text>
                  <Pressable
                    onPress={() => setDownloadOverWifiOnly((prev) => !prev)}
                    className="mt-1 flex-row items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5">
                    <Ionicons
                      name={downloadOverWifiOnly ? 'wifi' : 'cellular'}
                      size={16}
                      color={theme.primary}
                    />
                    <Text className="text-xs font-semibold text-foreground">
                      {downloadOverWifiOnly ? t`Wi‑Fi only` : t`Allow cellular`}
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-muted/70">
                    <Ionicons name="color-palette" size={20} color={theme.primary} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground">{t`Compact UI`}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {t`Tighter spacing for small screens`}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={useCompactUI}
                  onValueChange={setUseCompactUI}
                  thumbColor={useCompactUI ? theme.primary : theme.border}
                  trackColor={{ true: theme.primary, false: theme.border }}
                />
              </View>
            </View>

            <View className="border-t border-border/60 px-4 py-4">
              <Pressable
                onPress={handleLogout}
                disabled={!isSignedIn}
                className="flex-row items-center justify-between rounded-2xl bg-destructive/10 px-3 py-3">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-destructive/20">
                    <Ionicons name="power" size={20} color={theme.destructive} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-destructive">{t`Log out`}</Text>
                    <Text className="text-sm text-muted-foreground">{t`Sign out of this account`}</Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isSignedIn ? theme.destructive : theme.mutedForeground}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContent>
  );
}
