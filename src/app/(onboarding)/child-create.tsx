import { Ionicons } from '@expo/vector-icons';
import { t } from '@lingui/core/macro';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Text } from '@shared/components/ui/text';
import { THEME } from '@shared/lib/theme';
import {
  constantStorage,
  STORAGE_CONSTANT_IS_USER_ONBOARDED,
} from '@shared/storage/contstant-storage';
import { useChildStore, type ChildAvatar } from '@shared/stores/child-store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

const AVATAR_OPTIONS: {
  value: ChildAvatar;
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  label: string;
}[] = [
  { value: 'lion', icon: 'paw', emoji: '🦁', label: 'Lion' },
  { value: 'bear', icon: 'paw', emoji: '🐻', label: 'Bear' },
  { value: 'bunny', icon: 'paw', emoji: '🐰', label: 'Bunny' },
  { value: 'owl', icon: 'paw', emoji: '🦉', label: 'Owl' },
  { value: 'fox', icon: 'paw', emoji: '🦊', label: 'Fox' },
];

export default function ChildCreateScreen() {
  const router = useRouter();
  const { addChild } = useChildStore();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<ChildAvatar | null>(null);

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Required', "Please enter your child's name");
      return;
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 10) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 10');
      return;
    }

    if (!selectedAvatar) {
      Alert.alert('Required', 'Please select an avatar');
      return;
    }

    addChild({
      name: name.trim(),
      age: ageNum,
      avatar: selectedAvatar,
    });

    // Ensure onboarding is marked as completed
    constantStorage.setBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED, true);
    router.replace('/(app)/(tabs)');
  };

  return (
    <ScreenContent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold">{t`Who is this story for?`}</Text>
            <Text className="text-base leading-6" style={{ color: THEME.dark.mutedForeground }}>
              {t`We use this to personalize stories just for your child.`}
            </Text>
          </View>

          {/* Name Input */}
          <View className="gap-2">
            <Label>
              <Text className="text-sm font-medium">{t`Child's name or nickname`}</Text>
            </Label>
            <Input
              placeholder={t`Enter name`}
              value={name}
              onChangeText={setName}
              className="h-12"
            />
          </View>

          {/* Age Input */}
          <View className="gap-2">
            <Label>
              <Text className="text-sm font-medium">{t`Age`}</Text>
            </Label>
            <Input
              placeholder={t`Enter age (1-10)`}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              className="h-12"
            />
          </View>

          {/* Avatar Picker */}
          <View className="gap-3">
            <Label>
              <Text className="text-sm font-medium">{t`Choose an avatar`}</Text>
            </Label>
            <View className="flex-row flex-wrap gap-3">
              {AVATAR_OPTIONS.map((avatar) => (
                <Pressable
                  key={avatar.value}
                  onPress={() => setSelectedAvatar(avatar.value)}
                  className={`h-20 w-20 items-center justify-center rounded-2xl border-2 ${
                    selectedAvatar === avatar.value
                      ? 'border-primary bg-primary/20'
                      : 'border-border bg-card'
                  }`}>
                  <Text className="text-3xl">{avatar.emoji}</Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{
                      color:
                        selectedAvatar === avatar.value
                          ? THEME.dark.primary
                          : THEME.dark.mutedForeground,
                    }}>
                    {avatar.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Create Button */}
          <View className="pt-4">
            <Button
              onPress={handleCreate}
              className="h-14 w-full rounded-xl bg-primary active:bg-primary/90">
              <Ionicons name="sparkles" size={20} color={THEME.dark.primaryForeground} />
              <Text className="text-base font-semibold text-primary-foreground">{t`Create Story`}</Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContent>
  );
}
