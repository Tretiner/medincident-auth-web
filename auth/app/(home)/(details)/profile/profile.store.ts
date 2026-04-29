import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProfileState {
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  email: string | null;
  isEmailVerified: boolean;
  
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
      isEmailVerified: false,

      setProfile: (data) => set(data),
      clearProfile: () => set({ firstName: null, lastName: null, photoUrl: null, email: null, isEmailVerified: false}),
    }),
    {
      name: 'app-profile-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        firstName: state.firstName, 
        lastName: state.lastName, 
        photoUrl: state.photoUrl,
        isEmailVerified: state.isEmailVerified,
        email: state.email
      }),
    }
  )
);