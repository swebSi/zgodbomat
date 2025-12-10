import React, { type PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function GestureHandlerProvider(props: PropsWithChildren) {
  return <GestureHandlerRootView style={{ flex: 1 }}>{props.children}</GestureHandlerRootView>;
}

export default GestureHandlerProvider;
