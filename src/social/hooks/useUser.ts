import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useEffect, useState } from 'react';

export const useUser = (userId?: string) => {
  const [user, setUser] = useState<Amity.User | null>(null);
  useEffect(() => {
    if (!userId) return undefined;
    const unsubscribe = UserRepository.getUser(
      userId,
      ({ data, loading, error }) => {
        if (error) return undefined;
        if (!loading) {
          setUser(data);
        }
      }
    );
    // Every feed card uses this twice (the author, and the current user in
    // its menu); left open, each card ever shown kept both for the session.
    return () => unsubscribe();
  }, [userId]);
  return user;
};
