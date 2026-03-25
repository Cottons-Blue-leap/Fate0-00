import { createContext, useContext, useState, type ReactNode } from 'react';
import { isLoggedIn, saveServerProfile } from '../services/api';

export interface UserProfile {
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  isLunar: boolean;
  gender: 'male' | 'female';
}

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  clearProfile: () => void;
  hasProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  setProfile: () => {},
  clearProfile: () => {},
  hasProfile: false,
});

const STORAGE_KEY = 'fate0_profile';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const setProfile = (p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));

    // Background server sync
    if (isLoggedIn()) {
      saveServerProfile(p as unknown as Record<string, unknown>).catch(() => {
        // Silent fail — localStorage is the source of truth
      });
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile, hasProfile: !!profile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
