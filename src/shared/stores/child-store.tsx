import { globalStorage } from '@shared/storage/global-storage';
import { STORAGE_CONSTANT_ACTIVE_CHILD_ID } from '@shared/storage/global-storage/const';
import { zustandStorage } from '@shared/storage/zustand-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ChildAvatar = 'lion' | 'bear' | 'bunny' | 'owl' | 'fox';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: ChildAvatar;
  createdAt: number;
}

interface ChildStore {
  children: ChildProfile[];
  activeChildId: string | null;
  addChild: (child: Omit<ChildProfile, 'id' | 'createdAt'>) => ChildProfile;
  setActiveChild: (childId: string) => void;
  getActiveChild: () => ChildProfile | null;
}

export const useChildStore = create<ChildStore>()(
  persist(
    (set, get) => ({
      children: [],
      activeChildId: globalStorage.getItem(STORAGE_CONSTANT_ACTIVE_CHILD_ID) ?? null,
      addChild: (childData) => {
        const newChild: ChildProfile = {
          ...childData,
          id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };
        set((state) => ({
          children: [...state.children, newChild],
          activeChildId: newChild.id,
        }));
        globalStorage.setItem(STORAGE_CONSTANT_ACTIVE_CHILD_ID, newChild.id);
        return newChild;
      },
      setActiveChild: (childId) => {
        set({ activeChildId: childId });
        globalStorage.setItem(STORAGE_CONSTANT_ACTIVE_CHILD_ID, childId);
      },
      getActiveChild: () => {
        const state = get();
        return state.children.find((child) => child.id === state.activeChildId) ?? null;
      },
    }),
    {
      name: 'child-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
