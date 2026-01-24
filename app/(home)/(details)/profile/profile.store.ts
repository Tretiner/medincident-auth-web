import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProfileState {
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  email: string | null; // Добавим, раз кешируем профиль целиком
  
  // Actions
  setProfile: (data: Partial<ProfileState>) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      firstName: null,
      lastName: null,
      photoUrl: null,
      email: null,

      setProfile: (data) => set((state) => ({ ...state, ...data })),
      clearProfile: () => set({ firstName: null, lastName: null, photoUrl: null, email: null }),
    }),
    {
      name: 'app-profile-storage', // Имя ключа в localStorage
      storage: createJSONStorage(() => localStorage),
      // Опционально: кешируем только то, что нужно для UI, чтобы не раздувать
      partialize: (state) => ({ 
        firstName: state.firstName, 
        lastName: state.lastName, 
        photoUrl: state.photoUrl,
        email: state.email
      }),
    }
  )
);