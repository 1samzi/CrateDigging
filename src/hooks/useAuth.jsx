import { useEffect, useState } from 'react';
import { login, logout, signup, subscribeAuth } from '../lib/backend';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading, login, signup, logout };
}
