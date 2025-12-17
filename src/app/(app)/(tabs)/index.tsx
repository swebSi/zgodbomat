import { useAuth } from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { AppSheet, useSheet } from '@core/providers/sheet-provider';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContent } from '@shared/components/ScreenContent';
import { NewAdventureCard } from '@shared/components/new-adventure-card';
import { Text } from '@shared/components/ui/text';
import { useUserSettingsStore } from '@shared/stores/user-store';
import { useQuery } from '@tanstack/react-query';
import { router, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';

import { type ChildAvatar } from '@shared/types/child';

const AVATAR_EMOJI_MAP: Record<ChildAvatar, string> = {
  lion: '🦁',
  bear: '🐻',
  bunny: '🐰',
  owl: '🦉',
  fox: '🦊',
};

function BedtimeHeader() {
  const router = useRouter();
  const { [AppSheet.CHILD_SELECTION]: sheetRef } = useSheet();
  const { isSignedIn } = useAuth();
  const { data: children } = useQuery({
    ...convexQuery(api.children.getChildrenByUser, {}),
    enabled: isSignedIn ?? false,
  });
  const { activeChildId } = useUserSettingsStore();

  // Get active child or the only child if there's only one
  const activeChild = useMemo(() => {
    if (!children) return null;
    if (children.length === 0) return null;

    // If there's an active child ID, find it
    if (activeChildId) {
      const found = children.find((child: Doc<'children'>) => String(child._id) === activeChildId);
      if (found) return found;
    }

    // Otherwise, use the only child if there's just one
    return children.length === 1 ? children[0] : null;
  }, [children, activeChildId]);

  const handleNamePress = () => {
    sheetRef.current?.present();
  };

  const handleAvatarPress = () => {
    if (activeChild) {
      // Navigate to child-create with child ID for editing
      router.push({
        pathname: '/(app)/child-create',
        params: { childId: String(activeChild._id) },
      });
    } else {
      // If no active child, just go to create new
      router.push('/(app)/child-create');
    }
  };

  const avatarEmoji = activeChild ? AVATAR_EMOJI_MAP[activeChild.avatar as ChildAvatar] : null;
  const displayName = activeChild?.name ?? 'Select a child';

  return (
    <View className="mx-4 mb-4">
      <View className="px-6 py-5">
        <View className="flex-row items-center justify-between">
          {/* Left side: Text content - clickable to open bottom sheet */}
          <Pressable onPress={handleNamePress} className="flex-1">
            <View className="flex-1">
              <Text className="text-xs font-medium uppercase tracking-wide">BEDTIME FOR</Text>
              <View className="mt-1 flex-row items-center gap-2">
                <Text className="text-2xl font-bold">{displayName}</Text>
                <Ionicons name="chevron-down" size={20} color="#FFB84D" />
              </View>
            </View>
          </Pressable>

          {/* Right side: Avatar - clickable to edit/create child */}
          <Pressable onPress={handleAvatarPress} className="ml-4">
            <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-primary">
              {avatarEmoji ? (
                <Text className="text-3xl">{avatarEmoji}</Text>
              ) : (
                <Ionicons name="person" size={32} color="hsl(var(--primary))" />
              )}
            </View>
            {/* Notification dot - only show if there's an active child */}
            {activeChild && (
              <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-green-700 bg-green-600" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function Home() {
  return (
    <ScreenContent>
      <ScrollView className="flex-1 bg-background">
        <BedtimeHeader />
        <View className="p-4">
          <NewAdventureCard
            onPress={() => {
              router.push('/(app)/story-prompt');
            }}
          />
        </View>
      </ScrollView>
    </ScreenContent>
  );
}
