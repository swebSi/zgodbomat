import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useUserSettingsStore } from '@shared/stores/user-store';
import { type ChildAvatar } from '@shared/types/child';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';
import { api } from '../../../convex/_generated/api';

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

const childFormSchema = z.object({
  name: z.string().min(1, "Please enter your child's name").trim(),
  age: z
    .string()
    .min(1, 'Please enter an age')
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 10;
      },
      { message: 'Please enter a valid age between 1 and 10' }
    ),
  avatar: z.enum(['lion', 'bear', 'bunny', 'owl', 'fox'], {
    required_error: 'Please select an avatar',
  }),
});

type ChildFormData = z.infer<typeof childFormSchema>;

export default function ChildCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ childId?: string }>();
  const { setActiveChildId } = useUserSettingsStore();

  const createChildMutationFn = useConvexMutation(api.children.createChild);
  const updateChildMutationFn = useConvexMutation(api.children.updateChild);

  const { mutateAsync: createChildMutation } = useMutation({
    mutationFn: createChildMutationFn,
  });

  const { mutateAsync: updateChildMutation } = useMutation({
    mutationFn: updateChildMutationFn,
  });

  const { data: existingChild } = useQuery({
    ...convexQuery(api.children.getChildById, { childId: (params.childId ?? '') as any }),
    enabled: !!params.childId,
  });

  const isEditMode = !!params.childId && !!existingChild;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChildFormData>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      name: '',
      age: '',
      avatar: undefined,
    },
  });

  // Load existing child data when in edit mode
  React.useEffect(() => {
    if (existingChild) {
      reset({
        name: existingChild.name,
        age: String(existingChild.age),
        avatar: existingChild.avatar,
      });
    }
  }, [existingChild, reset]);

  const selectedAvatar = watch('avatar');

  const onSubmit = async (data: ChildFormData) => {
    try {
      const ageNum = parseInt(data.age, 10);
      let child;

      if (isEditMode && params.childId) {
        // Update existing child
        child = await updateChildMutation({
          childId: params.childId as any,
          name: data.name,
          age: ageNum,
          avatar: data.avatar,
        });
      } else {
        // Create new child
        child = await createChildMutation({
          name: data.name,
          age: ageNum,
          avatar: data.avatar,
        });

        // Set as active child
        if (child) {
          setActiveChildId(child._id);
        }

        // Ensure onboarding is marked as completed
        constantStorage.setBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED, true);
      }

      isEditMode ? router.back() : router.replace('/(app)/(tabs)');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} child:`, error);
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? 'update' : 'create'} child. Please try again.`
      );
    }
  };

  return (
    <ScreenContent edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1 bg-background" contentContainerClassName="px-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold">
              {isEditMode ? t`Edit Child Profile` : t`Who is this story for?`}
            </Text>
            <Text className="text-base leading-6" style={{ color: THEME.dark.mutedForeground }}>
              {isEditMode
                ? t`Update your child's information.`
                : t`We use this to personalize stories just for your child.`}
            </Text>
          </View>

          {/* Name Input */}
          <View className="gap-2">
            <Label>
              <Text className="text-sm font-medium">{t`Child's name or nickname`}</Text>
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t`Enter name`}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className="h-12"
                />
              )}
            />
            {errors.name && <Text className="text-sm text-destructive">{errors.name.message}</Text>}
          </View>

          {/* Age Input */}
          <View className="gap-2">
            <Label>
              <Text className="text-sm font-medium">{t`Age`}</Text>
            </Label>
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t`Enter age (1-10)`}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  className="h-12"
                />
              )}
            />
            {errors.age && <Text className="text-sm text-destructive">{errors.age.message}</Text>}
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
                  onPress={() => setValue('avatar', avatar.value)}
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
            {errors.avatar && (
              <Text className="text-sm text-destructive">{errors.avatar.message}</Text>
            )}
          </View>

          {/* Create Button */}
          <View className="pt-4">
            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="h-14 w-full rounded-xl bg-primary active:bg-primary/90 disabled:opacity-50">
              <Ionicons name="sparkles" size={20} color={THEME.dark.primaryForeground} />
              <Text className="text-base font-semibold text-primary-foreground">
                {isSubmitting
                  ? isEditMode
                    ? t`Updating...`
                    : t`Creating...`
                  : isEditMode
                    ? t`Update Child`
                    : t`Create Story`}
              </Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContent>
  );
}
