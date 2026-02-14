import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function useSamples() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const samplesQuery = query(collection(db, 'samples'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(samplesQuery, (snapshot) => {
      const nextSamples = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSamples(nextSamples);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { samples, loading };
}
