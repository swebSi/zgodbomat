import { useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { PropsWithChildren } from "react";
import { convex } from "./convexClient";

function ConvexProviderInner(props: PropsWithChildren) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {props.children}
    </ConvexProviderWithClerk>
  );
}

export default function ConvexProvider(props: PropsWithChildren) {
  return <ConvexProviderInner>{props.children}</ConvexProviderInner>;
}
