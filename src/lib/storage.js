import { useCallback, useEffect, useRef, useState } from "react";

export default function useAudioPool({
  okSrc = "/sfx/drop.mp3",
  missSrc = "/sfx/wrong.wav",
  volume = 0.7,
}) {
  const okRef = useRef(null);
  const missRef = useRef(null);
  const [soundOn, setSoundOn] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (okRef.current && missRef.current) return;

    const ok1 = new Audio(okSrc),
      ok2 = new Audio(okSrc);
    const m1 = new Audio(missSrc),
      m2 = new Audio(missSrc);
    const all = [ok1, ok2, m1, m2];
    all.forEach((a) => {
      a.preload = "auto";
      a.volume = volume;
    });

    okRef.current = [ok1, ok2];
    missRef.current = [m1, m2];
  }, [okSrc, missSrc, volume]);

  const unlockOnce = useCallback(() => {
    if (audioUnlocked) return;
    const pool = okRef.current;
    if (!pool?.length) return;
    const a = pool[0];
    a.muted = true;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
        setAudioUnlocked(true);
      })
      .catch(() => {});
  }, [audioUnlocked]);

  const playFrom = useCallback(
    (poolRef) => {
      if (!soundOn || !audioUnlocked) return;
      const pool = poolRef.current;
      if (!pool?.length) return;
      const a = pool.find((x) => x.paused) || pool[0];
      try {
        a.currentTime = 0;
        a.play();
      } catch {}
    },
    [soundOn, audioUnlocked]
  );

  const playOk = () => playFrom(okRef);
  const playMiss = () => playFrom(missRef);

  return { soundOn, setSoundOn, audioUnlocked, unlockOnce, playOk, playMiss };
}

export const safeLoad = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

export const safeSave = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
