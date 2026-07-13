import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/services/storage';

export type UserProfile = {
  email: string;
  id: string;
  name: string;
  photoURL?: string;
};

export const useUser = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const userProfileJson = storage.getString('user_profile');
    if (userProfileJson) {
      try {
        setUser(JSON.parse(userProfileJson));
      } catch {
        console.error('Failed to parse user profile');
      }
    }
    setIsLoading(false);
  }, []);

  const saveUser = useCallback((userProfile: UserProfile) => {
    setUser(userProfile);
    storage.set('user_profile', JSON.stringify(userProfile));
    storage.set('user_id', userProfile.id);
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    storage.delete('user_profile');
    storage.delete('user_id');
  }, []);

  return {
    user,
    isLoading,
    saveUser,
    clearUser,
  };
};
