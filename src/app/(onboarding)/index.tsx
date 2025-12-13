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
import { useChildStore } from '@shared/stores/child-store';
import { useConvexAuth } from 'convex/react';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SCREENS = [
  { id: 'welcome', component: OnboardingWelcomeScreen },
  { id: 'customize', component: OnboardingCustomizeScreen },
  { id: 'voice', component: OnboardingVoiceScreen },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getActiveChild } = useChildStore();
  const { isAuthenticated } = useConvexAuth();

  // Check if onboarding is already completed
  const hasCompletedOnboarding =
    constantStorage.getBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED) ?? false;

  // If onboarding is completed and authenticated but no child exists, redirect to child creation
  useEffect(() => {
    if (hasCompletedOnboarding && isAuthenticated && !getActiveChild()) {
      router.replace('/(onboarding)/child-create');
    } else if (hasCompletedOnboarding && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [hasCompletedOnboarding, isAuthenticated, getActiveChild, router]);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SCREENS.length - 1) {
      const nextIndex = currentIndex + 1;
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

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    constantStorage.setBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED, true);
    // If not authenticated, redirect to login
    // If authenticated, proceed to child creation
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(onboarding)/child-create');
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: (typeof ONBOARDING_SCREENS)[number];
    index: number;
  }) => {
    const Component = item.component;
    return (
      <View style={{ width: SCREEN_WIDTH }}>
        <Component
          onNext={handleNext}
          onSkip={handleSkip}
          onBack={handleBack}
          showBackButton={index > 0}
        />
      </View>
    );
  };

  return (
    <OnboardingCarousel
      ref={flatListRef}
      data={ONBOARDING_SCREENS as any}
      renderItem={({ item }: { item: (typeof ONBOARDING_SCREENS)[number] }) =>
        renderItem({ item, index: 0 })
      }
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
    />
  );
}
