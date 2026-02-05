import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProfileState {
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  email: string | null;
  
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
      name: 'app-profile-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        firstName: state.firstName, 
        lastName: state.lastName, 
        photoUrl: state.photoUrl,
        email: state.email
      }),
    }
  )
);