import type { FC, JSX, PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { KeyboardProvider } from 'react-native-keyboard-controller';
import ClerkProvider from './clerk/ClerkProvider';
import ConvexProvider from './convex/ConvexProvider';
import GestureHandlerProvider from './gesture/GestureHandlerProvider';
import { LanguageProvider } from './language/LanguageProvider';
import { SheetProvider } from './sheet-provider';
import TanstackQueryProvider from './tanstack-provider/TanstakQueryProvider';
/* eslint-disable-next-line */
type AnyChildren = PropsWithChildren<any>;

export const combineProviders = (...components: PropsWithChildren<FC>[]): PropsWithChildren<FC> => {
  return components.reduce(
    (AccumulatedComponents: AnyChildren, CurrentComponent: AnyChildren) => {
      return ({ children }: AnyChildren): JSX.Element => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };
    },
    ({ children }) => <>{children}</>
  );
};

/**
 *  The order of the providers is significant
 *  NOTE: If you need to change the order, DO IT CAREFULLY!
 *  ClerkProvider must wrap ConvexProvider so auth is available
 *  ConvexProvider wraps TanstackQueryProvider so Convex client is available
 */
const providers = [
  SafeAreaProvider,
  KeyboardProvider,
  TanstackQueryProvider,
  ClerkProvider,
  ConvexProvider,
  GestureHandlerProvider,
  SheetProvider,
  LanguageProvider,
];

const AppContextProviders = combineProviders(...(providers as FC[])) as AnyChildren;

export default AppContextProviders;
