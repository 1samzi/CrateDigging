import { useEffect, useState } from 'react';
import { subscribeLikes, toggleLike as toggleLikeStore } from '../lib/backend';

export default function useLikes(user) {
  const [likedIds, setLikedIds] = useState([]);

  useEffect(() => {
    if (!user) {
      setLikedIds([]);
      return undefined;
    }

    const unsubscribe = subscribeLikes(user.uid, setLikedIds);
    return unsubscribe;
  }, [user]);

  const toggleLike = async (sampleId) => {
    if (!user) return;
    await toggleLikeStore(user.uid, sampleId);
  };

  return { likedIds, toggleLike };
}
