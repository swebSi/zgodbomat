import { AppSheet, useSheet } from '@core/providers/sheet-provider';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SheetModal } from '../../components/sheet';
import { Text } from '../../components/ui/text';

export const SheetInfo = React.memo(function SheetInfo() {
  const { [AppSheet.INFO]: progressRef } = useSheet();

  const progressOpacity = useSharedValue(0);
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }));

  useEffect(() => {
    progressOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  return (
    <SheetModal name={AppSheet.INFO} snapPoints={[280]} ref={progressRef}>
      <View className="flex-1 px-4">
        <Animated.View className="items-center gap-4" style={progressAnimatedStyle}>
          <Text className="text-muted-foreground text-center text-lg">Hrere</Text>
        </Animated.View>
      </View>
    </SheetModal>
  );
});
