import { convexQuery } from '@convex-dev/react-query';
import {
  OnboardingCustomizeScreen,
  OnboardingVoiceScreen,
  OnboardingWelcomeScreen,
} from '@shared/components/onboarding';
import { OnboardingCarousel } from '@shared/components/onboarding/OnboardingCarousel';
import {
  constantStorage,
  STORAGE_CONSTANT_IS_USER_ONBOARDED,
} from '@shared/storage/contstant-storage';
import { useQuery } from '@tanstack/react-query';
import { useConvexAuth } from 'convex/react';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import { api } from '../../../convex/_generated/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SCREENS = [
  { id: 'welcome', component: OnboardingWelcomeScreen },
  { id: 'customize', component: OnboardingCustomizeScreen },
  { id: 'voice', component: OnboardingVoiceScreen },
] as const;

// Store onboarding index outside component to persist across remounts
let persistedOnboardingIndex = 0;

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(persistedOnboardingIndex);
  const { isAuthenticated } = useConvexAuth();
  const { data: children } = useQuery({
    ...convexQuery(api.children.getChildrenByUser, {}),
    enabled: isAuthenticated ?? false,
  });

  // Check if onboarding is already completed
  const hasCompletedOnboarding =
    constantStorage.getBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED) ?? false;

  // If onboarding is completed and authenticated but no child exists, redirect to child creation
  useEffect(() => {
    if (hasCompletedOnboarding && isAuthenticated && children !== undefined) {
      // Only redirect if we've loaded children and there are none
      if (children.length === 0) {
        router.replace('/(app)/child-create');
      } else {
        // If children exist, go to app
        router.replace('/(app)/(tabs)');
      }
    } else if (hasCompletedOnboarding && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [hasCompletedOnboarding, isAuthenticated, children, router]);

  // Sync currentIndex with persisted value
  useEffect(() => {
    persistedOnboardingIndex = currentIndex;
  }, [currentIndex]);

  // Restore scroll position after remount
  useEffect(() => {
    if (persistedOnboardingIndex > 0 && flatListRef.current) {
      // Small delay to ensure FlatList is ready
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({ index: persistedOnboardingIndex, animated: false });
        } catch (error) {
          flatListRef.current?.scrollToOffset({
            offset: persistedOnboardingIndex * SCREEN_WIDTH,
            animated: false,
          });
        }
      }, 100);
    }
  }, []);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SCREENS.length - 1) {
      const nextIndex = currentIndex + 1;
      persistedOnboardingIndex = nextIndex;
      try {
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        flatListRef.current?.scrollToOffset({ offset: nextIndex * SCREEN_WIDTH, animated: true });
        setCurrentIndex(nextIndex);
      }
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      persistedOnboardingIndex = prevIndex;
      try {
        flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
        setCurrentIndex(prevIndex);
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        flatListRef.current?.scrollToOffset({ offset: prevIndex * SCREEN_WIDTH, animated: true });
        setCurrentIndex(prevIndex);
      }
    }
  };

  const handleComplete = () => {
    constantStorage.setBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED, true);
    console.log('SHOUL DHANDLE COMPLETE');
    router.replace('/(auth)/login');
  };

  const renderItem = ({ item }: { item: (typeof ONBOARDING_SCREENS)[number] }) => {
    const Component = item.component;
    const index = ONBOARDING_SCREENS.findIndex((screen) => screen.id === item.id);
    return (
      <View style={{ width: SCREEN_WIDTH }}>
        <Component onNext={handleNext} onBack={handleBack} showBackButton={index > 0} />
      </View>
    );
  };

  return (
    <View className="flex-1">
      <OnboardingCarousel
        ref={flatListRef}
        data={ONBOARDING_SCREENS as any}
        renderItem={renderItem}
        currentIndex={currentIndex}
        onIndexChange={(index) => {
          persistedOnboardingIndex = index;
          setCurrentIndex(index);
        }}
      />
    </View>
  );
}
