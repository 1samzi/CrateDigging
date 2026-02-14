import { useEffect, useRef, useState } from 'react';

export default function useAudioPreview() {
  const audioRef = useRef(null);
  const [activeUrl, setActiveUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const ensureAudio = (url) => {
    if (!audioRef.current || activeUrl !== url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audio.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current = audio;
      setActiveUrl(url);
      return audio;
    }

    return audioRef.current;
  };

  const playOrPause = async (url) => {
    const audio = ensureAudio(url);

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return { isPlaying, activeUrl, playOrPause };
}
