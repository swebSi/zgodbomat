import { THEME } from '@shared/lib/theme';
import { forwardRef } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import { ScreenContent } from '../ScreenContent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingCarouselProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const OnboardingCarousel = forwardRef<FlatList, OnboardingCarouselProps<any>>(
  ({ data, renderItem, currentIndex, onIndexChange }, ref) => {
    return (
      <ScreenContent excludeEdges={['top', 'bottom']}>
        <FlatList
          ref={ref}
          data={data}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `onboarding-${index}`}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            onIndexChange(index);
          }}
          onScrollToIndexFailed={(info) => {
            // Fallback to scrollToOffset if scrollToIndex fails
            setTimeout(() => {
              if (ref && 'current' in ref && ref.current) {
                ref.current.scrollToOffset({ offset: info.index * SCREEN_WIDTH, animated: true });
              }
            }, 100);
          }}
          scrollEnabled={true}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />
        {/* Pagination dots */}
        <View className="absolute bottom-8 left-0 right-0 flex-row justify-center gap-2">
          {data.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full"
              style={{
                width: currentIndex === index ? 24 : 8,
                backgroundColor:
                  currentIndex === index ? THEME.dark.primary : THEME.dark.mutedForeground + '60',
              }}
            />
          ))}
        </View>
      </ScreenContent>
    );
  }
);

OnboardingCarousel.displayName = 'OnboardingCarousel';
