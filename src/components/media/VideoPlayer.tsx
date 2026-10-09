"use client";
import { useRef, useState } from "react";

/** Ambient videos loop silently; others show a poster and play with sound on click. */
export default function VideoPlayer({ src, poster, alt, ambient }: { src: string; poster?: string; alt: string; ambient?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  if (ambient) {
    return <video src={src} poster={poster} autoPlay muted loop playsInline aria-label={alt} className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <>
      <video ref={ref} src={src} poster={poster} playsInline controls={playing} aria-label={alt} className="absolute inset-0 h-full w-full object-cover" onEnded={() => setPlaying(false)} />
      {!playing && (
        <button
          onClick={() => { setPlaying(true); ref.current?.play(); }}
          className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-white/20 backdrop-blur-md"
          aria-label={`Play: ${alt}`}
        >
          <svg width="18" height="20" viewBox="0 0 18 20"><path d="M2 1.5 L16 10 L2 18.5 Z" fill="#fff" /></svg>
        </button>
      )}
    </>
  );
}
