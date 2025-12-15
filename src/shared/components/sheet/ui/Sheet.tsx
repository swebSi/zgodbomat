import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import React, { forwardRef, useCallback } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DetachedContentProps = {
  children: ReactNode;
  bottomInset?: number;
  name: string;
  detached?: boolean;
  onDismiss?: () => void;
  snapPoints?: number[];
  enableDynamicSizing?: boolean;
};

export const SheetComponent = forwardRef<BottomSheetModal, DetachedContentProps>(
  function SheetComponent(props, ref) {
    const { children, detached = true, bottomInset = 80, ...rest } = props;
    const { bottom: safeBottom } = useSafeAreaInsets();

    const backgroundComponent = useCallback(
      (props: BottomSheetBackgroundProps) => {
        const { style, ...rest } = props;
        // Ensure background extends to cover safe area at bottom
        const backgroundStyle = Array.isArray(style) ? style : [style];
        return (
          <View
            className="overflow-hidden rounded-t-3xl border border-primary/10 bg-background"
            style={[...backgroundStyle]}
            {...rest}
          />
        );
      },
      [safeBottom]
    );

    const backdropComponent = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          enableTouchThrough
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        enablePanDownToClose
        animateOnMount
        enableDynamicSizing
        backdropComponent={backdropComponent}
        backgroundComponent={backgroundComponent}
        // detached={detached}
        keyboardBehavior={'interactive'}
        keyboardBlurBehavior={'restore'}
        // bottomInset={bottomInset}
        handleIndicatorStyle={{}}
        {...rest}>
        <Pressable onPress={Keyboard.dismiss} className="flex-1 px-4 pb-0">
          <BottomSheetView style={{ paddingBottom: safeBottom, flex: 1 }}>
            {children}
          </BottomSheetView>
        </Pressable>
      </BottomSheetModal>
    );
  }
);
