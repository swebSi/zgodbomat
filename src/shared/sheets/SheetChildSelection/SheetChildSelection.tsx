import { useAuth } from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { AppSheet, useSheet } from '@core/providers/sheet-provider';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';
import { SheetModal } from '../../components/sheet';
import { Button } from '../../components/ui/button';
import { Text } from '../../components/ui/text';
import { THEME } from '../../lib/theme';
import { useUserSettingsStore } from '../../stores/user-store';
import { type ChildAvatar } from '../../types/child';

const AVATAR_EMOJI_MAP: Record<ChildAvatar, string> = {
  lion: '🦁',
  bear: '🐻',
  bunny: '🐰',
  owl: '🦉',
  fox: '🦊',
};

export const SheetChildSelection = React.memo(function SheetChildSelection() {
  const router = useRouter();
  const { [AppSheet.CHILD_SELECTION]: sheetRef } = useSheet();
  const { isSignedIn } = useAuth();
  const { data: children } = useQuery({
    ...convexQuery(api.children.getChildrenByUser, {}),
    enabled: isSignedIn ?? false,
  });
  const { activeChildId, setActiveChildId } = useUserSettingsStore();

  const handleChildSelect = (childId: string) => {
    setActiveChildId(childId);
    sheetRef.current?.dismiss();
  };

  const handleAddNew = () => {
    sheetRef.current?.dismiss();
    router.push('/(onboarding)/child-create');
  };

  return (
    <SheetModal name={AppSheet.CHILD_SELECTION} ref={sheetRef} enableDynamicSizing={true}>
      <View className="gap-4 p-4">
        <Text className="text-xl font-bold">Select Child</Text>

        {children && children.length > 0 && (
          <View className="gap-2">
            {children.map((child: Doc<'children'>) => {
              const childAvatarEmoji = AVATAR_EMOJI_MAP[child.avatar as ChildAvatar];
              const isActive = String(child._id) === activeChildId;

              return (
                <Pressable
                  key={child._id}
                  onPress={() => handleChildSelect(String(child._id))}
                  className={`flex-row items-center gap-3 rounded-xl border-2 p-4 ${
                    isActive ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}>
                  <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/20">
                    <Text className="text-2xl">{childAvatarEmoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">{child.name}</Text>
                    <Text className="text-sm text-muted-foreground">Age {child.age}</Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={24} color={THEME.dark.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <Button
          onPress={handleAddNew}
          className="mt-4 flex-row items-center justify-center gap-2 bg-primary">
          <Ionicons name="add-circle" size={20} color={THEME.dark.primaryForeground} />
          <Text className="text-base font-semibold text-primary-foreground">Add New Child</Text>
        </Button>
      </View>
    </SheetModal>
  );
});
