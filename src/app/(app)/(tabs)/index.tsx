import { ScreenContent } from '@shared/components/ScreenContent';
import { NewAdventureCard } from '@shared/components/new-adventure-card';
import { ScrollView, View } from 'react-native';

export default function Home() {
  return (
    <ScreenContent>
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          <NewAdventureCard
            onPress={() => {
              // Handle create magic action
              console.log('Create Magic pressed');
            }}
          />
        </View>
      </ScrollView>
    </ScreenContent>
  );
}
