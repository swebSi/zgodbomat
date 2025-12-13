import { Ionicons } from '@expo/vector-icons';
import { THEME, useColorScheme } from '@shared/lib/theme';
import { Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const inactiveColor = theme.mutedForeground;

  const SCREEN_OPTIONS = {
    tabBarActiveTintColor: theme.primary,
    tabBarInactiveTintColor: inactiveColor,
    tabBarStyle: {
      backgroundColor: theme.card,
      borderTopColor: theme.border,
      borderTopWidth: 1,
      height: 80,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
    },
    headerShown: false,
  };

  return (
    <Tabs screenOptions={SCREEN_OPTIONS}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'library' : 'library-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarButton: (props) => (
            <View className="relative flex-1 items-center justify-center">
              <Pressable
                onPress={() => {
                  // Handle create action
                  console.log('Create pressed');
                }}
                className="elevation-sm absolute -top-8 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md">
                <Ionicons name="add" size={28} color="#000" />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'radio' : 'radio-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
