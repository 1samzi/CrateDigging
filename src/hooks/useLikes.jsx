import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function useLikes(user) {
  const [likedIds, setLikedIds] = useState([]);

  useEffect(() => {
    if (!user) {
      setLikedIds([]);
      return undefined;
    }

    const likesRef = collection(db, 'users', user.uid, 'likes');
    const unsubscribe = onSnapshot(likesRef, (snapshot) => {
      setLikedIds(snapshot.docs.map((entry) => entry.id));
    });

    return unsubscribe;
  }, [user]);

  const toggleLike = async (sampleId) => {
    if (!user) {
      return;
    }

    const likeRef = doc(db, 'users', user.uid, 'likes', sampleId);
    if (likedIds.includes(sampleId)) {
      await deleteDoc(likeRef);
      return;
    }

    await setDoc(likeRef, { createdAt: Date.now() });
  };

  return { likedIds, toggleLike };
}
