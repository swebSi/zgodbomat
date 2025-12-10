import { zustandStorage } from '@shared/storage/zustand-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserSettingsStore {
  enabledLocalAuth: boolean;
  setEnabledLocalAuth: (enabledLocalAuth: boolean) => void;
  preferredTheme: 'light' | 'dark' | 'system';
  setPreferredTheme: (preferredTheme: 'light' | 'dark' | 'system') => void;
  enabledPushNotifications: boolean;
  setEnabledPushNotifications: (enabledPushNotifications: boolean) => void;
}

export const useUserSettingsStore = create<UserSettingsStore>()(
  persist(
    (set) => ({
      enabledLocalAuth: false,
      setEnabledLocalAuth: (enabledLocalAuth) => set({ enabledLocalAuth }),
      preferredTheme: 'system',
      setPreferredTheme: (preferredTheme) => set({ preferredTheme }),
      enabledPushNotifications: false,
      setEnabledPushNotifications: (enabledPushNotifications) => set({ enabledPushNotifications }),
    }),
    {
      name: 'user-settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
