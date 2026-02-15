import { useEffect, useState } from 'react';
import { subscribeSamples } from '../lib/backend';

export default function useSamples() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSamples((nextSamples) => {
      setSamples(nextSamples);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { samples, loading };
}
