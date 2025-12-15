import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useRef } from 'react';
// eslint-disable-next-line import/no-restricted-paths
// import * as Bottom from '@widgets/sheet'
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Bottom from '@shared/sheets';
import type { FC } from 'react';
import type { SheetProvider as ProviderType } from './context';
import SheetContext, { AppSheet } from './context';

interface SheetProviderProps {
  children: React.ReactNode;
}

export const SheetProvider: FC<SheetProviderProps> = ({ children }) => {
  const initialSheetContext: ProviderType = {
    [AppSheet.INFO]: useRef<BottomSheetModal>(null),
    [AppSheet.CHILD_SELECTION]: useRef<BottomSheetModal>(null),
  };

  return (
    <SheetContext.Provider value={initialSheetContext}>
      <BottomSheetModalProvider>
        <Bottom.SheetInfo />
        <Bottom.SheetChildSelection />
        {children}
      </BottomSheetModalProvider>
    </SheetContext.Provider>
  );
};
