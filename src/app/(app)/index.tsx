import { useAuth, useUser } from '@clerk/clerk-expo';
import * as Sentry from '@sentry/react-native';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { View } from 'react-native';

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <ScreenContent excludeEdges={['top']}>
      <View className="flex-1 items-center justify-center gap-4">
        <Text>Home {user?.firstName}</Text>
        <Button
          onPress={() => {
            Sentry.captureException(new Error('First error from expo app'));
          }}>
          <Text>Trigger sentry error</Text>
        </Button>
        <Button onPress={() => signOut()}>
          <Text>Sign Out</Text>
        </Button>
      </View>
    </ScreenContent>
  );
}
