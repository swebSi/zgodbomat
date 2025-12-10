import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { Link, Stack, useRouter } from 'expo-router';
import { View } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center gap-4 p-4">
        <Text className="font-medium">Page not found </Text>
        <View className="flex-row gap-4">
          <Button variant="outline" onPress={() => router.back()}>
            <Text>Go Back</Text>
          </Button>
          <Link href="/" asChild={true}>
            <Button>
              <Text>Go Home</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}
